import { useState, useEffect } from 'react';
import { Heart, Plus, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { suspendedBasketService, type SuspendedBasketWithDetails } from '../../utils/suspendedBasketService';
import { SuspendedBasketCard } from '../shared/SuspendedBasketCard';
import { CreateSuspendedBasketModal } from './components/CreateSuspendedBasketModal';
import { formatCurrency } from '../../utils/helpers';

/**
 * Page pour gérer les paniers suspendus offerts par le client
 * Affiche la liste des paniers offerts avec statistiques
 */
export function SuspendedBasketsPage() {
  // Hooks
  const { user } = useAuthStore();

  // État local
  const [baskets, setBaskets] = useState<SuspendedBasketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');

  // Charger les paniers
  useEffect(() => {
    if (!user?.id) return;

    const loadBaskets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await suspendedBasketService.getBasketsByDonor(user.id);
        setBaskets(data);
      } catch (err) {
        console.error('Erreur lors du chargement des paniers:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger vos paniers suspendus');
      } finally {
        setLoading(false);
      }
    };

    loadBaskets();
  }, [user?.id]);

  // Filtrer les paniers
  const filteredBaskets = baskets.filter((basket) => {
    if (filter === 'all') return true;
    if (filter === 'available') return basket.status === 'available';
    if (filter === 'claimed') return basket.status === 'claimed';
    return true;
  });

  // Calculer les statistiques
  const stats = {
    total: baskets.length,
    available: baskets.filter((b) => b.status === 'available').length,
    claimed: baskets.filter((b) => b.status === 'claimed').length,
    totalAmount: baskets.reduce((sum, b) => sum + b.amount, 0),
    claimedAmount: baskets
      .filter((b) => b.status === 'claimed')
      .reduce((sum, b) => sum + b.amount, 0),
  };

  // Handler pour rafraîchir après création
  const handleBasketCreated = () => {
    if (!user?.id) return;
    suspendedBasketService
      .getBasketsByDonor(user.id)
      .then((data) => {
        setBaskets(data);
      })
      .catch((err) => {
        console.error('Erreur lors du rafraîchissement:', err);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos paniers suspendus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-br from-accent-50 to-pink-50 rounded-2xl p-6 border-2 border-accent-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Mes paniers suspendus</h2>
              <p className="text-sm text-gray-600 mt-1">Votre impact solidaire</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all font-semibold flex items-center gap-2 shadow-md"
          >
            <Plus size={18} />
            Offrir un panier
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total offerts</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Disponibles</p>
            <p className="text-2xl font-black text-green-600">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Récupérés</p>
            <p className="text-2xl font-black text-blue-600">{stats.claimed}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Montant total</p>
            <p className="text-2xl font-black text-accent-600">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'available', 'claimed'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              filter === filterOption
                ? 'bg-accent-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption === 'all' && 'Tous'}
            {filterOption === 'available' && 'Disponibles'}
            {filterOption === 'claimed' && 'Récupérés'}
          </button>
        ))}
      </div>

      {/* Liste des paniers */}
      {error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Erreur</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredBaskets.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={36} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filter === 'all' ? 'Aucun panier suspendu' : 'Aucun panier dans cette catégorie'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? 'Commencez à offrir des paniers suspendus pour aider les personnes dans le besoin.'
              : 'Aucun panier ne correspond à ce filtre.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all font-semibold flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Offrir votre premier panier
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBaskets.map((basket) => (
            <SuspendedBasketCard key={basket.id} basket={basket} variant="donor" />
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateSuspendedBasketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleBasketCreated}
        />
      )}
    </div>
  );
}

