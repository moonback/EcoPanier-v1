// Imports externes
import { useState, useMemo } from 'react';
import { Package, Filter, X } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import { confirmReceiptAndPayMerchant } from '../../utils/walletService';
import {
  ReservationCard,
  QRCodeModal,
  SkeletonReservationCard,
  ReservationFilterSidebar,
  DEFAULT_RESERVATION_FILTERS,
} from './components';
import type { ReservationFilters } from './components';

// Imports types
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

/**
 * Composant pour afficher la liste des réservations d'un client
 * Permet de voir les détails, afficher le QR code et annuler une réservation
 */
export const ReservationsList = () => {
  // État local
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    null
  );
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState<ReservationFilters>(DEFAULT_RESERVATION_FILTERS);

  // Hooks (stores, contexts, router)
  const { profile, user } = useAuthStore();
  const { reservations, loading, error, cancelReservation, refetch } = useReservations(
    profile?.id
  );

  // Appliquer les filtres et tri
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filtre par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Filtre par type
    if (filters.type === 'donations') {
      filtered = filtered.filter((r) => r.is_donation === true);
    } else if (filters.type === 'purchases') {
      filtered = filtered.filter((r) => r.is_donation !== true);
    }

    // Filtre par date
    if (filters.dateFilter !== 'all') {
      filtered = filtered.filter((r) => {
        const createdAt = new Date(r.created_at);
        switch (filters.dateFilter) {
          case 'today':
            return isToday(createdAt);
          case 'week':
            return isThisWeek(createdAt);
          case 'month':
            return isThisMonth(createdAt);
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_desc':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'price_asc':
          return (a.total_price || 0) - (b.total_price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reservations, filters]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.status !== 'all' ? 1 : 0) +
      (filters.type !== 'all' ? 1 : 0) +
      (filters.dateFilter !== 'all' ? 1 : 0) +
      (filters.sortBy !== 'date_desc' ? 1 : 0)
    );
  }, [filters]);

  // Handlers
  const handleCancelReservation = async (
    reservationId: string,
    lotId: string,
    quantity: number
  ) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    try {
      await cancelReservation(reservationId, lotId, quantity);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l\'annulation de la réservation'
      );
    }
  };

  const handleConfirmReceipt = async (reservationId: string) => {
    if (!user?.id) {
      alert('Vous devez être connecté pour confirmer la réception');
      return;
    }

    try {
      await confirmReceiptAndPayMerchant(reservationId, user.id);
      // Rafraîchir la liste des réservations
      await refetch();
    } catch (err) {
      throw err; // L'erreur sera gérée par ReservationCard
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_RESERVATION_FILTERS);
  };

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonReservationCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full mb-6">
          <Package size={64} className="text-primary-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Votre premier panier vous attend ! 🎁
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          Vous n'avez pas encore de réservation. Explorez les paniers surprises 
          près de chez vous et faites vos premières économies ! 💰
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
        >
          Découvrir les paniers
        </button>
      </div>
    );
  }

  // Render principal
  return (
    <div>
      {/* Sidebar de filtres */}
      <ReservationFilterSidebar
        filters={filters}
        onApplyFilters={setFilters}
        onReset={handleResetFilters}
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
      />

      {/* Contenu principal avec margin pour la sidebar */}
      <div className="lg:ml-80">
        <div className="w-full px-4 pt-4">
          {/* Header avec bouton filtres */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes Réservations</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''}
                {filteredReservations.length !== reservations.length && ` sur ${reservations.length}`}
              </p>
            </div>
            <button
              onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-md"
            >
              <Filter size={18} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Badges filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
                  <Package className="w-3 h-3" />
                  {filters.status === 'pending' && 'En attente'}
                  {filters.status === 'confirmed' && 'Confirmées'}
                  {filters.status === 'completed' && 'Récupérées'}
                  {filters.status === 'cancelled' && 'Annulées'}
                  <button
                    onClick={() => setFilters({ ...filters, status: 'all' })}
                    className="ml-1 hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.type !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                  {filters.type === 'donations' && '💝 Dons uniquement'}
                  {filters.type === 'purchases' && '💰 Achats uniquement'}
                  <button
                    onClick={() => setFilters({ ...filters, type: 'all' })}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-full text-sm font-medium border border-secondary-200">
                  {filters.dateFilter === 'today' && "📅 Aujourd'hui"}
                  {filters.dateFilter === 'week' && '📅 Cette semaine'}
                  {filters.dateFilter === 'month' && '📅 Ce mois'}
                  <button
                    onClick={() => setFilters({ ...filters, dateFilter: 'all' })}
                    className="ml-1 hover:bg-secondary-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grille de réservations */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-6">
                <Filter size={64} className="text-gray-400" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">
                Aucune réservation trouvée
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                Aucune réservation ne correspond à vos filtres. Essayez de modifier vos critères de recherche.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onShowQRCode={setSelectedReservation}
                  onCancel={handleCancelReservation}
                  onConfirmReceipt={handleConfirmReceipt}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {selectedReservation && profile && (
        <QRCodeModal
          reservation={selectedReservation}
          userId={profile.id}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};
