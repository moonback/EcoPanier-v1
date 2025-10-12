import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMapGL, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl';
import {
  MapPin,
  Store,
  Navigation,
  Filter,
  X,
  Package,
  Euro,
  Zap,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useLots } from '../../hooks/useLots';
import { calculateDistance, formatDistance } from '../../utils/geocodingService';
import { ReservationModal } from './components/ReservationModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../lib/database.types';
import 'mapbox-gl/dist/mapbox-gl.css';

type LotBase = Database['public']['Tables']['lots']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Type pour Lot avec info du merchant (pour ReservationModal)
type LotWithMerchant = LotBase & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

interface MerchantWithLots extends Profile {
  lots: LotBase[];
  distance?: number;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const CATEGORIES = [
  'Tous',
  'Boulangerie-Pâtisserie',
  'Fruits & Légumes',
  'Viande & Poisson',
  'Produits laitiers',
  'Épicerie',
  'Plats préparés',
  'Boissons'
];

export function InteractiveMap() {
  const { profile } = useAuthStore();
  const { reserveLot } = useLots(''); // Hook pour réserver
  const mapRef = useRef<MapRef | null>(null);

  // État
  const [merchants, setMerchants] = useState<MerchantWithLots[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithLots | null>(null);
  const [selectedMerchantForModal, setSelectedMerchantForModal] = useState<MerchantWithLots | null>(null);
  const [selectedLotForReservation, setSelectedLotForReservation] = useState<LotWithMerchant | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // ViewState de la carte
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    zoom: 12
  });

  // Charger la position de l'utilisateur
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

  const loadMerchantsWithLots = useCallback(async () => {
    try {
      setLoading(true);

      // Construire la requête pour les lots
      let lotsQuery = supabase
        .from('lots')
        .select(`
          *,
          merchant:profiles!merchant_id(*)
        `)
        .eq('status', 'available')
        .gte('pickup_end', new Date().toISOString())
        .gt('discounted_price', 0); // Clients voient uniquement les lots payants (non gratuits)

      // Filtrer par catégorie
      if (selectedCategory !== 'Tous') {
        lotsQuery = lotsQuery.eq('category', selectedCategory);
      }

      // Filtrer les lots urgents
      if (onlyUrgent) {
        lotsQuery = lotsQuery.eq('is_urgent', true);
      }

      const { data: lots, error } = await lotsQuery;

      if (error) throw error;

      // Grouper les lots par commerçant
      const merchantsMap = new Map<string, MerchantWithLots>();

      lots?.forEach((lot: LotBase & { merchant: Profile }) => {
        const merchant = lot.merchant;
        if (!merchant || !merchant.latitude || !merchant.longitude) return;

        if (!merchantsMap.has(merchant.id)) {
          merchantsMap.set(merchant.id, {
            ...merchant,
            lots: []
          });
        }

        merchantsMap.get(merchant.id)?.lots.push(lot);
      });

      // Convertir en tableau et calculer les distances
      let merchantsArray = Array.from(merchantsMap.values());

      // Calculer la distance si on a la position utilisateur
      if (userLocation) {
        merchantsArray = merchantsArray.map(merchant => ({
          ...merchant,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            merchant.latitude!,
            merchant.longitude!
          )
        }));

        // Filtrer par distance max
        merchantsArray = merchantsArray.filter(
          m => !m.distance || m.distance <= maxDistance
        );

        // Trier par distance
        merchantsArray.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      setMerchants(merchantsArray);
    } catch (error) {
      console.error('Erreur chargement commerçants:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, onlyUrgent, maxDistance, userLocation]);

  // Charger les commerçants et leurs lots
  useEffect(() => {
    loadMerchantsWithLots();
  }, [loadMerchantsWithLots]);

  // Gérer le clic sur un commerçant (double clic pour ouvrir modal)
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
    // Trouver le commerçant correspondant
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

    setSelectedLotForReservation(lotWithMerchant);
    // Fermer la modal du commerçant pour ouvrir la modal de réservation
    setSelectedMerchantForModal(null);
  };

  // Confirmer une réservation
  const handleConfirmReservation = async (quantity: number) => {
    if (!selectedLotForReservation || !profile) return;

    try {
      // Utiliser le hook useLots pour réserver
      const pin = await reserveLot(selectedLotForReservation, quantity, profile.id, false);
      
      // Afficher le code PIN
      alert(`Réservation confirmée ! Code PIN : ${pin}`);
      
      // Fermer la modal
      setSelectedLotForReservation(null);
      
      // Recharger les lots
      await loadMerchantsWithLots();
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

  // Calculer les stats
  const totalLots = merchants.reduce((sum, m) => sum + m.lots.length, 0);
  const urgentLots = merchants.reduce(
    (sum, m) => sum + m.lots.filter(l => l.is_urgent).length,
    0
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="card p-8 text-center">
        <MapPin className="w-12 h-12 text-accent-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Configuration requise
        </h3>
        <p className="text-neutral-600">
          Veuillez configurer <code className="bg-neutral-100 px-2 py-1 rounded mx-1">VITE_MAPBOX_ACCESS_TOKEN</code> dans <code className="bg-neutral-100 px-2 py-1 rounded">.env</code>
        </p>
      </div>
    );
  }

  // Si un commerçant est sélectionné pour voir ses lots, afficher la page des lots
  if (selectedMerchantForModal) {
    return (
      <div className="space-y-4">
        {/* Header avec retour */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedMerchantForModal(null)}
            className="btn-secondary rounded-xl flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à la carte
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {selectedMerchantForModal.business_name || selectedMerchantForModal.full_name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedMerchantForModal.business_address || selectedMerchantForModal.address}
                  </span>
                  {selectedMerchantForModal.distance && (
                    <span className="flex items-center gap-1 text-primary-600 font-medium">
                      <Navigation className="w-4 h-4" />
                      {formatDistance(selectedMerchantForModal.distance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats du commerçant */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary-600">{selectedMerchantForModal.lots.length}</div>
            <div className="text-sm text-neutral-600">Lots disponibles</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-success-600">
              {selectedMerchantForModal.lots.reduce((sum, l) => sum + (l.quantity_total - l.quantity_reserved - l.quantity_sold), 0)}
            </div>
            <div className="text-sm text-neutral-600">Unités totales</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent-600">
              {selectedMerchantForModal.lots.filter(l => l.is_urgent).length}
            </div>
            <div className="text-sm text-neutral-600">Lots urgents</div>
          </div>
        </div>

        {/* Grille des lots */}
        {selectedMerchantForModal.lots.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Aucun lot disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedMerchantForModal.lots.map((lot) => (
              <div
                key={lot.id}
                className="card overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                {/* Image du lot */}
                <div className="relative w-full h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
                  {lot.image_urls && lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-neutral-400" />
                    </div>
                  )}
                  {lot.is_urgent && (
                    <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-lg font-bold animate-pulse shadow-lg">
                      🔥 Urgent
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-success-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    -{Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100)}%
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 mb-1 line-clamp-2">
                    {lot.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mb-3 line-clamp-2">
                    {lot.description}
                  </p>

                  <div className="mb-3">
                    <span className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
                      {lot.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-neutral-400 line-through text-xs">
                        {lot.original_price}€
                      </span>
                      <div className="flex items-center gap-0.5 text-primary-600">
                        <Euro className="w-5 h-5" />
                        <span className="text-2xl font-black">{lot.discounted_price}€</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-neutral-600" />
                      <span className="text-neutral-700">
                        <span className="font-bold text-success-600">
                          {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold}
                        </span>
                        {' '}disponibles
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserveLot(lot);
                    }}
                    disabled={lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0 ? 'Épuisé' : 'Réserver ce lot'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de réservation */}
        {selectedLotForReservation && (
          <ReservationModal
            lot={selectedLotForReservation}
            onClose={() => setSelectedLotForReservation(null)}
            onConfirm={handleConfirmReservation}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[60px] lg:top-[72px]">
      {/* Carte plein écran en arrière-plan */}
      <div className="absolute inset-0">
        <ReactMapGL
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Contrôles */}
          <NavigationControl position="bottom-right" style={{ marginBottom: '80px', marginRight: '10px' }} />
          <GeolocateControl
            position="bottom-right"
            style={{ marginBottom: '140px', marginRight: '10px' }}
            trackUserLocation
            onGeolocate={(e) => {
              setUserLocation({
                latitude: e.coords.latitude,
                longitude: e.coords.longitude
              });
            }}
          />

          {/* Marqueur utilisateur */}
          {userLocation && (
            <Marker
              latitude={userLocation.latitude}
              longitude={userLocation.longitude}
              anchor="bottom"
            >
              <div className="relative animate-pulse">
                <div className="absolute -inset-2 bg-primary-500 rounded-full opacity-20 animate-ping" />
                <div className="w-10 h-10 bg-primary-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" fill="currentColor" />
                </div>
              </div>
            </Marker>
          )}

          {/* Marqueurs commerçants */}
          {merchants.map((merchant) => (
            <Marker
              key={merchant.id}
              latitude={merchant.latitude!}
              longitude={merchant.longitude!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMerchantClick(merchant);
              }}
            >
              <div className={`relative cursor-pointer transform transition-all duration-300 ${
                selectedMerchant?.id === merchant.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}>
                {/* Pulsation pour indiquer qu'il faut cliquer à nouveau */}
                {selectedMerchant?.id === merchant.id && (
                  <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-40" />
                )}
                {merchant.lots.some(l => l.is_urgent) && (
                  <div className="absolute inset-0 bg-accent-400 rounded-full animate-ping opacity-20" />
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-3 border-white ${
                  selectedMerchant?.id === merchant.id
                    ? 'bg-gradient-to-br from-accent-500 to-accent-600 animate-pulse'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600'
                }`}>
                  <Store className="w-5 h-5 text-white" />
                </div>
                {merchant.lots.some(l => l.is_urgent) && (
                  <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    <Zap className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-700 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow border border-white">
                  {merchant.lots.length}
                </div>
                {/* Indicateur "Cliquez à nouveau" */}
                {selectedMerchant?.id === merchant.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-accent-600 text-white text-xs px-3 py-1 rounded-lg font-bold shadow-lg whitespace-nowrap animate-bounce">
                    Cliquez à nouveau
                  </div>
                )}
              </div>
            </Marker>
          ))}
        </ReactMapGL>
      </div>

      {/* Sidebar à droite - responsive */}
      <div className={`absolute top-0 bottom-0 right-0 transition-all duration-300 ${
        sidebarOpen ? 'w-full max-w-md lg:w-[420px]' : 'w-0'
      } z-10`}>
        <div className={`h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-neutral-200 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Header sidebar */}
          <div className="p-4 border-b border-neutral-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-lg text-neutral-900">Commerçants proches</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Fermer la liste"
              >
                <ChevronRight className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-primary-50 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{merchants.length}</div>
                <div className="text-xs text-neutral-600">Commerces</div>
              </div>
              <div className="text-center p-2 bg-success-50 rounded-lg">
                <div className="text-lg font-bold text-success-600">{totalLots}</div>
                <div className="text-xs text-neutral-600">Lots</div>
              </div>
              <div className="text-center p-2 bg-accent-50 rounded-lg">
                <div className="text-lg font-bold text-accent-600">{urgentLots}</div>
                <div className="text-xs text-neutral-600">Urgents</div>
              </div>
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`mt-3 w-full btn-secondary rounded-lg flex items-center justify-center gap-2 transition-all ${
                showFilters ? 'bg-primary-100 border-primary-300' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {(selectedCategory !== 'Tous' || onlyUrgent) && (
                <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(selectedCategory !== 'Tous' ? 1 : 0) + (onlyUrgent ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 space-y-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Distance max */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Distance max: <span className="text-primary-600">{maxDistance} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Lots urgents */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Lots urgents uniquement</span>
              </label>
            </div>
          )}

          {/* Liste des commerçants */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 250px)' }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                <p className="text-neutral-600 mt-4 text-sm">Chargement...</p>
              </div>
            ) : merchants.length === 0 ? (
              <div className="p-6 text-center">
                <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-2">Aucun résultat</h3>
                <p className="text-sm text-neutral-600">Élargissez votre zone de recherche</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {merchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                      selectedMerchant?.id === merchant.id
                        ? 'border-primary-400 bg-primary-50 shadow-lg'
                        : 'border-neutral-200 bg-white hover:border-primary-200 hover:shadow-md'
                    }`}
                    onClick={() => handleMerchantClick(merchant)}
                  >
                    {/* Indicateur pour clic sélectionné */}
                    {selectedMerchant?.id === merchant.id && (
                      <div className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce z-10">
                        Cliquez pour voir les lots
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedMerchant?.id === merchant.id
                          ? 'bg-gradient-to-br from-accent-500 to-accent-600 animate-pulse'
                          : merchant.lots.some(l => l.is_urgent)
                          ? 'bg-gradient-to-br from-accent-400 to-accent-600 animate-pulse'
                          : 'bg-gradient-to-br from-primary-500 to-primary-600'
                      }`}>
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-900 truncate text-sm">
                          {merchant.business_name || merchant.full_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {merchant.lots.some(l => l.is_urgent) && (
                            <span className="bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                              🔥 Urgent
                            </span>
                          )}
                          {merchant.distance && (
                            <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {formatDistance(merchant.distance)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Liste compacte des lots */}
                    <div className="space-y-2">
                      {merchant.lots.slice(0, 2).map((lot) => (
                        <div key={lot.id} className="bg-neutral-50 rounded-lg p-2 border border-neutral-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-neutral-900 truncate">
                                {lot.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="text-neutral-600">
                                  <Package className="w-3 h-3 inline mr-0.5" />
                                  {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold}
                                </span>
                                <span className="text-primary-600 font-bold">
                                  <Euro className="w-3 h-3 inline mr-0.5" />
                                  {lot.discounted_price}€
                                </span>
                              </div>
                            </div>
                            {lot.is_urgent && (
                              <span className="text-xs bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded font-medium">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {merchant.lots.length > 2 && (
                        <div className="text-xs text-center text-neutral-600 py-1">
                          +{merchant.lots.length - 2} autre{merchant.lots.length - 2 > 1 ? 's' : ''} lot{merchant.lots.length - 2 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton toggle sidebar (quand fermée) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-24 right-4 z-20 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary-200"
        >
          <ChevronLeft className="w-6 h-6 text-primary-600" />
        </button>
      )}

      {/* Popup filtres mobile */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Catégorie</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-2 text-xs rounded-lg border-2 transition-all ${
                        selectedCategory === cat
                          ? 'border-primary-400 bg-primary-100 text-primary-700 font-semibold'
                          : 'border-neutral-200 text-neutral-700 hover:border-primary-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Distance max: <span className="text-primary-600">{maxDistance} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium">Lots urgents uniquement</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Bouton position utilisateur flotant */}
      {userLocation && !sidebarOpen && (
        <button
          onClick={flyToUser}
          className="fixed bottom-24 right-4 z-20 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary-200"
          title="Centrer sur ma position"
        >
          <Target className="w-6 h-6 text-primary-600" />
        </button>
      )}

    </div>
  );
}
