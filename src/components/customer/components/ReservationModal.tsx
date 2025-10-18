import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

interface ReservationModalProps {
  lot: Lot;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

/**
 * Modal pour confirmer une réservation de lot
 * Permet de sélectionner la quantité et affiche le prix total
 */
export function ReservationModal({
  lot,
  onClose,
  onConfirm,
}: ReservationModalProps) {
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
        error instanceof Error
          ? error.message
          : 'Erreur lors de la réservation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-bold text-black pr-4">
            Réserver {lot.title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Sélection de quantité */}
        <div className="mb-6">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-black mb-2"
          >
            Quantité
          </label>
          <input
            id="quantity"
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

        {/* Affichage du total */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Total</p>
          <p className="text-3xl font-bold text-black">
            {formatCurrency(lot.discounted_price * quantity)}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Confirmation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

