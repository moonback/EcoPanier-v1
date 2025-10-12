import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { TrendingUp, Heart, Package, DollarSign } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type ImpactMetric = Database['public']['Tables']['impact_metrics']['Row'];

export const ImpactDashboard = () => {
  const [metrics, setMetrics] = useState({
    meals_saved: 0,
    co2_saved: 0,
    money_saved: 0,
    donations_made: 0,
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;

      const aggregated = data.reduce(
        (acc, metric) => {
          acc[metric.metric_type] += metric.value;
          return acc;
        },
        {
          meals_saved: 0,
          co2_saved: 0,
          money_saved: 0,
          donations_made: 0,
        }
      );

      setMetrics(aggregated);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
      value: (metrics.meals_saved * 2.5).toFixed(1),
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

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {impactCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all hover-lift"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`${card.color} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{card.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 sm:mt-3">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Votre Impact Environnemental</h2>

        <div className="space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Félicitations pour votre engagement!
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              En sauvant {metrics.meals_saved.toFixed(0)} repas du gaspillage, vous avez contribué
              à réduire l'empreinte carbone de notre communauté. Chaque geste compte!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 border border-gray-200 rounded-lg">
              <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Équivalence environnementale</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">🌳</span>
                  <span>{(metrics.meals_saved * 0.1).toFixed(1)} arbres préservés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">💧</span>
                  <span>{(metrics.meals_saved * 50).toFixed(0)} litres d'eau économisés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">⚡</span>
                  <span>{(metrics.meals_saved * 0.5).toFixed(1)} kWh d'énergie économisés</span>
                </li>
              </ul>
            </div>

            <div className="p-4 sm:p-6 border border-gray-200 rounded-lg">
              <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Impact social</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
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
