import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/helpers';
import { TrendingUp, Package, DollarSign, Users } from 'lucide-react';

export const SalesStats = () => {
  const [stats, setStats] = useState({
    totalLots: 0,
    totalRevenue: 0,
    itemsSold: 0,
    itemsSaved: 0,
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistiques</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Impact Environnemental</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600 mb-2">
              {(stats.itemsSaved * 2.5).toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-600">CO₂ économisé</p>
          </div>

          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {(stats.itemsSaved * 50).toFixed(0)} L
            </p>
            <p className="text-sm text-gray-600">Eau économisée</p>
          </div>

          <div className="p-6 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.itemsSaved}
            </p>
            <p className="text-sm text-gray-600">Repas sauvés</p>
          </div>
        </div>
      </div>
    </div>
  );
};
