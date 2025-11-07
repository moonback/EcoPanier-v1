import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type RegistrationRow = Database['public']['Tables']['association_beneficiary_registrations']['Row'];
type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'email' | 'phone' | 'address' | 'beneficiary_id'
>;

export interface BeneficiaryListItem {
  registration: RegistrationRow;
  beneficiary: ProfileRow;
  packagesRecovered: number;
}

export interface BeneficiaryListFilters {
  status?: 'all' | 'verified' | 'pending';
}

interface UseBeneficiariesParams {
  associationId: string | null;
  page: number;
  pageSize?: number;
  filters?: BeneficiaryListFilters;
}

interface UseBeneficiariesResult {
  beneficiaries: BeneficiaryListItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 10;

export function useBeneficiaries({
  associationId,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  filters,
}: UseBeneficiariesParams): UseBeneficiariesResult {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusFilter = filters?.status ?? 'all';

  const range = useMemo(() => {
    const start = (Math.max(page, 1) - 1) * pageSize;
    const end = start + pageSize - 1;
    return { start, end };
  }, [page, pageSize]);

  const fetchBeneficiaries = useCallback(async () => {
    if (!associationId) {
      setBeneficiaries([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('association_beneficiary_registrations')
        .select(
          `
            id,
            association_id,
            beneficiary_id,
            registration_date,
            notes,
            verification_document_url,
            is_verified,
            created_at,
            updated_at,
            beneficiary:profiles!beneficiary_id (
              id,
              full_name,
              email,
              phone,
              address,
              beneficiary_id
            )
          `,
          { count: 'exact' }
        )
        .eq('association_id', associationId)
        .order('registration_date', { ascending: false })
        .range(range.start, range.end);

      if (statusFilter === 'verified') {
        query = query.eq('is_verified', true);
      }

      if (statusFilter === 'pending') {
        query = query.eq('is_verified', false);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const typedData = (data ?? []) as Array<{
        beneficiary: ProfileRow | null;
      }> & RegistrationRow[];

      const beneficiaryItems = typedData
        .filter((item): item is RegistrationRow & { beneficiary: ProfileRow } => item.beneficiary !== null)
        .map((item) => ({
          registration: {
            id: item.id,
            association_id: item.association_id,
            beneficiary_id: item.beneficiary_id,
            registration_date: item.registration_date,
            notes: item.notes,
            verification_document_url: item.verification_document_url,
            is_verified: item.is_verified,
            created_at: item.created_at,
            updated_at: item.updated_at,
          },
          beneficiary: item.beneficiary,
          packagesRecovered: 0,
        }));

      if (beneficiaryItems.length === 0) {
        setBeneficiaries([]);
        setTotalCount(count ?? 0);
        return;
      }

      const beneficiaryIds = beneficiaryItems.map((item) => item.beneficiary.id).filter(Boolean);

      if (beneficiaryIds.length > 0) {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select('user_id, quantity')
          .in('user_id', beneficiaryIds)
          .eq('status', 'completed');

        if (reservationsError) {
          console.error('Erreur lors de la récupération des réservations:', reservationsError);
        } else if (reservationsData) {
          const quantitiesByUser = reservationsData.reduce<Record<string, number>>((acc, reservation) => {
            if (!reservation.user_id) {
              return acc;
            }
            const previous = acc[reservation.user_id] ?? 0;
            acc[reservation.user_id] = previous + (reservation.quantity ?? 0);
            return acc;
          }, {});

          for (const item of beneficiaryItems) {
            item.packagesRecovered = quantitiesByUser[item.beneficiary.id] ?? 0;
          }
        }
      }

      setBeneficiaries(beneficiaryItems);
      setTotalCount(count ?? beneficiaryItems.length);
    } catch (fetchError) {
      console.error('Erreur lors du chargement des bénéficiaires:', fetchError);
      setError('Impossible de charger les bénéficiaires. Réessayez plus tard.');
      setBeneficiaries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [associationId, range.end, range.start, statusFilter, pageSize]);

  useEffect(() => {
    void fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  return {
    beneficiaries,
    totalCount,
    loading,
    error,
    refresh: fetchBeneficiaries,
  };
}


