import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface UseReservationsReturn {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cancelReservation: (reservationId: string, lotId: string, quantity: number) => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les réservations d'un utilisateur
 * Récupère et gère les réservations avec mise à jour automatique
 */
export function useReservations(userId: string | undefined): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setReservations(data as Reservation[]);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError('Impossible de charger vos réservations. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const cancelReservation = async (
    reservationId: string,
    lotId: string,
    quantity: number
  ): Promise<void> => {
    try {
      setError(null);

      // Trouver la réservation pour obtenir les données du lot
      const reservation = reservations.find((r) => r.id === reservationId);
      if (!reservation) {
        throw new Error('Réservation introuvable');
      }

      // Mettre à jour le statut de la réservation
      const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      // Mettre à jour la quantité réservée du lot
      const newQuantityReserved = reservation.lots.quantity_reserved - quantity;

      const { error: lotError } = await supabase
        .from('lots')
        .update({ quantity_reserved: newQuantityReserved })
        .eq('id', lotId);

      if (lotError) throw lotError;

      // Rafraîchir la liste
      await fetchReservations();
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err);
      throw new Error('Impossible d\'annuler la réservation. Veuillez réessayer.');
    }
  };

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
    cancelReservation,
  };
}

