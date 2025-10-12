// Imports externes
import { useState } from 'react';
import { Package, Filter, X, Zap, Euro } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useLots } from '../../hooks/useLots';
import { useAdvancedFilters } from '../../hooks/useAdvancedFilters';
import {
  LotCard,
  ReservationModal,
  DonationModal,
  LotDetailsModal,
  AdvancedFilterModal,
  EmptyState,
  InlineSpinner,
} from './components';
import type { AdvancedFilters } from './components';

// Imports types
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

const DEFAULT_FILTERS: AdvancedFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 100,
  onlyUrgent: false,
  minQuantity: 1,
  sortBy: 'urgent'
};

/**
 * Composant principal pour parcourir et réserver des lots
 * Gère l'affichage des lots, le filtrage avancé et la réservation
 */
export const LotBrowser = () => {
  // État local
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [reservationMode, setReservationMode] = useState<'reserve' | 'donate' | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { lots, loading, error, reserveLot } = useLots(''); // Charger tous les lots
  
  // Appliquer les filtres et tri côté client
  const filteredLots = useAdvancedFilters(lots, filters);

  // Handlers
  const handleViewDetails = (lot: Lot) => {
    setSelectedLot(lot);
    setShowDetailsModal(true);
  };

  const handleReserveLot = (lot: Lot) => {
    setSelectedLot(lot);
    setShowDetailsModal(false);
    setReservationMode('reserve');
  };

  const handleDonateLot = (lot: Lot) => {
    setSelectedLot(lot);
    setShowDetailsModal(false);
    setReservationMode('donate');
  };

  const handleReserveFromDetails = () => {
    setShowDetailsModal(false);
    setReservationMode('reserve');
  };

  const handleDonateFromDetails = () => {
    setShowDetailsModal(false);
    setReservationMode('donate');
  };

  const handleConfirmReservation = async (quantity: number) => {
    if (!selectedLot || !profile) return;

    const pin = await reserveLot(selectedLot, quantity, profile.id, false);
    alert(`Réservation confirmée! Code PIN: ${pin}`);
    setSelectedLot(null);
    setReservationMode(null);
  };

  const handleConfirmDonation = async (quantity: number) => {
    if (!selectedLot || !profile) return;

    await reserveLot(selectedLot, quantity, profile.id, true);
    alert('Panier suspendu créé avec succès!');
    setSelectedLot(null);
    setReservationMode(null);
  };

  const handleCloseModal = () => {
    setSelectedLot(null);
    setReservationMode(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLot(null);
  };

  // Early returns (conditions de sortie)
  if (loading) return <InlineSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  // Calculer les filtres actifs
  const activeFiltersCount = 
    (filters.category ? 1 : 0) +
    (filters.onlyUrgent ? 1 : 0) +
    (filters.minQuantity > 1 ? 1 : 0) +
    ((filters.minPrice > 0 || filters.maxPrice < 100) ? 1 : 0);

  // Render principal
  return (
    <div>
      {/* Barre de filtres améliorée */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white text-neutral-700 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-neutral-200 hover:border-primary-300 font-semibold"
        >
          <Filter className="w-5 h-5 text-primary-600" />
          <span>Filtres avancés</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-primary-500 text-white rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Résultats */}
          <div className="px-4 py-3 bg-primary-50 text-primary-700 rounded-xl border-2 border-primary-200 font-semibold text-sm">
            {filteredLots.length} lot{filteredLots.length > 1 ? 's' : ''}
          </div>

          {/* Réinitialiser */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="flex items-center gap-1.5 px-3 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all text-sm font-semibold"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Badges filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              <Package className="w-3 h-3" />
              {filters.category}
              <button
                onClick={() => setFilters({ ...filters, category: '' })}
                className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.onlyUrgent && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold">
              <Zap className="w-3 h-3" />
              Urgents uniquement
              <button
                onClick={() => setFilters({ ...filters, onlyUrgent: false })}
                className="ml-1 hover:bg-accent-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 100) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
              <Euro className="w-3 h-3" />
              {filters.minPrice}€ - {filters.maxPrice}€
              <button
                onClick={() => setFilters({ ...filters, minPrice: 0, maxPrice: 100 })}
                className="ml-1 hover:bg-secondary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.minQuantity > 1 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-100 text-success-700 rounded-full text-sm font-semibold">
              <Package className="w-3 h-3" />
              Min. {filters.minQuantity} unités
              <button
                onClick={() => setFilters({ ...filters, minQuantity: 1 })}
                className="ml-1 hover:bg-success-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grille de lots - Mobile: 1 colonne, Desktop: grille responsive */}
      {filteredLots.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun lot disponible"
          description="Aucun lot ne correspond à vos critères. Essayez de modifier vos filtres."
        />
      ) : (
        <div className="grid gap-4
          /* Mobile : 1 lot par ligne (pleine largeur) */
          grid-cols-1
          /* Petits écrans : 2 colonnes */
          sm:grid-cols-2
          /* Tablettes : 3 colonnes */
          md:grid-cols-3
          /* Desktop : 4 colonnes */
          lg:grid-cols-4
          /* Large desktop : 5 colonnes */
          xl:grid-cols-5">
          {filteredLots.map((lot) => (
            <LotCard
              key={lot.id}
              lot={lot}
              onReserve={handleReserveLot}
              onDonate={handleDonateLot}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {showFilterModal && (
        <AdvancedFilterModal
          filters={filters}
          onApplyFilters={setFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {selectedLot && showDetailsModal && (
        <LotDetailsModal
          lot={selectedLot}
          onClose={handleCloseDetailsModal}
          onReserve={handleReserveFromDetails}
          onDonate={handleDonateFromDetails}
        />
      )}

      {selectedLot && reservationMode === 'reserve' && (
        <ReservationModal
          lot={selectedLot}
          onClose={handleCloseModal}
          onConfirm={handleConfirmReservation}
        />
      )}

      {selectedLot && reservationMode === 'donate' && (
        <DonationModal
          lot={selectedLot}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDonation}
        />
      )}
    </div>
  );
};
