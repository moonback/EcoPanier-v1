// Imports externes
import { Leaf, DollarSign, Package, Heart } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useImpactMetrics, calculateCO2Impact } from '../../hooks/useImpactMetrics';

/**
 * Widget pour afficher les statistiques d'impact personnel du client
 * Affiche les repas sauvés, CO₂ économisé, argent économisé et dons solidaires
 */
export function CustomerImpactStats() {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { metrics, loading, error } = useImpactMetrics(profile?.id);

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-red-200 p-6 shadow-lg">
        <p className="text-red-600 font-semibold text-center">{error}</p>
      </div>
    );
  }

  // Données des statistiques
  const stats = [
    {
      id: 'meals',
      label: 'Repas Sauvés',
      value: metrics.meals_saved.toFixed(0),
      icon: Package,
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-700',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
    },
    {
      id: 'co2',
      label: 'CO₂ Évité',
      value: `${calculateCO2Impact(metrics.meals_saved).toFixed(1)} kg`,
      icon: Leaf,
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      id: 'money',
      label: 'Économies',
      value: `${metrics.money_saved.toFixed(0)}€`,
      icon: DollarSign,
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-700',
      iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
    },
    {
      id: 'donations',
      label: 'Dons Solidaires',
      value: metrics.donations_made.toFixed(0),
      icon: Heart,
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200',
      textColor: 'text-accent-700',
      iconBg: 'bg-gradient-to-br from-accent-500 to-accent-600',
    },
  ];

  // Render principal
  return (
    <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span>Votre Impact</span>
        </h2>
        {metrics.meals_saved > 0 && (
          <span className="px-3 py-1 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full text-xs font-bold shadow-sm">
            🔥 Actif !
          </span>
        )}
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 ${stat.bgColor} ${stat.borderColor} hover:shadow-md transition-shadow`}
            >
              {/* Icône */}
              <div className={`flex-shrink-0 p-3 rounded-xl ${stat.iconBg}`}>
                <Icon size={24} className="text-white" strokeWidth={2} />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor} truncate`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message de motivation */}
      {metrics.meals_saved === 0 ? (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-success-50 rounded-xl border-2 border-primary-100">
          <p className="text-sm text-gray-700 font-medium text-center">
            Commencez votre aventure anti-gaspi dès aujourd'hui ! 🌍💚
          </p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border-2 border-success-100">
          <p className="text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
            <span className="text-lg">🎉</span>
            <span>
              Bravo ! Vous avez sauvé <strong className="text-success-700">{metrics.meals_saved.toFixed(0)} repas</strong> du gaspillage !
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

