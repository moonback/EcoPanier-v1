import ReactMapGL, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl';
import { Store, Zap, MapPin } from 'lucide-react';
import type { MerchantWithLots, ViewState, UserLocation } from './types';
import { MAPBOX_TOKEN } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * Interface pour les props du composant MapView
 */
interface MapViewProps {
  viewState: ViewState;
  onViewStateChange: (viewState: ViewState) => void;
  userLocation: UserLocation | null;
  onUserLocationChange: (location: UserLocation) => void;
  merchants: MerchantWithLots[];
  selectedMerchant: MerchantWithLots | null;
  onMerchantClick: (merchant: MerchantWithLots) => void;
  mapRef: React.MutableRefObject<MapRef | null>;
}

/**
 * Composant MapView - Carte interactive pour visualiser les commerçants
 * Design cohérent avec le système de cartes EcoPanier
 */
export function MapView({
  viewState,
  onViewStateChange,
  userLocation,
  onUserLocationChange,
  merchants,
  selectedMerchant,
  onMerchantClick,
  mapRef
}: MapViewProps) {
  return (
    <ReactMapGL
      ref={mapRef}
      {...viewState}
      onMove={(evt) => onViewStateChange(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Contrôles de navigation stylés */}
      <NavigationControl
        position="bottom-right"
        style={{
          marginBottom: '80px',
          marginRight: '10px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid rgb(229 231 235)'
        }}
      />
      <GeolocateControl
        position="bottom-right"
        style={{
          marginBottom: '140px',
          marginRight: '10px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid rgb(229 231 235)'
        }}
        trackUserLocation
        onGeolocate={(e) => {
          onUserLocationChange({
            latitude: e.coords.latitude,
            longitude: e.coords.longitude
          });
        }}
      />

      {/* Marqueur utilisateur - Design EcoPanier */}
      {userLocation && (
        <Marker
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          anchor="bottom"
        >
          <div className="relative">
            {/* Pulsation subtile */}
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            {/* Indicateur de position actuelle */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-gray-700"></div>
          </div>
        </Marker>
      )}

      {/* Marqueurs commerçants - Design EcoPanier */}
      {merchants.map((merchant) => (
        <Marker
          key={merchant.id}
          latitude={merchant.latitude!}
          longitude={merchant.longitude!}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onMerchantClick(merchant);
          }}
        >
          <div className={`relative cursor-pointer transform transition-all duration-300 ${
            selectedMerchant?.id === merchant.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
          }`}>
            {/* Pulsation pour indiquer qu'il faut cliquer à nouveau */}
            {selectedMerchant?.id === merchant.id && (
              <div className="absolute -inset-1 bg-blue-500/30 rounded-full animate-ping" />
            )}

            {/* Badge urgent avec animation */}
            {merchant.lots.some(l => l.is_urgent) && (
              <div className="absolute -inset-1 bg-orange-500/20 rounded-full animate-ping" />
            )}

            {/* Marqueur principal */}
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-3 border-white overflow-hidden transition-all duration-300 ${
              selectedMerchant?.id === merchant.id
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse'
                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
            }`}>
              {merchant.business_logo_url ? (
                <img
                  src={merchant.business_logo_url}
                  alt={merchant.business_name || merchant.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback vers l'icône si l'image ne charge pas
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Store className={`w-5 h-5 text-white ${merchant.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
            </div>

            {/* Badge urgent stylé */}
            {merchant.lots.some(l => l.is_urgent) && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white animate-bounce">
                <Zap className="w-3 h-3" strokeWidth={2} />
              </div>
            )}

            {/* Badge nombre de lots */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg border-2 border-white min-w-[20px] text-center">
              {merchant.lots.length}
            </div>

            {/* Tooltip amélioré avec design EcoPanier */}
            {selectedMerchant?.id === merchant.id && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-3 rounded-xl shadow-xl border border-gray-200 min-w-[200px] max-w-[280px] z-30">
                <div className="flex items-center gap-3">
                  {/* Logo dans le tooltip */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-gray-200 shadow-sm">
                    {merchant.business_logo_url ? (
                      <img
                        src={merchant.business_logo_url}
                        alt={merchant.business_name || merchant.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Affiche une icône Store si l'image échoue à charger
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Store
                      className={`w-5 h-5 text-gray-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${merchant.business_logo_url ? 'hidden' : ''}`}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Informations du commerce */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold mb-1 truncate">
                      {merchant.business_name || merchant.full_name}
                    </div>
                    <div className="text-xs text-gray-600 font-medium flex items-center gap-1 mb-1">
                      <span className="text-green-600">●</span>
                      <span>{merchant.lots.length} lots disponibles</span>
                    </div>
                    <div className="text-xs text-gray-500 font-light flex items-center gap-1">
                      <span>🛍️</span>
                      <span>Cliquez pour découvrir</span>
                    </div>
                  </div>
                </div>

                {/* Flèche pointant vers le marqueur avec style amélioré */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-gray-200"></div>
              </div>
            )}
          </div>
        </Marker>
      ))}
    </ReactMapGL>
  );
}

