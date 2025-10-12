import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { calculateDistance } from '../../../utils/geocodingService';
import type { MerchantWithLots, MapFilters, UserLocation, LotBase, Profile } from './types';

export function useMerchantsData(filters: MapFilters, userLocation: UserLocation | null) {
  const [merchants, setMerchants] = useState<MerchantWithLots[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMerchantsWithLots = useCallback(async () => {
    try {
      setLoading(true);

      // Construire la requête pour les lots
      let lotsQuery = supabase
        .from('lots')
        .select(`
          *,
          merchant:profiles!merchant_id(*)
        `)
        .eq('status', 'available')
        .gte('pickup_end', new Date().toISOString())
        .gt('discounted_price', 0); // Clients voient uniquement les lots payants (non gratuits)

      // Filtrer par catégorie
      if (filters.selectedCategory !== 'Tous') {
        lotsQuery = lotsQuery.eq('category', filters.selectedCategory);
      }

      // Filtrer les lots urgents
      if (filters.onlyUrgent) {
        lotsQuery = lotsQuery.eq('is_urgent', true);
      }

      const { data: lots, error } = await lotsQuery;

      if (error) throw error;

      // Grouper les lots par commerçant
      const merchantsMap = new Map<string, MerchantWithLots>();

      lots?.forEach((lot: LotBase & { merchant: Profile }) => {
        const merchant = lot.merchant;
        if (!merchant || !merchant.latitude || !merchant.longitude) return;

        if (!merchantsMap.has(merchant.id)) {
          merchantsMap.set(merchant.id, {
            ...merchant,
            lots: []
          });
        }

        merchantsMap.get(merchant.id)?.lots.push(lot);
      });

      // Convertir en tableau et calculer les distances
      let merchantsArray = Array.from(merchantsMap.values());

      // Calculer la distance si on a la position utilisateur
      if (userLocation) {
        merchantsArray = merchantsArray.map(merchant => ({
          ...merchant,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            merchant.latitude!,
            merchant.longitude!
          )
        }));

        // Filtrer par distance max
        merchantsArray = merchantsArray.filter(
          m => !m.distance || m.distance <= filters.maxDistance
        );

        // Trier par distance
        merchantsArray.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      setMerchants(merchantsArray);
    } catch (error) {
      console.error('Erreur chargement commerçants:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.selectedCategory, filters.onlyUrgent, filters.maxDistance, userLocation]);

  useEffect(() => {
    loadMerchantsWithLots();
  }, [loadMerchantsWithLots]);

  return { merchants, loading, reload: loadMerchantsWithLots };
}

