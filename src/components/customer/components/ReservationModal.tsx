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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 pr-2">
            Réserver {lot.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Sélection de quantité */}
        <div className="mb-4">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum disponible: {maxQuantity}
          </p>
        </div>

        {/* Affichage du total */}
        <div className="mb-5 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm sm:text-base font-semibold text-gray-800">
            Total:{' '}
            <span className="text-xl sm:text-2xl text-green-600">
              {formatCurrency(lot.discounted_price * quantity)}
            </span>
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Confirmation...' : 'Confirmer la réservation'}
          </button>
        </div>
      </div>
    </div>
  );
}

