// Imports externes
import { useState, useEffect } from 'react';
import { Users, Package, DollarSign, Heart, TrendingUp, Truck, ShoppingBag, Wallet, CreditCard, CheckCircle } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/helpers';

/**
 * Composant affichant les statistiques globales de la plateforme
 * Vue d'ensemble pour les administrateurs avec métriques clés
 */
export const AdminStats = () => {
  // État local
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalBeneficiaries: 0,
    totalCollectors: 0,
    totalLots: 0,
    totalRevenue: 0,
    itemsSaved: 0,
    donations: 0,
    activeMissions: 0,
    // Nouvelles statistiques wallet
    totalWalletBalance: 0,
    totalWalletTransactions: 0,
    totalRecharges: 0,
    totalPayments: 0,
    totalRefunds: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    walletUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Effets
  useEffect(() => {
    fetchStats();

    // Rafraîchir les statistiques toutes les 30 secondes
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('admin_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lots',
        },
        () => {
          fetchStats();
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
  const fetchStats = async () => {
    try {
      const [
        { data: profiles },
        { data: lots },
        { data: reservations },
        { data: missions },
        { data: wallets },
        { data: walletTransactions },
      ] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('lots').select('quantity_reserved, quantity_sold'),
        supabase.from('reservations').select('total_price, is_donation, status'),
        supabase.from('missions').select('status').in('status', ['accepted', 'in_progress']),
        supabase.from('wallets').select('balance'),
        supabase.from('wallet_transactions').select('type, amount, status'),
      ]);

      const totalUsers = profiles?.length || 0;
      const totalMerchants = profiles?.filter((p) => p.role === 'merchant').length || 0;
      const totalBeneficiaries = profiles?.filter((p) => p.role === 'beneficiary').length || 0;
      const totalCollectors = profiles?.filter((p) => p.role === 'collector').length || 0;
      const totalLots = lots?.length || 0;
      
      // Calculer les revenus depuis les réservations complétées et confirmées (payées)
      const paidReservations = reservations?.filter((r) => 
        r.status === 'completed' || r.status === 'confirmed'
      ) || [];
      const totalRevenue = paidReservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
      
      const itemsSaved =
        lots?.reduce((sum, lot) => sum + lot.quantity_reserved + lot.quantity_sold, 0) || 0;
      const donations = reservations?.filter((r) => r.is_donation).length || 0;
      const activeMissions = missions?.length || 0;

      // Statistiques wallet
      const totalWalletBalance = wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
      const totalWalletTransactions = walletTransactions?.length || 0;
      const totalRecharges = walletTransactions?.filter((t) => t.type === 'recharge' && t.status === 'completed').length || 0;
      const totalPayments = walletTransactions?.filter((t) => t.type === 'payment' && t.status === 'completed').length || 0;
      const totalRefunds = walletTransactions?.filter((t) => t.type === 'refund' && t.status === 'completed').length || 0;
      const walletUsers = wallets?.length || 0;

      // Statistiques réservations
      const pendingReservations = reservations?.filter((r) => r.status === 'pending').length || 0;
      const confirmedReservations = reservations?.filter((r) => r.status === 'confirmed').length || 0;

      setStats({
        totalUsers,
        totalMerchants,
        totalBeneficiaries,
        totalCollectors,
        totalLots,
        totalRevenue,
        itemsSaved,
        donations,
        activeMissions,
        totalWalletBalance,
        totalWalletTransactions,
        totalRecharges,
        totalPayments,
        totalRefunds,
        pendingReservations,
        confirmedReservations,
        walletUsers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données des cartes de statistiques
  const statCards = [
    {
      title: 'Utilisateurs Total',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      detail: `${stats.totalMerchants} commerçants, ${stats.totalBeneficiaries} bénéficiaires`,
    },
    {
      title: 'Lots Publiés',
      value: stats.totalLots,
      icon: Package,
      color: 'bg-green-500',
      detail: `${stats.itemsSaved} articles sauvés`,
    },
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      detail: `${stats.confirmedReservations + stats.pendingReservations} réservations`,
    },
    {
      title: 'Portefeuilles',
      value: stats.walletUsers,
      icon: Wallet,
      color: 'bg-purple-500',
      detail: `${formatCurrency(stats.totalWalletBalance)} de solde total`,
    },
    {
      title: 'Réservations',
      value: stats.pendingReservations + stats.confirmedReservations,
      icon: ShoppingBag,
      color: 'bg-indigo-500',
      detail: `${stats.confirmedReservations} payées, ${stats.pendingReservations} en attente`,
    },
    {
      title: 'Dons Solidaires',
      value: stats.donations,
      icon: Heart,
      color: 'bg-pink-500',
      detail: 'Paniers suspendus offerts',
    },
    {
      title: 'Impact CO₂',
      value: `${(stats.itemsSaved * 0.9).toFixed(0)} kg`,
      icon: TrendingUp,
      color: 'bg-green-600',
      detail: 'CO₂ économisé',
    },
    {
      title: 'Missions Actives',
      value: stats.activeMissions,
      icon: Truck,
      color: 'bg-orange-500',
      detail: `${stats.totalCollectors} collecteurs actifs`,
    },
  ];

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-6">
      {/* Header avec Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span>Vue d'ensemble</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            📊 Statistiques en temps réel de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105">
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 rounded-xl transition-all font-semibold hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques - Design amélioré */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 hover:border-primary-200 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-success-600 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>+12%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{card.title}</p>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{card.value}</p>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success-500 rounded-full"></span>
                {card.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sections Impact - Design moderne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Environnemental */}
        <div className="bg-gradient-to-br from-success-50 via-white to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-success-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Impact Environnemental</h3>
              <p className="text-xs text-gray-600 font-medium">🌱 Contribution écologique</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-success-100 hover:border-success-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package size={20} className="text-success-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Repas sauvés</span>
              </div>
              <span className="text-2xl font-black text-success-600">{stats.itemsSaved}</span>
            </div>
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700">Eau économisée</span>
              </div>
              <span className="text-2xl font-black text-blue-600">{(stats.itemsSaved * 50).toFixed(0)} L</span>
            </div>
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-yellow-100 hover:border-yellow-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700">Énergie économisée</span>
              </div>
              <span className="text-2xl font-black text-yellow-600">{(stats.itemsSaved * 0.5).toFixed(1)} kWh</span>
            </div>
          </div>
        </div>

        {/* Impact Social */}
        <div className="bg-gradient-to-br from-pink-50 via-white to-red-50 rounded-2xl shadow-lg p-6 border-2 border-pink-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Impact Social</h3>
              <p className="text-xs text-gray-600 font-medium">❤️ Solidarité locale</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-pink-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Bénéficiaires aidés</span>
              </div>
              <span className="text-2xl font-black text-pink-600">{stats.totalBeneficiaries}</span>
            </div>
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-red-100 hover:border-red-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart size={20} className="text-red-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Dons réalisés</span>
              </div>
              <span className="text-2xl font-black text-red-600">{stats.donations}</span>
            </div>
            <div className="group flex justify-between items-center p-4 bg-white rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag size={20} className="text-orange-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Commerçants engagés</span>
              </div>
              <span className="text-2xl font-black text-orange-600">{stats.totalMerchants}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Wallet - Nouvelles statistiques */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Portefeuilles & Transactions</h3>
            <p className="text-xs text-gray-600 font-medium">💰 Gestion des wallets utilisateurs</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className="text-purple-600" />
              <span className="text-xs font-bold text-gray-600">Solde total</span>
            </div>
            <p className="text-2xl font-black text-purple-600">{formatCurrency(stats.totalWalletBalance)}</p>
            <p className="text-[10px] text-gray-500 mt-1">{stats.walletUsers} portefeuilles actifs</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-green-600" />
              <span className="text-xs font-bold text-gray-600">Transactions</span>
            </div>
            <p className="text-2xl font-black text-green-600">{stats.totalWalletTransactions}</p>
            <p className="text-[10px] text-gray-500 mt-1">{stats.totalPayments} paiements</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-600">Recharges</span>
            </div>
            <p className="text-2xl font-black text-blue-600">{stats.totalRecharges}</p>
            <p className="text-[10px] text-gray-500 mt-1">Recharges effectuées</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-orange-600" />
              <span className="text-xs font-bold text-gray-600">Remboursements</span>
            </div>
            <p className="text-2xl font-black text-orange-600">{stats.totalRefunds}</p>
            <p className="text-[10px] text-gray-500 mt-1">Remboursements effectués</p>
          </div>
        </div>
      </div>

      {/* Section Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="group p-4 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center gap-2">
            <Users size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Utilisateurs</span>
            <span className="text-2xl font-black">{stats.totalUsers}</span>
          </div>
        </button>
        <button className="group p-4 bg-gradient-to-br from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center gap-2">
            <Package size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Lots</span>
            <span className="text-2xl font-black">{stats.totalLots}</span>
          </div>
        </button>
        <button className="group p-4 bg-gradient-to-br from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center gap-2">
            <DollarSign size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Revenus</span>
            <span className="text-xl font-black">{formatCurrency(stats.totalRevenue)}</span>
          </div>
        </button>
        <button className="group p-4 bg-gradient-to-br from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center gap-2">
            <Truck size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Missions</span>
            <span className="text-2xl font-black">{stats.activeMissions}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
