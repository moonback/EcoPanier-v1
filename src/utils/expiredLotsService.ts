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

