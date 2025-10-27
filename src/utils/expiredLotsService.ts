/**
 * Service de gestion des lots expirés
 * 
 * Ce service gère la conversion automatique des lots non vendus
 * après les heures de retrait en lots gratuits pour le lendemain.
 * 
 * @module expiredLotsService
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'];

export interface ConvertedLotResult {
  lot_id: string;
  lot_title: string;
  original_status: string;
  quantity_remaining: number;
}

/**
 * Convertit les lots expirés en lots gratuits pour le lendemain
 * en appelant la fonction PostgreSQL
 * 
 * @returns Promise avec le nombre de lots convertis
 */
export async function convertExpiredLotsToFree(): Promise<{
  success: boolean;
  count: number;
  lots: ConvertedLotResult[];
  error?: string;
}> {
  try {
    // Appeler la fonction PostgreSQL qui gère la conversion
    const { data, error } = await supabase.rpc('convert_expired_lots_to_free');

    if (error) {
      console.error('Erreur lors de la conversion des lots expirés:', error);
      return {
        success: false,
        count: 0,
        lots: [],
        error: error.message
      };
    }

    const convertedLots = data as ConvertedLotResult[] || [];

    console.log(`✅ ${convertedLots.length} lot(s) converti(s) en gratuit pour demain`);

    return {
      success: true,
      count: convertedLots.length,
      lots: convertedLots
    };
  } catch (error) {
    console.error('Erreur inattendue lors de la conversion:', error);
    return {
      success: false,
      count: 0,
      lots: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Version simplifiée qui retourne juste le nombre de lots convertis
 */
export async function autoConvertExpiredLots(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('auto_convert_expired_lots');

    if (error) {
      console.error('Erreur lors de la conversion automatique:', error);
      return 0;
    }

    return data as number || 0;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return 0;
  }
}

/**
 * Récupère la liste des lots qui seront bientôt expirés
 * (dans les 2 prochaines heures)
 * 
 * @returns Promise avec la liste des lots
 */
export async function getExpiringLots(): Promise<Lot[]> {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('lots')
      .select(`
        *,
        merchant:profiles!merchant_id(
          business_name,
          business_address
        )
      `)
      .in('status', ['available', 'reserved'])
      .eq('is_free', false)
      .gte('pickup_end', now.toISOString())
      .lte('pickup_end', twoHoursLater.toISOString())
      .gt('quantity_total', 0)
      .order('pickup_end', { ascending: true });

    if (error) throw error;

    return data as Lot[] || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des lots expirants:', error);
    return [];
  }
}

/**
 * Récupère les lots gratuits disponibles pour les bénéficiaires
 * 
 * @returns Promise avec la liste des lots gratuits
 */
export async function getFreeLots(): Promise<Lot[]> {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select(`
        *,
        merchant:profiles!merchant_id(
          business_name,
          business_address,
          latitude,
          longitude
        )
      `)
      .eq('is_free', true)
      .eq('status', 'available')
      .gt('quantity_total', 0)
      .gte('pickup_end', new Date().toISOString())
      .order('pickup_start', { ascending: true });

    if (error) throw error;

    // Filtrer pour ne garder que ceux qui ont encore du stock disponible
    const availableLots = (data || []).filter((lot: Lot) => {
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      return availableQty > 0;
    });

    return availableLots;
  } catch (error) {
    console.error('Erreur lors de la récupération des lots gratuits:', error);
    return [];
  }
}

/**
 * Statistiques sur les lots convertis
 */
export async function getConversionStats(days: number = 7): Promise<{
  totalConverted: number;
  totalQuantitySaved: number;
  merchantsImpacted: number;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('lots')
      .select('id, merchant_id, quantity_total, created_at')
      .eq('is_free', true)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const lots = data || [];
    const uniqueMerchants = new Set(lots.map(lot => lot.merchant_id));

    return {
      totalConverted: lots.length,
      totalQuantitySaved: lots.reduce((sum, lot) => sum + lot.quantity_total, 0),
      merchantsImpacted: uniqueMerchants.size
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      totalConverted: 0,
      totalQuantitySaved: 0,
      merchantsImpacted: 0
    };
  }
}

/**
 * Supprime automatiquement les lots non retirés 24h après la date de remise
 * 
 * Cette fonction identifie les lots où :
 * - pickup_end est passé de plus de 24h
 * - Il reste des quantités réservées mais pas complétées (completed)
 * - Les reservations en attente qui n'ont pas été complétées
 * 
 * Elle supprime ces lots de la base de données et annule les réservations associées.
 * 
 * @returns Promise avec le nombre de lots supprimés
 */
export async function cleanupUnclaimedLots(): Promise<{
  success: boolean;
  deletedLots: number;
  cancelledReservations: number;
  error?: string;
}> {
  try {
    const now = new Date();
    // 24 heures avant maintenant
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Identifier les lots dont pickup_end est passé de plus de 24h
    const { data: expiredLots, error: lotsError } = await supabase
      .from('lots')
      .select('id, title, pickup_end, quantity_reserved')
      .lt('pickup_end', twentyFourHoursAgo.toISOString())
      .in('status', ['available', 'reserved']);

    if (lotsError) throw lotsError;

    if (!expiredLots || expiredLots.length === 0) {
      return {
        success: true,
        deletedLots: 0,
        cancelledReservations: 0
      };
    }

    let deletedLotsCount = 0;
    let cancelledReservationsCount = 0;

    // Pour chaque lot expiré non récupéré
    for (const lot of expiredLots) {
      try {
        // Vérifier s'il y a des réservations non complétées
        const { data: reservations, error: resError } = await supabase
          .from('reservations')
          .select('id, status')
          .eq('lot_id', lot.id)
          .neq('status', 'completed')
          .neq('status', 'cancelled');

        if (resError) {
          console.error(`Erreur lors de la récupération des réservations pour le lot ${lot.id}:`, resError);
          continue;
        }

        // Annuler toutes les réservations non complétées
        if (reservations && reservations.length > 0) {
          const { error: updateError } = await supabase
            .from('reservations')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('lot_id', lot.id)
            .neq('status', 'completed');

          if (updateError) {
            console.error(`Erreur lors de l'annulation des réservations pour le lot ${lot.id}:`, updateError);
            continue;
          }

          cancelledReservationsCount += reservations.length;
        }

        // Supprimer les images associées si elles existent
        const { data: lotData, error: fetchError } = await supabase
          .from('lots')
          .select('image_urls')
          .eq('id', lot.id)
          .single();

        if (!fetchError && lotData?.image_urls && lotData.image_urls.length > 0) {
          // Supprimer les images du storage (la fonction deleteImages gère déjà les erreurs)
          const { deleteImages } = await import('./helpers');
          await deleteImages(lotData.image_urls);
        }

        // Supprimer le lot
        const { error: deleteError } = await supabase
          .from('lots')
          .delete()
          .eq('id', lot.id);

        if (deleteError) {
          console.error(`Erreur lors de la suppression du lot ${lot.id}:`, deleteError);
          continue;
        }

        deletedLotsCount++;
        console.log(`✅ Lot "${lot.title}" supprimé (non récupéré 24h après pickup_end)`);
      } catch (error) {
        console.error(`Erreur lors du traitement du lot ${lot.id}:`, error);
        // Continue avec les autres lots
      }
    }

    console.log(`✅ Nettoyage terminé : ${deletedLotsCount} lot(s) supprimé(s), ${cancelledReservationsCount} réservation(s) annulée(s)`);

    return {
      success: true,
      deletedLots: deletedLotsCount,
      cancelledReservations: cancelledReservationsCount
    };
  } catch (error) {
    console.error('Erreur lors du nettoyage des lots non récupérés:', error);
    return {
      success: false,
      deletedLots: 0,
      cancelledReservations: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

