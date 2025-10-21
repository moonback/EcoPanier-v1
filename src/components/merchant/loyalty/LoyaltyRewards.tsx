import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Gift, Star, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LOYALTY_REWARDS } from './types';

interface LoyaltyReward {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'priority_access' | 'exclusive_content';
  value: number;
  points_cost: number;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  created_at: string;
}

interface LoyaltyRewardsProps {
  merchantId: string;
}

export const LoyaltyRewards = ({ merchantId }: LoyaltyRewardsProps) => {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  useEffect(() => {
    loadRewards();
  }, [merchantId]);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (rewardData: any) => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .insert({
          ...rewardData,
          merchant_id: merchantId,
          usage_count: 0
        });

      if (error) throw error;
      await loadRewards();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création de la récompense:', error);
    }
  };

  const handleUpdateReward = async (rewardData: any) => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .update(rewardData)
        .eq('id', editingReward?.id);

      if (error) throw error;
      await loadRewards();
      setEditingReward(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la récompense:', error);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) return;

    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
      await loadRewards();
    } catch (error) {
      console.error('Erreur lors de la suppression de la récompense:', error);
    }
  };

  const toggleRewardStatus = async (reward: LoyaltyReward) => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id);

      if (error) throw error;
      await loadRewards();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount': return '🎫';
      case 'free_item': return '🎁';
      case 'priority_access': return '⚡';
      case 'exclusive_content': return '👑';
      default: return '🎁';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'discount': return 'from-green-400 to-green-500';
      case 'free_item': return 'from-blue-400 to-blue-500';
      case 'priority_access': return 'from-purple-400 to-purple-500';
      case 'exclusive_content': return 'from-yellow-400 to-yellow-500';
      default: return 'from-gray-400 to-gray-500';
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
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Récompenses</h2>
          <p className="text-gray-600">Gérez les récompenses de votre programme de fidélité</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Nouvelle récompense</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{rewards.length}</div>
          <div className="text-sm text-gray-600">Total récompenses</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {rewards.filter(r => r.is_active).length}
          </div>
          <div className="text-sm text-gray-600">Récompenses actives</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {rewards.reduce((sum, r) => sum + r.usage_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Utilisations totales</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(rewards.reduce((sum, r) => sum + r.points_cost, 0) / rewards.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Coût moyen (points)</div>
        </div>
      </div>

      {/* Grille des récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
            reward.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="p-6">
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getRewardColor(reward.type)} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {getRewardIcon(reward.type)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRewardStatus(reward)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      reward.is_active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => setEditingReward(reward)}
                    className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{reward.name}</h3>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">{reward.points_cost} points</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    reward.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {reward.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                {/* Statistiques d'utilisation */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Gift size={14} />
                      <span>{reward.usage_count} utilisations</span>
                    </div>
                    {reward.usage_limit && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Limite: {reward.usage_limit}</span>
                      </div>
                    )}
                  </div>
                  
                  {reward.usage_limit && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((reward.usage_count / reward.usage_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucune récompense */}
      {rewards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune récompense</h3>
          <p className="text-gray-600 mb-6">Créez votre première récompense pour encourager la fidélité de vos clients</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Créer une récompense
          </button>
        </div>
      )}

      {/* Modal de création/édition */}
      {(showCreateModal || editingReward) && (
        <RewardModal
          reward={editingReward}
          onSave={editingReward ? handleUpdateReward : handleCreateReward}
          onClose={() => {
            setShowCreateModal(false);
            setEditingReward(null);
          }}
        />
      )}
    </div>
  );
};

// Composant modal pour créer/éditer une récompense
interface RewardModalProps {
  reward?: LoyaltyReward | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const RewardModal = ({ reward, onSave, onClose }: RewardModalProps) => {
  const [formData, setFormData] = useState({
    name: reward?.name || '',
    description: reward?.description || '',
    type: reward?.type || 'discount',
    value: reward?.value || 0,
    points_cost: reward?.points_cost || 0,
    usage_limit: reward?.usage_limit || null,
    is_active: reward?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {reward ? 'Modifier la récompense' : 'Nouvelle récompense'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la récompense
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de récompense
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="discount">Réduction</option>
                <option value="free_item">Article gratuit</option>
                <option value="priority_access">Accès prioritaire</option>
                <option value="exclusive_content">Contenu exclusif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur ({formData.type === 'discount' ? '%' : '€'})
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût en points
              </label>
              <input
                type="number"
                value={formData.points_cost}
                onChange={(e) => setFormData({ ...formData, points_cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite d'utilisation (optionnel)
              </label>
              <input
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Récompense active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {reward ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

