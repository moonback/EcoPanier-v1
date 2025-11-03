import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generatePIN } from '../utils/helpers';
import { notifyReservationConfirmed } from '../utils/notificationService';
import type { Database } from '../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
};

interface UseLotsReturn {
  lots: Lot[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reserveLot: (
    lot: Lot,
    quantity: number,
    userId: string,
    isDonation?: boolean
  ) => Promise<string>;
}

/**
 * Hook personnalisé pour gérer les lots disponibles
 * Gère le filtrage et la réservation des lots
 */
export function useLots(selectedCategory: string = ''): UseLotsReturn {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLots = useCallback(async () => {
    try {
      setError(null);
      let query = supabase
        .from('lots')
        .select('*, profiles(business_name, business_address, business_logo_url)')
        .eq('status', 'available')
        .gt('quantity_total', 0)
        .gt('discounted_price', 0)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filtrer les lots avec une quantité disponible réelle > 0
      const availableLots = (data as Lot[]).filter((lot) => {
        const availableQty =
          lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return availableQty > 0;
      });

      setLots(availableLots);
    } catch (err) {
      console.error('Erreur lors du chargement des lots:', err);
      setError('Impossible de charger les lots disponibles. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const reserveLot = async (
    lot: Lot,
    quantity: number,
    userId: string,
    isDonation: boolean = false
  ): Promise<string> => {
    try {
      setError(null);

      // Vérifier la quantité disponible
      const availableQty =
        lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      if (quantity > availableQty) {
        throw new Error('Quantité demandée non disponible');
      }

      const pin = generatePIN();
      const totalPrice = isDonation ? 0 : lot.discounted_price * quantity;

      // Créer la réservation
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          lot_id: lot.id,
          user_id: userId,
          quantity,
          total_price: totalPrice,
          pickup_pin: pin,
          status: 'confirmed',
          is_donation: isDonation,
        })
        .select('id')
        .single();

      if (reservationError) throw reservationError;

      // Mettre à jour les quantités du lot
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: lot.quantity_reserved + quantity,
        })
        .eq('id', lot.id);

      if (updateError) throw updateError;

      // 🔔 CRÉER UNE NOTIFICATION
      try {
        await notifyReservationConfirmed(
          userId,
          lot.title || 'Votre lot',
          lot.profiles?.business_name || 'Commerçant',
          pin,
          reservationData.id
        );
      } catch (notificationError) {
        // Ne pas bloquer si la notification échoue
        console.error('Erreur notification:', notificationError);
      }

      return pin;
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors de la réservation';
      throw new Error(errorMessage);
    }
  };

  return {
    lots,
    loading,
    error,
    refetch: fetchLots,
    reserveLot,
  };
}

