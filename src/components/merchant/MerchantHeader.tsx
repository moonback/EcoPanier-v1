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

  // Render du logo - Design simple et responsive
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt={logoAlt}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
          />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône
    return (
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
        <span className="text-lg sm:text-xl">{defaultIcon}</span>
      </div>
    );
  };

  // Render d'un bouton d'action - Design simple et responsive
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    // Classes de variantes simples
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      danger: 'bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300',
    };

    const classes = variantClasses[action.variant || 'primary'];
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm hover:shadow transition-all duration-200 ${classes} ${disabledClasses}`}
        aria-label={action.label}
        title={action.label}
      >
        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />}
      </button>
    );
  };

  // Render des statistiques rapides - Design épuré et moderne
  const renderQuickStats = (variant: 'full' | 'compact' | 'minimal' = 'full') => {
    if (!showStats) return null;

    if (variant === 'minimal') {
      // Version minimale : badge notif compact pour mobile
      return (
        <div className="flex items-center">
          {quickStats.pendingReservations > 0 && (
            <div className="relative">
              <Bell className="w-4 h-4 text-orange-600" strokeWidth={2} />
              <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-3.5 px-1 bg-orange-500 rounded-full">
                <span className="text-[9px] font-bold text-white leading-none">
                  {quickStats.pendingReservations > 9 ? '9+' : quickStats.pendingReservations}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (variant === 'compact') {
      // Version compacte - Design minimaliste
      return (
        <div className="flex items-center gap-2">
          {/* Lots actifs */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg">
            <Package size={14} className="text-blue-600" strokeWidth={2} />
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>

          {/* Réservations en attente */}
          <div className="relative flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg">
            <ClipboardList size={14} className="text-orange-600" strokeWidth={2} />
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
            {quickStats.pendingReservations > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Revenus */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg">
            <TrendingUp size={14} className="text-green-600" strokeWidth={2} />
            <span className="text-xs font-bold text-gray-900">
              {loadingStats ? '...' : formatCurrency(quickStats.todayRevenue)}
            </span>
          </div>
        </div>
      );
    }

    // Version complète - Design minimaliste et pro
    return (
      <div className="flex items-center gap-3">
        {/* Lots actifs */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <Package size={18} className="text-blue-600" strokeWidth={2} />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium">Lots</span>
            <span className="text-sm font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.activeLots}
            </span>
          </div>
        </div>

        {/* Réservations en attente */}
        <div className="relative flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <ClipboardList size={18} className="text-orange-600" strokeWidth={2} />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium">En attente</span>
            <span className="text-sm font-bold text-gray-900">
              {loadingStats ? '...' : quickStats.pendingReservations}
            </span>
          </div>
          {quickStats.pendingReservations > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Revenus du jour */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <TrendingUp size={18} className="text-green-600" strokeWidth={2} />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium">Aujourd'hui</span>
            <span className="text-sm font-bold text-gray-900">
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
      className={`relative bg-white sticky top-0 z-40 border-b border-gray-100 transition-all duration-300 ${
        isScrolled ? 'shadow-lg py-2 sm:py-3' : 'shadow-sm py-3 sm:py-4'
      } ${className}`}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Layout Desktop : Logo + Titre à gauche, Stats au centre, Actions à droite */}
        <div className="hidden lg:flex items-center justify-between gap-8">
          {/* Section gauche : Logo + Titre */}
          <div className="flex items-center gap-3">
            {renderLogo()}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-500">
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
          <div className="flex items-center gap-2">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Layout Tablet : Logo + Titre à gauche, Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
          {/* Logo + Titre */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex items-center gap-2">
            {showStats && renderQuickStats('compact')}
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Layout Mobile : Optimisé pour petits écrans */}
        <div className="flex md:hidden flex-col gap-2">
          {/* Ligne 1 : Logo + Titre + Déconnexion */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {renderLogo()}
              <h1 className="text-xs font-bold text-gray-900 truncate">
                {finalTitle}
              </h1>
            </div>
            
            {showLogout && (
              <button
                onClick={signOut}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                aria-label="Se déconnecter"
              >
                <LogOut size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Ligne 2 : Stats + Actions + Sous-titre */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-shrink-0">
              {showStats && renderQuickStats('minimal')}
              {actions.map((action, index) => renderActionButton(action, index))}
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
};

