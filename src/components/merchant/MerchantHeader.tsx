// Imports externes
import { useState, useEffect } from 'react';
import { LogOut, type LucideIcon, Package, ClipboardList, DollarSign, Bell, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';

// Types
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

  // Hooks
  const { profile, signOut } = useAuthStore();

  // Effets
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showStats && profile?.id) {
      fetchQuickStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStats, profile?.id]);

  // Handlers
  const fetchQuickStats = async () => {
    if (!profile?.id) return;

    try {
      setLoadingStats(true);

      // Récupérer les lots actifs
      const { data: lots, error: lotsError } = await supabase
        .from('lots')
        .select('id')
        .eq('merchant_id', profile.id)
        .eq('status', 'available');

      if (lotsError) throw lotsError;

      const activeLotsCount = lots?.length || 0;

      // Récupérer les réservations en attente avec relation
      const { data: pendingReservations, error: pendingError } = await supabase
        .from('reservations')
        .select(`
          total_price,
          status,
          lots!inner(
            merchant_id
          )
        `)
        .eq('status', 'pending')
        .eq('lots.merchant_id', profile.id);

      if (pendingError) throw pendingError;

      // Calculer le revenu du jour (réservations complétées aujourd'hui)
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

      const todayRevenue = (todayReservations || []).reduce(
        (sum, r: { total_price: number | null }) => sum + (r.total_price || 0),
        0
      );

      setQuickStats({
        activeLots: activeLotsCount,
        pendingReservations: pendingReservations?.length || 0,
        todayRevenue,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Déterminer le titre final
  const finalTitle = title || profile?.business_name || profile?.full_name || 'Commerçant';

  // Déterminer le sous-titre final
  const finalSubtitle = subtitle || 'Valorisez vos invendus, réduisez le gaspillage ! 💚';

  // Render du logo avec tailles responsive
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="relative group flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-lg sm:rounded-xl md:rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={logo}
            alt={logoAlt}
            className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-2xl object-cover border-2 border-white/80 shadow-lg group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105 ring-2 ring-primary-100/50 group-hover:ring-primary-300/50"
          />
          <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône
    return (
      <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-lg sm:rounded-xl md:rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105 border-2 border-white/20">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl relative z-10">{defaultIcon}</span>
          <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    );
  };

  // Render d'un bouton d'action avec icône uniquement et couleurs cohérentes
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    // Classes de variantes simplifiées avec couleurs cohérentes du design system
    const variantClasses = {
      primary: `
        bg-gradient-to-br from-primary-600 to-primary-700 text-white
        hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900
        shadow-md hover:shadow-lg hover:shadow-primary-500/50
        ring-2 ring-primary-200/50 hover:ring-primary-300/50
      `,
      secondary: `
        bg-gradient-to-br from-secondary-600 to-secondary-700 text-white
        hover:from-secondary-700 hover:to-secondary-800 active:from-secondary-800 active:to-secondary-900
        shadow-md hover:shadow-lg hover:shadow-secondary-500/50
        ring-2 ring-secondary-200/50 hover:ring-secondary-300/50
      `,
      danger: `
        bg-white text-accent-600 border-2 border-accent-600
        hover:bg-gradient-to-br hover:from-accent-50 hover:to-accent-100 hover:border-accent-700 active:bg-accent-100
        shadow-md hover:shadow-lg hover:shadow-accent-500/40
        ring-2 ring-accent-100/50 hover:ring-accent-200/50
      `,
    };

    const classes = variantClasses[action.variant || 'primary'].trim().replace(/\s+/g, ' ');
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`
          group relative flex items-center justify-center
          w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11
          rounded-lg sm:rounded-xl
          transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          ${classes}
          ${disabledClasses}
        `}
        aria-label={action.label}
        title={action.label}
      >
        {Icon && (
          <Icon 
            className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 transition-transform duration-200 group-hover:scale-110"
            strokeWidth={2.5}
          />
        )}
      </button>
    );
  };

  // Render des statistiques rapides avec différentes tailles selon le breakpoint
  const renderQuickStats = (variant: 'full' | 'compact' | 'minimal' = 'full') => {
    if (!showStats) return null;

    if (variant === 'minimal') {
      // Version minimale : juste l'icône avec badge pour les réservations
      return (
        <div className="flex items-center">
          {quickStats.pendingReservations > 0 && (
            <div className="relative">
              <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-warning-600" strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 bg-warning-500 rounded-full border-2 border-white">
                <span className="text-[7px] sm:text-[8px] font-bold text-white">
                  {quickStats.pendingReservations > 9 ? '9+' : quickStats.pendingReservations}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (variant === 'compact') {
      // Version compacte pour tablet : statistiques en ligne avec icônes uniquement
      return (
        <div className="flex items-center gap-2">
          {/* Lots actifs */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-50 rounded-lg border border-primary-200">
            <Package size={14} className="text-primary-600" />
            <span className="text-xs font-bold text-primary-700">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>

          {/* Réservations en attente */}
          <div className="relative flex items-center gap-1.5 px-2 py-1 bg-warning-50 rounded-lg border border-warning-200">
            <ClipboardList size={14} className="text-warning-600" />
            <span className="text-xs font-bold text-warning-700">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
            {quickStats.pendingReservations > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-warning-500 rounded-full border-2 border-white">
                <Bell size={8} className="text-white" />
              </div>
            )}
          </div>

          {/* Revenus */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-success-50 rounded-lg border border-success-200">
            <DollarSign size={14} className="text-success-600" />
            <span className="text-xs font-bold text-success-700">
              {loadingStats ? '...' : formatCurrency(quickStats.todayRevenue)}
            </span>
          </div>
        </div>
      );
    }

    // Version complète pour desktop
    return (
      <div className="flex items-center gap-2 xl:gap-3">
        {/* Lots actifs */}
        <div className="relative flex items-center gap-2 px-2.5 xl:px-3 py-1.5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border border-primary-200/80 hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/20 transition-all duration-200 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/10 to-primary-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Package size={14} className="xl:w-4 xl:h-4 text-primary-600 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex flex-col relative z-10">
            <span className="text-[9px] xl:text-[10px] text-primary-600 font-medium">Lots actifs</span>
            <span className="text-xs xl:text-sm font-bold text-primary-700 group-hover:text-primary-800 transition-colors">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>
        </div>

        {/* Réservations en attente avec badge */}
        <div className="relative flex items-center gap-2 px-2.5 xl:px-3 py-1.5 bg-gradient-to-br from-warning-50 to-warning-100/50 rounded-lg border border-warning-200/80 hover:border-warning-300 hover:shadow-md hover:shadow-warning-500/20 transition-all duration-200 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-warning-400/0 via-warning-400/10 to-warning-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <ClipboardList size={14} className="xl:w-4 xl:h-4 text-warning-600 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex flex-col relative z-10">
            <span className="text-[9px] xl:text-[10px] text-warning-600 font-medium">En attente</span>
            <span className="text-xs xl:text-sm font-bold text-warning-700 group-hover:text-warning-800 transition-colors">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
          </div>
          {quickStats.pendingReservations > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 xl:w-5 xl:h-5 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full border-2 border-white shadow-lg animate-pulse">
              <Bell size={8} className="xl:w-2.5 xl:h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Revenus du jour */}
        <div className="relative flex items-center gap-2 px-2.5 xl:px-3 py-1.5 bg-gradient-to-br from-success-50 to-success-100/50 rounded-lg border border-success-200/80 hover:border-success-300 hover:shadow-md hover:shadow-success-500/20 transition-all duration-200 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-success-400/0 via-success-400/10 to-success-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <DollarSign size={14} className="xl:w-4 xl:h-4 text-success-600 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex flex-col relative z-10">
            <span className="text-[9px] xl:text-[10px] text-success-600 font-medium">Aujourd'hui</span>
            <span className="text-xs xl:text-sm font-bold text-success-700 group-hover:text-success-800 transition-colors">
              {loadingStats ? '...' : formatCurrency(quickStats.todayRevenue)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render principal
  return (
    <header
      className={`relative bg-gradient-to-br from-white via-white to-gray-50/80 sticky top-0 z-40 border-b border-gray-200/60 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'shadow-lg py-1.5 bg-white/95' : 'shadow-sm py-2 sm:py-3 md:py-4'
      } ${className}`}
    >
      {/* Effet de brillance animé en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Bordure brillante en haut */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
      <div className="max-w-12xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Layout Desktop XL : Logo + Titre centrés, Stats à gauche, Actions à droite */}
        <div className="hidden xl:flex items-center justify-between gap-4">
          {/* Section gauche : Statistiques */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && renderQuickStats('full')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent flex items-center gap-2">
                {finalTitle}
                <Sparkles size={18} className="text-primary-500 animate-pulse flex-shrink-0 drop-shadow-sm" />
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {/* Boutons d'action personnalisés */}
            {actions.map((action, index) => renderActionButton(action, index))}

            {/* Bouton de déconnexion avec icône uniquement */}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-11 h-11
                  bg-gradient-to-br from-white to-gray-50 text-accent-600 border-2 border-accent-600/80
                  hover:bg-gradient-to-br hover:from-accent-50 hover:to-accent-100 hover:border-accent-700 active:bg-accent-100
                  rounded-xl
                  shadow-md hover:shadow-lg hover:shadow-accent-500/40
                  hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                  ring-2 ring-accent-100/50 hover:ring-accent-200/50
                  overflow-hidden
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400/0 via-accent-400/10 to-accent-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <LogOut 
                  size={20} 
                  strokeWidth={2.5}
                  className="relative z-10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-12deg]"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Desktop LG : Logo + Titre centrés, Stats + Actions à droite */}
        <div className="hidden lg:flex xl:hidden items-center justify-between gap-4">
          {/* Section gauche : Vide pour équilibrer */}
          <div className="flex items-center gap-2 flex-shrink-0 w-40">
            {showStats && renderQuickStats('compact')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent flex items-center gap-2">
                {finalTitle}
                <Sparkles size={16} className="text-primary-500 flex-shrink-0 drop-shadow-sm" />
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-40 justify-end">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-10 h-10
                  bg-white text-accent-600 border-2 border-accent-600
                  hover:bg-accent-50 hover:border-accent-700 active:bg-accent-100
                  rounded-xl
                  shadow-md hover:shadow-lg hover:shadow-accent-500/30
                  hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={20} 
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Tablet : Logo + Titre centrés, Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-3">
          {/* Section gauche : Vide pour équilibrer */}
          <div className="flex items-center gap-2 flex-shrink-0 w-32">
            {showStats && renderQuickStats('compact')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-2.5 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-base font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent flex items-center gap-1.5">
                {finalTitle}
                <Sparkles size={14} className="text-primary-500 flex-shrink-0 drop-shadow-sm" />
              </h1>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-32 justify-end">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-10 h-10
                  bg-white text-accent-600 border-2 border-accent-600
                  hover:bg-accent-50 hover:border-accent-700 active:bg-accent-100
                  rounded-xl
                  shadow-md hover:shadow-lg hover:shadow-accent-500/30
                  hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={18} 
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Mobile : Logo + Titre centrés, Actions en dessous */}
        <div className="flex md:hidden flex-col gap-2">
          {/* Logo + Titre centrés */}
          <div className="flex items-center justify-center gap-1.5 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {finalTitle}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-gray-600 font-medium hidden sm:block">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Actions en dessous */}
          <div className="flex items-center gap-1 justify-center">
            {showStats && renderQuickStats('minimal')}
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-8 h-8 sm:w-9 sm:h-9
                  bg-white text-accent-600 border-2 border-accent-600
                  hover:bg-accent-50 hover:border-accent-700 active:bg-accent-100
                  rounded-lg
                  shadow-md hover:shadow-lg hover:shadow-accent-500/30
                  hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-200 group-hover:scale-110"
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

