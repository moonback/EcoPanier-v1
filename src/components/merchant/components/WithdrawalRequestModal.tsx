// Imports externes
import { useState, useEffect } from 'react';
import { X, ArrowDownCircle, AlertCircle, Info, CreditCard, Plus } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../../stores/authStore';
import {
  createWithdrawalRequest,
  calculateWithdrawalAmounts,
  getDefaultBankAccount,
  getMerchantBankAccounts,
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_COMMISSION_RATE,
  type MerchantBankAccount,
} from '../../../utils/walletService';
import { formatCurrency } from '../../../utils/helpers';
import { PasswordConfirmationModal } from '../../shared/PasswordConfirmationModal';

interface WithdrawalRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
  onManageBankAccounts?: () => void;
}

/**
 * Modal pour demander un virement
 * Permet de saisir le montant (minimum 100€) et les informations bancaires
 */
export function WithdrawalRequestModal({
  onClose,
  onSuccess,
  currentBalance,
  onManageBankAccounts,
}: WithdrawalRequestModalProps) {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [amount, setAmount] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<MerchantBankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [useSavedAccount, setUseSavedAccount] = useState<boolean>(true);
  const [bankAccountName, setBankAccountName] = useState<string>('');
  const [bankAccountIban, setBankAccountIban] = useState<string>('');
  const [bankAccountBic, setBankAccountBic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Charger les comptes bancaires
  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    if (!user?.id) return;

    try {
      setLoadingAccounts(true);
      const accounts = await getMerchantBankAccounts(user.id);
      setBankAccounts(accounts);

      // Sélectionner le compte par défaut s'il existe
      const defaultAccount = accounts.find((acc) => acc.is_default);
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.id);
        setUseSavedAccount(true);
      } else if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
        setUseSavedAccount(true);
      } else {
        setUseSavedAccount(false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err);
      setUseSavedAccount(false);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Mettre à jour les champs quand un compte est sélectionné
  useEffect(() => {
    if (useSavedAccount && selectedAccountId) {
      const account = bankAccounts.find((acc) => acc.id === selectedAccountId);
      if (account) {
        setBankAccountName(account.account_name);
        setBankAccountIban(account.iban.match(/.{1,4}/g)?.join(' ') || account.iban);
        setBankAccountBic(account.bic || '');
      }
    } else {
      setBankAccountName('');
      setBankAccountIban('');
      setBankAccountBic('');
    }
  }, [selectedAccountId, useSavedAccount, bankAccounts]);

  // Calculs
  const numericAmount = amount ? parseFloat(amount) : 0;
  const { commissionAmount, netAmount } = calculateWithdrawalAmounts(numericAmount);
  const canRequest = numericAmount >= MIN_WITHDRAWAL_AMOUNT && numericAmount <= currentBalance;

  // Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre uniquement les nombres positifs avec 2 décimales max
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formater l'IBAN (espaces tous les 4 caractères)
    let value = e.target.value.replace(/\s/g, '').toUpperCase();
    if (value.length <= 34) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setBankAccountIban(value);
      setError(null);
    }
  };

  const handleBicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // BIC en majuscules, max 11 caractères
    const value = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 11);
    setBankAccountBic(value);
    setError(null);
  };

  const handleSubmit = () => {
    if (!user?.id) {
      setError('Vous devez être connecté pour demander un virement');
      return;
    }

    if (!amount || numericAmount < MIN_WITHDRAWAL_AMOUNT) {
      setError(`Le montant minimum est de ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}`);
      return;
    }

    if (numericAmount > currentBalance) {
      setError(`Le montant demandé dépasse votre solde disponible (${formatCurrency(currentBalance)})`);
      return;
    }

    // Déterminer les informations bancaires à utiliser
    let finalAccountName: string;
    let finalIban: string;
    let finalBic: string | undefined;

    if (useSavedAccount && selectedAccountId) {
      const selectedAccount = bankAccounts.find((acc) => acc.id === selectedAccountId);
      if (!selectedAccount) {
        setError('Compte bancaire sélectionné introuvable');
        return;
      }
      finalAccountName = selectedAccount.account_name;
      finalIban = selectedAccount.iban;
      finalBic = selectedAccount.bic || undefined;
    } else {
      if (!bankAccountName.trim()) {
        setError('Veuillez saisir le nom du titulaire du compte');
        return;
      }

      if (!bankAccountIban.trim() || bankAccountIban.replace(/\s/g, '').length < 15) {
        setError('Veuillez saisir un IBAN valide');
        return;
      }

      finalAccountName = bankAccountName.trim();
      finalIban = bankAccountIban.replace(/\s/g, '');
      finalBic = bankAccountBic.trim() || undefined;
    }

    // Demander confirmation par mot de passe
    setShowPasswordModal(true);
  };

  const executeSubmit = async () => {
    if (!user?.id) return;

    const numericAmount = parseFloat(amount);

    // Déterminer les informations bancaires à utiliser
    let finalAccountName: string;
    let finalIban: string;
    let finalBic: string | undefined;

    if (useSavedAccount && selectedAccountId) {
      const selectedAccount = bankAccounts.find((acc) => acc.id === selectedAccountId);
      if (!selectedAccount) {
        setError('Compte bancaire sélectionné introuvable');
        return;
      }
      finalAccountName = selectedAccount.account_name;
      finalIban = selectedAccount.iban;
      finalBic = selectedAccount.bic || undefined;
    } else {
      finalAccountName = bankAccountName.trim();
      finalIban = bankAccountIban.replace(/\s/g, '');
      finalBic = bankAccountBic.trim() || undefined;
    }

    setLoading(true);
    setError(null);

    try {
      await createWithdrawalRequest(
        user.id,
        numericAmount,
        finalAccountName,
        finalIban,
        finalBic
      );
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de la demande de virement:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de créer la demande de virement. Vérifiez votre connexion.'
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
              <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Demander un virement
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

        {/* Informations importantes */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
                Conditions de virement
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Montant minimum : {formatCurrency(MIN_WITHDRAWAL_AMOUNT)}</li>
                <li>• Commission : {WITHDRAWAL_COMMISSION_RATE * 100}%</li>
                <li>• Délai de traitement : 3-5 jours ouvrés</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Montant */}
        <div className="mb-4 sm:mb-6">
          <label
            htmlFor="amount"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Montant à virer (minimum {formatCurrency(MIN_WITHDRAWAL_AMOUNT)})
          </label>
          <div className="relative">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="100.00"
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
              €
            </span>
          </div>
          {error && amount && numericAmount < MIN_WITHDRAWAL_AMOUNT && (
            <p className="text-xs sm:text-sm text-red-600 mt-2">
              Le montant minimum est de {formatCurrency(MIN_WITHDRAWAL_AMOUNT)}
            </p>
          )}
          {amount && numericAmount > currentBalance && (
            <p className="text-xs sm:text-sm text-red-600 mt-2">
              Solde insuffisant. Disponible : {formatCurrency(currentBalance)}
            </p>
          )}
        </div>

        {/* Calcul de la commission */}
        {amount && numericAmount >= MIN_WITHDRAWAL_AMOUNT && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant demandé :</span>
                <span className="font-medium text-gray-900">{formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission ({WITHDRAWAL_COMMISSION_RATE * 100}%) :</span>
                <span className="font-medium text-red-600">-{formatCurrency(commissionAmount)}</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between">
                <span className="font-medium text-gray-900">Montant net reçu :</span>
                <span className="font-bold text-lg text-green-600">{formatCurrency(netAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Informations bancaires */}
        <div className="mb-4 sm:mb-6 space-y-4">
          {loadingAccounts ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Chargement des comptes...</p>
            </div>
          ) : bankAccounts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Compte bancaire
                </label>
                {onManageBankAccounts && (
                  <button
                    onClick={onManageBankAccounts}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <CreditCard size={14} />
                    Gérer les comptes
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    id="useSaved"
                    checked={useSavedAccount}
                    onChange={() => setUseSavedAccount(true)}
                    disabled={loading}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="useSaved" className="text-xs sm:text-sm text-gray-700">
                    Utiliser un compte enregistré
                  </label>
                </div>

                {useSavedAccount && (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm disabled:opacity-50"
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} - {account.iban.slice(0, 4)}****{account.iban.slice(-4)}
                        {account.is_default ? ' (Par défaut)' : ''}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="useNew"
                    checked={!useSavedAccount}
                    onChange={() => setUseSavedAccount(false)}
                    disabled={loading}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="useNew" className="text-xs sm:text-sm text-gray-700">
                    Utiliser un nouveau compte
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-blue-900 mb-2">
                    Aucun compte bancaire enregistré
                  </p>
                  {onManageBankAccounts && (
                    <button
                      onClick={onManageBankAccounts}
                      className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Enregistrer un compte bancaire
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(!useSavedAccount || bankAccounts.length === 0) && (
            <>
              <div>
                <label
                  htmlFor="bankAccountName"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Nom du titulaire du compte *
                </label>
                <input
                  id="bankAccountName"
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => {
                    setBankAccountName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Jean Dupont"
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="bankAccountIban"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  IBAN *
                </label>
                <input
                  id="bankAccountIban"
                  type="text"
                  value={bankAccountIban}
                  onChange={handleIbanChange}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="bankAccountBic"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  BIC (optionnel)
                </label>
                <input
                  id="bankAccountBic"
                  type="text"
                  value={bankAccountBic}
                  onChange={handleBicChange}
                  placeholder="ABCDEFGH"
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase"
                />
              </div>
            </>
          )}
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

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
            onClick={handleSubmit}
            disabled={
              loading ||
              !canRequest ||
              (!useSavedAccount && (!bankAccountName.trim() || !bankAccountIban.trim())) ||
              (useSavedAccount && !selectedAccountId)
            }
            className="flex-1 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Traitement...</span>
                <span className="sm:hidden">En cours...</span>
              </>
            ) : (
              <>
                <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Demander le virement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmation par mot de passe */}
      <PasswordConfirmationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={executeSubmit}
        title="Confirmer la demande de virement"
        message="Veuillez entrer votre mot de passe pour confirmer cette demande de virement"
        confirmButtonText="Demander le virement"
      />
    </div>
  );
}

