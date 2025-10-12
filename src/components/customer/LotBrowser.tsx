// Imports externes
import { useState } from 'react';
import { Package, Filter, X, Check } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useLots } from '../../hooks/useLots';
import {
  LotCard,
  ReservationModal,
  DonationModal,
  FilterModal,
  EmptyState,
  InlineSpinner,
} from './components';

// Imports types
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

/**
 * Composant principal pour parcourir et réserver des lots
 * Gère l'affichage des lots, le filtrage par catégorie et la réservation
 */
export const LotBrowser = () => {
  // État local
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [reservationMode, setReservationMode] = useState<'reserve' | 'donate' | null>(null);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { lots, loading, error, reserveLot } = useLots(selectedCategory);

  // Handlers
  const handleReserveLot = (lot: Lot) => {
    setSelectedLot(lot);
    setReservationMode('reserve');
  };

  const handleDonateLot = (lot: Lot) => {
    setSelectedLot(lot);
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

  // Early returns (conditions de sortie)
  if (loading) return <InlineSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  // Render principal
  return (
    <div>
      {/* Barre de filtres */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-primary-300 font-medium text-sm"
        >
          <Filter size={18} />
          <span>Filtrer par catégorie</span>
          {selectedCategory && (
            <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              1
            </span>
          )}
        </button>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
          >
            <X size={16} />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Affichage du filtre actif */}
      {selectedCategory && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
          <Check size={16} className="text-primary-600" />
          <span className="text-sm text-primary-800 font-medium">
            Catégorie : <span className="font-bold">{selectedCategory}</span>
          </span>
        </div>
      )}

      {/* Grille de lots */}
      {lots.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun lot disponible"
          description="Aucun lot ne correspond à vos critères. Essayez de modifier vos filtres."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lots.map((lot) => (
            <LotCard
              key={lot.id}
              lot={lot}
              onReserve={handleReserveLot}
              onDonate={handleDonateLot}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {showFilterModal && (
        <FilterModal
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onClose={() => setShowFilterModal(false)}
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
