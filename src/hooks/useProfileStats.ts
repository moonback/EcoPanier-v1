import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../lib/database.types';

interface ProfileStats {
  // Client
  totalReservations?: number;
  moneySaved?: number;
  donationsMade?: number;
  suspendedBasketsOffered?: number;
  suspendedBasketsClaimed?: number;
  totalSuspendedAmount?: number;
  co2Impact?: number;
  
  // Commerçant
  lotsSold?: number;
  revenue?: number;
  averageRating?: number;
  wasteAvoided?: number;
  
  // Collecteur
  missionsCompleted?: number;
  totalDistance?: number;
  rating?: number;
  reliability?: number;
  
  // Admin
  totalUsers?: number;
  totalTransactions?: number;
  activeLots?: number;
  satisfaction?: number;
}

export function useProfileStats(userId: string | undefined, role: UserRole | undefined) {
  const [stats, setStats] = useState<ProfileStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      switch (role) {
        case 'customer': {
          // Récupérer les réservations du client
          const { data: reservations } = await supabase
            .from('reservations')
            .select('*, lot:lots(original_price, discounted_price)')
            .eq('user_id', userId);

          const totalReservations = reservations?.length || 0;
          const moneySaved = reservations?.reduce((sum, res) => {
            // @ts-expect-error Bug Supabase types
            const originalPrice = res.lot?.original_price || 0;
            // @ts-expect-error Bug Supabase types
            const discountedPrice = res.lot?.discounted_price || 0;
            return sum + (originalPrice - discountedPrice) * res.quantity;
          }, 0) || 0;

          const donationsMade = reservations?.filter(r => r.is_donation).length || 0;
          
          // Récupérer les paniers suspendus offerts par le client
          const { data: suspendedBaskets } = await supabase
            .from('suspended_baskets')
            .select('amount, status')
            .eq('donor_id', userId);

          const suspendedBasketsOffered = suspendedBaskets?.length || 0;
          const suspendedBasketsClaimed = suspendedBaskets?.filter(sb => sb.status === 'claimed').length || 0;
          const totalSuspendedAmount = suspendedBaskets?.reduce((sum, sb) => {
            const amount = typeof sb.amount === 'string' ? parseFloat(sb.amount) : sb.amount || 0;
            return sum + amount;
          }, 0) || 0;
          
          // CO2 = nombre de repas * 0.9 kg
          const co2Impact = totalReservations * 0.9;

          setStats({
            totalReservations,
            moneySaved: Math.round(moneySaved * 100) / 100,
            donationsMade,
            suspendedBasketsOffered,
            suspendedBasketsClaimed,
            totalSuspendedAmount: Math.round(totalSuspendedAmount * 100) / 100,
            co2Impact: Math.round(co2Impact * 100) / 100,
          });
          break;
        }

        case 'merchant': {
          // Récupérer les lots du commerçant
          const { data: lots } = await supabase
            .from('lots')
            .select('quantity_sold, discounted_price, original_price')
            .eq('merchant_id', userId);

          const lotsSold = lots?.reduce((sum, lot) => sum + lot.quantity_sold, 0) || 0;
          const revenue = lots?.reduce((sum, lot) => sum + (lot.quantity_sold * lot.discounted_price), 0) || 0;
          
          // Gaspillage évité en kg (estimation: 1 repas = 0.4 kg)
          const wasteAvoided = lotsSold * 0.4;

          setStats({
            lotsSold,
            revenue: Math.round(revenue * 100) / 100,
            averageRating: 4.8, // TODO: Implémenter système de notation
            wasteAvoided: Math.round(wasteAvoided * 100) / 100,
          });
          break;
        }

        case 'beneficiary': {
          // Pas de statistiques pour les bénéficiaires
          setStats({});
          break;
        }

        case 'collector': {
          // Récupérer les missions du collecteur
          const { data: missions } = await supabase
            .from('missions')
            .select('*')
            .eq('collector_id', userId);

          const missionsCompleted = missions?.filter(m => m.status === 'completed').length || 0;
          
          // TODO: Calculer la vraie distance basée sur les coordonnées
          const totalDistance = missionsCompleted * 5; // Estimation: 5 km par mission

          setStats({
            missionsCompleted,
            totalDistance,
            rating: 4.9, // TODO: Implémenter système de notation
            reliability: missionsCompleted > 0 ? 98 : 100,
          });
          break;
        }

        case 'admin': {
          // Statistiques globales
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id');

          const { data: reservations } = await supabase
            .from('reservations')
            .select('id');

          const { data: lots } = await supabase
            .from('lots')
            .select('id')
            .eq('status', 'available');

          setStats({
            totalUsers: profiles?.length || 0,
            totalTransactions: reservations?.length || 0,
            activeLots: lots?.length || 0,
            satisfaction: 96,
          });
          break;
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

