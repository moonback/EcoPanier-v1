import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Gift, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoyaltyStatsProps {
  merchantId: string;
}

export const LoyaltyStats = ({ merchantId }: LoyaltyStatsProps) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPointsEarned: 0,
    totalRewardsRedeemed: 0,
    averagePointsPerCustomer: 0,
    monthlyGrowth: 0,
    topRewards: [],
    customerLevels: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [merchantId]);

  const loadStats = async () => {
    try {
      // Charger les statistiques de base
      const { data: customersData } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('merchant_id', merchantId);

      const { data: transactionsData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('merchant_id', merchantId);

      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('merchant_id', merchantId);

      // Calculer les statistiques
      const totalCustomers = customersData?.length || 0;
      const activeCustomers = customersData?.filter(c => c.points > 0).length || 0;
      const totalPointsEarned = transactionsData?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
      const totalRewardsRedeemed = transactionsData?.filter(t => t.type === 'redemption').length || 0;
      const averagePointsPerCustomer = totalCustomers > 0 ? Math.round(totalPointsEarned / totalCustomers) : 0;

      // Top récompenses
      const topRewards = rewardsData
        ?.sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5) || [];

      // Répartition par niveau
      const customerLevels = {
        bronze: customersData?.filter(c => c.points < 100).length || 0,
        silver: customersData?.filter(c => c.points >= 100 && c.points < 300).length || 0,
        gold: customersData?.filter(c => c.points >= 300 && c.points < 600).length || 0,
        platinum: customersData?.filter(c => c.points >= 600).length || 0,
      };

      setStats({
        totalCustomers,
        activeCustomers,
        totalPointsEarned,
        totalRewardsRedeemed,
        averagePointsPerCustomer,
        monthlyGrowth: 0, // TODO: Calculer la croissance mensuelle
        topRewards,
        customerLevels
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistiques de Fidélité</h2>
        <p className="text-gray-600">Analysez les performances de votre programme de fidélité</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalCustomers}</div>
              <div className="text-blue-100">Clients inscrits</div>
            </div>
            <Users size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.activeCustomers}</div>
              <div className="text-green-100">Clients actifs</div>
            </div>
            <TrendingUp size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalPointsEarned.toLocaleString()}</div>
              <div className="text-purple-100">Points distribués</div>
            </div>
            <BarChart3 size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalRewardsRedeemed}</div>
              <div className="text-orange-100">Récompenses échangées</div>
            </div>
            <Gift size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par niveau */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition par Niveau</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-sm">🥉</div>
                <span className="font-medium">Bronze</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{stats.customerLevels.bronze}</div>
                <div className="text-sm text-gray-600">{Math.round((stats.customerLevels.bronze / stats.totalCustomers) * 100) || 0}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white text-sm">🥈</div>
                <span className="font-medium">Argent</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{stats.customerLevels.silver}</div>
                <div className="text-sm text-gray-600">{Math.round((stats.customerLevels.silver / stats.totalCustomers) * 100) || 0}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm">🥇</div>
                <span className="font-medium">Or</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{stats.customerLevels.gold}</div>
                <div className="text-sm text-gray-600">{Math.round((stats.customerLevels.gold / stats.totalCustomers) * 100) || 0}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">💎</div>
                <span className="font-medium">Platine</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{stats.customerLevels.platinum}</div>
                <div className="text-sm text-gray-600">{Math.round((stats.customerLevels.platinum / stats.totalCustomers) * 100) || 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top récompenses */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Récompenses</h3>
          <div className="space-y-3">
            {stats.topRewards.map((reward, index) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{reward.name}</div>
                    <div className="text-sm text-gray-600">{reward.points_cost} points</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{reward.usage_count}</div>
                  <div className="text-sm text-gray-600">utilisations</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Recommandations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Engagement Client</h4>
            <p className="text-sm text-gray-600">
              {stats.averagePointsPerCustomer < 50 
                ? "Encouragez vos clients à participer davantage avec des récompenses attractives."
                : "Excellent engagement ! Continuez à proposer des récompenses variées."
              }
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Optimisation</h4>
            <p className="text-sm text-gray-600">
              {stats.totalRewardsRedeemed < stats.totalCustomers * 0.3
                ? "Créez des récompenses plus accessibles pour augmenter les échanges."
                : "Parfait équilibre entre coût et valeur perçue des récompenses."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

