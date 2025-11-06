// Imports externes
import { useState, useEffect } from 'react';
import { X, Wallet, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../../stores/authStore';
import { getWalletBalance } from '../../../utils/walletService';
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
  onConfirm: (quantity: number, useWallet: boolean) => Promise<void>;
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
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const maxQuantity =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const totalPrice = lot.discounted_price * quantity;
  const isFree = lot.is_free || totalPrice === 0;

  // Charger le solde du wallet
  useEffect(() => {
    if (user?.id && !isFree) {
      setCheckingBalance(true);
      getWalletBalance(user.id)
        .then((balance) => {
          setWalletBalance(balance);
          // Pour les lots payants, le wallet est obligatoire
          // Activer automatiquement le wallet si le solde est suffisant
          if (balance >= totalPrice) {
            setUseWallet(true);
          } else {
            // Si le solde est insuffisant, garder useWallet à false
            // pour empêcher la confirmation
            setUseWallet(false);
          }
        })
        .catch((err) => {
          console.error('Erreur lors de la récupération du solde:', err);
          setWalletBalance(null);
        })
        .finally(() => {
          setCheckingBalance(false);
        });
    } else if (isFree) {
      // Pour les lots gratuits, pas besoin de vérifier le solde
      setWalletBalance(null);
      setUseWallet(false);
    }
  }, [user?.id, totalPrice, isFree]);

  // Vérifier si le solde est suffisant
  const hasEnoughBalance = walletBalance !== null && walletBalance >= totalPrice;
  
  // Pour les lots payants, le paiement via wallet est obligatoire
  const canConfirm = isFree || (useWallet && hasEnoughBalance);

  // Handlers
  const handleConfirm = async () => {
    // Pour les lots payants, s'assurer que useWallet est true
    const shouldUseWallet = !isFree && hasEnoughBalance;
    
    setLoading(true);
    try {
      await onConfirm(quantity, shouldUseWallet);
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
            {isFree ? 'Gratuit' : formatCurrency(totalPrice)}
          </p>
        </div>

        {/* Option de paiement via wallet (si pas gratuit) */}
        {!isFree && walletBalance !== null && (
          <div className="mb-6">
            <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900">
                  Paiement via portefeuille (obligatoire)
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">
                  Solde disponible: {formatCurrency(walletBalance)}
                </span>
                {!hasEnoughBalance && (
                  <span className="text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Solde insuffisant
                  </span>
                )}
                {hasEnoughBalance && (
                  <span className="text-green-600 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Solde suffisant
                  </span>
                )}
              </div>
              {hasEnoughBalance && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    Le montant de {formatCurrency(totalPrice)} sera débité de votre portefeuille lors de la confirmation.
                  </p>
                </div>
              )}
              {!hasEnoughBalance && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 mb-2">
                    Votre solde est insuffisant. Veuillez recharger votre portefeuille pour continuer.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      // Rediriger vers la page wallet (vous pouvez ajuster le chemin selon votre routing)
                      window.location.href = '/dashboard?tab=wallet';
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Recharger mon portefeuille →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Message si le wallet n'a pas été chargé */}
        {!isFree && walletBalance === null && !checkingBalance && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              Impossible de vérifier votre solde. Veuillez réessayer.
            </p>
          </div>
        )}

        {/* Message si gratuit */}
        {isFree && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Ce lot est gratuit. Aucun paiement requis.
            </p>
          </div>
        )}

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
            disabled={loading || !canConfirm || checkingBalance}
            className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmation...
              </>
            ) : (
              <>
                {!isFree && <Wallet className="w-5 h-5" />}
                {isFree && <CheckCircle className="w-5 h-5" />}
                Confirmer la réservation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

