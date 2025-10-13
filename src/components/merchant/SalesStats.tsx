// Imports externes
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/helpers';

// Types personnalisés pour les réservations et lots
type ReservationWithLot = {
  total_price: number;
  quantity: number;
  status: string;
};

type LotData = {
  quantity_reserved: number;
  quantity_sold: number;
};

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

      const reservationData = (reservations || []) as ReservationWithLot[];
      const totalRevenue = reservationData.reduce((sum, r) => sum + r.total_price, 0);
      const itemsSold = reservationData
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + r.quantity, 0);
      const lotData = (lots || []) as LotData[];
      const itemsSaved = lotData.reduce(
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div>
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-xl flex-shrink-0`}>
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 font-light">{card.title}</p>
                  <p className="text-2xl font-bold text-black truncate">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section impact environnemental */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-black mb-6">
          Impact Environnemental
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-3xl font-bold text-black mb-2">
              {(stats.itemsSaved * 2.5).toFixed(1)} kg
            </p>
            <p className="text-sm text-gray-600 font-light">CO₂ économisé</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-3xl font-bold text-black mb-2">
              {(stats.itemsSaved * 50).toFixed(0)} L
            </p>
            <p className="text-sm text-gray-600 font-light">Eau économisée</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-3xl font-bold text-black mb-2">
              {stats.itemsSaved}
            </p>
            <p className="text-sm text-gray-600 font-light">Repas sauvés</p>
          </div>
        </div>
      </div>
    </div>
  );
};
