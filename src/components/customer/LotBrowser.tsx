// Imports externes
import { useState } from 'react';
import { Package, Filter, X, Zap, Euro } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useLots } from '../../hooks/useLots';
import { useAdvancedFilters } from '../../hooks/useAdvancedFilters';
import { getCategoryLabel } from '../../utils/helpers';
import {
  LotCard,
  ReservationModal,
  LotDetailsModal,
  MerchantLotsModal,
  FilterSidebar,
  InlineSpinner,
} from './components';
import type { AdvancedFilters } from './components';

// Imports types
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
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
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [reservationMode, setReservationMode] = useState<'reserve' | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMerchantLotsModal, setShowMerchantLotsModal] = useState(false);
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

  const handleReserveFromDetails = () => {
    setShowDetailsModal(false);
    setReservationMode('reserve');
  };

  const handleConfirmReservation = async (quantity: number) => {
    if (!selectedLot || !profile) return;

    const pin = await reserveLot(selectedLot, quantity, profile.id, false);
    alert(`Réservation confirmée! Code PIN: ${pin}`);
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

  const handleMerchantClick = () => {
    if (selectedLot) {
      setShowDetailsModal(false);
      setShowMerchantLotsModal(true);
    }
  };

  const handleCloseMerchantModal = () => {
    setShowMerchantLotsModal(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
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
      {/* Sidebar de filtres */}
      <FilterSidebar
        filters={filters}
        onApplyFilters={setFilters}
        onReset={handleResetFilters}
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
      />

      {/* Contenu principal avec margin pour la sidebar */}
      <div className="lg:ml-80">
        <div className="max-w-12xl mx-auto px-6 py-6">
        {/* Barre de filtres mobile + résultats */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowFilterSidebar(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white text-black rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all font-medium group"
          >
            <Filter className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
            <span className="group-hover:text-primary-600 transition-colors">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full text-xs font-bold shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>

        </div>

        {/* Badges filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-black rounded-full text-sm font-medium">
                <Package className="w-3 h-3" />
                {getCategoryLabel(filters.category)}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.onlyUrgent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-black rounded-full text-sm font-medium">
                <Zap className="w-3 h-3" />
                Urgents uniquement
                <button
                  onClick={() => setFilters({ ...filters, onlyUrgent: false })}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.minPrice > 0 || filters.maxPrice < 100) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-black rounded-full text-sm font-medium">
                <Euro className="w-3 h-3" />
                {filters.minPrice}€ - {filters.maxPrice}€
                <button
                  onClick={() => setFilters({ ...filters, minPrice: 0, maxPrice: 100 })}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minQuantity > 1 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-black rounded-full text-sm font-medium">
                <Package className="w-3 h-3" />
                Min. {filters.minQuantity} unités
                <button
                  onClick={() => setFilters({ ...filters, minQuantity: 1 })}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Grille de lots - Mobile: 1 colonne, Desktop: grille responsive */}
        {filteredLots.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
              <Package size={64} className="text-gray-300" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold text-black mb-3">
              Aucun panier trouvé 🔍
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Pas de panique ! Essayez d'ajuster vos filtres ou revenez un peu plus tard. 
              De nouveaux paniers sont ajoutés régulièrement ! ⏰
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid gap-3
            /* Mobile : 1 lot par ligne (pleine largeur) */
            grid-cols-1
            /* Petits écrans : 2 colonnes */
            sm:grid-cols-2
            /* Tablettes : 2-3 colonnes */
            md:grid-cols-2
            /* Desktop avec sidebar : 3 colonnes */
            lg:grid-cols-3
            /* Large desktop : 4 colonnes */
            xl:grid-cols-4
            /* Extra large : 5 colonnes */
            2xl:grid-cols-3">
            {filteredLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onReserve={handleReserveLot}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Modales */}

        {selectedLot && showDetailsModal && (
          <LotDetailsModal
            lot={selectedLot}
            onClose={handleCloseDetailsModal}
            onReserve={handleReserveFromDetails}
            onMerchantClick={handleMerchantClick}
          />
        )}

        {showMerchantLotsModal && selectedLot && (
          <MerchantLotsModal
            merchantId={selectedLot.merchant_id}
            merchantName={selectedLot.profiles.business_name}
            merchantAddress={selectedLot.profiles.business_address}
            merchantLogoUrl={selectedLot.profiles.business_logo_url}
            onClose={handleCloseMerchantModal}
            onLotSelect={handleViewDetails}
            onReserve={handleReserveLot}
          />
        )}

        {selectedLot && reservationMode === 'reserve' && (
          <ReservationModal
            lot={selectedLot}
            onClose={handleCloseModal}
            onConfirm={handleConfirmReservation}
          />
        )}
        </div>
      </div>
    </div>
  );
};
