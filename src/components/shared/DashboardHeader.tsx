// Imports externes
import { LogOut, type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';

// Types
interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  mobileLabel?: string;
  disabled?: boolean;
}

interface DashboardHeaderProps {
  /** Titre principal (ex: nom de l'utilisateur, commerce) */
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
}

/**
 * Header réutilisable pour tous les dashboards
 * Gère l'affichage du logo, titre, sous-titre et actions
 */
export const DashboardHeader = ({
  title,
  subtitle,
  logo,
  logoAlt = 'Logo',
  defaultIcon = '👤',
  actions = [],
  showLogout = true,
  className = '',
}: DashboardHeaderProps) => {
  // Hooks
  const { profile, signOut } = useAuthStore();

  // Déterminer le titre final
  const finalTitle = title || `Bonjour ${profile?.full_name || 'Utilisateur'} !`;

  // Déterminer le sous-titre final
  const finalSubtitle = subtitle || 'Bienvenue sur votre tableau de bord';

  // Render du logo
  const renderLogo = () => {
    // Si logo est une string (URL)
    if (typeof logo === 'string') {
      return (
        <img
          src={logo}
          alt={logoAlt}
          className="h-10 w-10 rounded-xl object-cover border-2 border-gray-200 shadow-md flex-shrink-0"
        />
      );
    }

    // Si logo est un élément React
    if (logo) {
      return <div className="flex-shrink-0">{logo}</div>;
    }

    // Logo par défaut avec emoji/icône
    return (
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
        <span className="text-2xl">{defaultIcon}</span>
      </div>
    );
  };

  // Render d'un bouton d'action
  const renderActionButton = (action: ActionButton, index: number) => {
    const Icon = action.icon;
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg',
      secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:from-secondary-700 hover:to-secondary-800 shadow-md hover:shadow-lg',
      danger: 'text-red-600 border border-red-600 hover:bg-red-50',
    };

    const classes = variantClasses[action.variant || 'primary'];
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <button
        key={index}
        onClick={action.disabled ? undefined : action.onClick}
        disabled={action.disabled}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-all font-semibold ${classes} ${disabledClasses}`}
        aria-label={action.label}
      >
        {Icon && <Icon size={18} strokeWidth={2} />}
        <span className="hidden sm:inline">{action.mobileLabel || action.label}</span>
      </button>
    );
  };

  // Render principal
  return (
    <header className={`bg-white sticky top-0 z-40 border-b border-gray-200 ${className}`}>
      <div className="max-w-12xl mx-auto px-4 sm:px-6 py-4">
        {/* Layout Desktop : Grid 3 colonnes avec logo au centre */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 items-center">
          {/* Section gauche : Titre et sous-titre */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-black truncate">
              {finalTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-light mt-0.5 truncate">
              {finalSubtitle}
            </p>
          </div>

          {/* Section centrale : Logo */}
          <div className="flex items-center justify-center">
            {renderLogo()}
          </div>

          {/* Section droite : Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Boutons d'action personnalisés */}
            {actions.map((action, index) => renderActionButton(action, index))}

            {/* Bouton de déconnexion */}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-red-600 border border-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
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
              <h1 className="text-base font-bold text-black truncate">
                {finalTitle}
              </h1>
              <p className="text-xs text-gray-600 font-light mt-0.5 truncate">
                {finalSubtitle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, index) => renderActionButton(action, index))}
            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

