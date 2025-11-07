import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

export interface AssociationQuickStats {
  totalBeneficiaries: number;
  verifiedBeneficiaries: number;
  pendingVerification: number;
  thisMonthRegistrations: number;
}

interface UseAssociationQuickStatsOptions {
  enabled?: boolean;
}

const INITIAL_STATS: AssociationQuickStats = {
  totalBeneficiaries: 0,
  verifiedBeneficiaries: 0,
  pendingVerification: 0,
  thisMonthRegistrations: 0,
};

export function useAssociationQuickStats(
  associationId: string | null | undefined,
  options: UseAssociationQuickStatsOptions = {},
) {
  const { enabled = true } = options;
  const [stats, setStats] = useState<AssociationQuickStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickStats = useCallback(async () => {
    if (!associationId || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('association_beneficiary_registrations')
        .select('id, is_verified, registration_date')
        .eq('association_id', associationId);

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setStats(INITIAL_STATS);
        return;
      }

      const total = data.length;
      const verified = data.filter((registration) => registration.is_verified).length;
      const pending = total - verified;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonth = data.filter((registration) => {
        if (!registration.registration_date) {
          return false;
        }

        const registrationDate = new Date(registration.registration_date);
        return registrationDate >= firstDayOfMonth;
      }).length;

      setStats({
        totalBeneficiaries: total,
        verifiedBeneficiaries: verified,
        pendingVerification: pending,
        thisMonthRegistrations: thisMonth,
      });
    } catch (fetchError) {
      console.error('Erreur lors de la récupération des statistiques association:', fetchError);
      setError('Impossible de charger vos statistiques. Réessayez plus tard.');
      setStats(INITIAL_STATS);
    } finally {
      setLoading(false);
    }
  }, [associationId, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchQuickStats();
  }, [fetchQuickStats, enabled]);

  return {
    stats,
    loading,
    error,
    refresh: fetchQuickStats,
  };
}


