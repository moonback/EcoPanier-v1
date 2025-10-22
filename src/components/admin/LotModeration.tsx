// Imports externes
import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  Euro,
  Calendar,
  Thermometer,
  TrendingUp,
  ChevronDown,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports internes
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

// Types
type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    full_name: string;
    phone: string | null;
  };
};

type LotStatus = Database['public']['Tables']['lots']['Row']['status'];

interface LotStats {
  total: number;
  available: number;
  reserved: number;
  sold_out: number;
  expired: number;
}

interface FilterOptions {
  status: LotStatus | 'all';
  category: string;
  merchantId: string;
  searchQuery: string;
  urgent: boolean | null;
  coldChain: boolean | null;
}

/**
 * Composant de modération des lots pour les administrateurs
 * Permet de voir, filtrer, éditer et modérer tous les lots de la plateforme
 */
export function LotModeration() {
  // État local
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LotStats>({
    total: 0,
    available: 0,
    reserved: 0,
    sold_out: 0,
    expired: 0
  });
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    merchantId: 'all',
    searchQuery: '',
    urgent: null,
    coldChain: null
  });

  // Catégories disponibles
  const categories = [
    'Fruits & Légumes',
    'Boulangerie',
    'Produits laitiers',
    'Viande & Poisson',
    'Épicerie',
    'Plats préparés',
    'Pâtisserie',
    'Autre'
  ];

  // Charger les lots
  useEffect(() => {
    fetchLots();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots, filters]);

  // Calculer les stats
  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots]);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lots')
        .select(`
          *,
          profiles!merchant_id(
            business_name,
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLots(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats: LotStats = {
      total: lots.length,
      available: lots.filter(l => l.status === 'available').length,
      reserved: lots.filter(l => l.status === 'reserved').length,
      sold_out: lots.filter(l => l.status === 'sold_out').length,
      expired: lots.filter(l => l.status === 'expired').length
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...lots];

    // Filtre par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(lot => lot.status === filters.status);
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      filtered = filtered.filter(lot => lot.category === filters.category);
    }

    // Filtre par commerçant
    if (filters.merchantId !== 'all') {
      filtered = filtered.filter(lot => lot.merchant_id === filters.merchantId);
    }

    // Filtre urgent
    if (filters.urgent !== null) {
      filtered = filtered.filter(lot => lot.is_urgent === filters.urgent);
    }

    // Filtre chaîne du froid
    if (filters.coldChain !== null) {
      filtered = filtered.filter(lot => lot.requires_cold_chain === filters.coldChain);
    }

    // Recherche textuelle
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(lot =>
        lot.title.toLowerCase().includes(query) ||
        lot.description.toLowerCase().includes(query) ||
        lot.profiles.business_name.toLowerCase().includes(query)
      );
    }

    setFilteredLots(filtered);
  };

  const handleDeleteLot = async (lotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lots')
        .delete()
        .eq('id', lotId);

      if (error) throw error;

      alert('Lot supprimé avec succès');
      fetchLots();
      setSelectedLot(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Impossible de supprimer le lot. Il peut avoir des réservations actives.');
    }
  };

  const handleUpdateStatus = async (lotId: string, newStatus: LotStatus) => {
    try {
      const { error } = await supabase
        .from('lots')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', lotId);

      if (error) throw error;

      alert('Statut mis à jour avec succès');
      fetchLots();
      if (selectedLot && selectedLot.id === lotId) {
        setSelectedLot({ ...selectedLot, status: newStatus });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Impossible de mettre à jour le statut');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      merchantId: 'all',
      searchQuery: '',
      urgent: null,
      coldChain: null
    });
  };

  const getStatusBadge = (status: LotStatus) => {
    const badges = {
      available: { label: '✅ Disponible', color: 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300' },
      reserved: { label: '⏳ Réservé', color: 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300' },
      sold_out: { label: '🚫 Épuisé', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300' },
      expired: { label: '⚠️ Expiré', color: 'bg-accent-100 text-accent-700 border-accent-300' }
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Merchants uniques pour le filtre
  const uniqueMerchants = Array.from(
    new Set(lots.map(lot => JSON.stringify({ id: lot.merchant_id, name: lot.profiles.business_name })))
  ).map(str => JSON.parse(str));

  // Early return - Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-600 font-medium">Chargement des lots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <span>📦</span>
            <span>Modération des Lots</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez et modérez tous les paniers anti-gaspi de la plateforme
          </p>
        </div>
        <button
          onClick={fetchLots}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-sm transition-all font-semibold"
        >
          <TrendingUp size={18} strokeWidth={2} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-primary-100 hover:border-primary-200 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">📦 Total</p>
              <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Package size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-success-100 hover:border-success-200 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">✅ Disponibles</p>
              <p className="text-3xl font-bold text-success-600">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <CheckCircle size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-warning-100 hover:border-warning-200 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">⏳ Réservés</p>
              <p className="text-3xl font-bold text-warning-600">{stats.reserved}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Clock size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">🚫 Épuisés</p>
              <p className="text-3xl font-bold text-gray-600">{stats.sold_out}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <XCircle size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-accent-100 hover:border-accent-200 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">⚠️ Expirés</p>
              <p className="text-3xl font-bold text-accent-600">{stats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="🔍 Rechercher par titre, description ou commerçant..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Bouton filtres */}
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
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="pt-4 border-t-2 border-gray-100 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre statut */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📊</span>
                  <span>Statut</span>
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as LotStatus | 'all' })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="available">✅ Disponible</option>
                  <option value="reserved">⏳ Réservé</option>
                  <option value="sold_out">🚫 Épuisé</option>
                  <option value="expired">⚠️ Expiré</option>
                </select>
              </div>

              {/* Filtre catégorie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🏷️</span>
                  <span>Catégorie</span>
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtre commerçant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🏪</span>
                  <span>Commerçant</span>
                </label>
                <select
                  value={filters.merchantId}
                  onChange={(e) => setFilters({ ...filters, merchantId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                >
                  <option value="all">Tous commerces</option>
                  {uniqueMerchants.map(merchant => (
                    <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtres booléens */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⚙️ Options
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.urgent === true}
                    onChange={(e) => setFilters({ ...filters, urgent: e.target.checked ? true : null })}
                    className="w-4 h-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-accent-600 transition-colors">🔥 Urgent uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.coldChain === true}
                    onChange={(e) => setFilters({ ...filters, coldChain: e.target.checked ? true : null })}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">🧊 Chaîne du froid</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-all font-semibold"
              >
                <X size={16} strokeWidth={2} />
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des lots */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full border-2 border-primary-200">
              {filteredLots.length} lot{filteredLots.length > 1 ? 's' : ''}
            </span>
            <span className="text-gray-600">trouvé{filteredLots.length > 1 ? 's' : ''}</span>
          </h3>
        </div>

        {filteredLots.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
              <Package size={64} className="text-gray-300" strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun lot trouvé 🔍</h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos filtres ou critères de recherche
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 hover:shadow-sm transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLots.map((lot) => {
              const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
              const discount = Math.round(
                ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
              );

              return (
                <div
                  key={lot.id}
                  className="group p-5 border-2 border-gray-200 rounded-2xl hover:border-primary-300 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedLot(lot)}
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full lg:w-32 h-32 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      {lot.image_urls && lot.image_urls.length > 0 ? (
                        <img
                          src={lot.image_urls[0]}
                          alt={lot.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="40" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Titre et badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black truncate group-hover:text-primary-600 transition-colors">{lot.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1 font-light">{lot.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {getStatusBadge(lot.status)}
                          {lot.is_urgent && (
                            <span className="px-3 py-1 bg-accent-600 text-white text-xs font-bold rounded-full shadow-sm">
                              🔥 Urgent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Détails en grille */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{lot.profiles.business_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Package className="w-4 h-4 flex-shrink-0" />
                          <span>
                            <span className="font-bold text-neutral-900">{availableQty}</span> / {lot.quantity_total}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Euro className="w-4 h-4 flex-shrink-0" />
                          <span className="font-bold text-primary-600">{lot.discounted_price}€</span>
                          <span className="text-xs text-neutral-400 line-through">{lot.original_price}€</span>
                          <span className="text-xs font-bold text-success-600">-{discount}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{format(new Date(lot.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex flex-wrap gap-2 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLot(lot);
                          }}
                          className="py-2 px-4 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 border border-primary-200"
                        >
                          <Eye size={14} strokeWidth={2} />
                          <span>Voir détails</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lot.id, 'expired');
                          }}
                          disabled={lot.status === 'expired'}
                          className="py-2 px-4 bg-warning-50 text-warning-700 hover:bg-warning-100 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 border border-warning-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <AlertTriangle size={14} strokeWidth={2} />
                          <span>Expirer</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLot(lot.id);
                          }}
                          className="py-2 px-4 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 border border-accent-200"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal détails du lot */}
      {selectedLot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-white to-primary-50 border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
                  <Package size={20} strokeWidth={2} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-black truncate">{selectedLot.title}</h3>
                  <p className="text-xs text-gray-600 font-mono">ID: {selectedLot.id.substring(0, 8)}...</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="w-10 h-10 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center transition-all ml-4 flex-shrink-0"
              >
                <X size={20} strokeWidth={2} className="text-gray-600" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Images */}
              {selectedLot.image_urls && selectedLot.image_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedLot.image_urls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={url}
                        alt={`${selectedLot.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📝</span>
                      <span>Description</span>
                    </h4>
                    <p className="text-gray-900 leading-relaxed">{selectedLot.description}</p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl border-2 border-primary-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>🏷️</span>
                      <span>Catégorie</span>
                    </h4>
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold shadow-md">
                      {selectedLot.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary-50 rounded-xl border-2 border-secondary-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span>🏪</span>
                      <span>Commerçant</span>
                    </h4>
                    <div className="space-y-2">
                      <p className="font-bold text-secondary-700 text-lg">{selectedLot.profiles.business_name}</p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <span>👤</span>
                        <span>{selectedLot.profiles.full_name}</span>
                      </p>
                      {selectedLot.profiles.phone && (
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <span>📞</span>
                          <span>{selectedLot.profiles.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix et quantités */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <span>💵</span>
                    <span>Prix initial</span>
                  </p>
                  <p className="text-3xl font-bold text-primary-700">{selectedLot.original_price}€</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <span>💰</span>
                    <span>Prix réduit</span>
                  </p>
                  <p className="text-3xl font-bold text-success-700">{selectedLot.discounted_price}€</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <span>📉</span>
                    <span>Réduction</span>
                  </p>
                  <p className="text-3xl font-bold text-warning-700">
                    -{Math.round(((selectedLot.original_price - selectedLot.discounted_price) / selectedLot.original_price) * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">📦 Quantité totale</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedLot.quantity_total}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100">
                  <p className="text-xs font-semibold text-gray-600 mb-1">⏳ Réservées</p>
                  <p className="text-3xl font-bold text-warning-700">{selectedLot.quantity_reserved}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100">
                  <p className="text-xs font-semibold text-gray-600 mb-1">✅ Vendues</p>
                  <p className="text-3xl font-bold text-success-700">{selectedLot.quantity_sold}</p>
                </div>
              </div>

              {/* Horaires de retrait */}
              <div className="p-5 bg-gradient-to-br from-secondary-50 to-white rounded-xl border-2 border-secondary-100">
                <h4 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                  <span>⏰</span>
                  <span>Créneau de Retrait</span>
                </h4>
                <div className="flex items-center gap-4 text-gray-900">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Début</p>
                    <p className="font-bold text-secondary-700">
                      {format(new Date(selectedLot.pickup_start), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className="text-gray-400 font-bold">→</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Fin</p>
                    <p className="font-bold text-secondary-700">
                      {format(new Date(selectedLot.pickup_end), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-3">
                {selectedLot.is_urgent && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 rounded-xl font-semibold border-2 border-accent-300 shadow-sm">
                    <AlertTriangle size={16} strokeWidth={2} />
                    <span>🔥 Lot urgent</span>
                  </div>
                )}
                {selectedLot.requires_cold_chain && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-xl font-semibold border-2 border-primary-300 shadow-sm">
                    <Thermometer size={16} strokeWidth={2} />
                    <span>🧊 Chaîne du froid requise</span>
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                      <span>📅</span>
                      <span>Créé le</span>
                    </p>
                    <p className="font-bold text-gray-900">
                      {format(new Date(selectedLot.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                      <span>🔄</span>
                      <span>Mis à jour le</span>
                    </p>
                    <p className="font-bold text-gray-900">
                      {format(new Date(selectedLot.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions de modération */}
              <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <AlertTriangle size={16} strokeWidth={2} className="text-accent-600" />
                  </div>
                  <h4 className="text-lg font-bold text-black">Actions de Modération</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedLot.id, 'available')}
                    disabled={selectedLot.status === 'available'}
                    className="py-3 px-4 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={18} strokeWidth={2} />
                    <span>✅ Marquer disponible</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedLot.id, 'expired')}
                    disabled={selectedLot.status === 'expired'}
                    className="py-3 px-4 bg-gradient-to-r from-warning-600 to-warning-700 text-white rounded-xl hover:from-warning-700 hover:to-warning-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AlertTriangle size={18} strokeWidth={2} />
                    <span>⚠️ Marquer expiré</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('💡 Fonctionnalité d\'édition à venir');
                    }}
                    className="py-3 px-4 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
                  >
                    <Edit size={18} strokeWidth={2} />
                    <span>✏️ Modifier le lot</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLot(selectedLot.id)}
                    className="py-3 px-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                    <span>🗑️ Supprimer le lot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

