import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Users,
  TrendingUp,
  Mail,
  Download,
  Eye,
  Trash2,
  Filter,
  X,
  Calendar,
  MapPin
} from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserStats {
  total: number;
  customers: number;
  merchants: number;
  beneficiaries: number;
  collectors: number;
  verified: number;
  pending: number;
  newThisWeek: number;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    customers: 0,
    merchants: 0,
    beneficiaries: 0,
    collectors: 0,
    verified: 0,
    pending: 0,
    newThisWeek: 0,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'today'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, users, dateFilter, verificationFilter]);

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    setStats({
      total: users.length,
      customers: users.filter((u) => u.role === 'customer').length,
      merchants: users.filter((u) => u.role === 'merchant').length,
      beneficiaries: users.filter((u) => u.role === 'beneficiary').length,
      collectors: users.filter((u) => u.role === 'collector').length,
      verified: users.filter((u) => u.role === 'beneficiary' && u.verified).length,
      pending: users.filter((u) => u.role === 'beneficiary' && !u.verified).length,
      newThisWeek: users.filter((u) => new Date(u.created_at) > oneWeekAgo).length,
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.beneficiary_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((user) => {
        const userDate = new Date(user.created_at);
        if (dateFilter === 'today') return userDate >= today;
        if (dateFilter === 'week') return userDate >= oneWeekAgo;
        if (dateFilter === 'month') return userDate >= oneMonthAgo;
        return true;
      });
    }

    // Filtre par vérification
    if (verificationFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (user.role !== 'beneficiary') return false;
        if (verificationFilter === 'verified') return user.verified;
        if (verificationFilter === 'pending') return !user.verified;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({ verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
      alert(`✅ Utilisateur ${!currentStatus ? 'vérifié' : 'révoqué'} avec succès !`);
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const bulkVerify = async () => {
    if (selectedUsers.length === 0) {
      alert('Aucun utilisateur sélectionné');
      return;
    }

    if (!confirm(`Vérifier ${selectedUsers.length} utilisateurs ?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({ verified: true })
        .in('id', selectedUsers);

      if (error) throw error;
      fetchUsers();
      setSelectedUsers([]);
      alert(`✅ ${selectedUsers.length} utilisateurs vérifiés !`);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Erreur lors de la vérification en masse');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Rôle', 'Téléphone', 'ID Bénéficiaire', 'Vérifié', 'Date Inscription'];
    const rows = filteredUsers.map((user) => [
      user.full_name,
      user.role,
      user.phone || '',
      user.beneficiary_id || '',
      user.verified ? 'Oui' : 'Non',
      new Date(user.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sendEmail = (user: Profile) => {
    alert(`📧 Fonctionnalité Email vers ${user.full_name} (à implémenter)`);
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`⚠️ Supprimer définitivement ${userName} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;
      fetchUsers();
      alert('✅ Utilisateur supprimé');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Impossible de supprimer cet utilisateur');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
    <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <span>👥</span>
            <span>Gestion des Utilisateurs</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all font-semibold shadow-lg"
        >
          <Download size={18} strokeWidth={2} />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Stats Cards - Design amélioré avec plus de détails */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <Users size={16} className="text-primary-600" strokeWidth={2} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Total</p>
          </div>
          <p className="text-3xl font-black text-primary-600 mb-1">{stats.total}</p>
          <p className="text-[9px] text-gray-500 font-medium">utilisateurs</p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-white p-4 rounded-xl border-2 border-success-100 hover:border-success-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-success-100 rounded-lg">
              <TrendingUp size={16} className="text-success-600" strokeWidth={2} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Nouveaux</p>
          </div>
          <p className="text-3xl font-black text-success-600 mb-1">{stats.newThisWeek}</p>
          <p className="text-[9px] text-gray-500 font-medium">cette semaine</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛒</span>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Clients</p>
          </div>
          <p className="text-3xl font-black text-primary-600 mb-1">{stats.customers}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.total > 0 ? Math.round((stats.customers / stats.total) * 100) : 0}% du total</p>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-white p-4 rounded-xl border-2 border-secondary-100 hover:border-secondary-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏪</span>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Commerçants</p>
          </div>
          <p className="text-3xl font-black text-secondary-600 mb-1">{stats.merchants}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.total > 0 ? Math.round((stats.merchants / stats.total) * 100) : 0}% du total</p>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-white p-4 rounded-xl border-2 border-accent-100 hover:border-accent-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤝</span>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Bénéficiaires</p>
          </div>
          <p className="text-3xl font-black text-accent-600 mb-1">{stats.beneficiaries}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.total > 0 ? Math.round((stats.beneficiaries / stats.total) * 100) : 0}% du total</p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-white p-4 rounded-xl border-2 border-success-100 hover:border-success-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚴</span>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Collecteurs</p>
          </div>
          <p className="text-3xl font-black text-success-600 mb-1">{stats.collectors}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.total > 0 ? Math.round((stats.collectors / stats.total) * 100) : 0}% du total</p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-white p-4 rounded-xl border-2 border-success-100 hover:border-success-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-success-100 rounded-lg">
              <CheckCircle size={16} className="text-success-600" strokeWidth={2} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Vérifiés</p>
          </div>
          <p className="text-3xl font-black text-success-600 mb-1">{stats.verified}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.beneficiaries > 0 ? Math.round((stats.verified / stats.beneficiaries) * 100) : 0}% bénéf.</p>
        </div>

        <div className="bg-gradient-to-br from-warning-50 to-white p-4 rounded-xl border-2 border-warning-100 hover:border-warning-300 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-warning-100 rounded-lg">
              <XCircle size={16} className="text-warning-600" strokeWidth={2} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">En attente</p>
          </div>
          <p className="text-3xl font-black text-warning-600 mb-1">{stats.pending}</p>
          <p className="text-[9px] text-gray-500 font-medium">{stats.beneficiaries > 0 ? Math.round((stats.pending / stats.beneficiaries) * 100) : 0}% bénéf.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, téléphone, commerce, ID bénéficiaire..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
              />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-semibold ${
                showFilters
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              <Filter size={18} strokeWidth={2} />
              <span>Filtres</span>
              {(roleFilter || dateFilter !== 'all' || verificationFilter !== 'all') && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {[roleFilter, dateFilter !== 'all', verificationFilter !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100 animate-fade-in">
          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎭 Rôle</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
            >
              <option value="">Tous les rôles</option>
                  <option value="customer">🛒 Clients</option>
                  <option value="merchant">🏪 Commerçants</option>
                  <option value="beneficiary">🤝 Bénéficiaires</option>
                  <option value="collector">🚴 Collecteurs</option>
                  <option value="admin">👑 Administrateurs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date d'inscription</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois-ci</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">✅ Vérification</label>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value as typeof verificationFilter)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="verified">✅ Vérifiés</option>
                  <option value="pending">⏳ En attente</option>
            </select>
          </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-primary-700 font-semibold">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={bulkVerify}
              className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-all font-semibold flex items-center gap-2"
            >
              <CheckCircle size={16} strokeWidth={2} />
              <span>Vérifier tout</span>
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
        {filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-primary-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={selectAll}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Utilisateur
                </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Rôle
                </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID / Commerce
                </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Statut
                </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                    <div>
                        <div className="text-sm font-bold text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.phone || 'Pas de téléphone'}</div>
                    </div>
                  </td>
                    <td className="px-6 py-4">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                        user.role === 'customer'
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : user.role === 'merchant'
                            ? 'bg-secondary-50 text-secondary-700 border-secondary-200'
                            : user.role === 'beneficiary'
                            ? 'bg-accent-50 text-accent-700 border-accent-200'
                            : user.role === 'collector'
                            ? 'bg-success-50 text-success-700 border-success-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {user.role === 'customer'
                          ? '🛒 Client'
                          : user.role === 'merchant'
                          ? '🏪 Commerçant'
                          : user.role === 'beneficiary'
                          ? '🤝 Bénéficiaire'
                          : user.role === 'collector'
                          ? '🚴 Collecteur'
                          : '👑 Admin'}
                    </span>
                  </td>
                    <td className="px-6 py-4">
                    {user.beneficiary_id ? (
                        <span className="font-mono text-sm font-semibold text-accent-600 bg-accent-50 px-2 py-1 rounded">
                          {user.beneficiary_id}
                        </span>
                      ) : user.business_name ? (
                        <span className="text-sm font-medium text-secondary-600">
                          {user.business_name}
                        </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                    <td className="px-6 py-4">
                    {user.role === 'beneficiary' ? (
                      <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          user.verified
                              ? 'bg-success-50 text-success-700 border-success-200'
                              : 'bg-warning-50 text-warning-700 border-warning-200'
                        }`}
                      >
                        {user.verified ? (
                          <>
                              <CheckCircle size={14} strokeWidth={2} /> Vérifié
                          </>
                        ) : (
                          <>
                              <XCircle size={14} strokeWidth={2} /> En attente
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-all"
                          title="Voir les détails"
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
                    {user.role === 'beneficiary' && (
                      <button
                        onClick={() => toggleVerification(user.id, user.verified)}
                            className={`p-2 rounded-lg transition-all ${
                          user.verified
                                ? 'text-warning-600 hover:bg-warning-100'
                                : 'text-success-600 hover:bg-success-100'
                            }`}
                            title={user.verified ? 'Révoquer' : 'Vérifier'}
                          >
                            {user.verified ? (
                              <XCircle size={16} strokeWidth={2} />
                            ) : (
                              <CheckCircle size={16} strokeWidth={2} />
                            )}
                      </button>
                    )}
                        <button
                          onClick={() => sendEmail(user)}
                          className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-all"
                          title="Envoyer un email"
                        >
                          <Mail size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.full_name)}
                          className="p-2 text-accent-600 hover:bg-accent-100 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
              <Users size={48} className="text-gray-300" strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-1 flex items-center gap-2">
                  <span className="text-3xl">
                    {selectedUser.role === 'customer' ? '🛒' : selectedUser.role === 'merchant' ? '🏪' : selectedUser.role === 'beneficiary' ? '🤝' : selectedUser.role === 'collector' ? '🚴' : '👑'}
                  </span>
                  {selectedUser.full_name}
                </h3>
                <p className="text-sm text-gray-600">Fiche utilisateur complète</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={24} className="text-gray-600" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Badge rôle */}
              <div className="flex items-center justify-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                    selectedUser.role === 'customer'
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : selectedUser.role === 'merchant'
                      ? 'bg-secondary-50 text-secondary-700 border-secondary-200'
                      : selectedUser.role === 'beneficiary'
                      ? 'bg-accent-50 text-accent-700 border-accent-200'
                      : selectedUser.role === 'collector'
                      ? 'bg-success-50 text-success-700 border-success-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {selectedUser.role === 'customer'
                    ? '🛒 Client'
                    : selectedUser.role === 'merchant'
                    ? '🏪 Commerçant'
                    : selectedUser.role === 'beneficiary'
                    ? '🤝 Bénéficiaire'
                    : selectedUser.role === 'collector'
                    ? '🚴 Collecteur'
                    : '👑 Admin'}
                </span>
              </div>

              {/* Informations de contact */}
              <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl border-2 border-primary-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail size={16} className="text-primary-600" />
                  Informations de contact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 font-semibold mb-1">Nom complet</p>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-semibold mb-1">Téléphone</p>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* ID Utilisateur et dates */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-600" />
                  Informations système
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 font-semibold mb-1">ID Utilisateur</p>
                    <p className="text-[10px] font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded truncate">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-semibold mb-1">Inscription</p>
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations spécifiques bénéficiaire */}
              {selectedUser.beneficiary_id && (
                <div className="bg-gradient-to-br from-accent-50 to-white p-4 rounded-xl border-2 border-accent-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    Bénéficiaire
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-600 font-semibold mb-1">ID Bénéficiaire</p>
                      <p className="font-mono text-base font-bold text-accent-700 bg-accent-100 px-3 py-1.5 rounded inline-block">{selectedUser.beneficiary_id}</p>
                    </div>
                    {selectedUser.address && (
                      <div>
                        <p className="text-[10px] text-gray-600 font-semibold mb-1">Adresse</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations spécifiques commerçant */}
              {selectedUser.business_name && (
                <div className="bg-gradient-to-br from-secondary-50 to-white p-4 rounded-xl border-2 border-secondary-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🏪</span>
                    Commerce
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-600 font-semibold mb-1">Nom du commerce</p>
                      <p className="text-base font-bold text-secondary-700">{selectedUser.business_name}</p>
                    </div>
                    {selectedUser.business_address && (
                      <div>
                        <p className="text-[10px] text-gray-600 font-semibold mb-1">Adresse du commerce</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <MapPin size={14} className="text-gray-500" />
                          {selectedUser.business_address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statut de vérification pour bénéficiaires */}
              {selectedUser.role === 'beneficiary' && (
                <div className={`p-4 rounded-xl border-2 ${selectedUser.verified ? 'bg-success-50 border-success-200' : 'bg-warning-50 border-warning-200'}`}>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    {selectedUser.verified ? (
                      <>
                        <CheckCircle size={16} className="text-success-600" />
                        Compte vérifié
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-warning-600" />
                        En attente de vérification
                      </>
                    )}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {selectedUser.verified 
                      ? '✅ Ce bénéficiaire a accès à tous les services de la plateforme (paniers suspendus, dons généreux, etc.).'
                      : '⏳ Ce bénéficiaire est en attente de validation par un administrateur. Une fois vérifié, il pourra accéder aux services solidaires.'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {selectedUser.role === 'beneficiary' && (
                <button
                  onClick={() => {
                    toggleVerification(selectedUser.id, selectedUser.verified);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedUser.verified
                      ? 'bg-warning-600 text-white hover:bg-warning-700'
                      : 'bg-success-600 text-white hover:bg-success-700'
                  }`}
                >
                  {selectedUser.verified ? (
                    <>
                      <XCircle size={18} strokeWidth={2} />
                      Révoquer la vérification
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} strokeWidth={2} />
                      Vérifier le compte
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => sendEmail(selectedUser)}
                className="flex-1 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Mail size={18} strokeWidth={2} />
                Contacter
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
