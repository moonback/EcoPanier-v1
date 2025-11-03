// Imports externes
import { useState, useEffect } from 'react';
import { Package, User, Clock, Key, MapPin, ShoppingCart, ClipboardList, Eye, EyeOff, Thermometer, AlertTriangle, Image as ImageIcon } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, getCategoryLabel } from '../../utils/helpers';

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
  const [revealedPins, setRevealedPins] = useState<Set<string>>(new Set());

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

  // Handler pour révéler/masquer le PIN
  const togglePinReveal = (reservationId: string) => {
    setRevealedPins((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

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
          className="px-6 py-3 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl font-semibold hover:from-secondary-700 hover:to-secondary-800 transition-all shadow-lg"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredReservations.map((reservation) => {
          const statusStyles = getStatusStyles(reservation.status);
          const isPinRevealed = revealedPins.has(reservation.id);

          // Calcul du pourcentage de remise
          const discountPercent = reservation.lots.original_price > 0
            ? Math.round(((reservation.lots.original_price - reservation.lots.discounted_price) / reservation.lots.original_price) * 100)
            : 0;

          // Formatage des heures de retrait
          const pickupStart = new Date(reservation.lots.pickup_start);
          const pickupEnd = new Date(reservation.lots.pickup_end);
          const pickupTime = `${pickupStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${pickupEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

          return (
            <div
              key={reservation.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className={`p-3 ${statusStyles.bg}`}>
                {/* Image et en-tête avec statut compact */}
                <div className="flex gap-2 mb-2">
                  {/* Image miniature du produit */}
                  {reservation.lots.image_urls && reservation.lots.image_urls.length > 0 ? (
                    <img
                      src={reservation.lots.image_urls[0]}
                      alt={reservation.lots.title}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-gray-900 flex-1 line-clamp-1">
                        {reservation.lots.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap flex-shrink-0 ${statusStyles.badge}`}>
                        {statusStyles.emoji}
                      </span>
                    </div>
                    
                    {/* Catégorie et badges */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] text-gray-600 font-medium">
                        {getCategoryLabel(reservation.lots.category)}
                      </span>
                      {reservation.lots.is_urgent && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold">
                          <AlertTriangle size={8} />
                          Urgent
                        </span>
                      )}
                      {reservation.lots.requires_cold_chain && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                          <Thermometer size={8} />
                          Froid
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Heure de retrait */}
                <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">Retrait :</span>
                  <span className="font-semibold text-gray-900">{pickupTime}</span>
                </div>

                {/* Informations client compactes */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 min-w-0 flex-1">
                      <User size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{reservation.profiles.full_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ShoppingCart size={12} className="text-gray-400" />
                      <span className="font-semibold">{reservation.quantity}</span>
                    </div>
                  </div>
                  {reservation.profiles.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="truncate">{reservation.profiles.phone}</span>
                    </div>
                  )}
                </div>

                {/* Code PIN compact avec bouton révéler */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border border-gray-200">
                    <button
                      onClick={() => togglePinReveal(reservation.id)}
                      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                      title={isPinRevealed ? 'Masquer le PIN' : 'Révéler le PIN'}
                    >
                      {isPinRevealed ? (
                        <EyeOff size={14} className="text-gray-600" />
                      ) : (
                        <Eye size={14} className="text-gray-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {isPinRevealed ? (
                        <div className="flex items-center gap-1.5">
                          <Key size={12} className="text-primary-600 flex-shrink-0" />
                          <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                            {reservation.pickup_pin}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">Cliquez pour révéler le PIN</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prix et badge don compact */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {reservation.is_donation && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded text-[9px] font-bold">
                        <span>❤️</span>
                        <span>Don</span>
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {reservation.total_price === 0 ? (
                    <span className="text-xs font-bold text-gray-500">Gratuit</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(reservation.total_price)}
                    </span>
                  )}
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

