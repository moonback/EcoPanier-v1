// Imports externes
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LogOut, type LucideIcon, Package, ClipboardList, Bell, TrendingUp, BarChart3 } from 'lucide-react';
import { ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';

// Types
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  mobileLabel?: string;
  disabled?: boolean;
}

interface MerchantHeaderProps {
  /** Titre principal (ex: nom du commerce) */
  title?: string;
  /** Sous-titre ou message de bienvenue */
  subtitle?: string;
  /** URL ou élément JSX pour le logo */
  logo?: string | ReactNode;
  /** Alt text pour le logo si c'est une image */
  logoAlt?: string;
  /** Emoji ou icône par défaut si pas de logo */
  defaultIcon?: string;
  /** Boutons d'action additionnels à afficher */
  actions?: ActionButton[];
  /** Afficher le bouton de déconnexion (par défaut: true) */
  showLogout?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Afficher les statistiques rapides */
  showStats?: boolean;
}

interface QuickStats {
  activeLots: number;
  pendingReservations: number;
  todayRevenue: number;
}

interface QuickStatDefinition {
  key: keyof QuickStats;
  label: string;
  icon: LucideIcon;
  accentClass: string;
  gradientClass: string;
  hint: string;
}

const QUICK_STATS_DEFINITIONS: QuickStatDefinition[] = [
  {
    key: 'activeLots',
    label: 'Lots actifs',
    icon: Package,
    accentClass: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
    gradientClass: 'bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-white/60',
    hint: 'Lots disponibles en vitrine',
  },
  {
    key: 'pendingReservations',
    label: 'Commandes en attente',
    icon: ClipboardList,
    accentClass: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg',
    gradientClass: 'bg-gradient-to-br from-orange-50/90 via-amber-50/80 to-white/60',
    hint: 'Réservations à traiter',
  },
  {
    key: 'todayRevenue',
    label: "Revenu d'aujourd'hui",
    icon: TrendingUp,
    accentClass: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg',
    gradientClass: 'bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-white/60',
    hint: 'Ventes finalisées du jour',
  },
];

/**
 * Header amélioré spécifiquement pour les commerçants
 * Inclut des statistiques rapides, notifications et design moderne
 */
export const MerchantHeader = ({
  title,
  subtitle,
  logo,
  logoAlt = 'Logo',
  defaultIcon = '🏪',
  actions = [],
  showLogout = true,
  className = '',
  showStats = true,
}: MerchantHeaderProps) => {
  // État local
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    activeLots: 0,
    pendingReservations: 0,
    todayRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Hooks
  const { profile, signOut } = useAuthStore();

  const handleToggleStats = () => {
    setStatsExpanded((prev) => !prev);
  };

  // Effets
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchQuickStats = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!profile?.id) return;

      const silent = options?.silent ?? false;

      try {
        if (!silent) {
          setLoadingStats(true);
        }

        const { data: lots, error: lotsError } = await supabase
          .from('lots')
          .select('id')
          .eq('merchant_id', profile.id)
          .eq('status', 'available');

        if (lotsError) throw lotsError;

        const activeLotsCount = lots?.length ?? 0;

        const { data: pendingReservations, error: pendingError } = await supabase
          .from('reservations')
          .select(`
            total_price,
            status,
            lots!inner(
              merchant_id
            )
          `)
          .in('status', ['pending', 'confirmed'])
          .eq('lots.merchant_id', profile.id);

        if (pendingError) throw pendingError;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { data: todayReservations, error: todayError } = await supabase
          .from('reservations')
          .select(`
            total_price,
            lots!inner(
              merchant_id
            )
          `)
          .eq('status', 'completed')
          .gte('completed_at', todayISO)
          .eq('lots.merchant_id', profile.id);

        if (todayError) throw todayError;

        const todayRevenue = (todayReservations ?? []).reduce(
          (sum, reservation: { total_price: number | null }) => sum + (reservation.total_price ?? 0),
          0
        );

        setQuickStats({
          activeLots: activeLotsCount,
          pendingReservations: pendingReservations?.length ?? 0,
          todayRevenue,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        if (!silent) {
          setLoadingStats(false);
        }
      }
    },
    [profile?.id]
  );

  useEffect(() => {
    if (!showStats || !profile?.id) {
      return undefined;
    }

    fetchQuickStats();

    const intervalId = window.setInterval(() => {
      fetchQuickStats({ silent: true });
    }, 10000);

    const channel = supabase
      .channel('merchant_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        () => {
          fetchQuickStats({ silent: true });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lots',
        },
        () => {
          fetchQuickStats({ silent: true });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      window.clearInterval(intervalId);

      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [fetchQuickStats, showStats, profile?.id]);

  // Déterminer le titre final
  const finalTitle = title || profile?.business_name || profile?.full_name || 'Commerçant';

  // Déterminer le sous-titre final
  const finalSubtitle = subtitle || profile?.business_description || 'Valorisez vos invendus, réduisez le gaspillage ! 💚';

  const quickStatsItems = useMemo(
    () =>
      QUICK_STATS_DEFINITIONS.map((definition) => {
        const rawValue = quickStats[definition.key];
        const displayValue = loadingStats
          ? '...'
          : definition.key === 'todayRevenue'
            ? formatCurrency(rawValue)
            : String(rawValue);

        return {
          ...definition,
          value: displayValue,
        };
      }),
    [loadingStats, quickStats]
  );

  // Render du logo - Design élégant et moderne
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="flex flex-shrink-0 items-center justify-center">
          <img
            src={logo}
            alt={logoAlt}
            className="h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-white sm:h-12 sm:w-12"
          />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex flex-shrink-0 items-center justify-center">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône - Design amélioré
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 shadow-lg ring-2 ring-white/50 sm:h-12 sm:w-12">
        <span className="text-xl sm:text-2xl">{defaultIcon}</span>
      </div>
    );
  };

  // Render d'un bouton d'action - Design élégant et moderne
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;

    const variantClasses = {
      primary:
        'border-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:from-primary-600 hover:to-primary-700 hover:shadow-xl',
      secondary:
        'border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg hover:from-slate-900 hover:to-slate-900 hover:shadow-xl',
      danger:
        'border border-red-200 bg-white/80 text-red-600 shadow-sm hover:border-red-300 hover:bg-red-50 hover:shadow-md',
    };

    const classes = variantClasses[action.variant || 'primary'];
    const disabledClasses = action.disabled ? 'cursor-not-allowed opacity-50' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:w-11 ${classes} ${disabledClasses}`}
        aria-label={action.label}
        title={action.label}
      >
        {Icon && <Icon className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2.5} />}
      </button>
    );
  };

  // Render des statistiques rapides - Design épuré et moderne
  const renderQuickStats = (variant: 'full' | 'compact' | 'minimal' = 'full') => {
    if (!showStats) {
      return null;
    }

    if (variant === 'minimal') {
      const pendingItem = quickStatsItems.find((item) => item.key === 'pendingReservations');
      if (!pendingItem) {
        return null;
      }

      return (
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 shadow-inner">
            <Bell className="h-3.5 w-3.5" strokeWidth={2.5} />
            {!loadingStats && quickStats.pendingReservations > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-1 py-0.5 text-[9px] font-semibold text-white shadow-lg ring-2 ring-white">
                {quickStats.pendingReservations > 9 ? '9+' : quickStats.pendingReservations}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-gray-600">
            {loadingStats ? 'Sync…' : `${pendingItem.value} en attente`}
          </span>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-1.5">
          {quickStatsItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`flex items-center gap-1.5 rounded-lg border border-white/40 ${item.gradientClass} px-2.5 py-1.5 text-[13px] font-semibold text-slate-900 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.accentClass}`}>
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                </div>
                <span>{item.value}</span>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex w-full flex-wrap gap-1.5 md:flex-nowrap">
        {quickStatsItems.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.key}
              className={`relative flex min-w-[180px] flex-1 flex-col gap-1.5 rounded-xl border border-white/50 ${item.gradientClass} p-2 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)]`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.accentClass}`}>
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                </div>
                {!loadingStats && item.key === 'pendingReservations' && quickStats.pendingReservations > 0 && (
                  <span className="flex items-center justify-center rounded-full bg-white/70 px-1 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-orange-600 shadow-sm">
                    Urgent
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </span>
                <span className="text-base font-black tracking-tight text-slate-900">
                  {item.value}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 text-[9.5px] font-medium text-slate-600">
                <span>{item.hint}</span>
                {!loadingStats && item.key === 'todayRevenue' && quickStats.todayRevenue === 0 && (
                  <span className="rounded-full bg-white/70 px-1 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                    À booster
                  </span>
                )}
              </div>
              <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-slate-900/15 to-transparent" />
            </article>
          );
        })}
      </div>
    );
  };

  // Render principal
  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/30 bg-gradient-to-br from-white/85 via-white/75 to-white/60 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-xl backdrop-blur-2xl' : 'py-3 shadow-md backdrop-blur-xl'
      } ${className}`}
    >
      <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_50%)]" />
      <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-primary-400/60 via-secondary-400/40 to-primary-400/60" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            {renderLogo()}
            <div className="flex flex-col gap-1">
              <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                {finalTitle}
                {showStats && (
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500/15 to-secondary-500/15 px-3 py-1 text-xs font-semibold text-primary-700">
                    Tableau commerçant
                  </span>
                )}
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">
                {finalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 lg:gap-2.5">
            {showStats && (
              <button
                onClick={handleToggleStats}
                aria-expanded={statsExpanded}
                aria-label={statsExpanded ? 'Masquer les statistiques' : 'Afficher les statistiques'}
                className={`flex items-center gap-1.5 rounded-xl border border-primary-200 px-3 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md ${
                  statsExpanded ? 'bg-primary-50 text-primary-700 shadow-sm' : 'bg-white/80 text-primary-600 shadow-sm'
                }`}
              >
                <BarChart3 className="h-4 w-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">
                  {statsExpanded ? 'Masquer' : 'Stats'}
                </span>
                <span className="sm:hidden">{statsExpanded ? '–' : '+'}</span>
              </button>
            )}
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center justify-center h-11 w-11 rounded-xl border border-red-200 bg-white/80 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {showStats && statsExpanded && (
          <>
            <div className="hidden w-full justify-center lg:flex">
              {renderQuickStats('full')}
            </div>
            <div className="hidden md:flex lg:hidden justify-center">
              {renderQuickStats('compact')}
            </div>
            <div className="flex justify-between md:hidden">
              {renderQuickStats('minimal')}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

