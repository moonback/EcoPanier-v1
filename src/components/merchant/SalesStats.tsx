// Imports externes
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/helpers';

/**
 * Composant pour afficher les statistiques de vente d'un commerçant
 * Affiche les lots créés, le chiffre d'affaires, les articles vendus et l'impact
 */
export const SalesStats = () => {
  // État local
  const [stats, setStats] = useState({
    totalLots: 0,
    totalRevenue: 0,
    itemsSold: 0,
    itemsSaved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Effets
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const fetchStats = async () => {
    if (!profile) return;

    try {
      const { data: lots, error: lotsError } = await supabase
        .from('lots')
        .select('*')
        .eq('merchant_id', profile.id);

      if (lotsError) throw lotsError;

      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('*, lots!inner(merchant_id)')
        .eq('lots.merchant_id', profile.id)
        .in('status', ['completed', 'pending', 'confirmed']);

      if (reservationsError) throw reservationsError;

      const totalRevenue = reservations.reduce((sum, r) => sum + r.total_price, 0);
      const itemsSold = reservations
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + r.quantity, 0);
      const itemsSaved = lots.reduce(
        (sum, lot) => sum + lot.quantity_reserved + lot.quantity_sold,
        0
      );

      setStats({
        totalLots: lots.length,
        totalRevenue,
        itemsSold,
        itemsSaved,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données des cartes de statistiques
  const statCards = [
    {
      title: 'Lots Créés',
      value: stats.totalLots,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Articles Vendus',
      value: stats.itemsSold,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      title: 'Articles Sauvés',
      value: stats.itemsSaved,
      icon: Users,
      color: 'bg-pink-500',
    },
  ];

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div>
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition animate-fade-in-up"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`${card.color} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section impact environnemental */}
      <div className="bg-white rounded-xl shadow-md p-5 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Impact Environnemental
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 bg-green-50 rounded-lg border border-green-100">
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              {(stats.itemsSaved * 2.5).toFixed(1)} kg
            </p>
            <p className="text-xs sm:text-sm text-gray-600">CO₂ économisé</p>
          </div>

          <div className="p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
              {(stats.itemsSaved * 50).toFixed(0)} L
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Eau économisée</p>
          </div>

          <div className="p-4 sm:p-6 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
              {stats.itemsSaved}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Repas sauvés</p>
          </div>
        </div>
      </div>
    </div>
  );
};
