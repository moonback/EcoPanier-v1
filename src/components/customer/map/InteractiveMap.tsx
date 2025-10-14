import { useState, useEffect, useRef } from 'react';
import { MapRef } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useLots } from '../../../hooks/useLots';
import { ReservationModal } from '../components/ReservationModal';
import { FilterPanel } from './FilterPanel';
import { MapView } from './MapView';
import { MerchantSidebar } from './MerchantSidebar';
import { MerchantLotsView } from './MerchantLotsView';
import { MapControls } from './MapControls';
import { useMerchantsData } from './useMerchantsData';
import type { 
  ViewState, 
  UserLocation, 
  MerchantWithLots, 
  LotBase, 
  LotWithMerchant, 
  MapFilters 
} from './types';
import { MAPBOX_TOKEN, DEFAULT_VIEW_STATE, DEFAULT_FILTERS } from './constants';

export function InteractiveMap() {
  const { profile } = useAuthStore();
  const { reserveLot } = useLots(''); // Hook pour réserver
  const mapRef = useRef<MapRef | null>(null);

  // État de la carte
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // État des commerçants et sélection
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithLots | null>(null);
  const [selectedMerchantForModal, setSelectedMerchantForModal] = useState<MerchantWithLots | null>(null);
  const [selectedLotForReservation, setSelectedLotForReservation] = useState<LotWithMerchant | null>(null);

  // État de l'UI
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  // Charger les commerçants avec le hook personnalisé
  const { merchants, loading, reload } = useMerchantsData(filters, userLocation);

  // Charger la position de l'utilisateur au montage
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewState({
            latitude,
            longitude,
            zoom: 13
          });
        },
        (error) => {
          console.warn('Erreur géolocalisation:', error);
        }
      );
    }
  }, []);

  // Synchroniser le commerçant sélectionné avec les données mises à jour
  useEffect(() => {
    if (selectedMerchantForModal) {
      const updatedMerchant = merchants.find(m => m.id === selectedMerchantForModal.id);
      if (updatedMerchant) {
        setSelectedMerchantForModal(updatedMerchant);
      }
    }
  }, [merchants, selectedMerchantForModal]);

  // Gérer le clic sur un commerçant
  const handleMerchantClick = (merchant: MerchantWithLots) => {
    // Si c'est le même commerçant déjà sélectionné, ouvrir la modal
    if (selectedMerchant?.id === merchant.id) {
      setSelectedMerchantForModal(merchant);
    } else {
      // Sinon, centrer la carte et sélectionner
      if (merchant.latitude && merchant.longitude) {
        mapRef.current?.flyTo({
          center: [merchant.longitude, merchant.latitude],
          zoom: 16,
          duration: 1200,
          padding: { top: 0, bottom: 0, left: 0, right: sidebarOpen ? 400 : 0 }
        });
      }
      setSelectedMerchant(merchant);
    }
  };

  // Gérer la réservation d'un lot
  const handleReserveLot = (lot: LotBase) => {
    const merchantForLot = selectedMerchantForModal;
    
    if (!merchantForLot) return;

    // Créer un lot avec les infos du merchant
    const lotWithMerchant: LotWithMerchant = {
      ...lot,
      profiles: {
        business_name: merchantForLot.business_name || '',
        business_address: merchantForLot.business_address || ''
      }
    };

    // Ouvrir la modal de réservation (garde la vue des lots en arrière-plan)
    setSelectedLotForReservation(lotWithMerchant);
  };

  // Confirmer une réservation
  const handleConfirmReservation = async (quantity: number) => {
    if (!selectedLotForReservation || !profile) return;

    try {
      // Utiliser le hook useLots pour réserver
      const pin = await reserveLot(selectedLotForReservation, quantity, profile.id, false);
      
      // Afficher le code PIN
      alert(`Réservation confirmée ! Code PIN : ${pin}`);
      
      // Fermer la modal de réservation
      setSelectedLotForReservation(null);
      
      // Recharger les données des commerçants (le useEffect synchronisera automatiquement)
      await reload();
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la réservation');
    }
  };

  // Centrer sur l'utilisateur
  const flyToUser = () => {
    if (userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 1200
      });
    }
  };

  // Mettre à jour les filtres
  const handleFiltersChange = (newFilters: Partial<MapFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Vérifier si Mapbox est configuré
  if (!MAPBOX_TOKEN) {
    return (
      <div className="card p-8 text-center bg-gradient-to-br from-accent-50 to-warning-50 border-2 border-accent-200">
        <div className="inline-flex p-6 bg-white rounded-full mb-6">
          <MapPin className="w-12 h-12 text-accent-500" />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Configuration de la carte requise 🗺️
        </h3>
        <p className="text-gray-700 mb-4 leading-relaxed max-w-md mx-auto">
          Pour afficher la carte interactive des commerçants, veuillez configurer votre clé Mapbox.
        </p>
        <code className="inline-block bg-gray-900 text-green-400 px-4 py-2 rounded-lg text-sm font-mono mb-2">
          VITE_MAPBOX_ACCESS_TOKEN
        </code>
        <p className="text-xs text-gray-500 mt-2">
          Fichier : <code className="bg-gray-100 px-2 py-1 rounded">.env</code>
        </p>
      </div>
    );
  }

  // Si un commerçant est sélectionné pour voir ses lots, afficher la vue des lots
  if (selectedMerchantForModal) {
    return (
      <>
        <MerchantLotsView
          merchant={selectedMerchantForModal}
          onBack={() => setSelectedMerchantForModal(null)}
          onReserveLot={handleReserveLot}
        />

        {/* Modal de réservation */}
        {selectedLotForReservation && (
          <ReservationModal
            lot={selectedLotForReservation}
            onClose={() => setSelectedLotForReservation(null)}
            onConfirm={handleConfirmReservation}
          />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 top-[60px] lg:top-[72px]">
      {/* Carte plein écran en arrière-plan */}
      <div className="absolute inset-0">
        <MapView
          viewState={viewState}
          onViewStateChange={setViewState}
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
          merchants={merchants}
          selectedMerchant={selectedMerchant}
          onMerchantClick={handleMerchantClick}
          mapRef={mapRef}
        />
      </div>

      {/* Sidebar à droite */}
      <MerchantSidebar
        merchants={merchants}
        selectedMerchant={selectedMerchant}
        onMerchantClick={handleMerchantClick}
        loading={loading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      {/* Contrôles de la carte */}
      <MapControls
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(true)}
        userLocation={userLocation}
        onCenterUser={flyToUser}
      />

      {/* Popup filtres mobile */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
          isMobile
        />
      )}
    </div>
  );
}

