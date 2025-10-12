// Imports externes
import { useState, useEffect } from 'react';
import { Users, Package, DollarSign, Heart, TrendingUp, Truck } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';

/**
 * Composant affichant les statistiques globales de la plateforme
 * Vue d'ensemble pour les administrateurs avec métriques clés
 */
export const AdminStats = () => {
  // État local
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalBeneficiaries: 0,
    totalCollectors: 0,
    totalLots: 0,
    totalRevenue: 0,
    itemsSaved: 0,
    donations: 0,
    activeMissions: 0,
  });
  const [loading, setLoading] = useState(true);

  // Effets
  useEffect(() => {
    fetchStats();
  }, []);

  // Handlers
  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('role');
      const { data: lots } = await supabase.from('lots').select('quantity_reserved, quantity_sold');
      const { data: reservations } = await supabase
        .from('reservations')
        .select('total_price, is_donation');
      const { data: missions } = await supabase
        .from('missions')
        .select('status')
        .in('status', ['accepted', 'in_progress']);

      const totalUsers = profiles?.length || 0;
      const totalMerchants = profiles?.filter((p) => p.role === 'merchant').length || 0;
      const totalBeneficiaries = profiles?.filter((p) => p.role === 'beneficiary').length || 0;
      const totalCollectors = profiles?.filter((p) => p.role === 'collector').length || 0;
      const totalLots = lots?.length || 0;
      const totalRevenue = reservations?.reduce((sum, r) => sum + r.total_price, 0) || 0;
      const itemsSaved =
        lots?.reduce((sum, lot) => sum + lot.quantity_reserved + lot.quantity_sold, 0) || 0;
      const donations = reservations?.filter((r) => r.is_donation).length || 0;
      const activeMissions = missions?.length || 0;

      setStats({
        totalUsers,
        totalMerchants,
        totalBeneficiaries,
        totalCollectors,
        totalLots,
        totalRevenue,
        itemsSaved,
        donations,
        activeMissions,
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
      title: 'Utilisateurs Total',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      detail: `${stats.totalMerchants} commerçants, ${stats.totalBeneficiaries} bénéficiaires`,
    },
    {
      title: 'Lots Publiés',
      value: stats.totalLots,
      icon: Package,
      color: 'bg-green-500',
      detail: `${stats.itemsSaved} articles sauvés`,
    },
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      detail: 'Total des transactions',
    },
    {
      title: 'Dons Solidaires',
      value: stats.donations,
      icon: Heart,
      color: 'bg-pink-500',
      detail: 'Paniers suspendus offerts',
    },
    {
      title: 'Impact CO₂',
      value: `${(stats.itemsSaved * 2.5).toFixed(0)} kg`,
      icon: TrendingUp,
      color: 'bg-green-600',
      detail: 'CO₂ économisé',
    },
    {
      title: 'Missions Actives',
      value: stats.activeMissions,
      icon: Truck,
      color: 'bg-orange-500',
      detail: `${stats.totalCollectors} collecteurs actifs`,
    },
  ];

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Vue d'ensemble de la plateforme</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition animate-fade-in-up"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`${card.color} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 truncate">{card.value}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{card.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Impact Environnemental</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Repas sauvés</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">{stats.itemsSaved}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Eau économisée</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                {(stats.itemsSaved * 50).toFixed(0)} L
              </span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Énergie économisée</span>
              <span className="text-xl sm:text-2xl font-bold text-yellow-600">
                {(stats.itemsSaved * 0.5).toFixed(1)} kWh
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Impact Social</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-pink-50 rounded-lg border border-pink-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Bénéficiaires aidés</span>
              <span className="text-xl sm:text-2xl font-bold text-pink-600">
                {stats.totalBeneficiaries}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Dons réalisés</span>
              <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.donations}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Commerçants engagés</span>
              <span className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalMerchants}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
