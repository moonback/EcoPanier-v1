// Imports externes
import { useState, useEffect } from 'react';
import { ArrowDownCircle, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, Eye, CreditCard, Download, X, Building2 } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';
import type { Database } from '../../lib/database.types';

// Types
type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'] & {
  profiles?: {
    full_name: string;
    business_name: string | null;
    phone: string | null;
  };
  wallets?: {
    balance: number;
  };
};

type WithdrawalStatus = 'all' | 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';

/**
 * Composant de gestion des virements pour les administrateurs
 * Permet d'approuver, rejeter et suivre les demandes de virement des commerçants
 */
export const WithdrawalManagement = () => {
  // État local
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus>('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  // Effets
  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(() => {
      fetchWithdrawals(true);
    }, 30000);

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('admin_withdrawals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
        },
        () => {
          fetchWithdrawals(true);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const fetchWithdrawals = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles!withdrawal_requests_merchant_id_fkey (
            full_name,
            business_name,
            phone
          ),
          wallets!withdrawal_requests_wallet_id_fkey (
            balance
          )
        `)
        .order('created_at', { ascending: false });

      // Appliquer le filtre de statut
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const withdrawalsData = (data || []) as WithdrawalRequest[];
      setWithdrawals(withdrawalsData);

      // Calculer les statistiques
      const allData = withdrawalsData;
      const pendingData = allData.filter((w) => w.status === 'pending');
      const totalAmount = allData.reduce((sum, w) => sum + (w.requested_amount || 0), 0);
      const pendingAmount = pendingData.reduce((sum, w) => sum + (w.requested_amount || 0), 0);

      setStats({
        total: allData.length,
        pending: allData.filter((w) => w.status === 'pending').length,
        approved: allData.filter((w) => w.status === 'approved').length,
        processing: allData.filter((w) => w.status === 'processing').length,
        completed: allData.filter((w) => w.status === 'completed').length,
        rejected: allData.filter((w) => w.status === 'rejected').length,
        totalAmount,
        pendingAmount,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des virements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', withdrawalId);

      if (error) throw error;

      // Créer une notification pour le commerçant (optionnel, ne bloque pas si la table n'existe pas)
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (withdrawal) {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: withdrawal.merchant_id,
          title: 'Demande de virement approuvée',
          message: `Votre demande de virement de ${formatCurrency(withdrawal.requested_amount)} a été approuvée. Le montant a été débité de votre wallet et sera viré sous 48h.`,
          type: 'success',
          read: false,
        } as never);
        if (notifError) {
          // La table notifications n'existe peut-être pas, on continue quand même
          console.warn('Impossible de créer la notification:', notifError);
        }
      }

      // Mettre à jour l'état local immédiatement
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === withdrawalId
            ? { ...w, status: 'approved' as const, updated_at: new Date().toISOString() }
            : w
        )
      );

      // Mettre à jour les statistiques immédiatement (pending -> approved)
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
        pendingAmount: withdrawal 
          ? Math.max(0, prev.pendingAmount - withdrawal.requested_amount)
          : prev.pendingAmount,
      }));

      // Rafraîchir les données depuis le serveur pour synchroniser
      await fetchWithdrawals(true);
      setShowDetails(false);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de refus');
      return;
    }

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', withdrawalId);

      if (error) throw error;

      // Remettre l'argent dans le wallet du commerçant
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (withdrawal) {
        // Récupérer le wallet actuel
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', withdrawal.wallet_id)
          .single();

        if (wallet) {
          const walletBalance = (wallet as { balance: number }).balance || 0;
          // Rembourser le montant
          const newBalance = walletBalance + withdrawal.requested_amount;
          await supabase
            .from('wallets')
            .update({ balance: newBalance, updated_at: new Date().toISOString() } as never)
            .eq('id', withdrawal.wallet_id);

          // Créer une transaction de remboursement
          await supabase.from('wallet_transactions').insert({
            wallet_id: withdrawal.wallet_id,
            user_id: withdrawal.merchant_id,
            type: 'refund',
            amount: withdrawal.requested_amount,
            balance_before: walletBalance || 0,
            balance_after: newBalance,
            description: `Remboursement suite au rejet de la demande de virement #${withdrawalId.slice(0, 8)}`,
            status: 'completed',
          } as never);

          // Créer une notification (optionnel)
          const { error: notifError } = await supabase.from('notifications').insert({
            user_id: withdrawal.merchant_id,
            title: 'Demande de virement rejetée',
            message: `Votre demande de virement de ${formatCurrency(withdrawal.requested_amount)} a été rejetée. Raison: ${rejectionReason}. Le montant a été remboursé sur votre wallet.`,
            type: 'warning',
            read: false,
          } as never);
          if (notifError) {
            console.warn('Impossible de créer la notification:', notifError);
          }
        }
      }

      await fetchWithdrawals();
      setShowRejectModal(false);
      setRejectionReason('');
      setShowDetails(false);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de la demande');
    }
  };

  const handleMarkAsProcessing = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', withdrawalId);

      if (error) throw error;

      // Mettre à jour l'état local immédiatement pour un feedback instantané
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === withdrawalId
            ? { ...w, status: 'processing' as const, updated_at: new Date().toISOString() }
            : w
        )
      );
      
      // Mettre à jour les statistiques immédiatement (approved -> processing)
      setStats((prev) => ({
        ...prev,
        approved: Math.max(0, prev.approved - 1),
        processing: prev.processing + 1,
      }));
      
      // Rafraîchir les données depuis le serveur pour synchroniser
      await fetchWithdrawals(true);
      setShowDetails(false);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleMarkAsCompleted = async (withdrawalId: string) => {
    try {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (!withdrawal) return;

      // Débiter le wallet du commerçant
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', withdrawal.wallet_id)
        .single();

      if (wallet) {
        const walletBalance = (wallet as { balance: number }).balance || 0;
        if (walletBalance >= withdrawal.requested_amount) {
          const newBalance = walletBalance - withdrawal.requested_amount;
          await supabase
            .from('wallets')
            .update({ balance: newBalance, updated_at: new Date().toISOString() } as never)
            .eq('id', withdrawal.wallet_id);

          // Créer une transaction
          await supabase.from('wallet_transactions').insert({
            wallet_id: withdrawal.wallet_id,
            user_id: withdrawal.merchant_id,
            type: 'payment',
            amount: -withdrawal.requested_amount,
            balance_before: walletBalance,
            balance_after: newBalance,
            description: `Virement bancaire traité - ${formatCurrency(withdrawal.requested_amount)}`,
            status: 'completed',
          } as never);
        }
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', withdrawalId);

      if (error) throw error;

      // Créer une notification (optionnel)
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: withdrawal.merchant_id,
        title: 'Virement complété',
        message: `Votre virement de ${formatCurrency(withdrawal.net_amount)} (net après commission) a été effectué avec succès.`,
        type: 'success',
        read: false,
      } as never);
      if (notifError) {
        console.warn('Impossible de créer la notification:', notifError);
      }

      // Mettre à jour l'état local immédiatement pour un feedback instantané
      const now = new Date().toISOString();
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === withdrawalId
            ? { 
                ...w, 
                status: 'completed' as const,
                processed_at: now,
                updated_at: now,
              }
            : w
        )
      );
      
      // Mettre à jour les statistiques immédiatement
      setStats((prev) => ({
        ...prev,
        processing: prev.processing > 0 ? prev.processing - 1 : 0,
        completed: prev.completed + 1,
        pendingAmount: withdrawal.status === 'pending' 
          ? Math.max(0, prev.pendingAmount - withdrawal.requested_amount)
          : prev.pendingAmount,
      }));
      
      // Rafraîchir les données depuis le serveur pour synchroniser
      await fetchWithdrawals(true);
      setShowDetails(false);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      alert('Erreur lors de la finalisation du virement');
    }
  };

  const handleViewDetails = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetails(true);
  };

  // Filtrer les virements
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      withdrawal.profiles?.full_name?.toLowerCase().includes(query) ||
      withdrawal.profiles?.business_name?.toLowerCase().includes(query) ||
      withdrawal.id.toLowerCase().includes(query)
    );
  });

  // Fonction pour obtenir le style selon le statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: Clock,
          label: 'En attente',
        };
      case 'approved':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: CheckCircle,
          label: 'Approuvé',
        };
      case 'processing':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: RefreshCw,
          label: 'En traitement',
        };
      case 'completed':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: CheckCircle,
          label: 'Complété',
        };
      case 'rejected':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: XCircle,
          label: 'Rejeté',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: XCircle,
          label: 'Annulé',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: Clock,
          label: status,
        };
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ArrowDownCircle size={22} className="text-white" />
            </div>
            <span>Gestion des Virements</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            💳 Gérez les demandes de virement des commerçants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchWithdrawals(false)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle size={18} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border-2 border-yellow-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-600" />
            <span className="text-xs font-bold text-gray-600">En attente</span>
          </div>
          <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border-2 border-indigo-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-indigo-600" />
            <span className="text-xs font-bold text-gray-600">Approuvées</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={18} className="text-purple-600" />
            <span className="text-xs font-bold text-gray-600">En traitement</span>
          </div>
          <p className="text-2xl font-black text-purple-600">{stats.processing}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-xs font-bold text-gray-600">Complétées</span>
          </div>
          <p className="text-2xl font-black text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border-2 border-red-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-red-600" />
            <span className="text-xs font-bold text-gray-600">Rejetées</span>
          </div>
          <p className="text-2xl font-black text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border-2 border-emerald-100 hover:shadow-lg transition-all col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-emerald-600" />
            <span className="text-xs font-bold text-gray-600">Montant total en attente</span>
          </div>
          <p className="text-xl font-black text-emerald-600">{formatCurrency(stats.pendingAmount)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, commerce ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WithdrawalStatus)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-300 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="processing">En traitement</option>
              <option value="completed">Complétées</option>
              <option value="rejected">Rejetées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des virements */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Commerçant</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net (après commission)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune demande de virement trouvée
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((withdrawal) => {
                  const statusStyle = getStatusStyle(withdrawal.status);
                  const StatusIcon = statusStyle.icon;
                  return (
                    <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {withdrawal.profiles?.business_name || withdrawal.profiles?.full_name || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500">{withdrawal.profiles?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{formatCurrency(withdrawal.requested_amount)}</span>
                        <p className="text-xs text-gray-500">Commission: {formatCurrency(withdrawal.commission_amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">{formatCurrency(withdrawal.net_amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <StatusIcon size={14} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(withdrawal)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Eye size={14} />
                          <span>Détails</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetails && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">Détails de la demande de virement</h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Informations commerçant */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Commerçant</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nom:</span> {selectedWithdrawal.profiles?.full_name || 'N/A'}</p>
                  <p><span className="font-semibold">Commerce:</span> {selectedWithdrawal.profiles?.business_name || 'N/A'}</p>
                  <p><span className="font-semibold">Téléphone:</span> {selectedWithdrawal.profiles?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Montants */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Montants</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant demandé:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedWithdrawal.requested_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission (8%):</span>
                    <span className="font-bold text-red-600">-{formatCurrency(selectedWithdrawal.commission_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-blue-200 pt-2">
                    <span className="font-bold text-gray-900">Montant net:</span>
                    <span className="font-black text-green-600 text-lg">{formatCurrency(selectedWithdrawal.net_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Compte bancaire */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 size={18} />
                  Compte bancaire
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Titulaire:</span> {selectedWithdrawal.bank_account_name || 'N/A'}</p>
                  <p><span className="font-semibold">IBAN:</span> {selectedWithdrawal.bank_account_iban || 'N/A'}</p>
                  {selectedWithdrawal.bank_account_bic && (
                    <p><span className="font-semibold">BIC:</span> {selectedWithdrawal.bank_account_bic}</p>
                  )}
                </div>
              </div>

              {/* Statut et dates */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Informations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Statut:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedWithdrawal.status).bg} ${getStatusStyle(selectedWithdrawal.status).text}`}>
                      {getStatusStyle(selectedWithdrawal.status).label}
                    </span>
                  </div>
                  <p><span className="font-semibold">Date de demande:</span> {new Date(selectedWithdrawal.created_at).toLocaleString('fr-FR')}</p>
                  {selectedWithdrawal.processed_at && (
                    <p><span className="font-semibold">Traité le:</span> {new Date(selectedWithdrawal.processed_at).toLocaleString('fr-FR')}</p>
                  )}
                  {selectedWithdrawal.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-700">Raison du rejet:</p>
                      <p className="text-sm text-red-600">{selectedWithdrawal.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedWithdrawal.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedWithdrawal.id)}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Rejeter
                  </button>
                </div>
              )}

              {selectedWithdrawal.status === 'approved' && (
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleMarkAsProcessing(selectedWithdrawal.id)}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Marquer en traitement
                  </button>
                </div>
              )}

              {selectedWithdrawal.status === 'processing' && (
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleMarkAsCompleted(selectedWithdrawal.id)}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Marquer comme complété
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b-2 border-gray-200">
              <h3 className="text-xl font-black text-gray-900">Rejeter la demande</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Raison du rejet <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Indiquez la raison du rejet de cette demande..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReject(selectedWithdrawal.id)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


