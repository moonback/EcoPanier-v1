// Imports externes
import { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUp,
  History,
  RefreshCw,
  Filter,
  TrendingUp,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  X,
  CreditCard,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import {
  getWalletBalance,
  getWalletTransactionsByType,
  getWalletStats,
  getWalletTransactionsCount,
  getWithdrawalRequests,
  cancelWithdrawalRequest,
  MIN_WITHDRAWAL_AMOUNT,
  type WalletTransaction as WalletTransactionType,
  type WalletStats,
  type WithdrawalRequest,
} from '../../utils/walletService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { WithdrawalRequestModal } from './components/WithdrawalRequestModal';
import { BankAccountModal } from './components/BankAccountModal';

// Constantes
const TRANSACTIONS_PER_PAGE = 20;

/**
 * Page wallet pour les commerçants
 * Affiche le solde, statistiques des paiements reçus et l'historique des transactions
 */
export const MerchantWalletPage = () => {
  // Hooks (stores, contexts, router)
  const { user } = useAuthStore();

  // État local
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionType[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'merchant_payment'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);

  // Charger les données du wallet
  const loadWalletData = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const [walletBalance, walletStats, transactionsData, totalCount, withdrawalRequestsData] = await Promise.all([
        getWalletBalance(user.id),
        getWalletStats(user.id),
        getWalletTransactionsByType(
          user.id,
          filterType === 'all' ? 'all' : 'merchant_payment',
          TRANSACTIONS_PER_PAGE,
          (currentPage - 1) * TRANSACTIONS_PER_PAGE
        ),
        getWalletTransactionsCount(user.id, filterType === 'all' ? undefined : 'merchant_payment'),
        getWithdrawalRequests(user.id),
      ]);

      setBalance(walletBalance);
      setStats(walletStats);
      setTransactions(transactionsData);
      setTotalTransactions(totalCount);
      setWithdrawalRequests(withdrawalRequestsData);
    } catch (err) {
      console.error('Erreur lors du chargement du wallet:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les données du portefeuille. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effets
  useEffect(() => {
    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filterType, currentPage]);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleFilterChange = (type: 'all' | 'merchant_payment') => {
    setFilterType(type);
    setCurrentPage(1);
  };

  // Calculs
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  // Early returns
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du portefeuille...</p>
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* En-tête avec solde */}
        <div className="card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-success-500 to-success-700 text-white relative overflow-hidden">
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/5 rounded-full -ml-12 sm:-ml-18 md:-ml-24 -mb-12 sm:-mb-18 md:-mb-24" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mon Portefeuille</h1>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Actualiser"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-success-100 text-xs sm:text-sm mb-1 sm:mb-2">Solde disponible</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">{formatCurrency(balance)}</p>
            </div>

            <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 mb-3 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white mb-1 text-sm sm:text-base">
                    Paiements reçus
                  </p>
                  <p className="text-xs sm:text-sm text-success-100">
                    Vous recevez les paiements lorsque vos clients confirment la réception de leurs lots.
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowBankAccountModal(true)}
                className="flex-1 py-2.5 sm:py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base border border-white/30"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Comptes</span>
              </button>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                disabled={balance < MIN_WITHDRAWAL_AMOUNT}
                className="flex-1 py-2.5 sm:py-3 bg-white text-success-600 rounded-lg hover:bg-success-50 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {balance < MIN_WITHDRAWAL_AMOUNT ? (
                  <span className="hidden sm:inline">Minimum {formatCurrency(MIN_WITHDRAWAL_AMOUNT)} requis</span>
                ) : (
                  <span>Virement</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              title="Total reçu"
              value={formatCurrency(stats.totalRecharged)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
              subtitle={`${stats.transactionCount} transaction${stats.transactionCount > 1 ? 's' : ''}`}
            />
            <StatCard
              title="Transactions"
              value={stats.transactionCount.toString()}
              icon={<History className="w-5 h-5" />}
              color="blue"
              subtitle={`Moyenne: ${formatCurrency(stats.averageTransactionAmount)}`}
            />
            <StatCard
              title="Solde actuel"
              value={formatCurrency(balance)}
              icon={<Wallet className="w-5 h-5" />}
              color="purple"
              subtitle="Disponible"
            />
          </div>
        )}

        {/* Historique des transactions */}
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Historique des paiements
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">
                ({totalTransactions} transaction{totalTransactions > 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Toutes
            </button>
            <button
              onClick={() => handleFilterChange('merchant_payment')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filterType === 'merchant_payment'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paiements reçus
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <History className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {filterType === 'all'
                  ? 'Aucune transaction pour le moment'
                  : 'Aucun paiement reçu pour le moment'}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 px-4">
                Les paiements apparaîtront ici lorsque vos clients confirmeront la réception de leurs lots.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Précédent</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm"
                    >
                      <span className="hidden sm:inline">Suivant</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Historique des demandes de virement */}
        {withdrawalRequests.length > 0 && (
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Demandes de virement
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">
                ({withdrawalRequests.length} demande{withdrawalRequests.length > 1 ? 's' : ''})
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {withdrawalRequests.map((request) => (
                <WithdrawalRequestItem
                  key={request.id}
                  request={request}
                  onCancel={async () => {
                    if (!user?.id) return;
                    try {
                      await cancelWithdrawalRequest(request.id, user.id);
                      await loadWalletData();
                    } catch (err) {
                      alert(
                        err instanceof Error
                          ? err.message
                          : 'Erreur lors de l\'annulation de la demande'
                      );
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de demande de virement */}
      {showWithdrawalModal && (
        <WithdrawalRequestModal
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => {
            setShowWithdrawalModal(false);
            loadWalletData();
          }}
          currentBalance={balance}
          onManageBankAccounts={() => {
            setShowWithdrawalModal(false);
            setShowBankAccountModal(true);
          }}
        />
      )}

      {/* Modal de gestion des comptes bancaires */}
      {showBankAccountModal && (
        <BankAccountModal
          onClose={() => setShowBankAccountModal(false)}
          onSuccess={() => {
            setShowBankAccountModal(false);
            // Si le modal de virement était ouvert, le rouvrir
            if (balance >= MIN_WITHDRAWAL_AMOUNT) {
              setShowWithdrawalModal(true);
            }
          }}
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
  color: 'green' | 'blue' | 'purple';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="card p-4 sm:p-5 md:p-6 bg-white">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{value}</p>
        </div>
        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0 ${colorClasses[color]}`}>{icon}</div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 sm:mt-2">{subtitle}</p>
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
  const isPayment = transaction.type === 'merchant_payment';

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'merchant_payment':
        return 'Paiement reçu';
      case 'recharge':
        return 'Recharge';
      case 'refund':
        return 'Remboursement';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      {/* Layout Desktop/Tablette : Horizontal */}
      <div className="hidden sm:flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Icône */}
          <div
            className={`p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0 ${
              isPayment
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Détails */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description}</p>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded flex-shrink-0">
                {getTypeLabel()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {formatDateTime(transaction.created_at)}
            </p>
            {transaction.reference_type && (
              <p className="text-xs text-gray-400 mt-1">
                Référence: {transaction.reference_type}
              </p>
            )}
          </div>

          {/* Montant */}
          <div className="text-right flex-shrink-0 ml-2">
            <p
              className={`font-bold text-base sm:text-lg ${
                isPayment ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              +{formatCurrency(Math.abs(transaction.amount))}
            </p>
            <p className="text-xs text-gray-500">
              Solde: {formatCurrency(transaction.balance_after)}
            </p>
          </div>
        </div>
      </div>

      {/* Layout Mobile : Vertical */}
      <div className="sm:hidden p-3 space-y-3">
        {/* En-tête avec icône et montant */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icône */}
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                isPayment
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </div>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded flex-shrink-0">
                  {getTypeLabel()}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDateTime(transaction.created_at)}
              </p>
            </div>
          </div>

          {/* Montant */}
          <div className="text-right flex-shrink-0">
            <p
              className={`font-bold text-base ${
                isPayment ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              +{formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          {transaction.reference_type && (
            <p className="text-xs text-gray-400">
              Référence: {transaction.reference_type}
            </p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            Solde: {formatCurrency(transaction.balance_after)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant pour afficher une demande de virement
 */
interface WithdrawalRequestItemProps {
  request: WithdrawalRequest;
  onCancel: () => void;
}

function WithdrawalRequestItem({ request, onCancel }: WithdrawalRequestItemProps) {
  const getStatusStyles = () => {
    switch (request.status) {
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-700',
          label: 'En attente',
        };
      case 'approved':
        return {
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Approuvée',
        };
      case 'processing':
        return {
          bg: 'bg-purple-50',
          badge: 'bg-purple-100 text-purple-700',
          label: 'En traitement',
        };
      case 'completed':
        return {
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-700',
          label: 'Complétée',
        };
      case 'rejected':
        return {
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-700',
          label: 'Rejetée',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Annulée',
        };
      default:
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: request.status,
        };
    }
  };

  const statusStyles = getStatusStyles();
  const canCancel = request.status === 'pending';

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${statusStyles.bg} border-gray-200`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles.badge}`}>
              {statusStyles.label}
            </span>
            <span className="text-xs text-gray-500">
              {formatDateTime(request.created_at)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Montant demandé :</span>
              <span className="font-medium text-gray-900">{formatCurrency(request.requested_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Commission :</span>
              <span className="font-medium text-red-600">-{formatCurrency(request.commission_amount)}</span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
              <span className="font-medium text-gray-900">Montant net :</span>
              <span className="font-bold text-green-600">{formatCurrency(request.net_amount)}</span>
            </div>
            {request.bank_account_name && (
              <p className="text-xs text-gray-500 mt-2">
                Compte : {request.bank_account_name} - {request.bank_account_iban?.slice(0, 4)}****{request.bank_account_iban?.slice(-4)}
              </p>
            )}
            {request.rejection_reason && (
              <p className="text-xs text-red-600 mt-2">
                Raison du rejet : {request.rejection_reason}
              </p>
            )}
            {request.processed_at && (
              <p className="text-xs text-gray-500 mt-2">
                Traité le : {formatDateTime(request.processed_at)}
              </p>
            )}
          </div>
        </div>
        {canCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 sm:flex-shrink-0"
          >
            <X size={14} />
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

