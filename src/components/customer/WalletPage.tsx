// Imports externes
import { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowDown,
  ArrowUp,
  History,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import {
  getWalletBalance,
  getWalletTransactionsByType,
  getWalletStats,
  getWalletTransactionsCount,
  type WalletTransaction as WalletTransactionType,
  type WalletStats,
} from '../../utils/walletService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { RechargeModal } from './components/RechargeModal';

// Constantes
const LOW_BALANCE_THRESHOLD = 10; // Seuil d'alerte de solde faible (€)
const TRANSACTIONS_PER_PAGE = 20;

/**
 * Page wallet améliorée pour les clients
 * Affiche le solde, statistiques, permet la recharge et l'historique filtré des transactions
 */
export const WalletPage = () => {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'payment' | 'refund'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Charger les données du wallet
  const loadWalletData = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const [walletBalance, walletStats, transactionsData, totalCount] = await Promise.all([
        getWalletBalance(user.id),
        getWalletStats(user.id),
        getWalletTransactionsByType(
          user.id,
          filterType,
          TRANSACTIONS_PER_PAGE,
          (currentPage - 1) * TRANSACTIONS_PER_PAGE
        ),
        getWalletTransactionsCount(user.id, filterType === 'all' ? undefined : filterType),
      ]);

      setBalance(walletBalance);
      setStats(walletStats);
      setTransactions(transactionsData);
      setTotalTransactions(totalCount);
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
  }, [user?.id, filterType, currentPage]);

  // Handlers
  const handleRecharge = () => {
    setShowRechargeModal(true);
  };

  const handleRechargeSuccess = () => {
    setShowRechargeModal(false);
    setCurrentPage(1); // Reset à la première page
    loadWalletData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleFilterChange = (type: 'all' | 'recharge' | 'payment' | 'refund') => {
    setFilterType(type);
    setCurrentPage(1); // Reset à la première page lors du changement de filtre
  };

  // Calculs
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);
  const isLowBalance = balance < LOW_BALANCE_THRESHOLD && balance > 0;
  const hasNoBalance = balance === 0;

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
          <button onClick={handleRefresh} className="btn-primary rounded-lg">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* En-tête avec solde */}
        <div className="card p-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white relative overflow-hidden">
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
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

            {/* Alerte solde faible */}
            {(isLowBalance || hasNoBalance) && (
              <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white mb-1">
                      {hasNoBalance ? 'Solde vide' : 'Solde faible'}
                    </p>
                    <p className="text-sm text-primary-100">
                      {hasNoBalance
                        ? 'Rechargez votre wallet pour continuer à faire des réservations.'
                        : `Votre solde est inférieur à ${formatCurrency(LOW_BALANCE_THRESHOLD)}. Pensez à recharger.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRecharge}
              className="w-full py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Recharger mon wallet
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total rechargé"
              value={formatCurrency(stats.totalRecharged)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
              subtitle={`${stats.rechargeCount} recharge${stats.rechargeCount > 1 ? 's' : ''}`}
            />
            <StatCard
              title="Total dépensé"
              value={formatCurrency(stats.totalSpent)}
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
              subtitle={`${stats.paymentCount} paiement${stats.paymentCount > 1 ? 's' : ''}`}
            />
            <StatCard
              title="Total remboursé"
              value={formatCurrency(stats.totalRefunded)}
              icon={<ArrowUp className="w-5 h-5" />}
              color="blue"
              subtitle={`${stats.refundCount} remboursement${stats.refundCount > 1 ? 's' : ''}`}
            />
            <StatCard
              title="Transactions"
              value={stats.transactionCount.toString()}
              icon={<History className="w-5 h-5" />}
              color="purple"
              subtitle={`Moyenne: ${formatCurrency(stats.averageTransactionAmount)}`}
            />
          </div>
        )}

        {/* Historique des transactions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Historique des transactions
              </h2>
              <span className="text-sm text-gray-500">
                ({totalTransactions} transaction{totalTransactions > 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Toutes
            </button>
            <button
              onClick={() => handleFilterChange('recharge')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'recharge'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recharges
            </button>
            <button
              onClick={() => handleFilterChange('payment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'payment'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paiements
            </button>
            <button
              onClick={() => handleFilterChange('refund')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'refund'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Remboursements
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filterType === 'all'
                  ? 'Aucune transaction pour le moment'
                  : `Aucune transaction de type "${filterType}"`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {filterType === 'all' && 'Rechargez votre wallet pour commencer'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
 * Composant pour afficher une carte de statistique
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'purple';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="card p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Composant pour afficher une transaction individuelle
 */
interface TransactionItemProps {
  transaction: WalletTransactionType;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isPositive = transaction.type === 'recharge' || transaction.type === 'refund';
  const isPayment = transaction.type === 'payment';

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'recharge':
        return 'Recharge';
      case 'payment':
        return 'Paiement';
      case 'refund':
        return 'Remboursement';
      default:
        return 'Transaction';
    }
  };

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
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">{transaction.description}</p>
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
              {getTypeLabel()}
            </span>
          </div>
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
