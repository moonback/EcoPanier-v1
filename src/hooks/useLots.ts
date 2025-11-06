// Imports externes
import { useState, useEffect, useCallback } from 'react';

// Imports internes
import { supabase } from '../lib/supabase';
import { generatePIN } from '../utils/helpers';
import { payFromWallet } from '../utils/walletService';
import type { Database } from '../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
    business_type?: string | null;
    business_description?: string | null;
    business_email?: string | null;
    business_hours?: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
    phone?: string | null;
    verified?: boolean;
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
    isDonation?: boolean,
    useWallet?: boolean
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
        .select(`
          *,
          profiles(
            business_name,
            business_address,
            business_logo_url,
            business_type,
            business_description,
            business_email,
            business_hours,
            phone,
            verified
          )
        `)
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
    isDonation: boolean = false,
    useWallet: boolean = false
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
      let reservationId: string | undefined;

      // Si paiement via wallet, effectuer le paiement d'abord
      if (useWallet && totalPrice > 0 && !isDonation) {
        try {
          // Créer la réservation d'abord pour obtenir l'ID
          const { data: reservationData, error: reservationError } = await supabase
            .from('reservations')
            .insert({
              lot_id: lot.id,
              user_id: userId,
              quantity,
              total_price: totalPrice,
              pickup_pin: pin,
              status: 'pending',
              is_donation: isDonation,
            })
            .select()
            .single();

          if (reservationError) throw reservationError;
          if (!reservationData) throw new Error('Impossible de créer la réservation');

          reservationId = reservationData.id;

          // Effectuer le paiement via wallet
          await payFromWallet(
            userId,
            totalPrice,
            `Paiement pour réservation ${lot.title} (x${quantity})`,
            reservationId,
            'reservation',
            {
              lot_id: lot.id,
              lot_title: lot.title,
              quantity,
            }
          );

          // Mettre à jour le statut de la réservation
          const { error: updateReservationError } = await supabase
            .from('reservations')
            .update({
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', reservationId);

          if (updateReservationError) throw updateReservationError;
        } catch (walletError) {
          // Si le paiement échoue, annuler la réservation si elle a été créée
          if (reservationId) {
            await supabase
              .from('reservations')
              .delete()
              .eq('id', reservationId);
          }
          throw walletError;
        }
      } else {
        // Créer la réservation sans paiement wallet
        const { error: reservationError } = await supabase
          .from('reservations')
          .insert({
            lot_id: lot.id,
            user_id: userId,
            quantity,
            total_price: totalPrice,
            pickup_pin: pin,
            status: 'pending',
            is_donation: isDonation,
          });

        if (reservationError) throw reservationError;
      }

      // Mettre à jour la quantité réservée du lot
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: lot.quantity_reserved + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lot.id);

      if (updateError) throw updateError;

      // Enregistrer les métriques d'impact
      const metricType = isDonation ? 'donations_made' : 'meals_saved';
      await supabase.from('impact_metrics').insert({
        user_id: userId,
        metric_type: metricType,
        value: quantity,
      });

      // Rafraîchir la liste des lots
      await fetchLots();

      return pin;
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Impossible de finaliser la réservation. Veuillez réessayer.');
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

