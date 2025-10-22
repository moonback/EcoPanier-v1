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
          badge: 'bg-primary-100 text-primary-700 border-primary-300',
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
          Les commandes réservées par vos clients apparaîtront ici 📋
        </h3>
        <p className="text-gray-600 font-light mb-6 max-w-md mx-auto leading-relaxed">
          Commencez à valoriser vos produits 
          tout en réduisant le gaspillage alimentaire ! 🌱
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-secondary-600 text-white rounded-lg font-semibold hover:bg-secondary-700 hover:shadow-sm transition-all"
        >
          Créer mon premier panier
        </button>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-4 animate-fade-in">
      {/* En-tête compact */}
      <div className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
        
        <div className="relative flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Commandes
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              En temps réel
            </p>
          </div>
        </div>
        
        {/* Statistiques compactes */}
        <div className="relative grid grid-cols-4 gap-2 mb-4">
          <div className="relative bg-primary-50 rounded-lg p-3 border border-primary-200 hover:shadow-md transition-shadow">
            <p className="text-[10px] text-primary-600 font-bold mb-1">Total</p>
            <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
          </div>
          
          <div className="relative bg-warning-50 rounded-lg p-3 border border-warning-200 hover:shadow-md transition-shadow">
            <p className="text-[10px] text-warning-600 font-bold mb-1 flex items-center gap-1">
              <span>En attente</span>
              {stats.pending > 0 && <span className="flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-warning-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-warning-500"></span></span>}
            </p>
            <p className="text-2xl font-bold text-warning-700">{stats.pending}</p>
          </div>
          
          <div className="relative bg-success-50 rounded-lg p-3 border border-success-200 hover:shadow-md transition-shadow">
            <p className="text-[10px] text-success-600 font-bold mb-1">Récupérés</p>
            <p className="text-2xl font-bold text-success-700">{stats.completed}</p>
          </div>
          
          <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-[10px] text-gray-600 font-bold mb-1">Annulés</p>
            <p className="text-2xl font-bold text-gray-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filtres épurés */}
        <div className="relative flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
          </button>
          
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-warning-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats.pending})
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-success-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Récupérés ({stats.completed})
          </button>
          
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'cancelled'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annulés ({stats.cancelled})
          </button>
        </div>
      </div>

      {/* Liste des réservations compacte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.map((reservation) => {
          const statusStyles = getStatusStyles(reservation.status);

          return (
            <div
              key={reservation.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all"
            >
              <div className={`p-4 ${statusStyles.bg}`}>
                {/* En-tête avec statut */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-gray-900 flex-1 pr-2 line-clamp-2">
                    {reservation.lots.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${statusStyles.badge}`}>
                    {statusStyles.label}
                  </span>
                </div>

                {/* Informations compactes */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <User size={14} className="text-gray-400" />
                    <span className="font-medium">{reservation.profiles.full_name}</span>
                  </div>
                  {reservation.profiles.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{reservation.profiles.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>{formatDateTime(reservation.lots.pickup_start)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <ShoppingCart size={14} className="text-gray-400" />
                    <span className="font-medium">Qté: {reservation.quantity}</span>
                  </div>
                </div>

                {/* Code PIN épuré */}
                <div className="mb-3 p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <Key size={16} className="text-primary-400" />
                    <span className="font-mono text-2xl font-bold text-white tracking-widest">
                      {reservation.pickup_pin}
                    </span>
                  </div>
                  <p className="text-[9px] text-center text-gray-500 uppercase tracking-wide">Code PIN</p>
                </div>

                {/* Badge don (si applicable) */}
                {reservation.is_donation && (
                  <div className="mb-3 p-2 bg-pink-50 rounded-lg border border-pink-200">
                    <p className="text-xs text-pink-700 font-bold text-center flex items-center justify-center gap-1.5">
                      <span>❤️</span>
                      <span>Panier Solidaire</span>
                    </p>
                  </div>
                )}

                {/* Prix total compact */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-semibold">Total</span>
                    {reservation.total_price === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-500 text-white rounded text-xs font-bold">
                        <span>❤️</span>
                        <span>Don</span>
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(reservation.total_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date de réservation */}
                <div className="mt-2 text-[10px] text-center text-gray-400">
                  {formatDateTime(reservation.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-sm text-gray-500">
            Filtre : <span className="font-semibold">{filter === 'all' ? 'Tous' : filter === 'pending' ? 'En attente' : filter === 'completed' ? 'Récupérés' : 'Annulés'}</span>
          </p>
        </div>
      )}
    </div>
  );
};

