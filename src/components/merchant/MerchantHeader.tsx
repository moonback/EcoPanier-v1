// Imports externes
import { useState, useEffect } from 'react';
import { LogOut, type LucideIcon, Package, ClipboardList, Bell, TrendingUp } from 'lucide-react';
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

  // Render du logo - Design élégant et moderne
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt={logoAlt}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md ring-2 ring-white"
          />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône - Design amélioré
    return (
      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/50">
        <span className="text-xl sm:text-2xl">{defaultIcon}</span>
      </div>
    );
  };

  // Render d'un bouton d'action - Design élégant et moderne
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    // Classes de variantes améliorées avec gradients
    const variantClasses = {
      primary: 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg',
      danger: 'bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md',
    };

    const classes = variantClasses[action.variant || 'primary'];
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${classes} ${disabledClasses}`}
        aria-label={action.label}
        title={action.label}
      >
        {Icon && <Icon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2.5} />}
      </button>
    );
  };

  // Render des statistiques rapides - Design épuré et moderne
  const renderQuickStats = (variant: 'full' | 'compact' | 'minimal' = 'full') => {
    if (!showStats) return null;

    if (variant === 'minimal') {
      // Version minimale : badge notif compact pour mobile - Design amélioré
      return (
        <div className="flex items-center">
          {quickStats.pendingReservations > 0 && (
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center border border-orange-200 shadow-sm">
                <Bell className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4.5 px-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg ring-2 ring-white">
                <span className="text-[10px] font-bold text-white leading-none">
                  {quickStats.pendingReservations > 9 ? '9+' : quickStats.pendingReservations}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (variant === 'compact') {
      // Version compacte - Design élégant avec gradients
      return (
        <div className="flex items-center gap-2.5">
          {/* Lots actifs */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
              <Package size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>

          {/* Réservations en attente */}
          <div className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
              <ClipboardList size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
            {quickStats.pendingReservations > 0 && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse ring-2 ring-white" />
            )}
          </div>

          {/* Revenus */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
              <TrendingUp size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : formatCurrency(quickStats.todayRevenue)}
            </span>
          </div>
        </div>
      );
    }

    // Version complète - Design élégant et professionnel
    return (
      <div className="flex items-center gap-4">
        {/* Lots actifs */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Package size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide">Lots</span>
            <span className="text-base font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>
        </div>

        {/* Réservations en attente */}
        <div className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <ClipboardList size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide">En attente</span>
            <span className="text-base font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
          </div>
          {quickStats.pendingReservations > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full animate-pulse ring-2 ring-white shadow-lg" />
          )}
        </div>

        {/* Revenus du jour */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <TrendingUp size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide">Aujourd'hui</span>
            <span className="text-base font-bold text-gray-900">
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
      className={`relative bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl py-2 sm:py-3 bg-white/98' : 'shadow-md py-3 sm:py-4'
      } ${className}`}
    >
      {/* Accent bar améliorée */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 shadow-sm" />
      
      <div className="max-w-12xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Layout Desktop : Logo + Titre à gauche, Stats au centre, Actions à droite */}
        <div className="hidden lg:flex items-center justify-between gap-8">
          {/* Section gauche : Logo + Titre */}
          <div className="flex items-center gap-4">
            {renderLogo()}
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section centrale : Statistiques */}
          {showStats && (
            <div className="flex items-center gap-2 flex-1 justify-center">
              {renderQuickStats('full')}
            </div>
          )}

          {/* Section droite : Actions */}
          <div className="flex items-center gap-2.5">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center justify-center w-11 h-11 bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Layout Tablet : Logo + Titre à gauche, Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
          {/* Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-black text-gray-900 truncate tracking-tight">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-600 font-medium truncate">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex items-center gap-2.5">
            {showStats && renderQuickStats('compact')}
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center justify-center w-11 h-11 bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Layout Mobile : Optimisé pour petits écrans */}
        <div className="flex md:hidden flex-col gap-2.5">
          {/* Ligne 1 : Logo + Titre + Déconnexion */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {renderLogo()}
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm font-black text-gray-900 truncate tracking-tight">
                  {finalTitle}
                </h1>
                <p className="text-[10px] text-gray-600 font-medium truncate">
                  {finalSubtitle}
                </p>
              </div>
            </div>
            
            {showLogout && (
              <button
                onClick={signOut}
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Ligne 2 : Stats + Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              {showStats && renderQuickStats('minimal')}
              {actions.map((action, index) => renderActionButton(action, index))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

