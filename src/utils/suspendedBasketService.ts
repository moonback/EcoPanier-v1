import { supabase } from '../lib/supabase';

/**
 * Types pour les paniers suspendus
 */
export type SuspendedBasketStatus = 'available' | 'reserved' | 'claimed' | 'expired';

export interface SuspendedBasket {
  id: string;
  donor_id: string;
  merchant_id: string;
  reservation_id: string | null;
  amount: number;
  status: SuspendedBasketStatus;
  notes: string | null;
  expires_at: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuspendedBasketWithDetails extends SuspendedBasket {
  donor: {
    id: string;
    full_name: string;
    phone: string | null;
  };
  merchant: {
    id: string;
    full_name: string;
    business_name: string | null;
    business_address: string | null;
  };
  beneficiary: {
    id: string;
    full_name: string;
    beneficiary_id: string | null;
  } | null;
  lot?: {
    id: string;
    title: string;
    discounted_price: number;
    original_price: number;
    category: string;
    image_urls: string[] | null;
    pickup_start: string;
    pickup_end: string;
  } | null;
}

export interface CreateSuspendedBasketInput {
  lot_id: string;
  quantity: number;
  notes?: string;
  reservation_id?: string;
}

/**
 * Service pour gérer les paniers suspendus
 */
export const suspendedBasketService = {
  /**
   * Récupère tous les paniers suspendus offerts par un client
   */
  async getBasketsByDonor(donorId: string): Promise<SuspendedBasketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('suspended_baskets')
        .select(`
          *,
          donor:profiles!donor_id(id, full_name, phone),
          merchant:profiles!merchant_id(id, full_name, business_name, business_address),
          beneficiary:profiles!claimed_by(id, full_name, beneficiary_id)
        `)
        .eq('donor_id', donorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les lots associés
      const basketsWithLots = await Promise.all(
        (data || []).map(async (basket) => {
          let lot = null;
          // Utiliser lot_id si disponible, sinon reservation_id (rétrocompatibilité)
          const lotId = (basket as any).lot_id || basket.reservation_id;
          if (lotId) {
            try {
              const { data: lotData, error: lotError } = await supabase
                .from('lots')
                .select('id, title, discounted_price, original_price, category, image_urls, pickup_start, pickup_end')
                .eq('id', lotId)
                .maybeSingle();
              
              if (!lotError && lotData) {
                lot = lotData;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du lot:', err);
              // Continuer sans le lot si erreur
            }
          }

          return {
            ...basket,
            donor: basket.donor as SuspendedBasketWithDetails['donor'],
            merchant: basket.merchant as SuspendedBasketWithDetails['merchant'],
            beneficiary: basket.beneficiary as SuspendedBasketWithDetails['beneficiary'],
            lot: lot as SuspendedBasketWithDetails['lot'],
          };
        })
      );

      return basketsWithLots;
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers suspendus:', error);
      throw new Error('Impossible de charger vos paniers suspendus');
    }
  },

  /**
   * Récupère tous les paniers suspendus disponibles pour les bénéficiaires
   */
  async getAvailableBaskets(): Promise<SuspendedBasketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('suspended_baskets')
        .select(`
          *,
          donor:profiles!donor_id(id, full_name, phone),
          merchant:profiles!merchant_id(id, full_name, business_name, business_address),
          beneficiary:profiles!claimed_by(id, full_name, beneficiary_id)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les lots associés et filtrer
      const basketsWithLots = await Promise.all(
        (data || []).map(async (basket) => {
          let lot = null;
          // Utiliser lot_id si disponible, sinon reservation_id (rétrocompatibilité)
          const lotId = (basket as any).lot_id || basket.reservation_id;
          if (lotId) {
            try {
              const { data: lotData, error: lotError } = await supabase
                .from('lots')
                .select('id, title, discounted_price, original_price, category, image_urls, pickup_start, pickup_end, status, quantity_total, quantity_reserved, quantity_sold')
                .eq('id', lotId)
                .maybeSingle();
              
              if (!lotError && lotData) {
                lot = lotData;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du lot:', err);
              // Continuer sans le lot si erreur
            }
          }

          return {
            ...basket,
            donor: basket.donor as SuspendedBasketWithDetails['donor'],
            merchant: basket.merchant as SuspendedBasketWithDetails['merchant'],
            beneficiary: basket.beneficiary as SuspendedBasketWithDetails['beneficiary'],
            lot: lot as SuspendedBasketWithDetails['lot'],
          };
        })
      );

      // Filtrer pour ne garder que ceux dont le lot est disponible
      return basketsWithLots.filter((basket) => {
        if (!basket.lot) return false;
        const lot = basket.lot as any;
        return lot.status === 'available' && (lot.quantity_total - lot.quantity_reserved - lot.quantity_sold) > 0;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers disponibles:', error);
      throw new Error('Impossible de charger les paniers suspendus disponibles');
    }
  },

  /**
   * Récupère tous les paniers suspendus récupérés par un bénéficiaire
   */
  async getBasketsByBeneficiary(beneficiaryId: string): Promise<SuspendedBasketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('suspended_baskets')
        .select(`
          *,
          donor:profiles!donor_id(id, full_name, phone),
          merchant:profiles!merchant_id(id, full_name, business_name, business_address),
          beneficiary:profiles!claimed_by(id, full_name, beneficiary_id)
        `)
        .eq('claimed_by', beneficiaryId)
        .order('claimed_at', { ascending: false });

      if (error) throw error;

      // Récupérer les lots associés
      const basketsWithLots = await Promise.all(
        (data || []).map(async (basket) => {
          let lot = null;
          // Utiliser lot_id si disponible, sinon reservation_id (rétrocompatibilité)
          const lotId = (basket as any).lot_id || basket.reservation_id;
          if (lotId) {
            try {
              const { data: lotData, error: lotError } = await supabase
                .from('lots')
                .select('id, title, discounted_price, original_price, category, image_urls, pickup_start, pickup_end')
                .eq('id', lotId)
                .maybeSingle();
              
              if (!lotError && lotData) {
                lot = lotData;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du lot:', err);
              // Continuer sans le lot si erreur
            }
          }

          return {
            ...basket,
            donor: basket.donor as SuspendedBasketWithDetails['donor'],
            merchant: basket.merchant as SuspendedBasketWithDetails['merchant'],
            beneficiary: basket.beneficiary as SuspendedBasketWithDetails['beneficiary'],
            lot: lot as SuspendedBasketWithDetails['lot'],
          };
        })
      );

      return basketsWithLots;
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers récupérés:', error);
      throw new Error('Impossible de charger vos paniers récupérés');
    }
  },

  /**
   * Crée un nouveau panier suspendu à partir d'un lot
   */
  async createBasket(input: CreateSuspendedBasketInput, donorId: string): Promise<SuspendedBasket> {
    try {
      // Récupérer le lot pour obtenir le merchant_id et le prix
      const { data: lot, error: lotError } = await supabase
        .from('lots')
        .select('merchant_id, discounted_price, status, quantity_total, quantity_reserved, quantity_sold')
        .eq('id', input.lot_id)
        .single();

      if (lotError) throw lotError;
      if (!lot) throw new Error('Lot introuvable');

      // Vérifier que le lot est disponible
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      if (lot.status !== 'available' || availableQty < input.quantity) {
        throw new Error('Le lot n\'est plus disponible en quantité suffisante');
      }

      // Calculer le montant total
      const amount = lot.discounted_price * input.quantity;

      // Créer le panier suspendu
      const { data, error } = await supabase
        .from('suspended_baskets')
        .insert({
          donor_id: donorId,
          merchant_id: lot.merchant_id,
          amount: amount,
          notes: input.notes || null,
          lot_id: input.lot_id,
          reservation_id: input.reservation_id || null,
          status: 'available',
        })
        .select()
        .single();

      if (error) throw error;

      // Réserver la quantité du lot pour le panier suspendu
      // On incrémente quantity_reserved pour réserver le stock
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: (lot.quantity_reserved || 0) + input.quantity,
        })
        .eq('id', input.lot_id);

      if (updateError) {
        console.error('Erreur lors de la réservation du lot:', updateError);
        // Annuler la création du panier si la réservation échoue
        await supabase.from('suspended_baskets').delete().eq('id', data.id);
        throw new Error('Impossible de réserver le lot');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création du panier suspendu:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Impossible de créer le panier suspendu'
      );
    }
  },

  /**
   * Réserve un panier suspendu pour un bénéficiaire
   */
  async reserveBasket(basketId: string, beneficiaryId: string): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('reserve_suspended_basket', {
        p_basket_id: basketId,
        p_beneficiary_id: beneficiaryId,
      });

      if (error) throw error;
      
      // La fonction retourne un boolean, vérifier le résultat
      if (data === false) {
        throw new Error('Impossible de réserver ce panier (déjà réservé ou indisponible)');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation du panier:', error);
      if (error instanceof Error && error.message.includes('déjà réservé')) {
        throw error;
      }
      throw new Error('Impossible de réserver ce panier');
    }
  },

  /**
   * Récupère un panier suspendu (le marque comme réclamé et crée une réservation pour le bénéficiaire)
   */
  async claimBasket(basketId: string, beneficiaryId: string): Promise<void> {
    try {
      // Récupérer le panier suspendu
      const { data: basket, error: basketError } = await supabase
        .from('suspended_baskets')
        .select('*')
        .eq('id', basketId)
        .single();

      if (basketError) throw basketError;
      if (!basket) throw new Error('Panier suspendu introuvable');

      // Vérifier que le panier est disponible
      if (basket.status !== 'available') {
        throw new Error('Ce panier n\'est plus disponible');
      }

      // Récupérer le lot_id (nouvelle colonne ou rétrocompatibilité avec reservation_id)
      const lotId = (basket as any).lot_id || basket.reservation_id;
      if (!lotId) {
        throw new Error('Lot associé introuvable');
      }

      // Récupérer les détails du lot
      const { data: lot, error: lotError } = await supabase
        .from('lots')
        .select('*')
        .eq('id', lotId)
        .single();

      if (lotError) throw lotError;
      if (!lot) throw new Error('Lot introuvable');

      // Vérifier que le lot est encore disponible
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      if (lot.status !== 'available' || availableQty < 1) {
        throw new Error('Le lot n\'est plus disponible');
      }

      // Générer un PIN pour la réservation
      const { generatePIN } = await import('./helpers');
      const pin = generatePIN();

      // Créer la réservation pour le bénéficiaire (gratuite)
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          lot_id: lotId,
          user_id: beneficiaryId,
          quantity: 1, // Pour l'instant, on assume 1 unité par panier suspendu
          total_price: 0, // Gratuit pour le bénéficiaire
          pickup_pin: pin,
          status: 'confirmed',
          is_donation: false, // Ce n'est pas un don, c'est un panier suspendu récupéré
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Marquer le panier comme réclamé
      const { error: claimError } = await supabase.rpc('claim_suspended_basket', {
        p_basket_id: basketId,
        p_beneficiary_id: beneficiaryId,
      });

      if (claimError) {
        // Annuler la réservation si le claim échoue
        await supabase.from('reservations').delete().eq('id', reservation.id);
        throw claimError;
      }

      // Mettre à jour la quantité réservée du lot (déjà fait lors de la création du panier)
      // Pas besoin de modifier car c'est déjà réservé
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      if (error instanceof Error && (error.message.includes('déjà récupéré') || error.message.includes('non trouvé') || error.message.includes('pas disponible'))) {
        throw error;
      }
      throw new Error('Impossible de récupérer ce panier');
    }
  },

};

