import { useMemo } from 'react';
import type { Database } from '../lib/database.types';
import type { AdvancedFilters } from '../components/customer/components';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

/**
 * Hook personnalisé pour filtrer et trier les lots
 * Applique les filtres avancés et retourne les lots filtrés/triés
 */
export function useAdvancedFilters(lots: Lot[], filters: AdvancedFilters) {
  return useMemo(() => {
    let filtered = [...lots];

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(lot => lot.category === filters.category);
    }

    // Filtre par prix
    filtered = filtered.filter(
      lot => lot.discounted_price >= filters.minPrice && lot.discounted_price <= filters.maxPrice
    );

    // Filtre lots urgents uniquement
    if (filters.onlyUrgent) {
      filtered = filtered.filter(lot => lot.is_urgent);
    }

    // Filtre par quantité minimale
    const lotsWithQty = filtered.filter(lot => {
      const available = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      return available >= filters.minQuantity;
    });

    // Tri
    switch (filters.sortBy) {
      case 'price_asc':
        lotsWithQty.sort((a, b) => a.discounted_price - b.discounted_price);
        break;
      case 'price_desc':
        lotsWithQty.sort((a, b) => b.discounted_price - a.discounted_price);
        break;
      case 'quantity_desc':
        lotsWithQty.sort((a, b) => {
          const qtyA = a.quantity_total - a.quantity_reserved - a.quantity_sold;
          const qtyB = b.quantity_total - b.quantity_reserved - b.quantity_sold;
          return qtyB - qtyA;
        });
        break;
      case 'urgent':
        lotsWithQty.sort((a, b) => {
          if (a.is_urgent && !b.is_urgent) return -1;
          if (!a.is_urgent && b.is_urgent) return 1;
          return 0;
        });
        break;
    }

    return lotsWithQty;
  }, [lots, filters]);
}

