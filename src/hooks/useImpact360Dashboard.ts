import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

import { supabase } from '../lib/supabase';
import type { Database, UserRole } from '../lib/database.types';
import {
  calculateCO2Impact,
  calculateEnergySaved,
  calculateTreesEquivalent,
  calculateWaterSaved,
} from './useImpactMetrics';

type ReservationRow = Database['public']['Tables']['reservations']['Row'];
type LotRow = Database['public']['Tables']['lots']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type MissionRow = Database['public']['Tables']['missions']['Row'];

interface ReservationWithRelations extends ReservationRow {
  lot: (Pick<LotRow, 'merchant_id' | 'category' | 'original_price' | 'discounted_price'> & {
    merchant?: Pick<ProfileRow, 'id' | 'business_name'> | null;
  }) | null;
  user: Pick<ProfileRow, 'id' | 'role'> | null;
}

interface TimelinePoint {
  month: string;
  meals: number;
  revenue: number;
  donations: number;
}

interface RoleSnapshot {
  role: UserRole;
  count: number;
}

interface MerchantImpact {
  merchantId: string;
  merchantName: string;
  meals: number;
  revenue: number;
  donations: number;
}

interface MissionSnapshot {
  completed: number;
  inProgress: number;
  payoutVolume: number;
  completionRate: number;
}

interface HeadlineMetrics {
  mealsSaved: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  energySavedKwh: number;
  treesEquivalent: number;
  revenue: number;
  donationCount: number;
  donationVolume: number;
  averageBasketValue: number;
  averageDiscountRate: number;
  savingsGenerated: number;
}

interface Impact360Metrics {
  headline: HeadlineMetrics;
  timeline: TimelinePoint[];
  roleDistribution: RoleSnapshot[];
  merchantLeaders: MerchantImpact[];
  mission: MissionSnapshot;
  lastUpdatedAt: string;
}

interface UseImpact360DashboardReturn {
  metrics: Impact360Metrics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MONTHS_DEFAULT = 6;

const INITIAL_METRICS: Impact360Metrics = {
  headline: {
    mealsSaved: 0,
    co2SavedKg: 0,
    waterSavedLiters: 0,
    energySavedKwh: 0,
    treesEquivalent: 0,
    revenue: 0,
    donationCount: 0,
    donationVolume: 0,
    averageBasketValue: 0,
    averageDiscountRate: 0,
    savingsGenerated: 0,
  },
  timeline: [],
  roleDistribution: [],
  merchantLeaders: [],
  mission: {
    completed: 0,
    inProgress: 0,
    payoutVolume: 0,
    completionRate: 0,
  },
  lastUpdatedAt: new Date(0).toISOString(),
};

export function useImpact360Dashboard(months: number = MONTHS_DEFAULT): UseImpact360DashboardReturn {
  const [metrics, setMetrics] = useState<Impact360Metrics>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodStart = useMemo(() => {
    const scopedMonths = Math.max(1, Math.floor(months));
    return startOfMonth(subMonths(new Date(), scopedMonths - 1));
  }, [months]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const periodStartIso = periodStart.toISOString();

      const [profilesResponse, reservationsResponse, missionsResponse] = await Promise.all([
        supabase.from('profiles').select('id, role'),
        supabase
          .from('reservations')
          .select(
            `
              id,
              quantity,
              total_price,
              is_donation,
              status,
              created_at,
              lot:lots (
                id,
                merchant_id,
                category,
                original_price,
                discounted_price,
                merchant:profiles!lots_merchant_id_fkey (
                  id,
                  business_name
                )
              ),
              user:profiles!reservations_user_id_fkey (
                id,
                role
              )
            `
          )
          .gte('created_at', periodStartIso),
        supabase
          .from('missions')
          .select('status, payment_amount')
          .gte('created_at', periodStartIso),
      ]);

      if (profilesResponse.error) {
        throw profilesResponse.error;
      }
      if (reservationsResponse.error) {
        throw reservationsResponse.error;
      }
      if (missionsResponse.error) {
        throw missionsResponse.error;
      }

      const profileRows = (profilesResponse.data ?? []) as Pick<ProfileRow, 'id' | 'role'>[];
      const reservationRows = (reservationsResponse.data ?? []) as ReservationWithRelations[];
      const missionRows = (missionsResponse.data ?? []) as Pick<MissionRow, 'status' | 'payment_amount'>[];

      const completedStatuses: ReservationRow['status'][] = ['completed', 'confirmed'];
      const completedReservations = reservationRows.filter((reservation) =>
        completedStatuses.includes(reservation.status)
      );

      const mealsSaved = completedReservations.reduce((total, reservation) => total + reservation.quantity, 0);
      const co2Saved = calculateCO2Impact(mealsSaved);
      const waterSaved = calculateWaterSaved(mealsSaved);
      const energySaved = calculateEnergySaved(mealsSaved);
      const treesEquivalent = calculateTreesEquivalent(mealsSaved);

      const reservationsCount = completedReservations.length;
      let revenue = 0;
      let donationCount = 0;
      let donationVolume = 0;
      let savingsGenerated = 0;
      let originalValueTotal = 0;

      const merchantAggregator = new Map<string, MerchantImpact>();

      for (const reservation of completedReservations) {
        const { total_price: totalPrice, is_donation: isDonation, quantity, lot } = reservation;
        revenue += totalPrice;

        if (isDonation) {
          donationCount += 1;
          donationVolume += totalPrice;
        }

        const discountedUnit = lot?.discounted_price ?? (quantity > 0 ? totalPrice / quantity : totalPrice);
        const originalUnit = lot?.original_price ?? discountedUnit;
        const perUnitSavings = Math.max(0, originalUnit - discountedUnit);
        savingsGenerated += perUnitSavings * quantity;
        originalValueTotal += Math.max(originalUnit, discountedUnit) * quantity;

        const merchantId = lot?.merchant_id;
        if (merchantId) {
          const aggregate = merchantAggregator.get(merchantId) ?? {
            merchantId,
            merchantName: lot?.merchant?.business_name ?? 'Commerce local',
            meals: 0,
            revenue: 0,
            donations: 0,
          };

          aggregate.meals += quantity;
          aggregate.revenue += totalPrice;
          if (isDonation) {
            aggregate.donations += 1;
          }

          merchantAggregator.set(merchantId, aggregate);
        }
      }

      const averageBasketValue = reservationsCount > 0 ? revenue / reservationsCount : 0;
      const averageDiscountRate = originalValueTotal > 0 ? savingsGenerated / originalValueTotal : 0;

      const roleDistribution = profileRows.reduce<Record<UserRole, number>>((accumulator, profile) => {
        const roleCount = accumulator[profile.role] ?? 0;
        accumulator[profile.role] = roleCount + 1;
        return accumulator;
      }, {
        admin: 0,
        association: 0,
        beneficiary: 0,
        collector: 0,
        customer: 0,
        merchant: 0,
      });

      const roleDistributionSnapshot: RoleSnapshot[] = Object.entries(roleDistribution)
        .map(([role, count]) => ({ role: role as UserRole, count }))
        .sort((a, b) => b.count - a.count);

      const monthsRange = Math.max(1, Math.floor(months));
      const timelineBuckets = new Map<string, TimelinePoint>();

      for (let index = monthsRange - 1; index >= 0; index -= 1) {
        const currentDate = subMonths(new Date(), index);
        const monthKey = format(currentDate, 'yyyy-MM');
        timelineBuckets.set(monthKey, {
          month: format(currentDate, 'MMM', { locale: fr }),
          meals: 0,
          revenue: 0,
          donations: 0,
        });
      }

      for (const reservation of completedReservations) {
        const monthKey = format(new Date(reservation.created_at), 'yyyy-MM');
        const bucket = timelineBuckets.get(monthKey);
        if (!bucket) {
          continue;
        }

        bucket.meals += reservation.quantity;
        bucket.revenue += reservation.total_price;
        if (reservation.is_donation) {
          bucket.donations += 1;
        }
      }

      const timeline = Array.from(timelineBuckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, point]) => point);

      const merchantLeaders = Array.from(merchantAggregator.values())
        .sort((a, b) => b.meals - a.meals)
        .slice(0, 5);

      const missionCompleted = missionRows.filter((mission) => mission.status === 'completed');
      const missionInProgress = missionRows.filter((mission) => mission.status === 'in_progress' || mission.status === 'accepted');
      const missionPayoutVolume = missionCompleted.reduce((total, mission) => total + mission.payment_amount, 0);
      const missionCompletionRate = missionRows.length > 0 ? missionCompleted.length / missionRows.length : 0;

      setMetrics({
        headline: {
          mealsSaved,
          co2SavedKg: co2Saved,
          waterSavedLiters: waterSaved,
          energySavedKwh: energySaved,
          treesEquivalent,
          revenue,
          donationCount,
          donationVolume,
          averageBasketValue,
          averageDiscountRate,
          savingsGenerated,
        },
        timeline,
        roleDistribution: roleDistributionSnapshot,
        merchantLeaders,
        mission: {
          completed: missionCompleted.length,
          inProgress: missionInProgress.length,
          payoutVolume: missionPayoutVolume,
          completionRate: missionCompletionRate,
        },
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (fetchError) {
      console.error('Erreur Impact 360:', fetchError);
      setError('Impossible de charger les métriques Impact 360. Réessayez plus tard.');
      setMetrics(INITIAL_METRICS);
    } finally {
      setLoading(false);
    }
  }, [months, periodStart]);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  };
}


