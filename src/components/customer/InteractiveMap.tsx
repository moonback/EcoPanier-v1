import { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { MapPin, Store, Navigation, Filter, X, Package, Clock, Euro } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { calculateDistance, formatDistance } from '../../utils/geocodingService';
import type { Database } from '../../lib/database.types';
import 'mapbox-gl/dist/mapbox-gl.css';

type Lot = Database['public']['Tables']['lots']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface MerchantWithLots extends Profile {
  lots: Lot[];
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
  const { user } = useAuthStore();
  const mapRef = useRef<any>(null);

  // État
  const [merchants, setMerchants] = useState<MerchantWithLots[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithLots | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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
          console.error('Erreur géolocalisation:', error);
        }
      );
    }
  }, []);

  // Charger les commerçants et leurs lots
  useEffect(() => {
    loadMerchantsWithLots();
  }, [selectedCategory, onlyUrgent]);

  const loadMerchantsWithLots = async () => {
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
        .gte('pickup_end', new Date().toISOString());

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

      lots?.forEach((lot: any) => {
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
  };

  // Centrer sur un commerçant
  const flyToMerchant = (merchant: MerchantWithLots) => {
    if (merchant.latitude && merchant.longitude) {
      mapRef.current?.flyTo({
        center: [merchant.longitude, merchant.latitude],
        zoom: 15,
        duration: 1500
      });
      setSelectedMerchant(merchant);
    }
  };

  // Centrer sur l'utilisateur
  const flyToUser = () => {
    if (userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 1500
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
          Veuillez configurer la variable d'environnement
          <code className="bg-neutral-100 px-2 py-1 rounded mx-1">VITE_MAPBOX_ACCESS_TOKEN</code>
          dans votre fichier <code className="bg-neutral-100 px-2 py-1 rounded">.env</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary-600" />
            Carte Interactive
          </h2>
          <p className="text-neutral-600 mt-1">
            Découvrez les lots disponibles près de vous
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary rounded-xl flex items-center gap-2"
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

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{merchants.length}</div>
              <div className="text-sm text-neutral-600">Commerçants</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-success-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{totalLots}</div>
              <div className="text-sm text-neutral-600">Lots disponibles</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-warning-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{urgentLots}</div>
              <div className="text-sm text-neutral-600">Lots urgents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-neutral-900">Filtres</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance max */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Distance maximale: {maxDistance} km
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent"
                checked={onlyUrgent}
                onChange={(e) => setOnlyUrgent(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="urgent" className="text-sm font-medium text-neutral-700">
                Afficher uniquement les lots urgents
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className="card p-0 overflow-hidden" style={{ height: '600px' }}>
        <ReactMapGL
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Contrôles */}
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
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
              <div className="relative">
                <div className="absolute -inset-2 bg-primary-500 rounded-full opacity-20 animate-ping" />
                <Navigation className="w-8 h-8 text-primary-600 drop-shadow-lg" fill="currentColor" />
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
                setSelectedMerchant(merchant);
              }}
            >
              <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white">
                  <Store className="w-5 h-5" />
                </div>
                {merchant.lots.some(l => l.is_urgent) && (
                  <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    !
                  </div>
                )}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium shadow">
                  {merchant.lots.length}
                </div>
              </div>
            </Marker>
          ))}

          {/* Popup détails commerçant */}
          {selectedMerchant && (
            <Popup
              latitude={selectedMerchant.latitude!}
              longitude={selectedMerchant.longitude!}
              anchor="top"
              onClose={() => setSelectedMerchant(null)}
              closeButton={true}
              closeOnClick={false}
              className="max-w-sm"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg text-neutral-900 mb-1">
                  {selectedMerchant.business_name || selectedMerchant.full_name}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {selectedMerchant.business_address || selectedMerchant.address}
                </p>

                {selectedMerchant.distance && (
                  <div className="flex items-center gap-2 text-sm text-neutral-700 mb-3">
                    <Navigation className="w-4 h-4 text-primary-600" />
                    <span>{formatDistance(selectedMerchant.distance)}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="font-semibold text-sm text-neutral-900">
                    {selectedMerchant.lots.length} lot{selectedMerchant.lots.length > 1 ? 's' : ''} disponible{selectedMerchant.lots.length > 1 ? 's' : ''}:
                  </div>
                  {selectedMerchant.lots.slice(0, 3).map((lot) => (
                    <div key={lot.id} className="bg-neutral-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-sm text-neutral-900">
                          {lot.title}
                        </div>
                        {lot.is_urgent && (
                          <span className="bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-neutral-600">
                          <Package className="w-3 h-3 inline mr-1" />
                          {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold} dispo
                        </span>
                        <span className="text-primary-600 font-semibold">
                          <Euro className="w-3 h-3 inline mr-1" />
                          {lot.discounted_price}€
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedMerchant.lots.length > 3 && (
                    <div className="text-sm text-neutral-600 text-center">
                      +{selectedMerchant.lots.length - 3} autre{selectedMerchant.lots.length - 3 > 1 ? 's' : ''} lot{selectedMerchant.lots.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    window.location.href = '/dashboard'; // Rediriger vers le browser de lots
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  Voir tous les lots
                </button>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>

      {/* Liste des commerçants */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="text-neutral-600 mt-4">Chargement de la carte...</p>
        </div>
      ) : merchants.length === 0 ? (
        <div className="card p-8 text-center">
          <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Aucun commerçant trouvé
          </h3>
          <p className="text-neutral-600">
            Essayez d'élargir votre zone de recherche ou de modifier les filtres.
          </p>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">
            Commerçants près de vous ({merchants.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => flyToMerchant(merchant)}
              >
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 flex items-center gap-2">
                    {merchant.business_name || merchant.full_name}
                    {merchant.lots.some(l => l.is_urgent) && (
                      <span className="bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {merchant.lots.length} lot{merchant.lots.length > 1 ? 's' : ''} disponible{merchant.lots.length > 1 ? 's' : ''}
                  </div>
                  {merchant.distance && (
                    <div className="text-sm text-primary-600 font-medium">
                      📍 {formatDistance(merchant.distance)}
                    </div>
                  )}
                </div>
                <button className="btn-secondary rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Localiser
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

