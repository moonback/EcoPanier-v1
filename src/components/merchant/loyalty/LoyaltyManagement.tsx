import { useState, useEffect } from 'react';
import { Gift, Users, Trophy, Star, Settings, BarChart3, Award, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { LoyaltyProgramConfig } from './LoyaltyProgramConfig';
import { LoyaltyStats } from './LoyaltyStats';
import { LoyaltyRewards } from './LoyaltyRewards';
import { LoyaltyCustomers } from './LoyaltyCustomers';
import { LOYALTY_LEVELS, LOYALTY_BADGES, LOYALTY_REWARDS, LoyaltyUtils } from './types';

type LoyaltyTab = 'overview' | 'customers' | 'rewards' | 'stats' | 'config';

export const LoyaltyManagement = () => {
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('overview');
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPointsEarned: 0,
    totalRewardsRedeemed: 0,
    averagePointsPerCustomer: 0,
    topCustomers: []
  });

  const { profile } = useAuthStore();

  // Charger le programme de fidélité du commerçant
  useEffect(() => {
    if (profile?.id) {
      loadLoyaltyProgram();
      loadLoyaltyStats();
    }
  }, [profile?.id]);

  const loadLoyaltyProgram = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('merchant_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      setLoyaltyProgram(data);
    } catch (error) {
      console.error('Erreur lors du chargement du programme de fidélité:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLoyaltyStats = async () => {
    try {
      // Charger les statistiques de fidélité
      const { data: customersData, error: customersError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('merchant_id', profile?.id);

      if (customersError) throw customersError;

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('merchant_id', profile?.id);

      if (transactionsError) throw transactionsError;

      // Calculer les statistiques
      const totalCustomers = customersData?.length || 0;
      const activeCustomers = customersData?.filter(c => c.points > 0).length || 0;
      const totalPointsEarned = transactionsData?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
      const totalRewardsRedeemed = transactionsData?.filter(t => t.type === 'redemption').length || 0;
      const averagePointsPerCustomer = totalCustomers > 0 ? Math.round(totalPointsEarned / totalCustomers) : 0;

      // Top 5 clients par points
      const topCustomers = customersData
        ?.sort((a, b) => b.points - a.points)
        .slice(0, 5) || [];

      setStats({
        totalCustomers,
        activeCustomers,
        totalPointsEarned,
        totalRewardsRedeemed,
        averagePointsPerCustomer,
        topCustomers
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const tabs = [
    { id: 'overview' as LoyaltyTab, label: 'Vue d\'ensemble', icon: BarChart3, emoji: '📊' },
    { id: 'customers' as LoyaltyTab, label: 'Clients', icon: Users, emoji: '👥' },
    { id: 'rewards' as LoyaltyTab, label: 'Récompenses', icon: Gift, emoji: '🎁' },
    { id: 'stats' as LoyaltyTab, label: 'Statistiques', icon: Trophy, emoji: '🏆' },
    { id: 'config' as LoyaltyTab, label: 'Configuration', icon: Settings, emoji: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎁 Programme de Fidélité</h1>
            <p className="text-purple-100">
              Fidélisez vos clients et récompensez leur engagement anti-gaspi
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <div className="text-sm text-purple-100">Clients inscrits</div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</div>
              <div className="text-sm text-gray-600">Clients actifs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPointsEarned.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Points distribués</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRewardsRedeemed}</div>
              <div className="text-sm text-gray-600">Récompenses échangées</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.averagePointsPerCustomer}</div>
              <div className="text-sm text-gray-600">Points moyen/client</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Vue d'ensemble du programme */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Niveaux de fidélité */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award size={24} className="text-purple-600" />
                    Niveaux de Fidélité
                  </h3>
                  <div className="space-y-3">
                    {LOYALTY_LEVELS.map((level, index) => (
                      <div key={level.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className={`w-10 h-10 bg-gradient-to-r ${level.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {level.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{level.name}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                          <div className="text-xs text-gray-500">{level.pointsRequired} points requis</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top clients */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy size={24} className="text-blue-600" />
                    Top Clients
                  </h3>
                  <div className="space-y-3">
                    {stats.topCustomers.map((customer, index) => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{customer.customer_name || 'Client anonyme'}</div>
                          <div className="text-sm text-gray-600">{customer.points} points</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {LOYALTY_LEVELS.find(l => l.pointsRequired <= customer.points)?.icon || '🥉'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges populaires */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star size={24} className="text-green-600" />
                  Badges Disponibles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LOYALTY_BADGES.slice(0, 8).map((badge) => (
                    <div key={badge.id} className="bg-white rounded-lg p-4 border border-green-200 text-center">
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
                      <div className="text-xs text-gray-600">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && <LoyaltyCustomers merchantId={profile?.id} />}
          {activeTab === 'rewards' && <LoyaltyRewards merchantId={profile?.id} />}
          {activeTab === 'stats' && <LoyaltyStats merchantId={profile?.id} />}
          {activeTab === 'config' && <LoyaltyProgramConfig merchantId={profile?.id} />}
        </div>
      </div>
    </div>
  );
};

