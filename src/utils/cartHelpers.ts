import { supabase } from '../lib/supabase';
import { generatePIN } from './helpers';
import type { CartItem } from '../stores/cartStore';

/**
 * Crée une réservation groupée pour tous les articles du panier
 * Génère un seul code PIN et cart_group_id pour toutes les réservations
 * 
 * @param items - Articles du panier
 * @param userId - ID de l'utilisateur
 * @returns Le code PIN généré
 */
export async function createGroupReservation(
  items: CartItem[],
  userId: string
): Promise<string> {
  if (items.length === 0) {
    throw new Error('Le panier est vide');
  }

  // Vérifier que tous les lots appartiennent au même commerçant
  const merchantId = items[0].lot.merchant_id;
  const allSameMerchant = items.every(item => item.lot.merchant_id === merchantId);
  
  if (!allSameMerchant) {
    throw new Error('Tous les articles doivent appartenir au même commerçant');
  }

  // Générer un PIN unique et un cart_group_id pour le groupe
  const pin = generatePIN();
  const cartGroupId = crypto.randomUUID();

  try {
    // Créer les réservations en une seule transaction
    const reservations = items.map(item => ({
      lot_id: item.lot.id,
      user_id: userId,
      quantity: item.quantity,
      total_price: item.lot.discounted_price * item.quantity,
      pickup_pin: pin,
      cart_group_id: cartGroupId,
      status: 'pending' as const,
      is_donation: false,
    }));

    const { data: createdReservations, error: reservationError } = await supabase
      .from('reservations')
      .insert(reservations)
      .select();

    if (reservationError) throw reservationError;

    // Mettre à jour les quantités réservées pour chaque lot
    const updatePromises = items.map(async (item) => {
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: item.lot.quantity_reserved + item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.lot.id);

      if (updateError) throw updateError;
    });

    await Promise.all(updatePromises);

    // Enregistrer les métriques d'impact
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    await supabase.from('impact_metrics').insert({
      user_id: userId,
      metric_type: 'meals_saved',
      value: totalQuantity,
    });

    return pin;
  } catch (err) {
    console.error('Erreur lors de la création de la réservation groupée:', err);
    
    // Essayer de nettoyer les réservations créées en cas d'erreur
    try {
      await supabase
        .from('reservations')
        .delete()
        .eq('cart_group_id', cartGroupId);
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage:', cleanupError);
    }
    
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Impossible de créer la réservation groupée. Veuillez réessayer.');
  }
}

/**
 * Récupère toutes les réservations d'un groupe (panier)
 * 
 * @param cartGroupId - ID du groupe de réservations
 * @returns Les réservations avec les informations des lots
 */
export async function getGroupReservations(cartGroupId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, lots(*, profiles(business_name, business_address, business_logo_url))')
    .eq('cart_group_id', cartGroupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des réservations groupées:', error);
    throw new Error('Impossible de charger les réservations');
  }

  return data;
}

/**
 * Annule toutes les réservations d'un groupe
 * 
 * @param cartGroupId - ID du groupe de réservations
 */
export async function cancelGroupReservation(cartGroupId: string): Promise<void> {
  try {
    // Récupérer les réservations du groupe
    const reservations = await getGroupReservations(cartGroupId);

    if (reservations.length === 0) {
      throw new Error('Groupe de réservations introuvable');
    }

    // Annuler toutes les réservations
    const { error: cancelError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('cart_group_id', cartGroupId);

    if (cancelError) throw cancelError;

    // Remettre à jour les quantités réservées
    const updatePromises = reservations.map(async (reservation) => {
      const lot = reservation.lots;
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: lot.quantity_reserved - reservation.quantity,
        })
        .eq('id', lot.id);

      if (updateError) throw updateError;
    });

    await Promise.all(updatePromises);
  } catch (err) {
    console.error('Erreur lors de l\'annulation du groupe:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Impossible d\'annuler les réservations. Veuillez réessayer.');
  }
}

