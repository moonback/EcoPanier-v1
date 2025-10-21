import { useState, useEffect } from 'react';
import { Search, Filter, Crown, Star, TrendingUp, Calendar, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LOYALTY_LEVELS, LOYALTY_BADGES, LoyaltyUtils } from './types';

interface CustomerLoyalty {
  id: string;
  customer_id: string;
  customer_name: string;
  points: number;
  level: string;
  badges_earned: string[];
  total_purchases: number;
  total_donations: number;
  last_activity: string;
  created_at: string;
}

interface LoyaltyCustomersProps {
  merchantId: string;
}

export const LoyaltyCustomers = ({ merchantId }: LoyaltyCustomersProps) => {
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'last_activity'>('points');

  useEffect(() => {
    loadCustomers();
  }, [merchantId]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('points', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || customer.level === filterLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'name':
          return (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'last_activity':
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        default:
          return 0;
      }
    });

  const getCustomerLevel = (points: number) => {
    return LoyaltyUtils.getCurrentLevel(points);
  };

  const getCustomerBadges = (customer: CustomerLoyalty) => {
    return LOYALTY_BADGES.filter(badge => 
      customer.badges_earned?.includes(badge.id)
    );
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
      {/* Filtres et recherche */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par niveau */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              {LOYALTY_LEVELS.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="points">Points</option>
              <option value="name">Nom</option>
              <option value="last_activity">Dernière activité</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
          <div className="text-sm text-gray-600">Total clients</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {customers.filter(c => c.points > 0).length}
          </div>
          <div className="text-sm text-gray-600">Clients actifs</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Points totaux</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(customers.reduce((sum, c) => sum + c.points, 0) / customers.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Points moyen</div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const level = getCustomerLevel(customer.points);
                const badges = getCustomerBadges(customer);
                const progressPercentage = LoyaltyUtils.getProgressPercentage(customer.points);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(customer.customer_name || customer.customer_id).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.customer_name || 'Client anonyme'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {customer.customer_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${level.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                          {level.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{level.name}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.points}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`bg-gradient-to-r ${level.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {LoyaltyUtils.getPointsToNextLevel(customer.points)} points jusqu'au prochain niveau
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.last_activity).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.total_purchases} achats • {customer.total_donations} dons
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {badges.slice(0, 3).map((badge) => (
                          <div key={badge.id} className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                            {badge.icon}
                          </div>
                        ))}
                        {badges.length > 3 && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                            +{badges.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-purple-600 hover:text-purple-900 transition-colors">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message si aucun client */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun client trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || filterLevel !== 'all' 
              ? 'Aucun client ne correspond à vos critères de recherche.'
              : 'Aucun client n\'est encore inscrit à votre programme de fidélité.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

