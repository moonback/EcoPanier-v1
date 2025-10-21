import { useState, useEffect } from 'react';
import { Star, Gift, Trophy, Award, Crown, Target, TrendingUp } from 'lucide-react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { LOYALTY_LEVELS, LOYALTY_BADGES, LOYALTY_REWARDS, LoyaltyUtils } from '../merchant/loyalty/types';
import { supabase } from '../../lib/supabase';

interface CustomerLoyaltyCardProps {
  merchantId: string;
  merchantName?: string;
}

export const CustomerLoyaltyCard = ({ merchantId, merchantName }: CustomerLoyaltyCardProps) => {
  const { customerLoyalty, loading, error, redeemReward } = useLoyalty(merchantId);
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableRewards();
  }, [merchantId]);

  const loadAvailableRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      setAvailableRewards(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    setRedeemingReward(rewardId);
    try {
      const success = await redeemReward(rewardId);
      if (success) {
        alert('Récompense échangée avec succès !');
        await loadAvailableRewards();
      } else {
        alert('Erreur lors de l\'échange de la récompense');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'échange de la récompense');
    } finally {
      setRedeemingReward(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-200 bg-red-50">
        <div className="text-red-600">
          <p className="font-semibold">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!customerLoyalty) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Programme de Fidélité</h3>
          <p className="text-gray-600 mb-4">
            Rejoignez le programme de fidélité de {merchantName || 'ce commerçant'} et gagnez des points à chaque achat !
          </p>
          <button className="btn-primary px-4 py-2 rounded-lg">
            Rejoindre le programme
          </button>
        </div>
      </div>
    );
  }

  const currentLevel = LoyaltyUtils.getCurrentLevel(customerLoyalty.points);
  const nextLevel = LOYALTY_LEVELS.find(level => level.pointsRequired > customerLoyalty.points);
  const progressPercentage = LoyaltyUtils.getProgressPercentage(customerLoyalty.points);
  const pointsToNext = LoyaltyUtils.getPointsToNextLevel(customerLoyalty.points);

  const earnedBadges = LOYALTY_BADGES.filter(badge => 
    customerLoyalty.badges_earned?.includes(badge.id)
  );

  return (
    <div className="space-y-6">
      {/* Carte principale de fidélité */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🎁 Programme de Fidélité</h2>
            <p className="text-purple-100">{merchantName || 'Commerçant'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{customerLoyalty.points}</div>
            <div className="text-purple-100">points</div>
          </div>
        </div>

        {/* Niveau actuel */}
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${currentLevel.color} rounded-xl flex items-center justify-center text-white text-xl`}>
              {currentLevel.icon}
            </div>
            <div>
              <div className="font-bold text-lg">{currentLevel.name}</div>
              <div className="text-purple-100 text-sm">{currentLevel.description}</div>
            </div>
          </div>

          {/* Barre de progression */}
          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm text-purple-100 mb-1">
                <span>Progression vers {nextLevel.name}</span>
                <span>{pointsToNext} points restants</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Avantages du niveau */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Avantages de votre niveau :</div>
          <ul className="text-sm space-y-1">
            {currentLevel.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Badges gagnés */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-600" />
            Badges Gagnés
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Récompenses disponibles */}
      {availableRewards.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift size={20} className="text-green-600" />
            Récompenses Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => {
              const canAfford = customerLoyalty.points >= reward.points_cost;
              const isRedeeming = redeemingReward === reward.id;
              
              return (
                <div key={reward.id} className={`p-4 rounded-lg border-2 transition-all ${
                  canAfford 
                    ? 'border-green-200 bg-green-50 hover:border-green-300' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${
                        canAfford ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-400'
                      }`}>
                        {reward.type === 'discount' ? '🎫' : 
                         reward.type === 'free_item' ? '🎁' : 
                         reward.type === 'priority_access' ? '⚡' : '👑'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{reward.name}</div>
                        <div className="text-sm text-gray-600">{reward.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <Star size={14} className="text-yellow-500" />
                        {reward.points_cost}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={!canAfford || isRedeeming}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      canAfford && !isRedeeming
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isRedeeming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Échange...
                      </div>
                    ) : canAfford ? (
                      'Échanger'
                    ) : (
                      'Points insuffisants'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistiques personnelles */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          Mes Statistiques
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{customerLoyalty.total_purchases}</div>
            <div className="text-sm text-gray-600">Achats</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{customerLoyalty.total_donations}</div>
            <div className="text-sm text-gray-600">Dons</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{customerLoyalty.current_streak}</div>
            <div className="text-sm text-gray-600">Série</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
};

