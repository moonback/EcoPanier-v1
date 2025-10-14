// Imports externes
import { useState, useEffect } from 'react';
import { Package, User, Clock, Key, MapPin, ShoppingCart, ClipboardList } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// Imports types
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'];
  profiles: {
    full_name: string;
    phone: string;
  };
};

/**
 * Composant pour afficher les réservations des lots d'un commerçant
 * Permet de suivre toutes les réservations avec détails client et statut
 */
export const MerchantReservations = () => {
  // État local
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Effets
  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const fetchReservations = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          lots!inner(
            *,
            merchant_id
          ),
          profiles!reservations_user_id_fkey(
            full_name,
            phone
          )
        `)
        .eq('lots.merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les styles selon le statut
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-gradient-to-br from-warning-50 to-white',
          badge: 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300',
          label: '⏳ En attente',
          emoji: '⏰',
        };
      case 'confirmed':
        return {
          bg: 'bg-gradient-to-br from-primary-50 to-white',
          badge: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border-primary-300',
          label: '✓ Confirmé',
          emoji: '✅',
        };
      case 'completed':
        return {
          bg: 'bg-gradient-to-br from-success-50 to-white',
          badge: 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300',
          label: '✅ Récupéré',
          emoji: '🎉',
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-white',
          badge: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
          label: '❌ Annulé',
          emoji: '🚫',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-white',
          badge: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
          label: status,
          emoji: '❓',
        };
    }
  };

  // Filtrer les réservations
  const filteredReservations = reservations.filter((reservation) => {
    if (filter === 'all') return true;
    return reservation.status === filter;
  });

  // Statistiques rapides
  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-full mb-6">
          <Package size={64} className="text-secondary-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Vos commandes apparaîtront ici 📋
        </h3>
        <p className="text-gray-600 font-light mb-6 max-w-md mx-auto leading-relaxed">
          Créez vos premiers paniers d'invendus et commencez à valoriser vos produits 
          tout en réduisant le gaspillage ! 🌱
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl font-semibold hover:from-secondary-700 hover:to-secondary-800 transition-all shadow-lg"
        >
          Créer mon premier panier
        </button>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-md">
            <ClipboardList className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">
              Suivi des Commandes
            </h2>
            <p className="text-sm text-gray-600">Gérez vos réservations en temps réel 📊</p>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border-2 border-primary-100 shadow-sm">
            <p className="text-xs text-gray-600 font-semibold mb-1">📦 Total</p>
            <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-warning-50 to-white rounded-xl p-4 border-2 border-warning-100 shadow-sm">
            <p className="text-xs text-gray-600 font-semibold mb-1">⏳ En attente</p>
            <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-success-50 to-white rounded-xl p-4 border-2 border-success-100 shadow-sm">
            <p className="text-xs text-gray-600 font-semibold mb-1">✅ Récupérés</p>
            <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600 font-semibold mb-1">❌ Annulés</p>
            <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
              filter === 'all'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
            }`}
          >
            📦 Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-warning-600 to-warning-700 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-warning-300'
            }`}
          >
            ⏳ En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-success-300'
            }`}
          >
            ✅ Récupérés ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
              filter === 'cancelled'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            ❌ Annulés ({stats.cancelled})
          </button>
        </div>
      </div>

      {/* Liste des réservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReservations.map((reservation) => {
          const statusStyles = getStatusStyles(reservation.status);

          return (
            <div
              key={reservation.id}
              className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-xl transition-all group"
            >
              <div className={`p-6 ${statusStyles.bg}`}>
                {/* En-tête avec statut */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-black flex-1 pr-2 group-hover:text-secondary-600 transition-colors">
                    {reservation.lots.title}
                  </h3>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm ${statusStyles.badge}`}
                  >
                    {statusStyles.label}
                  </span>
                </div>

                {/* Informations client */}
                <div className="space-y-3 text-sm text-gray-700 font-light mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} strokeWidth={1.5} />
                    <span>{reservation.profiles.full_name}</span>
                  </div>
                  {reservation.profiles.phone && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} strokeWidth={1.5} />
                      <span>{reservation.profiles.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} strokeWidth={1.5} />
                    <span>{formatDateTime(reservation.lots.pickup_start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} strokeWidth={1.5} />
                    <span>Quantité: {reservation.quantity}</span>
                  </div>
                </div>

                {/* Code PIN */}
                <div className="mb-4 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Key size={18} strokeWidth={2} className="text-gray-700" />
                    </div>
                    <span className="font-mono text-2xl font-bold text-black tracking-wider">
                      {reservation.pickup_pin}
                    </span>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">Code PIN de retrait</p>
                </div>

                {/* Badge panier suspendu */}
                {reservation.is_donation && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-accent-50 to-pink-50 rounded-xl border-2 border-accent-200">
                    <p className="text-xs text-accent-700 font-semibold text-center flex items-center justify-center gap-2">
                      <span className="text-lg">❤️</span>
                      <span>Panier Solidaire (Don généreux)</span>
                    </p>
                  </div>
                )}

                {/* Prix total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-light">Total</span>
                    <span className="text-lg font-bold text-black">
                      {formatCurrency(reservation.total_price)}
                    </span>
                  </div>
                </div>

                {/* Date de réservation */}
                <div className="mt-2 text-xs text-gray-500 text-center font-light">
                  Réservé le {formatDateTime(reservation.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat après filtrage */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
            <Package size={64} className="text-gray-300" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">
            Aucune commande trouvée 🔍
          </h3>
          <p className="text-gray-600 font-light">
            Aucune réservation ne correspond au filtre "{filter === 'all' ? 'Tous' : filter === 'pending' ? 'En attente' : filter === 'completed' ? 'Récupérés' : 'Annulés'}"
          </p>
        </div>
      )}
    </div>
  );
};

