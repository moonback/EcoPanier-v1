// Imports externes
import { useState, useEffect } from 'react';
import { Package, User, Clock, Key, MapPin, ShoppingCart, AlertCircle } from 'lucide-react';

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
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          label: 'En attente',
        };
      case 'confirmed':
        return {
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          label: 'Confirmé',
        };
      case 'completed':
        return {
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-700 border-green-200',
          label: 'Récupéré',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'Annulé',
        };
      default:
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          label: status,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Package size={64} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Aucune réservation pour le moment
        </h3>
        <p className="text-gray-600">
          Les réservations de vos lots apparaîtront ici.
        </p>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Suivi des Réservations
        </h2>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-blue-600 mb-1">En attente</p>
            <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <p className="text-sm text-green-600 mb-1">Récupérés</p>
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Annulés</p>
            <p className="text-2xl font-bold text-gray-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Récupérés ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'cancelled'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annulés ({stats.cancelled})
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
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className={`p-5 ${statusStyles.bg}`}>
                {/* En-tête avec statut */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-800 flex-1 pr-2">
                    {reservation.lots.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusStyles.badge} whitespace-nowrap`}
                  >
                    {statusStyles.label}
                  </span>
                </div>

                {/* Informations client */}
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="font-medium">{reservation.profiles.full_name}</span>
                  </div>
                  {reservation.profiles.phone && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                      <span>{reservation.profiles.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500 flex-shrink-0" />
                    <span>{formatDateTime(reservation.lots.pickup_start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-gray-500 flex-shrink-0" />
                    <span>Quantité: {reservation.quantity}</span>
                  </div>
                </div>

                {/* Code PIN */}
                <div className="mb-4 p-3 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center gap-2 justify-center">
                    <Key size={18} className="text-primary-600" />
                    <span className="font-mono text-lg font-bold text-primary-700">
                      PIN: {reservation.pickup_pin}
                    </span>
                  </div>
                </div>

                {/* Badge panier suspendu */}
                {reservation.is_donation && (
                  <div className="mb-4 p-2 bg-pink-100 rounded-lg border border-pink-200">
                    <p className="text-xs text-pink-700 font-semibold text-center flex items-center justify-center gap-1">
                      <AlertCircle size={14} />
                      Panier Suspendu (Don solidaire)
                    </p>
                  </div>
                )}

                {/* Prix total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-lg font-bold text-gray-800">
                      {formatCurrency(reservation.total_price)}
                    </span>
                  </div>
                </div>

                {/* Date de réservation */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Réservé le {formatDateTime(reservation.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat après filtrage */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-12 px-4">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Aucune réservation avec le filtre sélectionné.
          </p>
        </div>
      )}
    </div>
  );
};

