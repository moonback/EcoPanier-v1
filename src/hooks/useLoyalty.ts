import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface LoyaltyHook {
  // État
  customerLoyalty: any | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addPoints: (points: number, type: string, description?: string, referenceId?: string, referenceType?: string) => Promise<boolean>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  refreshLoyalty: () => Promise<void>;
}

export const useLoyalty = (merchantId?: string): LoyaltyHook => {
  const [customerLoyalty, setCustomerLoyalty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  // Charger les données de fidélité du client
  useEffect(() => {
    if (merchantId && user?.id) {
      loadCustomerLoyalty();
    }
  }, [merchantId, user?.id]);

  const loadCustomerLoyalty = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('customer_id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setCustomerLoyalty(data);
    } catch (err) {
      console.error('Erreur lors du chargement de la fidélité:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (
    points: number, 
    type: string, 
    description?: string, 
    referenceId?: string, 
    referenceType?: string
  ): Promise<boolean> => {
    try {
      if (!merchantId || !user?.id) {
        throw new Error('Merchant ID ou User ID manquant');
      }

      const { error } = await supabase.rpc('add_loyalty_points', {
        p_merchant_id: merchantId,
        p_customer_id: user.id,
        p_points: points,
        p_type: type,
        p_description: description,
        p_reference_id: referenceId,
        p_reference_type: referenceType
      });

      if (error) throw error;

      // Recharger les données de fidélité
      await loadCustomerLoyalty();
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de points:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de points');
      return false;
    }
  };

  const redeemReward = async (rewardId: string): Promise<boolean> => {
    try {
      if (!merchantId || !user?.id) {
        throw new Error('Merchant ID ou User ID manquant');
      }

      const { error } = await supabase.rpc('redeem_loyalty_reward', {
        p_merchant_id: merchantId,
        p_customer_id: user.id,
        p_reward_id: rewardId
      });

      if (error) throw error;

      // Recharger les données de fidélité
      await loadCustomerLoyalty();
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'échange de récompense:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'échange de récompense');
      return false;
    }
  };

  const refreshLoyalty = async (): Promise<void> => {
    await loadCustomerLoyalty();
  };

  return {
    customerLoyalty,
    loading,
    error,
    addPoints,
    redeemReward,
    refreshLoyalty
  };
};

// Hook pour les commerçants (gestion du programme de fidélité)
interface MerchantLoyaltyHook {
  // État
  loyaltyProgram: any | null;
  customers: any[];
  rewards: any[];
  stats: any;
  loading: boolean;
  error: string | null;
  
  // Actions
  createReward: (rewardData: any) => Promise<boolean>;
  updateReward: (rewardId: string, rewardData: any) => Promise<boolean>;
  deleteReward: (rewardId: string) => Promise<boolean>;
  toggleRewardStatus: (rewardId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useMerchantLoyalty = (merchantId?: string): MerchantLoyaltyHook => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (merchantId) {
      loadAllData();
    }
  }, [merchantId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le programme de fidélité
      const { data: programData } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('merchant_id', merchantId)
        .single();

      // Charger les clients
      const { data: customersData } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('points', { ascending: false });

      // Charger les récompenses
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('points_cost', { ascending: true });

      // Charger les statistiques
      const { data: transactionsData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('merchant_id', merchantId);

      // Calculer les statistiques
      const totalCustomers = customersData?.length || 0;
      const activeCustomers = customersData?.filter(c => c.points > 0).length || 0;
      const totalPointsEarned = transactionsData?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
      const totalRewardsRedeemed = transactionsData?.filter(t => t.type === 'redeem').length || 0;

      setLoyaltyProgram(programData);
      setCustomers(customersData || []);
      setRewards(rewardsData || []);
      setStats({
        totalCustomers,
        activeCustomers,
        totalPointsEarned,
        totalRewardsRedeemed,
        averagePointsPerCustomer: totalCustomers > 0 ? Math.round(totalPointsEarned / totalCustomers) : 0
      });
    } catch (err) {
      console.error('Erreur lors du chargement des données de fidélité:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createReward = async (rewardData: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .insert({
          ...rewardData,
          merchant_id: merchantId,
          usage_count: 0
        });

      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Erreur lors de la création de la récompense:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      return false;
    }
  };

  const updateReward = async (rewardId: string, rewardData: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .update(rewardData)
        .eq('id', rewardId);

      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la récompense:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      return false;
    }
  };

  const deleteReward = async (rewardId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la récompense:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      return false;
    }
  };

  const toggleRewardStatus = async (rewardId: string): Promise<boolean> => {
    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return false;

      const { error } = await supabase
        .from('loyalty_rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', rewardId);

      if (error) throw error;
      await loadAllData();
      return true;
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
      return false;
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadAllData();
  };

  return {
    loyaltyProgram,
    customers,
    rewards,
    stats,
    loading,
    error,
    createReward,
    updateReward,
    deleteReward,
    toggleRewardStatus,
    refreshData
  };
};

