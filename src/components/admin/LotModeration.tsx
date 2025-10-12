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
  }, [lots, filters]);

  // Calculer les stats
  useEffect(() => {
    calculateStats();
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
      available: { label: 'Disponible', color: 'bg-success-100 text-success-700 border-success-200' },
      reserved: { label: 'Réservé', color: 'bg-warning-100 text-warning-700 border-warning-200' },
      sold_out: { label: 'Épuisé', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
      expired: { label: 'Expiré', color: 'bg-accent-100 text-accent-700 border-accent-200' }
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
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
          <h2 className="text-2xl font-black text-neutral-900">Modération des Lots</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Gérez et modérez tous les lots de la plateforme
          </p>
        </div>
        <button
          onClick={fetchLots}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <TrendingUp className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary-600 uppercase">Total</p>
              <p className="text-3xl font-black text-primary-700 mt-1">{stats.total}</p>
            </div>
            <Package className="w-10 h-10 text-primary-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-success-600 uppercase">Disponibles</p>
              <p className="text-3xl font-black text-success-700 mt-1">{stats.available}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-success-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-warning-600 uppercase">Réservés</p>
              <p className="text-3xl font-black text-warning-700 mt-1">{stats.reserved}</p>
            </div>
            <Clock className="w-10 h-10 text-warning-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 uppercase">Épuisés</p>
              <p className="text-3xl font-black text-neutral-700 mt-1">{stats.sold_out}</p>
            </div>
            <XCircle className="w-10 h-10 text-neutral-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-accent-600 uppercase">Expirés</p>
              <p className="text-3xl font-black text-accent-700 mt-1">{stats.expired}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-accent-400" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou commerçant..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${
              showFilters ? 'bg-primary-100 text-primary-700' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre statut */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as LotStatus | 'all' })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Tous</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Réservé</option>
                  <option value="sold_out">Épuisé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>

              {/* Filtre catégorie */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Toutes</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtre commerçant */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Commerçant
                </label>
                <select
                  value={filters.merchantId}
                  onChange={(e) => setFilters({ ...filters, merchantId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Tous</option>
                  {uniqueMerchants.map(merchant => (
                    <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtres booléens */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Options
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.urgent === true}
                    onChange={(e) => setFilters({ ...filters, urgent: e.target.checked ? true : null })}
                    className="w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-sm text-neutral-700">Urgent uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.coldChain === true}
                    onChange={(e) => setFilters({ ...filters, coldChain: e.target.checked ? true : null })}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">Chaîne du froid</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm text-accent-600 hover:text-accent-700 font-semibold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des lots */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">
            {filteredLots.length} lot{filteredLots.length > 1 ? 's' : ''} trouvé{filteredLots.length > 1 ? 's' : ''}
          </h3>
        </div>

        {filteredLots.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">Aucun lot trouvé</p>
            <p className="text-sm text-neutral-500 mt-1">
              Essayez de modifier vos filtres ou critères de recherche
            </p>
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
                  className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
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
                          <h4 className="font-bold text-neutral-900 truncate">{lot.title}</h4>
                          <p className="text-sm text-neutral-600 line-clamp-2 mt-1">{lot.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {getStatusBadge(lot.status)}
                          {lot.is_urgent && (
                            <span className="px-2 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
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
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLot(lot);
                          }}
                          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Détails
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lot.id, 'expired');
                          }}
                          disabled={lot.status === 'expired'}
                          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Expirer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLot(lot.id);
                          }}
                          className="py-1.5 px-3 text-xs font-semibold text-accent-600 hover:bg-accent-50 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-neutral-900 truncate">{selectedLot.title}</h3>
                <p className="text-sm text-neutral-600 mt-0.5">ID: {selectedLot.id}</p>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5 text-neutral-600" />
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
                  <div>
                    <h4 className="text-sm font-bold text-neutral-700 uppercase mb-2">Description</h4>
                    <p className="text-neutral-900">{selectedLot.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-700 uppercase mb-2">Catégorie</h4>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-lg font-medium">
                      {selectedLot.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-700 uppercase mb-2">Commerçant</h4>
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-900">{selectedLot.profiles.business_name}</p>
                      <p className="text-sm text-neutral-600">{selectedLot.profiles.full_name}</p>
                      {selectedLot.profiles.phone && (
                        <p className="text-sm text-neutral-600">{selectedLot.profiles.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix et quantités */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card bg-primary-50 border-primary-200">
                  <p className="text-xs font-medium text-primary-600 uppercase mb-1">Prix initial</p>
                  <p className="text-2xl font-black text-primary-700">{selectedLot.original_price}€</p>
                </div>
                <div className="card bg-success-50 border-success-200">
                  <p className="text-xs font-medium text-success-600 uppercase mb-1">Prix réduit</p>
                  <p className="text-2xl font-black text-success-700">{selectedLot.discounted_price}€</p>
                </div>
                <div className="card bg-warning-50 border-warning-200">
                  <p className="text-xs font-medium text-warning-600 uppercase mb-1">Réduction</p>
                  <p className="text-2xl font-black text-warning-700">
                    -{Math.round(((selectedLot.original_price - selectedLot.discounted_price) / selectedLot.original_price) * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <p className="text-xs font-medium text-neutral-600 uppercase mb-1">Quantité totale</p>
                  <p className="text-2xl font-black text-neutral-900">{selectedLot.quantity_total}</p>
                </div>
                <div className="card">
                  <p className="text-xs font-medium text-neutral-600 uppercase mb-1">Réservées</p>
                  <p className="text-2xl font-black text-warning-700">{selectedLot.quantity_reserved}</p>
                </div>
                <div className="card">
                  <p className="text-xs font-medium text-neutral-600 uppercase mb-1">Vendues</p>
                  <p className="text-2xl font-black text-success-700">{selectedLot.quantity_sold}</p>
                </div>
              </div>

              {/* Horaires de retrait */}
              <div className="card bg-neutral-50">
                <h4 className="text-sm font-bold text-neutral-700 uppercase mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horaires de retrait
                </h4>
                <div className="flex items-center gap-4 text-neutral-900">
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Début</p>
                    <p className="font-bold">
                      {format(new Date(selectedLot.pickup_start), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className="text-neutral-400">→</span>
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Fin</p>
                    <p className="font-bold">
                      {format(new Date(selectedLot.pickup_end), 'dd MMM yyyy - HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-3">
                {selectedLot.is_urgent && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-accent-700 rounded-lg font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Lot urgent
                  </div>
                )}
                {selectedLot.requires_cold_chain && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
                    <Thermometer className="w-4 h-4" />
                    Chaîne du froid requise
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="card bg-neutral-50 text-xs text-neutral-600 space-y-1">
                <p><span className="font-semibold">Créé le :</span> {format(new Date(selectedLot.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                <p><span className="font-semibold">Mis à jour le :</span> {format(new Date(selectedLot.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
              </div>

              {/* Actions de modération */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-700 uppercase">Actions de modération</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedLot.id, 'available')}
                    disabled={selectedLot.status === 'available'}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme disponible
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedLot.id, 'expired')}
                    disabled={selectedLot.status === 'expired'}
                    className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Marquer comme expiré
                  </button>
                  <button
                    onClick={() => {
                      alert('Fonctionnalité d\'édition à venir');
                    }}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier le lot
                  </button>
                  <button
                    onClick={() => handleDeleteLot(selectedLot.id)}
                    className="bg-accent-50 hover:bg-accent-100 text-accent-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 py-3 px-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer le lot
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

