// Imports externes
import { MapPin, History, TrendingUp, ShoppingBag } from 'lucide-react';

interface CustomerActionsProps {
  onNavigateToMap: () => void;
  onNavigateToReservations: () => void;
  onNavigateToImpact: () => void;
  onNavigateToBrowse: () => void;
}

/**
 * Widget d'actions rapides pour le client
 * Affiche les boutons CTA principaux pour naviguer dans l'application
 */
export function CustomerActions({
  onNavigateToMap,
  onNavigateToReservations,
  onNavigateToImpact,
  onNavigateToBrowse,
}: CustomerActionsProps) {
  // Données des actions
  const actions = [
    {
      id: 'browse',
      label: 'Trouver un panier',
      icon: ShoppingBag,
      emoji: '🛒',
      onClick: onNavigateToBrowse,
      variant: 'primary' as const,
      description: 'Découvrez les lots disponibles',
    },
    {
      id: 'map',
      label: 'Voir la carte',
      icon: MapPin,
      emoji: '🗺️',
      onClick: onNavigateToMap,
      variant: 'secondary' as const,
      description: 'Commerçants près de vous',
    },
    {
      id: 'reservations',
      label: 'Mes réservations',
      icon: History,
      emoji: '📦',
      onClick: onNavigateToReservations,
      variant: 'secondary' as const,
      description: 'Gérez vos paniers',
    },
    {
      id: 'impact',
      label: 'Mon impact complet',
      icon: TrendingUp,
      emoji: '🌍',
      onClick: onNavigateToImpact,
      variant: 'secondary' as const,
      description: 'Votre contribution écologique',
    },
  ];

  // Render principal
  return (
    <div className="card bg-gradient-to-br from-success-50 to-primary-50 rounded-2xl border-2 border-success-200 p-6 shadow-lg h-full flex flex-col">
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <span>Actions rapides</span>
        </h2>
        <p className="text-sm text-gray-600 font-light">
          Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      {/* Liste des actions */}
      <div className="flex flex-col gap-3 flex-1">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isPrimary = action.variant === 'primary';

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`group flex items-center gap-4 p-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                isPrimary
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              } ${index === 0 ? 'animate-pulse-soft' : ''}`}
            >
              {/* Icône */}
              <div
                className={`flex-shrink-0 p-2 rounded-lg ${
                  isPrimary
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600'
                }`}
              >
                <Icon
                  size={24}
                  className={isPrimary ? 'text-white' : 'text-white'}
                  strokeWidth={2}
                />
              </div>

              {/* Contenu */}
              <div className="flex-1 text-left">
                <p className={`text-base font-bold ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
                  {action.label}
                </p>
                <p
                  className={`text-xs font-light ${
                    isPrimary ? 'text-white/80' : 'text-gray-600'
                  }`}
                >
                  {action.description}
                </p>
              </div>

              {/* Emoji */}
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {action.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Message motivationnel */}
      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-success-200">
        <p className="text-xs text-center text-gray-700 font-medium">
          💚 Chaque panier sauvé fait la différence !
        </p>
      </div>
    </div>
  );
}

