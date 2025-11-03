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
import { ImpactCard, SkeletonImpactCard } from './components';

/**
 * Composant pour afficher le tableau de bord d'impact environnemental et social
 * Affiche les statistiques d'impact du client et leurs équivalences
 */
export const ImpactDashboard = () => {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { metrics, loading, error } = useImpactMetrics(profile?.id);

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div>
        {/* Cartes d'impact skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonImpactCard key={index} />
          ))}
        </div>

        {/* Section détaillée skeleton */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
      title: '🍽️ Repas Sauvés',
      value: metrics.meals_saved.toFixed(0),
      icon: Package,
      color: 'from-primary-500 to-primary-600',
      description: 'repas sauvés du gaspillage',
      emoji: '🎉',
    },
    {
      title: '🌱 CO₂ Évité',
      value: `${calculateCO2Impact(metrics.meals_saved).toFixed(1)} kg`,
      icon: TrendingUp,
      color: 'from-success-500 to-success-600',
      description: 'de CO₂ non émis dans l\'atmosphère',
      emoji: '🌍',
    },
    {
      title: '💰 Économies',
      value: `${metrics.money_saved.toFixed(0)}€`,
      icon: DollarSign,
      color: 'from-warning-500 to-warning-600',
      description: 'économisés sur vos courses',
      emoji: '🎊',
    },
    {
      title: '❤️ Solidarité',
      value: metrics.donations_made.toFixed(0),
      icon: Heart,
      color: 'from-accent-500 to-accent-600',
      description: 'paniers solidaires offerts',
      emoji: '🤝',
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
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">
              Votre Impact Environnemental
            </h2>
            <p className="text-sm text-gray-600">Calculs basés sur des données scientifiques crédibles 🌍</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Message de félicitations */}
          <div className="p-6 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border-2 border-success-100">
            <h3 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span>Bravo pour votre engagement !</span>
            </h3>
            <p className="text-gray-700 font-light leading-relaxed">
              En sauvant <strong className="text-primary-600">{metrics.meals_saved.toFixed(0)} repas</strong> du gaspillage, vous
              avez contribué à réduire l'empreinte carbone de notre communauté. 
              Vous êtes un véritable héros anti-gaspi ! 💪
            </p>
          </div>

          {/* Équivalences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Équivalence environnementale */}
            <div className="p-6 bg-gradient-to-br from-success-50 to-white border-2 border-success-100 rounded-xl">
              <h4 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <span>Équivalence environnementale</span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">🌳</span>
                  <div>
                    <div className="font-semibold text-success-700">
                      {calculateTreesEquivalent(metrics.meals_saved).toFixed(1)} arbres
                    </div>
                    <div className="text-xs text-gray-600">préservés grâce à vous</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">💧</span>
                  <div>
                    <div className="font-semibold text-primary-700">
                      {calculateWaterSaved(metrics.meals_saved).toFixed(0)} litres
                    </div>
                    <div className="text-xs text-gray-600">d'eau économisés</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">⚡</span>
                  <div>
                    <div className="font-semibold text-warning-700">
                      {calculateEnergySaved(metrics.meals_saved).toFixed(1)} kWh
                    </div>
                    <div className="text-xs text-gray-600">d'énergie économisés</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Impact social */}
            <div className="p-6 bg-gradient-to-br from-accent-50 to-white border-2 border-accent-100 rounded-xl">
              <h4 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <span>Impact social</span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">🎁</span>
                  <div>
                    <div className="font-semibold text-accent-700">
                      {metrics.donations_made.toFixed(0)} personnes
                    </div>
                    <div className="text-xs text-gray-600">aidées par vos dons</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">🤝</span>
                  <div>
                    <div className="font-semibold text-secondary-700">Membre actif</div>
                    <div className="text-xs text-gray-600">de la communauté solidaire</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl flex-shrink-0">🌟</span>
                  <div>
                    <div className="font-semibold text-primary-700">Héros local</div>
                    <div className="text-xs text-gray-600">du changement positif</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Sources scientifiques */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span>📚</span>
              <span>Sources scientifiques</span>
            </h5>
            <ul className="text-[10px] text-gray-600 space-y-1">
              <li>• <strong>CO₂ :</strong> ADEME (2024) - 0.9 kg CO₂ par repas gaspillé évité</li>
              <li>• <strong>Eau :</strong> FAO - 50 litres d'eau par repas sauvé</li>
              <li>• <strong>Énergie :</strong> WWF - 0.5 kWh par repas (production, transport, stockage)</li>
              <li>• <strong>Arbres :</strong> ONF - 1 arbre mature absorbe ~22 kg CO₂/an</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
