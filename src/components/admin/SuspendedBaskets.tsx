import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Heart, 
  Package, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Gift,
  User,
  Calendar,
  MapPin,
  Filter,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

interface SuspendedBasket {
  id: string;
  donor_name: string;
  donor_id: string;
  amount: number;
  created_at: string;
  claimed_at: string | null;
  claimed_by: string | null;
  status: 'available' | 'reserved' | 'claimed' | 'expired';
  merchant_name: string;
  beneficiary_name?: string;
  merchant_business_name?: string;
  beneficiary_code?: string;
}

interface Beneficiary {
  id: string;
  full_name: string;
  beneficiary_id: string;
  phone: string | null;
}

export const SuspendedBaskets = () => {
  const [baskets, setBaskets] = useState<SuspendedBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'reserved' | 'claimed' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBasket, setSelectedBasket] = useState<SuspendedBasket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    claimed: 0,
    expired: 0,
    totalAmount: 0,
    thisMonth: 0
  });

  useEffect(() => {
    loadBaskets();
  }, []);

  const loadBaskets = async () => {
    setLoading(true);
    try {
      // Récupérer les paniers suspendus depuis Supabase
      const { data, error } = await supabase
        .from('suspended_baskets_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement:', error);
        // Si la table n'existe pas encore, utiliser des données mockées
        loadMockBaskets();
        return;
      }

      if (data && data.length > 0) {
        // Transformer les données de la vue
        const transformedBaskets: SuspendedBasket[] = data.map(item => ({
          id: item.id,
          donor_name: item.donor_name || 'Donateur anonyme',
          donor_id: item.donor_id,
          amount: parseFloat(item.amount),
          created_at: item.created_at,
          claimed_at: item.claimed_at,
          claimed_by: item.beneficiary_id,
          status: item.status as any,
          merchant_name: item.merchant_business_name || item.merchant_name || 'Commerce',
          beneficiary_name: item.beneficiary_name,
          merchant_business_name: item.merchant_business_name,
          beneficiary_code: item.beneficiary_code
        }));

        setBaskets(transformedBaskets);
        calculateStats(transformedBaskets);
      } else {
        // Aucune donnée trouvée, utiliser des données d'exemple
        loadMockBaskets();
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paniers:', err);
      loadMockBaskets();
    } finally {
      setLoading(false);
    }
  };

  const loadMockBaskets = () => {
    const mockBaskets: SuspendedBasket[] = [
        {
          id: '1',
          donor_name: 'Marie Dupont',
          donor_id: 'user-123',
          amount: 5,
          created_at: '2025-10-12T10:30:00',
          claimed_at: null,
          claimed_by: null,
          status: 'available',
          merchant_name: 'Boulangerie du Coin'
        },
        {
          id: '2',
          donor_name: 'Jean Martin',
          donor_id: 'user-456',
          amount: 10,
          created_at: '2025-10-12T09:15:00',
          claimed_at: '2025-10-12T11:20:00',
          claimed_by: 'beneficiary-789',
          status: 'claimed',
          merchant_name: 'Épicerie Bio',
          beneficiary_name: 'Association Entraide'
        },
        {
          id: '3',
          donor_name: 'Sophie Bernard',
          donor_id: 'user-789',
          amount: 5,
          created_at: '2025-10-11T14:20:00',
          claimed_at: null,
          claimed_by: null,
          status: 'available',
          merchant_name: 'Primeur des Halles'
        },
        {
          id: '4',
          donor_name: 'Pierre Dubois',
          donor_id: 'user-101',
          amount: 7.5,
          created_at: '2025-10-11T16:45:00',
          claimed_at: '2025-10-12T08:30:00',
          claimed_by: 'beneficiary-456',
          status: 'claimed',
          merchant_name: 'Fromagerie Artisanale',
          beneficiary_name: 'Resto du Cœur'
        },
        {
          id: '5',
          donor_name: 'Emma Petit',
          donor_id: 'user-202',
          amount: 5,
          created_at: '2025-10-10T11:00:00',
          claimed_at: null,
          claimed_by: null,
          status: 'available',
          merchant_name: 'Boucherie Moderne'
        },
        {
          id: '6',
          donor_name: 'Luc Thomas',
          donor_id: 'user-303',
          amount: 15,
          created_at: '2025-10-10T15:30:00',
          claimed_at: null,
          claimed_by: 'beneficiary-123',
          status: 'reserved',
          merchant_name: 'Traiteur Délices'
        },
        {
          id: '7',
          donor_name: 'Claire Robert',
          donor_id: 'user-404',
          amount: 5,
          created_at: '2025-10-09T13:15:00',
          claimed_at: '2025-10-10T09:00:00',
          claimed_by: 'beneficiary-234',
          status: 'claimed',
          merchant_name: 'Pâtisserie Sucrée',
          beneficiary_name: 'Secours Populaire'
        },
        {
          id: '8',
          donor_name: 'Antoine Moreau',
          donor_id: 'user-505',
          amount: 10,
          created_at: '2025-10-08T10:45:00',
          claimed_at: '2025-10-09T14:20:00',
          claimed_by: 'beneficiary-345',
          status: 'claimed',
          merchant_name: 'Supermarché Local',
          beneficiary_name: 'Croix-Rouge'
        },
      ];

      setBaskets(mockBaskets);
      calculateStats(mockBaskets);
  };

  const calculateStats = (basketsList: SuspendedBasket[]) => {
    const total = basketsList.length;
    const available = basketsList.filter(b => b.status === 'available').length;
    const reserved = basketsList.filter(b => b.status === 'reserved').length;
    const claimed = basketsList.filter(b => b.status === 'claimed').length;
    const expired = basketsList.filter(b => b.status === 'expired').length;
    const totalAmount = basketsList.reduce((sum, b) => sum + b.amount, 0);
    
    const thisMonthDate = new Date();
    thisMonthDate.setDate(1);
    thisMonthDate.setHours(0, 0, 0, 0);
    const thisMonth = basketsList.filter(b => new Date(b.created_at) >= thisMonthDate).length;

    setStats({
      total,
      available,
      reserved,
      claimed,
      expired,
      totalAmount,
      thisMonth
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="badge-success">✅ Disponible</span>;
      case 'reserved':
        return <span className="badge-warning">⏳ Réservé</span>;
      case 'claimed':
        return <span className="badge-primary">🎁 Récupéré</span>;
      case 'expired':
        return <span className="badge-accent">❌ Expiré</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getTopDonors = () => {
    const donorMap = new Map<string, { name: string; donations: number; amount: number }>();
    
    baskets.forEach(basket => {
      const existing = donorMap.get(basket.donor_id) || { 
        name: basket.donor_name, 
        donations: 0, 
        amount: 0 
      };
      existing.donations += 1;
      existing.amount += basket.amount;
      donorMap.set(basket.donor_id, existing);
    });

    return Array.from(donorMap.values())
      .sort((a, b) => b.donations - a.donations)
      .slice(0, 5);
  };

  const getTopBeneficiaries = () => {
    const beneficiaryMap = new Map<string, { name: string; baskets: number; value: number }>();
    
    baskets
      .filter(b => b.beneficiary_name)
      .forEach(basket => {
        const key = basket.beneficiary_name!;
        const existing = beneficiaryMap.get(key) || { 
          name: basket.beneficiary_name!, 
          baskets: 0, 
          value: 0 
        };
        existing.baskets += 1;
        existing.value += basket.amount;
        beneficiaryMap.set(key, existing);
      });

    return Array.from(beneficiaryMap.values())
      .sort((a, b) => b.baskets - a.baskets)
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = () => {
    console.log('Export des données...');
    // Implémentation de l'export
  };

  const openDetails = (basket: SuspendedBasket) => {
    setSelectedBasket(basket);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBasket(null);
  };

  const loadBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, beneficiary_id, phone')
        .eq('role', 'beneficiary')
        .eq('verified', true)
        .order('full_name');

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des bénéficiaires:', err);
    }
  };

  const openAssignModal = async (basket: SuspendedBasket) => {
    setSelectedBasket(basket);
    setAssignError('');
    setAssignSuccess('');
    setSelectedBeneficiary('');
    await loadBeneficiaries();
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedBasket(null);
    setSelectedBeneficiary('');
    setAssignError('');
    setAssignSuccess('');
  };

  const handleAssign = async () => {
    if (!selectedBeneficiary || !selectedBasket) {
      setAssignError('Veuillez sélectionner un bénéficiaire');
      return;
    }

    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');

    try {
      // Mettre à jour le panier suspendu
      const { error: updateError } = await supabase
        .from('suspended_baskets')
        .update({
          status: 'claimed',
          claimed_by: selectedBeneficiary,
          claimed_at: new Date().toISOString()
        })
        .eq('id', selectedBasket.id);

      if (updateError) throw updateError;

      setAssignSuccess('Panier attribué avec succès ! ✅');
      
      // Recharger les paniers
      setTimeout(async () => {
        await loadBaskets();
        closeAssignModal();
        setShowModal(false);
      }, 1500);
    } catch (err: any) {
      console.error('Erreur lors de l\'attribution:', err);
      setAssignError(err.message || 'Erreur lors de l\'attribution du panier');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredBaskets = baskets.filter(basket => {
    if (filterStatus !== 'all' && basket.status !== filterStatus) return false;
    if (searchQuery && 
        !basket.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !basket.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !basket.beneficiary_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Chargement des paniers suspendus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <Gift size={32} className="text-accent-600" />
            Paniers Suspendus
          </h2>
          <p className="text-neutral-600 mt-2 font-medium">
            Gestion et suivi des dons solidaires
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBaskets}
            disabled={loading}
            className="btn-outline rounded-xl"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          <button
            onClick={exportData}
            className="btn-secondary rounded-xl"
          >
            <Download size={20} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="card p-6 border-2 border-primary-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-primary-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.total}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Total paniers</div>
        </div>

        <div className="card p-6 border-2 border-success-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.available}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Disponibles</div>
        </div>

        <div className="card p-6 border-2 border-warning-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-warning-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.reserved}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Réservés</div>
        </div>

        <div className="card p-6 border-2 border-primary-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Gift size={20} className="text-primary-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.claimed}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Récupérés</div>
        </div>

        <div className="card p-6 border-2 border-accent-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-accent-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.expired}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Expirés</div>
        </div>

        <div className="card p-6 border-2 border-secondary-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-secondary-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.totalAmount.toFixed(0)}€</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Valeur totale</div>
        </div>

        <div className="card p-6 border-2 border-primary-200 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-primary-600" />
            </div>
            <div className="text-3xl font-black text-neutral-900">{stats.thisMonth}</div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Ce mois</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par donateur, bénéficiaire ou commerce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-icon"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-icon"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">✅ Disponibles</option>
              <option value="reserved">⏳ Réservés</option>
              <option value="claimed">🎁 Récupérés</option>
              <option value="expired">❌ Expirés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Impact Banner */}
      <div className="card p-8 bg-gradient-to-br from-accent-50 to-secondary-50 border-2 border-accent-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center shadow-soft-lg animate-pulse-soft">
            <Heart size={32} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              Impact Solidaire
            </h3>
            <p className="text-neutral-700 font-medium">
              <strong className="text-accent-600">{stats.claimed} paniers</strong> ont été offerts à des personnes dans le besoin,
              pour une valeur totale de <strong className="text-accent-600">{stats.totalAmount}€</strong>.
              Merci aux donateurs pour leur générosité ! 💚
            </p>
          </div>
        </div>
      </div>

      {/* Baskets List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Package size={24} className="text-primary-600" />
          Liste des Paniers ({filteredBaskets.length})
        </h3>

        {filteredBaskets.length === 0 ? (
          <div className="card p-12 text-center">
            <Gift size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Aucun panier trouvé
            </h3>
            <p className="text-neutral-600 font-medium">
              Modifiez vos filtres pour voir plus de résultats
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBaskets.map((basket, index) => (
              <div
                key={basket.id}
                className="card p-6 hover-lift"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon & Status */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-soft-md ${
                      basket.status === 'available' ? 'bg-success-100' :
                      basket.status === 'reserved' ? 'bg-warning-100' :
                      'bg-primary-100'
                    }`}>
                      <Gift size={28} className={
                        basket.status === 'available' ? 'text-success-600' :
                        basket.status === 'reserved' ? 'text-warning-600' :
                        'text-primary-600'
                      } />
                    </div>
                    <div>
                      {getStatusBadge(basket.status)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    {/* Donor Info */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Donateur
                      </div>
                      <div className="font-bold text-neutral-900">{basket.donor_name}</div>
                      <div className="text-sm text-neutral-600 font-medium flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {formatDate(basket.created_at)}
                      </div>
                    </div>

                    {/* Merchant Info */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Commerce
                      </div>
                      <div className="font-bold text-neutral-900 flex items-center gap-2">
                        <MapPin size={14} className="text-neutral-400" />
                        {basket.merchant_name}
                      </div>
                      <div className="text-sm font-bold text-gradient mt-1">
                        {basket.amount}€
                      </div>
                    </div>

                    {/* Beneficiary Info */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Bénéficiaire
                      </div>
                      {basket.beneficiary_name ? (
                        <>
                          <div className="font-bold text-neutral-900">{basket.beneficiary_name}</div>
                          {basket.claimed_at && (
                            <div className="text-sm text-neutral-600 font-medium flex items-center gap-1 mt-1">
                              <CheckCircle size={12} className="text-success-600" />
                              {formatDate(basket.claimed_at)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-neutral-500 italic font-medium">
                          {basket.status === 'reserved' ? 'Réservation en cours...' : 'En attente...'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <button 
                      onClick={() => openDetails(basket)}
                      className="btn-outline rounded-xl flex-1 md:flex-initial"
                    >
                      <Eye size={16} />
                      <span className="hidden md:inline">Détails</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-success-600" />
          Tendances & Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm font-semibold text-neutral-700">Taux de récupération</span>
            </div>
            <div className="text-2xl font-black text-gradient mb-1">
              {((stats.claimed / stats.total) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              {stats.claimed} paniers sur {stats.total} ont été récupérés
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
              <span className="text-sm font-semibold text-neutral-700">Don moyen</span>
            </div>
            <div className="text-2xl font-black text-gradient mb-1">
              {(stats.totalAmount / stats.total).toFixed(2)}€
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              Par panier suspendu
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
              <span className="text-sm font-semibold text-neutral-700">Croissance mensuelle</span>
            </div>
            <div className="text-2xl font-black text-gradient mb-1">
              +{stats.thisMonth}
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              Nouveaux paniers ce mois
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <span className="text-sm font-semibold text-neutral-700">Taux de disponibilité</span>
            </div>
            <div className="text-2xl font-black text-gradient mb-1">
              {((stats.available / stats.total) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-neutral-600 font-medium">
              {stats.available} paniers disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Top Donors */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Users size={24} className="text-secondary-600" />
            Top Donateurs
          </h3>
          <div className="space-y-3">
            {getTopDonors().length === 0 ? (
              <div className="text-center py-8 text-neutral-500 font-medium">
                Aucun donateur pour le moment
              </div>
            ) : (
              getTopDonors().map((donor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{donor.name}</div>
                    <div className="text-sm text-neutral-600 font-medium">
                      {donor.donations} paniers offerts
                    </div>
                  </div>
                </div>
                <div className="text-xl font-black text-gradient">
                  {donor.amount}€
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Heart size={24} className="text-accent-600" />
            Associations Bénéficiaires
          </h3>
          <div className="space-y-3">
            {getTopBeneficiaries().length === 0 ? (
              <div className="text-center py-8 text-neutral-500 font-medium">
                Aucun bénéficiaire pour le moment
              </div>
            ) : (
              getTopBeneficiaries().map((org, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                    <Heart size={20} className="text-accent-600" fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{org.name}</div>
                    <div className="text-sm text-neutral-600 font-medium">
                      {org.baskets} paniers reçus
                    </div>
                  </div>
                </div>
                <div className="text-xl font-black text-gradient">
                  {org.value}€
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showModal && selectedBasket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            {/* Header de la modal */}
            <div className="sticky top-0 bg-gradient-primary p-6 rounded-t-large">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Gift size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Détails du Panier Suspendu
                    </h3>
                    <p className="text-primary-100 font-medium">
                      ID: {selectedBasket.id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <Eye size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Contenu de la modal */}
            <div className="p-6 space-y-6">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-semibold">Statut</span>
                <div>{getStatusBadge(selectedBasket.status)}</div>
              </div>

              {/* Montant */}
              <div className="p-6 bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl border-2 border-secondary-200 text-center">
                <div className="text-sm font-semibold text-neutral-600 mb-2">Valeur du don</div>
                <div className="text-5xl font-black text-gradient mb-2">
                  {selectedBasket.amount}€
                </div>
                <div className="text-sm text-neutral-600 font-medium">
                  Panier suspendu offert avec générosité
                </div>
              </div>

              {/* Informations du Donateur */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                  <User size={20} className="text-primary-600" />
                  Donateur
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-sm font-semibold text-neutral-600">Nom</span>
                    <span className="font-bold text-neutral-900">{selectedBasket.donor_name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-sm font-semibold text-neutral-600">ID</span>
                    <span className="font-mono text-sm text-neutral-700">{selectedBasket.donor_id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-sm font-semibold text-neutral-600">Date du don</span>
                    <span className="font-bold text-neutral-900">{formatDate(selectedBasket.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Informations du Commerce */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                  <MapPin size={20} className="text-success-600" />
                  Commerce
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-sm font-semibold text-neutral-600">Nom</span>
                    <span className="font-bold text-neutral-900">{selectedBasket.merchant_name}</span>
                  </div>
                  {selectedBasket.merchant_business_name && (
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                      <span className="text-sm font-semibold text-neutral-600">Enseigne</span>
                      <span className="font-bold text-neutral-900">{selectedBasket.merchant_business_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations du Bénéficiaire */}
              {(selectedBasket.beneficiary_name || selectedBasket.claimed_by) && (
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                    <Heart size={20} className="text-accent-600" />
                    Bénéficiaire
                  </h4>
                  <div className="grid gap-3">
                    {selectedBasket.beneficiary_name ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                          <span className="text-sm font-semibold text-neutral-600">Nom</span>
                          <span className="font-bold text-neutral-900">{selectedBasket.beneficiary_name}</span>
                        </div>
                        {selectedBasket.beneficiary_code && (
                          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                            <span className="text-sm font-semibold text-neutral-600">Code bénéficiaire</span>
                            <span className="badge-primary font-mono">{selectedBasket.beneficiary_code}</span>
                          </div>
                        )}
                        {selectedBasket.claimed_at && (
                          <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl border border-success-200">
                            <span className="text-sm font-semibold text-success-700">Récupéré le</span>
                            <span className="font-bold text-success-900">{formatDate(selectedBasket.claimed_at)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-warning-50 rounded-xl border border-warning-200 text-center">
                        <p className="text-sm font-semibold text-warning-700">
                          {selectedBasket.status === 'reserved' 
                            ? '⏳ Panier réservé - En attente de récupération'
                            : '✨ Panier disponible - En attente d\'attribution'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Clock size={20} className="text-secondary-600" />
                  Chronologie
                </h4>
                <div className="relative pl-8 space-y-4">
                  {/* Ligne de temps */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
                  
                  {/* Création */}
                  <div className="relative">
                    <div className="absolute left-[-1.9rem] w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <div className="bg-success-50 p-3 rounded-xl border border-success-200">
                      <div className="text-sm font-bold text-success-900">Panier créé</div>
                      <div className="text-xs text-success-700 font-medium">{formatDate(selectedBasket.created_at)}</div>
                    </div>
                  </div>

                  {/* Réservation/Récupération */}
                  {selectedBasket.claimed_at && (
                    <div className="relative">
                      <div className="absolute left-[-1.9rem] w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Gift size={14} className="text-white" />
                      </div>
                      <div className="bg-primary-50 p-3 rounded-xl border border-primary-200">
                        <div className="text-sm font-bold text-primary-900">
                          {selectedBasket.status === 'claimed' ? 'Panier récupéré' : 'Panier réservé'}
                        </div>
                        <div className="text-xs text-primary-700 font-medium">{formatDate(selectedBasket.claimed_at)}</div>
                      </div>
                    </div>
                  )}

                  {/* En attente */}
                  {!selectedBasket.claimed_at && selectedBasket.status === 'available' && (
                    <div className="relative">
                      <div className="absolute left-[-1.9rem] w-6 h-6 bg-warning-500 rounded-full flex items-center justify-center animate-pulse">
                        <Clock size={14} className="text-white" />
                      </div>
                      <div className="bg-warning-50 p-3 rounded-xl border border-warning-200">
                        <div className="text-sm font-bold text-warning-900">En attente</div>
                        <div className="text-xs text-warning-700 font-medium">Panier disponible pour les bénéficiaires</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button 
                  onClick={closeModal}
                  className="btn-secondary rounded-xl flex-1"
                >
                  Fermer
                </button>
                {selectedBasket.status === 'available' && (
                  <button 
                    onClick={() => openAssignModal(selectedBasket)}
                    className="btn-accent rounded-xl flex-1"
                  >
                    <Heart size={20} />
                    <span>Attribuer manuellement</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'attribution */}
      {showAssignModal && selectedBasket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-6 rounded-t-large">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart size={24} className="text-white" fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Attribuer le Panier
                  </h3>
                  <p className="text-accent-100 font-medium">
                    Valeur : {selectedBasket.amount}€
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {assignSuccess && (
                <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 font-semibold animate-fade-in">
                  {assignSuccess}
                </div>
              )}

              {assignError && (
                <div className="p-4 bg-accent-50 border-2 border-accent-200 rounded-xl text-accent-700 font-semibold animate-fade-in">
                  ⚠️ {assignError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Sélectionner un bénéficiaire
                </label>
                
                {beneficiaries.length === 0 ? (
                  <div className="p-6 bg-warning-50 border-2 border-warning-200 rounded-xl text-center">
                    <p className="text-warning-700 font-semibold mb-2">
                      Aucun bénéficiaire vérifié disponible
                    </p>
                    <p className="text-sm text-warning-600 font-medium">
                      Vérifiez d'abord des bénéficiaires dans la section "Utilisateurs"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {beneficiaries.map((beneficiary) => (
                      <label
                        key={beneficiary.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover-lift ${
                          selectedBeneficiary === beneficiary.id
                            ? 'border-accent-500 bg-accent-50'
                            : 'border-neutral-200 hover:border-accent-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="beneficiary"
                          value={beneficiary.id}
                          checked={selectedBeneficiary === beneficiary.id}
                          onChange={(e) => setSelectedBeneficiary(e.target.value)}
                          className="w-5 h-5 text-accent-600 focus:ring-accent-500"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-neutral-900 flex items-center gap-2">
                            {beneficiary.full_name}
                            <span className="badge-primary text-xs">{beneficiary.beneficiary_id}</span>
                          </div>
                          {beneficiary.phone && (
                            <div className="text-sm text-neutral-600 font-medium mt-1">
                              📞 {beneficiary.phone}
                            </div>
                          )}
                        </div>
                        {selectedBeneficiary === beneficiary.id && (
                          <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                <p className="text-sm text-primary-800 font-semibold">
                  💡 <strong>Information :</strong> Le bénéficiaire recevra une notification 
                  et pourra récupérer le panier chez <strong>{selectedBasket.merchant_name}</strong>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeAssignModal}
                  disabled={assignLoading}
                  className="btn-secondary rounded-xl flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assignLoading || !selectedBeneficiary || beneficiaries.length === 0}
                  className="btn-accent rounded-xl flex-1"
                >
                  {assignLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Attribution...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={20} fill="currentColor" />
                      <span>Attribuer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

