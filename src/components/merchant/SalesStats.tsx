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
      title: '📦 Paniers Créés',
      value: stats.totalLots,
      icon: Package,
      color: 'from-primary-500 to-primary-600',
      suffix: '',
      emoji: '🎉',
    },
    {
      title: '💰 Revenus Récupérés',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-success-500 to-success-600',
      suffix: '',
      emoji: '💵',
    },
    {
      title: '📈 Articles Vendus',
      value: stats.itemsSold,
      icon: TrendingUp,
      color: 'from-warning-500 to-warning-600',
      suffix: '',
      emoji: '✅',
    },
    {
      title: '🌍 Articles Sauvés',
      value: stats.itemsSaved,
      icon: Users,
      color: 'from-accent-500 to-accent-600',
      suffix: '',
      emoji: '♻️',
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
              className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-semibold mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-black truncate">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section impact environnemental */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-md">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black">
              Votre Impact Environnemental
            </h3>
            <p className="text-sm text-gray-600">Chaque panier sauvé compte ! 🌱</p>
          </div>
        </div>

        {/* Message de félicitations */}
        <div className="mb-6 p-6 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border-2 border-success-100">
          <h4 className="font-bold text-black mb-2 flex items-center gap-2">
            <span className="text-2xl">🎊</span>
            <span>Félicitations pour votre engagement !</span>
          </h4>
          <p className="text-gray-700 font-light leading-relaxed">
            Grâce à vous, <strong className="text-primary-600">{stats.itemsSaved} articles</strong> ont été sauvés du gaspillage.
            Vous contribuez activement à la protection de la planète et à la solidarité locale ! 💪
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌱</span>
              <div>
                <p className="text-3xl font-bold text-success-600">
                  {(stats.itemsSaved * 2.5).toFixed(1)}
                </p>
                <p className="text-sm font-semibold text-gray-700">kg de CO₂</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-light">évité dans l'atmosphère</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💧</span>
              <div>
                <p className="text-3xl font-bold text-primary-600">
                  {(stats.itemsSaved * 50).toFixed(0)}
                </p>
                <p className="text-sm font-semibold text-gray-700">litres d'eau</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-light">économisés</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🍽️</span>
              <div>
                <p className="text-3xl font-bold text-warning-600">
                  {stats.itemsSaved}
                </p>
                <p className="text-sm font-semibold text-gray-700">repas</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-light">sauvés du gaspillage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
