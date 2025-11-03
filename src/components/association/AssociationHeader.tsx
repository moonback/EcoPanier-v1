// Imports externes
import { useState, useEffect } from 'react';
import { LogOut, type LucideIcon, Users, CheckCircle, Clock, FileText, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

// Types
interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  mobileLabel?: string;
  disabled?: boolean;
}

interface AssociationHeaderProps {
  /** Titre principal (ex: nom de l'association) */
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
  totalBeneficiaries: number;
  verifiedBeneficiaries: number;
  pendingVerification: number;
  thisMonthRegistrations: number;
}

/**
 * Header amélioré spécifiquement pour les associations
 * Inclut des statistiques rapides, notifications et design moderne
 */
export const AssociationHeader = ({
  title,
  subtitle,
  logo,
  logoAlt = 'Logo',
  defaultIcon = '🏛️',
  actions = [],
  showLogout = true,
  className = '',
  showStats = true,
}: AssociationHeaderProps) => {
  // État local
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalBeneficiaries: 0,
    verifiedBeneficiaries: 0,
    pendingVerification: 0,
    thisMonthRegistrations: 0,
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

      // Charger toutes les inscriptions de l'association
      const { data: registrations, error } = await supabase
        .from('association_beneficiary_registrations')
        .select('*')
        .eq('association_id', profile.id);

      if (error) throw error;

      // Calculer les statistiques
      const total = registrations?.length || 0;
      const verified = registrations?.filter(r => r.is_verified).length || 0;
      const pending = total - verified;

      // Inscriptions de ce mois
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = registrations?.filter(r => {
        const registrationDate = new Date(r.registration_date);
        return registrationDate >= firstDayOfMonth;
      }).length || 0;

      setQuickStats({
        totalBeneficiaries: total,
        verifiedBeneficiaries: verified,
        pendingVerification: pending,
        thisMonthRegistrations: thisMonth,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Déterminer le titre final
  const finalTitle = title || profile?.business_name || profile?.full_name || 'Association';

  // Déterminer le sous-titre final
  const finalSubtitle = subtitle || 'Gérez vos bénéficiaires et leur accès à la solidarité';

  // Render du logo
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <div className="relative group">
          <img
            src={logo}
            alt={logoAlt}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône
    return (
      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <span className="text-3xl">{defaultIcon}</span>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
    );
  };

  // Render d'un bouton d'action avec icône uniquement et couleurs cohérentes
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    // Classes de variantes simplifiées avec couleurs cohérentes du design system
    const variantClasses = {
      primary: `
        bg-primary-600 text-white
        hover:bg-primary-700 active:bg-primary-800
        shadow-md hover:shadow-lg hover:shadow-primary-500/40
      `,
      secondary: `
        bg-secondary-600 text-white
        hover:bg-secondary-700 active:bg-secondary-800
        shadow-md hover:shadow-lg hover:shadow-secondary-500/40
      `,
      danger: `
        bg-white text-accent-600 border-2 border-accent-600
        hover:bg-accent-50 hover:border-accent-700 active:bg-accent-100
        shadow-md hover:shadow-lg hover:shadow-accent-500/30
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
          w-10 h-10 sm:w-11 sm:h-11
          rounded-xl
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
            size={20} 
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        )}
      </button>
    );
  };

  // Render des statistiques rapides
  const renderQuickStats = () => {
    if (!showStats) return null;

    return (
      <div className="hidden lg:flex items-center gap-3">
        {/* Total bénéficiaires */}
        {quickStats.totalBeneficiaries > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 rounded-lg border border-secondary-200 hover:shadow-md transition-shadow">
            <Users size={16} className="text-secondary-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary-600 font-medium">Total</span>
              <span className="text-sm font-bold text-secondary-700">
                {loadingStats ? '...' : quickStats.totalBeneficiaries}
              </span>
            </div>
          </div>
        )}

        {/* Bénéficiaires vérifiés */}
        {quickStats.verifiedBeneficiaries > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-lg border border-success-200 hover:shadow-md transition-shadow">
            <CheckCircle size={16} className="text-success-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-success-600 font-medium">Vérifiés</span>
              <span className="text-sm font-bold text-success-700">
                {loadingStats ? '...' : quickStats.verifiedBeneficiaries}
              </span>
            </div>
          </div>
        )}

        {/* En attente */}
        {quickStats.pendingVerification > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 rounded-lg border border-warning-200 hover:shadow-md transition-shadow">
            <Clock size={16} className="text-warning-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-warning-600 font-medium">En attente</span>
              <span className="text-sm font-bold text-warning-700">
                {loadingStats ? '...' : quickStats.pendingVerification}
              </span>
            </div>
          </div>
        )}

        {/* Ce mois */}
        {quickStats.thisMonthRegistrations > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-200 hover:shadow-md transition-shadow">
            <FileText size={16} className="text-primary-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-primary-600 font-medium">Ce mois</span>
              <span className="text-sm font-bold text-primary-700">
                {loadingStats ? '...' : quickStats.thisMonthRegistrations}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render principal
  return (
    <header
      className={`bg-gradient-to-br from-white via-white to-gray-50/50 sticky top-0 z-40 border-b border-gray-200/80 backdrop-blur-sm transition-all duration-300 ${
        isScrolled ? 'shadow-md py-2' : 'shadow-sm py-4'
      } ${className}`}
    >
      <div className="max-w-12xl mx-auto px-4 sm:px-6">
        {/* Layout Desktop : Grid 3 colonnes avec logo au centre */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 items-center">
          {/* Section gauche : Titre, sous-titre et statistiques */}
          <div className="flex flex-col min-w-0 gap-2">
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                {finalTitle}
                <Sparkles size={18} className="text-secondary-500 animate-pulse" />
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5 truncate">
                {finalSubtitle}
              </p>
            </div>
            {showStats && (
              <div className="flex items-center gap-2 mt-1">
                {renderQuickStats()}
              </div>
            )}
          </div>

          {/* Section centrale : Logo */}
          <div className="flex items-center justify-center">
            {renderLogo()}
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Boutons d'action personnalisés */}
            {actions.map((action, index) => renderActionButton(action, index))}

            {/* Bouton de déconnexion avec icône uniquement */}
            {showLogout && (
              <button
                onClick={signOut}
                className="
                  group relative flex items-center justify-center
                  w-10 h-10 sm:w-11 sm:h-11
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

        {/* Layout Tablet : Logo + Titre à gauche, Stats + Actions à droite */}
        <div className="hidden md:flex lg:hidden items-center justify-between gap-4">
          {/* Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
                {finalTitle}
                <Sparkles size={16} className="text-secondary-500" />
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5 truncate">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && quickStats.pendingVerification > 0 && (
              <div className="relative">
                <Clock size={18} className="text-warning-600" />
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-warning-500 rounded-full border-2 border-white">
                  <span className="text-[8px] font-bold text-white">
                    {quickStats.pendingVerification}
                  </span>
                </div>
              </div>
            )}
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

        {/* Layout Mobile : Logo + Titre à gauche, Actions à droite */}
        <div className="flex md:hidden items-center justify-between gap-3">
          {/* Logo + Titre */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {renderLogo()}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5 truncate">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStats && quickStats.pendingVerification > 0 && (
              <div className="relative">
                <Clock size={18} className="text-warning-600" />
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-warning-500 rounded-full border-2 border-white">
                  <span className="text-[8px] font-bold text-white">
                    {quickStats.pendingVerification}
                  </span>
                </div>
              </div>
            )}
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
      </div>
    </header>
  );
};

