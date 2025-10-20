import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
};

export interface CartItem {
  lot: Lot;
  quantity: number;
}

interface CartStore {
  // État
  items: CartItem[];
  merchantId: string | null;
  
  // Actions
  addItem: (lot: Lot, quantity: number) => void;
  removeItem: (lotId: string) => void;
  updateQuantity: (lotId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  canAddItem: (merchantId: string) => boolean;
}

/**
 * Store Zustand pour gérer le panier d'achat
 * Permet d'ajouter plusieurs lots du même commerçant
 * et de créer une réservation groupée avec un seul QR code
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // État initial
      items: [],
      merchantId: null,

      // Ajouter un item au panier
      addItem: (lot, quantity) => {
        const state = get();
        
        // Vérifier si on peut ajouter (même commerçant ou panier vide)
        if (state.merchantId && state.merchantId !== lot.merchant_id) {
          throw new Error('Vous ne pouvez ajouter que des produits du même commerçant');
        }

        // Vérifier si l'item existe déjà
        const existingItemIndex = state.items.findIndex(item => item.lot.id === lot.id);

        if (existingItemIndex !== -1) {
          // Mettre à jour la quantité de l'item existant
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += quantity;
          
          set({ items: newItems });
        } else {
          // Ajouter un nouvel item
          set({
            items: [...state.items, { lot, quantity }],
            merchantId: lot.merchant_id,
          });
        }
      },

      // Retirer un item du panier
      removeItem: (lotId) => {
        const state = get();
        const newItems = state.items.filter(item => item.lot.id !== lotId);
        
        set({
          items: newItems,
          merchantId: newItems.length > 0 ? state.merchantId : null,
        });
      },

      // Mettre à jour la quantité d'un item
      updateQuantity: (lotId, quantity) => {
        const state = get();
        
        if (quantity <= 0) {
          get().removeItem(lotId);
          return;
        }

        const newItems = state.items.map(item =>
          item.lot.id === lotId ? { ...item, quantity } : item
        );

        set({ items: newItems });
      },

      // Vider le panier
      clearCart: () => {
        set({ items: [], merchantId: null });
      },

      // Calculer le prix total
      getTotalPrice: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.lot.discounted_price * item.quantity,
          0
        );
      },

      // Obtenir le nombre total d'items
      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      // Vérifier si on peut ajouter un item (même commerçant)
      canAddItem: (merchantId) => {
        const state = get();
        return !state.merchantId || state.merchantId === merchantId;
      },
    }),
    {
      name: 'ecopanier-cart', // Clé pour localStorage
    }
  )
);

