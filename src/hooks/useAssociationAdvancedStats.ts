import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface MonthlyStats {
  month: string;
  registrations: number;
  reservations: number;
}

export interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

export interface AdvancedTotals {
  totalBeneficiaries: number;
  totalReservations: number;
  activeThisMonth: number;
  averagePerBeneficiary: number;
}

interface UseAssociationAdvancedStatsParams {
  associationId: string | null;
  months?: number;
  colors?: string[];
}

interface UseAssociationAdvancedStatsResult {
  monthlyData: MonthlyStats[];
  categoryData: CategoryStats[];
  totals: AdvancedTotals;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];

export function useAssociationAdvancedStats({
  associationId,
  months = 6,
  colors = DEFAULT_COLORS,
}: UseAssociationAdvancedStatsParams): UseAssociationAdvancedStatsResult {
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [totals, setTotals] = useState<AdvancedTotals>({
    totalBeneficiaries: 0,
    totalReservations: 0,
    activeThisMonth: 0,
    averagePerBeneficiary: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!associationId) {
      setMonthlyData([]);
      setCategoryData([]);
      setTotals({
        totalBeneficiaries: 0,
        totalReservations: 0,
        activeThisMonth: 0,
        averagePerBeneficiary: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('association_beneficiary_registrations')
        .select(
          `
            registration_date,
            beneficiary:profiles!association_beneficiary_registrations_beneficiary_id_fkey (id)
          `
        )
        .eq('association_id', associationId);

      if (registrationsError) {
        throw registrationsError;
      }

      const beneficiaryProfiles = registrationsData ?? [];
      const beneficiaryIds = beneficiaryProfiles
        .map((registration) => registration.beneficiary?.id)
        .filter((id): id is string => Boolean(id));

      const totalBeneficiaries = beneficiaryIds.length;

      const earliestDate = startOfMonth(subMonths(new Date(), Math.max(0, months - 1)));

      let reservationsRecent: Array<{
        created_at: string;
        user_id: string;
        lot: { category: string | null } | null;
      }> = [];
      let totalReservations = 0;
      let activeThisMonth = 0;

      if (beneficiaryIds.length > 0) {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select(
            `
              user_id,
              created_at,
              lot:lots (
                category
              )
            `
          )
          .in('user_id', beneficiaryIds)
          .eq('is_donation', true)
          .gte('created_at', earliestDate.toISOString())
          .order('created_at', { ascending: false });

        if (reservationsError) {
          throw reservationsError;
        }

        reservationsRecent = reservationsData ?? [];

        const thisMonthStart = startOfMonth(new Date()).toISOString();

        const { count: totalCount, error: totalCountError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .in('user_id', beneficiaryIds)
          .eq('is_donation', true);

        if (totalCountError) {
          throw totalCountError;
        }

        totalReservations = totalCount ?? 0;

        const activeUsers = reservationsRecent.filter(
          (reservation) => reservation.created_at >= thisMonthStart,
        );
        activeThisMonth = new Set(activeUsers.map((reservation) => reservation.user_id)).size;
      }

      const monthlyStats: MonthlyStats[] = [];

      for (let index = months - 1; index >= 0; index -= 1) {
        const currentDate = subMonths(new Date(), index);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const monthLabel = format(currentDate, 'MMM', { locale: fr });

        const registrationsCount = beneficiaryProfiles.filter((registration) => {
          if (!registration.registration_date) {
            return false;
          }
          const registrationDate = new Date(registration.registration_date);
          return registrationDate >= monthStart && registrationDate <= monthEnd;
        }).length;

        const reservationCount = reservationsRecent.filter((reservation) => {
          const createdAt = new Date(reservation.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        monthlyStats.push({
          month: monthLabel,
          registrations: registrationsCount,
          reservations: reservationCount,
        });
      }

      setMonthlyData(monthlyStats);

      const categoryCount = reservationsRecent.reduce<Record<string, number>>((accumulator, reservation) => {
        const category = reservation.lot?.category ?? 'Autre';
        const currentValue = accumulator[category] ?? 0;
        accumulator[category] = currentValue + 1;
        return accumulator;
      }, {});

      const categories = Object.entries(categoryCount)
        .sort(([, valueA], [, valueB]) => Number(valueB) - Number(valueA))
        .slice(0, colors.length)
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length],
        }));

      setCategoryData(categories);

      const averagePerBeneficiary = totalBeneficiaries > 0
        ? Math.round((totalReservations / totalBeneficiaries) * 10) / 10
        : 0;

      setTotals({
        totalBeneficiaries,
        totalReservations,
        activeThisMonth,
        averagePerBeneficiary,
      });
    } catch (statsError) {
      console.error('Erreur lors de la récupération des statistiques avancées:', statsError);
      setError('Impossible de charger les statistiques avancées. Veuillez réessayer plus tard.');
      setMonthlyData([]);
      setCategoryData([]);
      setTotals({
        totalBeneficiaries: 0,
        totalReservations: 0,
        activeThisMonth: 0,
        averagePerBeneficiary: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [associationId, months, colors]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    monthlyData,
    categoryData,
    totals,
    loading,
    error,
    refresh: fetchStats,
  };
}


