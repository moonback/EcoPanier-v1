import { useState, useEffect } from 'react';
import { Heart, AlertCircle, MapPin } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { suspendedBasketService, type SuspendedBasketWithDetails } from '../../utils/suspendedBasketService';
import { SuspendedBasketCard } from '../shared/SuspendedBasketCard';
import { formatCurrency } from '../../utils/helpers';

/**
 * Composant pour afficher les paniers suspendus disponibles pour les bénéficiaires
 */
export function AvailableSuspendedBaskets() {
  // Hooks
  const { user } = useAuthStore();

  // État local
  const [baskets, setBaskets] = useState<SuspendedBasketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Charger les paniers disponibles
  useEffect(() => {
    const loadBaskets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await suspendedBasketService.getAvailableBaskets();
        setBaskets(data);
      } catch (err) {
        console.error('Erreur lors du chargement des paniers:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les paniers disponibles');
      } finally {
        setLoading(false);
      }
    };

    loadBaskets();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadBaskets, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handler pour récupérer un panier
  const handleClaim = async (basketId: string) => {
    if (!user?.id) {
      alert('Vous devez être connecté');
      return;
    }

    setClaimingId(basketId);
    try {
      await suspendedBasketService.claimBasket(basketId, user.id);
      
      // Rafraîchir la liste
      const data = await suspendedBasketService.getAvailableBaskets();
      setBaskets(data);
      
      // Afficher un message de succès
      alert('Panier récupéré avec succès ! Vous pouvez le retirer chez le commerçant.');
    } catch (err) {
      console.error('Erreur lors de la récupération:', err);
      alert(err instanceof Error ? err.message : 'Impossible de récupérer ce panier');
    } finally {
      setClaimingId(null);
    }
  };

  // Calculer le total disponible
  const totalAvailable = baskets.reduce((sum, basket) => sum + basket.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des paniers suspendus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations */}
      <div className="bg-gradient-to-br from-accent-50 to-pink-50 rounded-2xl p-6 border-2 border-accent-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Paniers suspendus disponibles</h2>
            <p className="text-sm text-gray-600 mt-1">Offerts par la communauté</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Paniers disponibles</p>
            <p className="text-2xl font-black text-green-600">{baskets.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Valeur totale</p>
            <p className="text-2xl font-black text-accent-600">{formatCurrency(totalAvailable)}</p>
          </div>
        </div>

        {/* Message d'information */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Comment ça marche ?
              </p>
              <p className="text-xs text-blue-800">
                Les paniers suspendus sont offerts par des clients généreux. Vous pouvez en récupérer un gratuitement chez le commerçant indiqué. Présentez-vous simplement au commerce avec votre identifiant bénéficiaire.
              </p>
            </div>
          </div>
        </div>
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
      ) : baskets.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={36} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aucun panier suspendu disponible
          </h3>
          <p className="text-gray-600">
            Il n'y a actuellement aucun panier suspendu disponible. Revenez plus tard pour voir les nouvelles offres de la communauté.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {baskets.map((basket) => (
            <SuspendedBasketCard
              key={basket.id}
              basket={basket}
              variant="available"
              onClaim={handleClaim}
              claiming={claimingId === basket.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

