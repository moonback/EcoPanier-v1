// Imports externes
import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDown, ArrowUp, History, RefreshCw } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import {
  getWalletBalance,
  getWalletTransactions,
  type WalletTransaction as WalletTransactionType,
} from '../../utils/walletService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { RechargeModal } from './components/RechargeModal';

/**
 * Page wallet pour les clients
 * Affiche le solde, permet la recharge et l'historique des transactions
 */
export const WalletPage = () => {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données du wallet
  const loadWalletData = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const [walletBalance, walletTransactions] = await Promise.all([
        getWalletBalance(user.id),
        getWalletTransactions(user.id, 50, 0),
      ]);

      setBalance(walletBalance);
      setTransactions(walletTransactions);
    } catch (err) {
      console.error('Erreur lors du chargement du wallet:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les données du wallet. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effets
  useEffect(() => {
    loadWalletData();
  }, [user?.id]);

  // Handlers
  const handleRecharge = () => {
    setShowRechargeModal(true);
  };

  const handleRechargeSuccess = () => {
    setShowRechargeModal(false);
    loadWalletData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  // Early returns
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full card p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-primary rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* En-tête avec solde */}
        <div className="card p-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Mon Wallet</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Actualiser"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-primary-100 text-sm mb-2">Solde disponible</p>
            <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          </div>

          <button
            onClick={handleRecharge}
            className="w-full py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Recharger mon wallet
          </button>
        </div>

        {/* Historique des transactions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Historique des transactions
              </h2>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune transaction pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Rechargez votre wallet pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de recharge */}
      {showRechargeModal && (
        <RechargeModal
          onClose={() => setShowRechargeModal(false)}
          onSuccess={handleRechargeSuccess}
        />
      )}
    </div>
  );
};

/**
 * Composant pour afficher une transaction individuelle
 */
interface TransactionItemProps {
  transaction: WalletTransactionType;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isPositive = transaction.type === 'recharge' || transaction.type === 'refund';
  const isPayment = transaction.type === 'payment';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Icône */}
        <div
          className={`p-3 rounded-lg ${
            isPositive
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {isPositive ? (
            <ArrowUp className="w-5 h-5" />
          ) : (
            <ArrowDown className="w-5 h-5" />
          )}
        </div>

        {/* Détails */}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">
            {formatDateTime(transaction.created_at)}
          </p>
          {transaction.reference_type && (
            <p className="text-xs text-gray-400 mt-1">
              Référence: {transaction.reference_type}
            </p>
          )}
        </div>

        {/* Montant */}
        <div className="text-right">
          <p
            className={`font-bold text-lg ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className="text-xs text-gray-500">
            Solde: {formatCurrency(transaction.balance_after)}
          </p>
        </div>
      </div>
    </div>
  );
}

