// Imports externes
import { TrendingUp, Heart, Package, DollarSign } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import {
  useImpactMetrics,
  calculateCO2Impact,
  calculateTreesEquivalent,
  calculateWaterSaved,
  calculateEnergySaved,
} from '../../hooks/useImpactMetrics';
import { ImpactCard, InlineSpinner } from './components';

/**
 * Composant pour afficher le tableau de bord d'impact environnemental et social
 * Affiche les statistiques d'impact du client et leurs équivalences
 */
export const ImpactDashboard = () => {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { metrics, loading, error } = useImpactMetrics(profile?.id);

  // Early returns (conditions de sortie)
  if (loading) return <InlineSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  // Données des cartes d'impact
  const impactCards = [
    {
      title: 'Repas Sauvés',
      value: metrics.meals_saved.toFixed(0),
      icon: Package,
      color: 'bg-blue-500',
      description: 'repas sauvés du gaspillage',
    },
    {
      title: 'CO₂ Économisé',
      value: calculateCO2Impact(metrics.meals_saved).toFixed(1),
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'kg de CO₂ non émis',
    },
    {
      title: 'Économies',
      value: `${metrics.money_saved.toFixed(0)}€`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      description: "d'économies réalisées",
    },
    {
      title: 'Dons Solidaires',
      value: metrics.donations_made.toFixed(0),
      icon: Heart,
      color: 'bg-pink-500',
      description: 'paniers suspendus offerts',
    },
  ];

  // Render principal
  return (
    <div>
      {/* Cartes d'impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {impactCards.map((card) => (
          <ImpactCard key={card.title} {...card} />
        ))}
      </div>

      {/* Section détaillée de l'impact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Votre Impact Environnemental
        </h2>

        <div className="space-y-6">
          {/* Message de félicitations */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold text-black mb-2">
              Félicitations pour votre engagement !
            </h3>
            <p className="text-gray-700 font-light leading-relaxed">
              En sauvant {metrics.meals_saved.toFixed(0)} repas du gaspillage, vous
              avez contribué à réduire l'empreinte carbone de notre communauté. Chaque
              geste compte !
            </p>
          </div>

          {/* Équivalences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Équivalence environnementale */}
            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="text-base font-bold text-black mb-4">
                Équivalence environnementale
              </h4>
              <ul className="space-y-3 text-sm text-gray-700 font-light">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">🌳</span>
                  <span>
                    {calculateTreesEquivalent(metrics.meals_saved).toFixed(1)} arbres
                    préservés
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">💧</span>
                  <span>
                    {calculateWaterSaved(metrics.meals_saved).toFixed(0)} litres d'eau
                    économisés
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">⚡</span>
                  <span>
                    {calculateEnergySaved(metrics.meals_saved).toFixed(1)} kWh d'énergie
                    économisés
                  </span>
                </li>
              </ul>
            </div>

            {/* Impact social */}
            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="text-base font-bold text-black mb-4">
                Impact social
              </h4>
              <ul className="space-y-3 text-sm text-gray-700 font-light">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">❤️</span>
                  <span>{metrics.donations_made.toFixed(0)} personnes aidées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">🤝</span>
                  <span>Membre actif de la communauté solidaire</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">🌟</span>
                  <span>Acteur du changement local</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
