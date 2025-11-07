// Imports externes
import { useEffect, useState, useCallback, memo } from 'react';
import { LogOut, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';

type ActionVariant = 'primary' | 'secondary' | 'danger';

interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: ActionVariant;
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
}

/**
 * Header allégé spécifiquement pour les commerçants.
 * Met en avant l'identité du commerce et les actions clés.
 */
export const MerchantHeader = memo(
  ({
    title,
    subtitle,
    logo,
    logoAlt = 'Logo',
    defaultIcon = '🏪',
    actions = [],
    showLogout = true,
    className = '',
  }: MerchantHeaderProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { profile, signOut } = useAuthStore();

    // Gestion du scroll avec nettoyage
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    // Titre et sous-titre finaux
    const finalTitle = title || profile?.business_name || profile?.full_name || 'Commerçant';
    const finalSubtitle =
      subtitle || profile?.business_description || 'Valorisez vos invendus, réduisez le gaspillage ! 💚';

    // Rendu du logo (optimisé avec useCallback)
    const renderLogo = useCallback(() => {
      if (typeof logo === 'string') {
        return (
          <div className="flex flex-shrink-0 items-center justify-center">
            <img
              src={logo}
              alt={logoAlt}
              className="h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-white sm:h-12 sm:w-12"
              loading="lazy"
            />
          </div>
        );
      }
      if (logo) {
        return <div className="flex flex-shrink-0 items-center justify-center">{logo}</div>;
      }
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 shadow-lg ring-2 ring-white/50 sm:h-12 sm:w-12">
          <span className="text-xl sm:text-2xl">{defaultIcon}</span>
        </div>
      );
    }, [logo, logoAlt, defaultIcon]);

    // Rendu des boutons d'action (optimisé avec useCallback)
    const renderActionButton = useCallback(
      (action: ActionButton, index: number) => {
        const Icon = action.icon;
        const baseClasses =
          'flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 hover:-translate-y-0.5';
        const variant = action.variant ?? 'primary';
        const variantClasses: Record<ActionVariant, string> = {
          primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg',
          secondary: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md hover:shadow-lg',
          danger: 'border border-red-200 bg-white/85 text-red-600 shadow-sm hover:border-red-300 hover:bg-red-50 hover:shadow-md',
        };
        const disabledClasses = action.disabled ? 'cursor-not-allowed opacity-60' : '';

        return (
          <button
            key={`${action.label}-${index}`}
            onClick={action.disabled ? undefined : action.onClick}
            disabled={action.disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
            aria-label={action.mobileLabel ?? action.label}
            title={action.label}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={2.5} />}
          </button>
        );
      },
      [],
    );

    // Rendu du bouton de déconnexion (optimisé avec useCallback)
    const renderLogoutButton = useCallback(() => (
      <button
        onClick={signOut}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white/85 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        aria-label="Se déconnecter"
      >
        <LogOut size={16} strokeWidth={2.5} />
      </button>
    ), [signOut]);

    return (
      <header
        className={`sticky top-0 z-40 border-b border-white/40 bg-gradient-to-br from-white/85 via-white/75 to-white/60 transition-all duration-300 ${
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
                <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">{finalTitle}</h1>
                <p className="text-xs font-medium text-slate-600 sm:text-sm">{finalSubtitle}</p>
              </div>
            </div>
            {(actions.length > 0 || showLogout) && (
              <div className="flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-xl">
                {actions.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {actions.map((action, index) => renderActionButton(action, index))}
                  </div>
                )}
                {actions.length > 0 && showLogout && (
                  <span className="hidden h-6 w-px bg-gradient-to-b from-transparent via-slate-300/70 to-transparent sm:block" />
                )}
                {showLogout && renderLogoutButton()}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  },
);

// Nom du composant pour le débogage
MerchantHeader.displayName = 'MerchantHeader';
