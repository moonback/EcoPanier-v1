import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';

interface ReservationActivity {
  id: string;
  created_at: string;
  status: string;
  quantity: number;
  completed_at: string | null;
  lot: {
    title: string;
    category: string;
    merchant: {
      business_name: string;
    } | null;
  } | null;
}

export interface BeneficiaryActivity {
  id: string;
  full_name: string;
  beneficiary_id: string | null;
  phone: string | null;
  created_at: string;
  reservations: ReservationActivity[];
}

interface UseBeneficiaryActivityParams {
  associationId: string | null;
  limitPerBeneficiary?: number;
}

interface UseBeneficiaryActivityResult {
  beneficiaries: BeneficiaryActivity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_LIMIT_PER_BENEFICIARY = 50;

export function useBeneficiaryActivity({
  associationId,
  limitPerBeneficiary = DEFAULT_LIMIT_PER_BENEFICIARY,
}: UseBeneficiaryActivityParams): UseBeneficiaryActivityResult {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!associationId) {
      setBeneficiaries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: registrations, error: registrationsError } = await supabase
        .from('association_beneficiary_registrations')
        .select(
          `
            beneficiary_id,
            beneficiary:profiles!association_beneficiary_registrations_beneficiary_id_fkey (
              id,
              full_name,
              beneficiary_id,
              phone,
              created_at
            )
          `
        )
        .eq('association_id', associationId);

      if (registrationsError) {
        throw registrationsError;
      }

      const beneficiaryProfiles = (registrations ?? [])
        .map((registration) => registration.beneficiary)
        .filter((profile): profile is NonNullable<typeof profile> => profile !== null);

      if (beneficiaryProfiles.length === 0) {
        setBeneficiaries([]);
        return;
      }

      const beneficiaryIds = beneficiaryProfiles.map((profile) => profile.id).filter(Boolean);

      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(
          `
            id,
            created_at,
            status,
            quantity,
            completed_at,
            user_id,
            lot:lots (
              title,
              category,
              merchant:profiles!lots_merchant_id_fkey (
                business_name
              )
            )
          `
        )
        .in('user_id', beneficiaryIds)
        .eq('is_donation', true)
        .order('created_at', { ascending: false });

      if (reservationsError) {
        throw reservationsError;
      }

      const reservationsByUser = new Map<string, ReservationActivity[]>();

      for (const reservation of reservationsData ?? []) {
        const userId = reservation.user_id;
        if (!userId) {
          continue;
        }

        const existing = reservationsByUser.get(userId) ?? [];
        if (existing.length < limitPerBeneficiary) {
          existing.push({
            id: reservation.id,
            created_at: reservation.created_at,
            status: reservation.status,
            quantity: reservation.quantity ?? 0,
            completed_at: reservation.completed_at,
            lot: reservation.lot ?? null,
          });
          reservationsByUser.set(userId, existing);
        }
      }

      const formatted = beneficiaryProfiles.map<BeneficiaryActivity>((profile) => ({
        id: profile.id,
        full_name: profile.full_name ?? 'Bénéficiaire',
        beneficiary_id: profile.beneficiary_id,
        phone: profile.phone,
        created_at: profile.created_at,
        reservations: reservationsByUser.get(profile.id) ?? [],
      }));

      setBeneficiaries(formatted);
    } catch (fetchError) {
      console.error('Erreur lors du chargement de l\'activité bénéficiaire:', fetchError);
      setError('Impossible de charger l\'historique des activités. Veuillez réessayer plus tard.');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [associationId, limitPerBeneficiary]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  return {
    beneficiaries,
    loading,
    error,
    refresh: fetchActivity,
  };
}


