// Imports externes
import { useState, useEffect } from 'react';
import { LogOut, type LucideIcon, Package, ShoppingBag, Heart, Sparkles, TrendingDown, Filter, Wallet } from 'lucide-react';
import { ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';
import { getWalletBalance } from '../../utils/walletService';

// Types
interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  mobileLabel?: string;
  disabled?: boolean;
}

interface CustomerHeaderProps {
  /** Titre principal (ex: nom du client) */
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
  /** Afficher le bouton filtres (par défaut: false) */
  showFilters?: boolean;
  /** Callback pour ouvrir les filtres */
  onOpenFilters?: () => void;
  /** Nombre de filtres actifs */
  activeFiltersCount?: number;
}

interface QuickStats {
  activeReservations: number;
  mealsSaved: number;
  moneySaved: number;
  donationsMade: number;
  walletBalance: number;
}

/**
 * Header amélioré spécifiquement pour les clients
 * Inclut des statistiques rapides, impact et design moderne
 */
export const CustomerHeader = ({
  title,
  subtitle,
  logo,
  logoAlt = 'Logo',
  defaultIcon = '🛒',
  actions = [],
  showLogout = true,
  className = '',
  showStats = true,
  showFilters = false,
  onOpenFilters,
  activeFiltersCount = 0,
}: CustomerHeaderProps) => {
  // État local
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    activeReservations: 0,
    mealsSaved: 0,
    moneySaved: 0,
    donationsMade: 0,
    walletBalance: 0,
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

      // Récupérer les données en parallèle
      const [
        activeReservationsResult,
        completedReservationsResult,
        walletBalance,
      ] = await Promise.all([
        // Récupérer les réservations actives (pending, confirmed)
        supabase
          .from('reservations')
          .select('quantity, total_price, is_donation')
          .eq('user_id', profile.id)
          .in('status', ['pending', 'confirmed']),
        // Récupérer les réservations complétées pour calculer l'impact
        supabase
          .from('reservations')
          .select(`
            quantity,
            total_price,
            is_donation,
            lots!inner(
              original_price,
              discounted_price
            )
          `)
          .eq('user_id', profile.id)
          .eq('status', 'completed'),
        // Récupérer le solde du wallet
        getWalletBalance(profile.id).catch(() => 0),
      ]);

      const { data: activeReservations, error: reservationsError } = activeReservationsResult;
      if (reservationsError) throw reservationsError;

      const { data: completedReservations, error: completedError } = completedReservationsResult;
      if (completedError) throw completedError;

      // Calculer les statistiques
      const activeCount = activeReservations?.length || 0;
      
      const mealsSaved = (completedReservations || []).reduce(
        (sum, r: { quantity: number | null }) => sum + (r.quantity || 0),
        0
      );

      const moneySaved = (completedReservations || []).reduce((sum, r: {
        quantity: number | null;
        lots: { original_price: number | null; discounted_price: number | null } | null;
      }) => {
        const lot = r.lots;
        if (lot && lot.original_price && lot.discounted_price) {
          return sum + (r.quantity || 0) * (lot.original_price - lot.discounted_price);
        }
        return sum;
      }, 0);

      const donationsMade = (completedReservations || []).filter((r: { is_donation: boolean | null }) => r.is_donation).length;

      setQuickStats({
        activeReservations: activeCount,
        mealsSaved,
        moneySaved,
        donationsMade,
        walletBalance,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Déterminer le titre final
  const finalTitle = title || `Bonjour ${profile?.full_name || 'Client'} !`;

  // Déterminer le sous-titre final
  const finalSubtitle = subtitle || 'Prêt à sauver des paniers aujourd\'hui ?';

  // Render du logo - Design compact
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

    // Logo par défaut avec emoji/icône - Design compact
    return (
      <div className="relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 group animate-fade-in">
        <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 h-full">
          <span className="text-xl md:text-2xl">{defaultIcon}</span>
        </div>
      </div>
    );
  };

  // Render d'un bouton d'action - Design compact et moderne
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
            className="w-5 h-5"
            strokeWidth={2}
          />
        )}
      </button>
    );
  };

  // Render des statistiques rapides - Design compact
  const renderQuickStats = () => {
    if (!showStats) return null;

    const stats = [
      {
        icon: Wallet,
        label: 'Portefeuille',
        value: formatCurrency(quickStats.walletBalance),
        show: true, // Toujours afficher le wallet
        color: 'primary',
      },
      {
        icon: ShoppingBag,
        label: 'En cours',
        value: quickStats.activeReservations,
        show: quickStats.activeReservations > 0,
        color: 'primary',
      },
      {
        icon: Package,
        label: 'Repas sauvés',
        value: quickStats.mealsSaved,
        show: quickStats.mealsSaved > 0,
        color: 'success',
      },
      {
        icon: TrendingDown,
        label: 'Économies',
        value: formatCurrency(quickStats.moneySaved),
        show: quickStats.moneySaved > 0,
        color: 'warning',
      },
      {
        icon: Heart,
        label: 'Dons',
        value: quickStats.donationsMade,
        show: quickStats.donationsMade > 0,
        color: 'accent',
      },
    ];

    const visibleStats = stats.filter(stat => stat.show);
    if (visibleStats.length === 0) return null;

    return (
      <div className="hidden lg:flex items-center gap-2 animate-fade-in">
        {visibleStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'bg-primary-50 border-primary-200 hover:border-primary-300',
            success: 'bg-success-50 border-success-200 hover:border-success-300',
            warning: 'bg-warning-50 border-warning-200 hover:border-warning-300',
            accent: 'bg-accent-50 border-accent-200 hover:border-accent-300',
          };
          const iconColorClasses = {
            primary: 'text-primary-600',
            success: 'text-success-600',
            warning: 'text-warning-600',
            accent: 'text-accent-600',
          };

          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon size={16} className={iconColorClasses[stat.color as keyof typeof iconColorClasses]} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-medium">{stat.label}</span>
                <span className="text-sm font-bold text-gray-900">
                  {loadingStats ? '...' : stat.value}
                </span>
              </div>
            </div>
          );
        })}
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
        {/* Layout Desktop : Logo + Titre à gauche, Stats centrées, Actions à droite */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Section gauche : Logo + Titre */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2 animate-fade-in">
                {finalTitle}
                <Sparkles size={14} className="text-primary-500 animate-pulse" strokeWidth={2} />
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5 animate-fade-in" style={{ animationDelay: '100ms' }}>
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Section centrale : Statistiques */}
          <div className="flex items-center justify-center flex-1">
            {renderQuickStats()}
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group flex items-center justify-center
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

        {/* Layout Tablet : Logo + Titre à gauche, Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
          {/* Logo + Titre */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                {finalTitle}
                <Sparkles size={12} className="text-primary-500" strokeWidth={2} />
              </h1>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && quickStats.activeReservations > 0 && (
              <div className="relative animate-fade-in">
                <ShoppingBag size={18} className="text-primary-600" strokeWidth={2} />
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-2 border-white shadow-sm animate-pulse">
                  <span className="text-[8px] font-bold text-white">
                    {quickStats.activeReservations}
                  </span>
                </div>
              </div>
            )}
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

         {/* Layout Mobile : Filtres à gauche, Logo centré, Déconnexion à droite */}
         <div className="flex md:hidden flex-col gap-3">
           {/* Ligne avec Filtres à gauche, Logo centré et Déconnexion à droite */}
           <div className="flex items-center justify-between animate-fade-in">
             {/* Bouton filtres à gauche */}
             {showFilters && onOpenFilters ? (
               <button
                 onClick={onOpenFilters}
                 className="
                   group relative flex items-center justify-center
                   w-9 h-9
                   bg-white hover:bg-primary-50 text-primary-600 border border-primary-300 hover:border-primary-500
                   rounded-lg
                   shadow-sm hover:shadow-md
                   hover:scale-105 active:scale-95
                   transition-all duration-300 ease-out
                 "
                 aria-label="Filtres"
                 title="Filtres"
               >
                 <Filter 
                   size={18}
                   strokeWidth={2}
                   className="transition-all duration-300"
                 />
                 {activeFiltersCount > 0 && (
                   <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-2 border-white shadow-sm animate-pulse">
                     <span className="text-[8px] font-bold text-white">
                       {activeFiltersCount}
                     </span>
                   </div>
                 )}
               </button>
             ) : (
               <div className="w-9 h-9" />
             )}
            
            {/* Logo centré */}
            {renderLogo()}
            
            {/* Bouton déconnexion à droite */}
            {showLogout ? (
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
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>

          {/* Titre centré en dessous du logo */}
          <div className="flex flex-col items-center justify-center gap-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h1 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              {finalTitle}
              <Sparkles size={12} className="text-primary-500" strokeWidth={2} />
            </h1>
            <p className="text-[10px] text-gray-500 font-medium text-center">
              {finalSubtitle}
            </p>
          </div>

          {/* Stats + Actions en dessous */}
          <div className="flex items-center gap-2 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '200ms' }}>
            {showStats && quickStats.activeReservations > 0 && (
              <div className="relative">
                <ShoppingBag size={18} className="text-primary-600" strokeWidth={2} />
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-2 border-white shadow-sm animate-pulse">
                  <span className="text-[8px] font-bold text-white">
                    {quickStats.activeReservations}
                  </span>
                </div>
              </div>
            )}
            {actions.map((action, index) => renderActionButton(action, index))}
          </div>
        </div>
      </div>
    </header>
  );
};

