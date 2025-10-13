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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="text-gray-300 mx-auto mb-6" strokeWidth={1} />
        <h3 className="text-xl font-bold text-black mb-2">
          Aucune réservation
        </h3>
        <p className="text-gray-600 font-light">
          Les réservations de vos lots apparaîtront ici
        </p>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-black mb-6">
          Suivi des Réservations
        </h2>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-light mb-1">Total</p>
            <p className="text-2xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-light mb-1">En attente</p>
            <p className="text-2xl font-bold text-black">{stats.pending}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-light mb-1">Récupérés</p>
            <p className="text-2xl font-bold text-black">{stats.completed}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-light mb-1">Annulés</p>
            <p className="text-2xl font-bold text-black">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Récupérés ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'cancelled'
                ? 'bg-black text-white'
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
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              <div className={`p-6 ${statusStyles.bg}`}>
                {/* En-tête avec statut */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-black flex-1 pr-2">
                    {reservation.lots.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.badge}`}
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
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 justify-center">
                    <Key size={18} strokeWidth={1.5} />
                    <span className="font-mono text-lg font-bold text-black">
                      PIN: {reservation.pickup_pin}
                    </span>
                  </div>
                </div>

                {/* Badge panier suspendu */}
                {reservation.is_donation && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-black font-medium text-center flex items-center justify-center gap-1">
                      <AlertCircle size={14} strokeWidth={1.5} />
                      Panier Suspendu (Don solidaire)
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
          <Package size={64} className="text-gray-300 mx-auto mb-6" strokeWidth={1} />
          <p className="text-gray-600 font-light">
            Aucune réservation avec le filtre sélectionné
          </p>
        </div>
      )}
    </div>
  );
};

