import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

interface DonationModalProps {
  lot: Lot;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

/**
 * Modal pour créer un panier suspendu (don solidaire)
 * Permet de sélectionner la quantité à offrir
 */
export function DonationModal({ lot, onClose, onConfirm }: DonationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxQuantity =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(quantity);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      alert(
        error instanceof Error ? error.message : 'Erreur lors du don'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* En-tête avec icône */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-black" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-black text-center mb-2">
              Panier Suspendu
            </h3>
            <p className="text-sm text-gray-600 text-center font-light">
              Offrez ce produit à une personne dans le besoin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Sélection de quantité */}
        <div className="mb-6">
          <label
            htmlFor="donation-quantity"
            className="block text-sm font-medium text-black mb-2"
          >
            Quantité à donner
          </label>
          <input
            id="donation-quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-200 transition-all text-base"
          />
          <p className="text-xs text-gray-600 mt-2 font-light">
            Maximum disponible: {maxQuantity}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Confirmation...' : 'Offrir'}
          </button>
        </div>
      </div>
    </div>
  );
}

