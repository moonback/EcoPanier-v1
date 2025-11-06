// Imports externes
import { useState, useEffect } from 'react';
import { Wallet, Search, Filter, Download, RefreshCw, Eye, TrendingUp, TrendingDown, CreditCard, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';
import type { Database } from '../../lib/database.types';

// Types
type WalletData = Database['public']['Tables']['wallets']['Row'] & {
  profiles?: {
    full_name: string;
    role: string;
  };
};

type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'] & {
  profiles?: {
    full_name: string;
  };
};

type TransactionType = 'all' | 'recharge' | 'payment' | 'refund' | 'merchant_payment';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Composant de gestion des wallets pour les administrateurs
 * Permet de visualiser, rechercher et gérer tous les wallets de la plateforme
 */
export const WalletManagement = () => {
  // État local
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType>('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<TransactionStatus>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'created_at' | 'transactions'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Statistiques
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalBalance: 0,
    totalTransactions: 0,
    totalRecharges: 0,
    totalPayments: 0,
    totalRefunds: 0,
    pendingTransactions: 0,
  });

  // Effets
  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(() => {
      fetchWallets(true);
      fetchTransactions(true);
    }, 30000);

    // Écouter les changements en temps réel
    const walletChannel = supabase
      .channel('admin_wallets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
        },
        () => {
          fetchWallets(true);
        }
      )
      .subscribe();

    const transactionChannel = supabase
      .channel('admin_wallet_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
        },
        () => {
          fetchTransactions(true);
          fetchWallets(true);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const fetchWallets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const { data, error } = await supabase
        .from('wallets')
        .select(`
          *,
          profiles!user_id (
            full_name,
            role
          )
        `)
        .order('balance', { ascending: false });

      if (error) throw error;

      setWallets((data || []) as WalletData[]);

      // Calculer les statistiques
      const totalBalance = (data || []).reduce((sum, w) => sum + (w.balance || 0), 0);
      setStats((prev) => ({
        ...prev,
        totalWallets: (data || []).length,
        totalBalance,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des wallets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTransactions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      let query = supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles!user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      // Appliquer les filtres
      if (transactionTypeFilter !== 'all') {
        query = query.eq('type', transactionTypeFilter);
      }
      if (transactionStatusFilter !== 'all') {
        query = query.eq('status', transactionStatusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransactions((data || []) as WalletTransaction[]);

      // Mettre à jour les statistiques
      const totalRecharges = data?.filter((t) => t.type === 'recharge' && t.status === 'completed').length || 0;
      const totalPayments = data?.filter((t) => t.type === 'payment' && t.status === 'completed').length || 0;
      const totalRefunds = data?.filter((t) => t.type === 'refund' && t.status === 'completed').length || 0;
      const pendingTransactions = data?.filter((t) => t.status === 'pending').length || 0;

      setStats((prev) => ({
        ...prev,
        totalTransactions: data?.length || 0,
        totalRecharges,
        totalPayments,
        totalRefunds,
        pendingTransactions,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewWalletTransactions = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setShowTransactions(true);
    // Filtrer les transactions pour ce wallet
    fetchWalletTransactions(wallet.id);
  };

  const fetchWalletTransactions = async (walletId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles!user_id (
            full_name
          )
        `)
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as WalletTransaction[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions du wallet:', error);
    }
  };

  const handleRefresh = () => {
    fetchWallets(false);
    fetchTransactions(false);
  };

  // Filtrer les wallets
  const filteredWallets = wallets.filter((wallet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      wallet.profiles?.full_name?.toLowerCase().includes(query) ||
      wallet.user_id.toLowerCase().includes(query) ||
      wallet.id.toLowerCase().includes(query)
    );
  });

  // Trier les wallets
  const sortedWallets = [...filteredWallets].sort((a, b) => {
    if (sortBy === 'balance') {
      return sortOrder === 'desc' ? (b.balance || 0) - (a.balance || 0) : (a.balance || 0) - (b.balance || 0);
    } else if (sortBy === 'created_at') {
      return sortOrder === 'desc'
        ? new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        : new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
    }
    return 0;
  });

  // Fonction pour obtenir l'icône selon le type de transaction
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'merchant_payment':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  // Fonction pour obtenir le style selon le statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock };
      case 'failed':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
      case 'cancelled':
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Clock };
    }
  };

  // Fonction pour obtenir le label du type de transaction
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'recharge':
        return 'Recharge';
      case 'payment':
        return 'Paiement';
      case 'refund':
        return 'Remboursement';
      case 'merchant_payment':
        return 'Paiement commerçant';
      default:
        return type;
    }
  };

  // Early returns
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet size={22} className="text-white" />
            </div>
            <span>Gestion des Portefeuilles</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            💰 Visualisez et gérez tous les wallets de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 rounded-xl transition-all font-semibold hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-purple-600" />
            <span className="text-xs font-bold text-gray-600">Portefeuilles</span>
          </div>
          <p className="text-2xl font-black text-purple-600">{stats.totalWallets}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-xs font-bold text-gray-600">Solde total</span>
          </div>
          <p className="text-xl font-black text-green-600">{formatCurrency(stats.totalBalance)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-600">Transactions</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.totalTransactions}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border-2 border-emerald-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-bold text-gray-600">Recharges</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.totalRecharges}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border-2 border-red-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle size={18} className="text-red-600" />
            <span className="text-xs font-bold text-gray-600">Paiements</span>
          </div>
          <p className="text-2xl font-black text-red-600">{stats.totalPayments}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border-2 border-orange-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={18} className="text-orange-600" />
            <span className="text-xs font-bold text-gray-600">Remboursements</span>
          </div>
          <p className="text-2xl font-black text-orange-600">{stats.totalRefunds}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border-2 border-yellow-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-600" />
            <span className="text-xs font-bold text-gray-600">En attente</span>
          </div>
          <p className="text-2xl font-black text-yellow-600">{stats.pendingTransactions}</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none"
            >
              <option value="balance">Solde</option>
              <option value="created_at">Date de création</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des wallets */}
      {!showTransactions ? (
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Solde</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date de création</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedWallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun wallet trouvé
                    </td>
                  </tr>
                ) : (
                  sortedWallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{wallet.profiles?.full_name || 'N/A'}</span>
                          <span className="text-sm text-gray-500">{wallet.user_id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {wallet.profiles?.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${(wallet.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(wallet.balance || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(wallet.created_at || '').toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewWalletTransactions(wallet)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors font-medium"
                        >
                          <Eye size={16} />
                          <span>Voir transactions</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vue des transactions */
        <div className="space-y-4">
          {/* Header avec retour */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 border-2 border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowTransactions(false);
                  setSelectedWallet(null);
                  fetchTransactions();
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                ← Retour
              </button>
              <div>
                <h3 className="font-bold text-gray-900">
                  Transactions - {selectedWallet?.profiles?.full_name || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500">Solde actuel: {formatCurrency(selectedWallet?.balance || 0)}</p>
              </div>
            </div>
          </div>

          {/* Filtres de transactions */}
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={18} />
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as TransactionType)}
                  className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="recharge">Recharge</option>
                  <option value="payment">Paiement</option>
                  <option value="refund">Remboursement</option>
                  <option value="merchant_payment">Paiement commerçant</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Statut:</span>
                <select
                  value={transactionStatusFilter}
                  onChange={(e) => setTransactionStatusFilter(e.target.value as TransactionStatus)}
                  className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Complétées</option>
                  <option value="failed">Échouées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des transactions */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Solde avant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Solde après</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => {
                      const statusStyle = getStatusStyle(transaction.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="font-medium text-gray-900">{getTransactionTypeLabel(transaction.type)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-bold ${
                                transaction.type === 'recharge' || transaction.type === 'refund'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'recharge' || transaction.type === 'refund' ? '+' : '-'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(transaction.balance_before)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(transaction.balance_after)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              <StatusIcon size={14} />
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{transaction.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

