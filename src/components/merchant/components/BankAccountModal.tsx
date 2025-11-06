// Imports externes
import { useState, useEffect } from 'react';
import { X, CreditCard, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../../stores/authStore';
import {
  saveMerchantBankAccount,
  deleteMerchantBankAccount,
  getMerchantBankAccounts,
  type MerchantBankAccount,
} from '../../../utils/walletService';
import { maskIban } from '../../../utils/helpers';

interface BankAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal pour gérer les comptes bancaires
 * Permet d'ajouter, modifier et supprimer des comptes bancaires
 */
export function BankAccountModal({ onClose, onSuccess }: BankAccountModalProps) {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [accounts, setAccounts] = useState<MerchantBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<MerchantBankAccount | null>(null);
  const [accountName, setAccountName] = useState<string>('');
  const [iban, setIban] = useState<string>('');
  const [bic, setBic] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  // Charger les comptes bancaires
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const accountsData = await getMerchantBankAccounts(user.id);
      setAccounts(accountsData);
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les comptes bancaires. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formater l'IBAN (espaces tous les 4 caractères)
    let value = e.target.value.replace(/\s/g, '').toUpperCase();
    if (value.length <= 34) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setIban(value);
    }
  };

  const handleBicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // BIC en majuscules, max 11 caractères
    const value = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 11);
    setBic(value);
  };

  const handleEdit = (account: MerchantBankAccount) => {
    setEditingAccount(account);
    setAccountName(account.account_name);
    setIban(account.iban.match(/.{1,4}/g)?.join(' ') || account.iban);
    setBic(account.bic || '');
    setIsDefault(account.is_default);
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setAccountName('');
    setIban('');
    setBic('');
    setIsDefault(false);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('Vous devez être connecté');
      return;
    }

    if (!accountName.trim()) {
      setError('Veuillez saisir le nom du titulaire du compte');
      return;
    }

    if (!iban.trim() || iban.replace(/\s/g, '').length < 15) {
      setError('Veuillez saisir un IBAN valide');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveMerchantBankAccount(
        user.id,
        {
          account_name: accountName.trim(),
          iban: iban,
          bic: bic.trim() || undefined,
          is_default: isDefault,
        },
        editingAccount?.id
      );
      handleCancelEdit();
      await loadAccounts();
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d\'enregistrer le compte bancaire. Vérifiez votre connexion.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!user?.id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte bancaire ?')) return;

    try {
      setError(null);
      await deleteMerchantBankAccount(accountId, user.id);
      await loadAccounts();
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer le compte bancaire. Vérifiez votre connexion.'
      );
    }
  };

  // Render principal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 my-auto animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Mes comptes bancaires
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Fermer"
            disabled={saving}
          >
            <X size={18} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
          </button>
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

        {/* Formulaire d'ajout/modification */}
        <div className="mb-4 sm:mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
            {editingAccount ? 'Modifier le compte' : 'Ajouter un compte bancaire'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Nom du titulaire *
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Jean Dupont"
                disabled={saving}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                IBAN *
              </label>
              <input
                type="text"
                value={iban}
                onChange={handleIbanChange}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                disabled={saving}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm font-mono disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                BIC (optionnel)
              </label>
              <input
                type="text"
                value={bic}
                onChange={handleBicChange}
                placeholder="ABCDEFGH"
                disabled={saving}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm font-mono uppercase disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={saving}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isDefault" className="text-xs sm:text-sm text-gray-700">
                Définir comme compte par défaut
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !accountName.trim() || !iban.trim()}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingAccount ? 'Enregistrer' : 'Ajouter'}
                  </>
                )}
              </button>
              {editingAccount && (
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des comptes */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Chargement des comptes...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucun compte bancaire enregistré</p>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez un compte pour faciliter vos demandes de virement
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {account.account_name}
                      </p>
                      {account.is_default && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono mb-1">
                      {maskIban(account.iban)}
                    </p>
                    {account.bic && (
                      <p className="text-xs text-gray-500 font-mono">{account.bic}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      aria-label="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

