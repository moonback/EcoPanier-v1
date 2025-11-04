// Imports externes
import { useState, useEffect } from 'react';
import { LogOut, type LucideIcon, Package, ClipboardList, Bell, Sparkles, TrendingUp } from 'lucide-react';
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

  // Render du logo avec design épuré et animations subtiles
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="relative group flex-shrink-0 animate-fade-in">
          <img
            src={logo}
            alt={logoAlt}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
          />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0 animate-fade-in">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône - Design épuré
    return (
      <div className="relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 group animate-fade-in">
        <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 h-full">
          <span className="text-xl md:text-2xl">{defaultIcon}</span>
        </div>
      </div>
    );
  };

  // Render d'un bouton d'action - Design épuré et moderne
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    // Classes de variantes épurées
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-sm hover:shadow-md',
      danger: 'bg-white hover:bg-accent-50 text-accent-600 border border-accent-300 hover:border-accent-500 shadow-sm',
    };

    const classes = variantClasses[action.variant || 'primary'];
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`
          group relative flex items-center justify-center
          w-10 h-10 md:w-11 md:h-11
          rounded-xl
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-95
          animate-fade-in
          ${classes}
          ${disabledClasses}
        `}
        style={{ animationDelay: `${index * 50}ms` }}
        aria-label={action.label}
        title={action.label}
      >
        {Icon && (
          <Icon 
            className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6"
            strokeWidth={2}
          />
        )}
      </button>
    );
  };

  // Render des statistiques rapides - Design épuré et moderne
  const renderQuickStats = (variant: 'full' | 'compact' | 'minimal' = 'full') => {
    if (!showStats) return null;

    if (variant === 'minimal') {
      // Version minimale : badge notif seulement
      return (
        <div className="flex items-center animate-fade-in">
          {quickStats.pendingReservations > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-warning-600 animate-pulse" strokeWidth={2} />
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full border-2 border-white shadow-sm">
                <span className="text-[8px] font-bold text-white">
                  {quickStats.pendingReservations > 9 ? '9+' : quickStats.pendingReservations}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (variant === 'compact') {
      // Version compacte - Design épuré
      return (
        <div className="flex items-center gap-2 animate-fade-in">
          {/* Lots actifs */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
            <Package size={16} className="text-primary-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>

          {/* Réservations en attente */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-warning-300 hover:shadow-md transition-all duration-300">
            <ClipboardList size={16} className="text-warning-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
            {quickStats.pendingReservations > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-warning-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>

          {/* Revenus */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-success-300 hover:shadow-md transition-all duration-300">
            <TrendingUp size={16} className="text-success-600" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-900">
              {loadingStats ? '...' : formatCurrency(quickStats.todayRevenue)}
            </span>
          </div>
        </div>
      );
    }

    // Version complète - Design épuré avec animations subtiles
    return (
      <div className="flex items-center gap-3 animate-fade-in">
        {/* Lots actifs */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 group">
          <div className="w-10 h-10 flex items-center justify-center bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors duration-300">
            <Package size={20} className="text-primary-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Lots actifs</span>
            <span className="text-lg font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>
        </div>

        {/* Réservations en attente */}
        <div className="relative flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-warning-300 hover:shadow-md transition-all duration-300 group">
          <div className="w-10 h-10 flex items-center justify-center bg-warning-50 rounded-lg group-hover:bg-warning-100 transition-colors duration-300">
            <ClipboardList size={20} className="text-warning-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">En attente</span>
            <span className="text-lg font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
          </div>
          {quickStats.pendingReservations > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </div>

        {/* Revenus du jour */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-success-300 hover:shadow-md transition-all duration-300 group">
          <div className="w-10 h-10 flex items-center justify-center bg-success-50 rounded-lg group-hover:bg-success-100 transition-colors duration-300">
            <TrendingUp size={20} className="text-success-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Aujourd'hui</span>
            <span className="text-lg font-bold text-gray-900">
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
      className={`relative bg-white/95 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200 transition-all duration-500 animate-fade-in ${
        isScrolled ? 'shadow-md py-3' : 'shadow-sm py-4'
      } ${className}`}
    >
      {/* Ligne d'accentuation subtile en haut */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-60" />
      
      <div className="max-w-12xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Layout Desktop XL : Stats à gauche, Logo + Titre centrés, Actions à droite */}
        <div className="hidden xl:flex items-center justify-between gap-6">
          {/* Section gauche : Statistiques */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && renderQuickStats('full')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 animate-fade-in">
                {finalTitle}
                <Sparkles size={16} className="text-primary-500 animate-pulse" strokeWidth={2} />
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-0.5 animate-fade-in" style={{ animationDelay: '100ms' }}>
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-11 h-11
                  bg-white hover:bg-accent-50 text-accent-600 border border-accent-300 hover:border-accent-500
                  rounded-xl
                  shadow-sm hover:shadow-md
                  hover:scale-105 active:scale-95
                  transition-all duration-300 ease-out
                  animate-fade-in
                "
                style={{ animationDelay: `${actions.length * 50}ms` }}
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={20} 
                  strokeWidth={2}
                  className="transition-all duration-300 group-hover:rotate-12"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Desktop LG : Stats à gauche, Logo + Titre centrés, Actions à droite */}
        <div className="hidden lg:flex xl:hidden items-center justify-between gap-4">
          {/* Section gauche : Statistiques */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && renderQuickStats('compact')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {finalTitle}
                <Sparkles size={14} className="text-primary-500 animate-pulse" strokeWidth={2} />
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-end">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group flex items-center justify-center
                  w-10 h-10
                  bg-white hover:bg-accent-50 text-accent-600 border border-accent-300 hover:border-accent-500
                  rounded-xl
                  shadow-sm hover:shadow-md
                  hover:scale-105 active:scale-95
                  transition-all duration-300 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={20} 
                  strokeWidth={2}
                  className="transition-all duration-300 group-hover:rotate-12"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Tablet : Stats à gauche, Logo + Titre centrés, Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-3">
          {/* Section gauche : Statistiques */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && renderQuickStats('compact')}
          </div>

          {/* Section centrale : Logo + Titre */}
          <div className="flex items-center gap-2.5 flex-1 justify-center min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0 items-center">
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                {finalTitle}
                <Sparkles size={12} className="text-primary-500" strokeWidth={2} />
              </h1>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-end">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group flex items-center justify-center
                  w-10 h-10
                  bg-white hover:bg-accent-50 text-accent-600 border border-accent-300 hover:border-accent-500
                  rounded-xl
                  shadow-sm hover:shadow-md
                  hover:scale-105 active:scale-95
                  transition-all duration-300 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={18} 
                  strokeWidth={2}
                  className="transition-all duration-300 group-hover:rotate-12"
                />
              </button>
            )}
          </div>
        </div>

        {/* Layout Mobile : Logo + Titre centrés, Stats + Actions en dessous */}
        <div className="flex md:hidden flex-col gap-3">
          {/* Logo + Titre centrés */}
          <div className="flex items-center justify-center gap-2 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                {finalTitle}
                <Sparkles size={12} className="text-primary-500" strokeWidth={2} />
              </h1>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Stats + Actions en dessous */}
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {showStats && renderQuickStats('minimal')}
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group flex items-center justify-center
                  w-9 h-9
                  bg-white hover:bg-accent-50 text-accent-600 border border-accent-300 hover:border-accent-500
                  rounded-lg
                  shadow-sm hover:shadow-md
                  hover:scale-105 active:scale-95
                  transition-all duration-300 ease-out
                "
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut 
                  size={18}
                  strokeWidth={2}
                  className="transition-all duration-300 group-hover:rotate-12"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

