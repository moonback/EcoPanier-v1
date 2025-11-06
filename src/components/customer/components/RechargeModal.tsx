// Imports externes
import { useState } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../../stores/authStore';
import { rechargeWallet } from '../../../utils/walletService';
import { formatCurrency } from '../../../utils/helpers';

interface RechargeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal pour recharger le wallet
 * Permet de sélectionner un montant prédéfini ou d'entrer un montant personnalisé
 */
export function RechargeModal({ onClose, onSuccess }: RechargeModalProps) {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Montants prédéfinis
  const predefinedAmounts = [10, 20, 50, 100, 200];

  // Handlers
  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
    setError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre uniquement les nombres positifs avec 2 décimales max
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleRecharge = async () => {
    if (!user?.id) {
      setError('Vous devez être connecté pour recharger votre portefeuille');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez entrer un montant valide (minimum 0.01€)');
      return;
    }

    if (numericAmount < 0.01) {
      setError('Le montant minimum est de 0.01€');
      return;
    }

    if (numericAmount > 10000) {
      setError('Le montant maximum est de 10 000€');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await rechargeWallet(
        user.id,
        numericAmount,
        `Recharge de ${formatCurrency(numericAmount)}`
      );
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de la recharge:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de recharger le portefeuille. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Render principal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 md:p-8 my-auto animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Recharger mon portefeuille
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Fermer"
            disabled={loading}
          >
            <X size={18} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Montants prédéfinis */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Montants rapides
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {predefinedAmounts.map((predefinedAmount) => (
              <button
                key={predefinedAmount}
                onClick={() => handleAmountSelect(predefinedAmount)}
                disabled={loading}
                className={`p-2 sm:p-2.5 md:p-3 rounded-lg border-2 transition-all font-medium text-xs sm:text-sm ${
                  amount === predefinedAmount.toString()
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-primary-300 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {predefinedAmount}€
              </button>
            ))}
          </div>
        </div>

        {/* Montant personnalisé */}
        <div className="mb-4 sm:mb-6">
          <label
            htmlFor="amount"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Ou entrez un montant personnalisé
          </label>
          <div className="relative">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
              €
            </span>
          </div>
          {error && (
            <p className="text-xs sm:text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        {/* Affichage du montant total */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Montant à recharger
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              {formatCurrency(parseFloat(amount) || 0)}
            </p>
          </div>
        )}

        {/* Note importante */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
                Note importante
              </p>
              <p className="text-xs text-blue-700">
                La recharge sera effectuée immédiatement. Vous pourrez utiliser
                ce montant pour payer vos réservations avec votre portefeuille.
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Annuler
          </button>
          <button
            onClick={handleRecharge}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex-1 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Rechargement...</span>
                <span className="sm:hidden">Chargement...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Recharger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

