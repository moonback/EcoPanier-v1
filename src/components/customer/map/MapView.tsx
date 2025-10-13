import ReactMapGL, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl';
import { Navigation, Store, Zap } from 'lucide-react';
import type { MerchantWithLots, ViewState, UserLocation } from './types';
import { MAPBOX_TOKEN } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';

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
      {/* Contrôles */}
      <NavigationControl position="bottom-right" style={{ marginBottom: '80px', marginRight: '10px' }} />
      <GeolocateControl
        position="bottom-right"
        style={{ marginBottom: '140px', marginRight: '10px' }}
        trackUserLocation
        onGeolocate={(e) => {
          onUserLocationChange({
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
            onMerchantClick(merchant);
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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-3 border-white overflow-hidden ${
              selectedMerchant?.id === merchant.id
                ? 'animate-pulse'
                : ''
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
              <Store className={`w-5 h-5 text-white ${merchant.business_logo_url ? 'hidden' : ''}`} />
            </div>
            {merchant.lots.some(l => l.is_urgent) && (
              <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                <Zap className="w-3 h-3" />
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-700 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow border border-white">
              {merchant.lots.length}
            </div>
            {/* Tooltip avec nom du commerce et logo */}
            {selectedMerchant?.id === merchant.id && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-2xl animate-fade-in border-2 border-white min-w-[180px] max-w-[240px]">
                <div className="flex items-center gap-2">
                  {/* Logo dans le tooltip */}
                  {merchant.business_logo_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img
                        src={merchant.business_logo_url}
                        alt={merchant.business_name || merchant.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {/* Nom et instruction */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold mb-0.5 truncate">
                      {merchant.business_name || merchant.full_name}
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">
                      Cliquez pour voir les lots
                    </div>
                  </div>
                </div>
                {/* Flèche pointant vers le marqueur */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-neutral-900" />
              </div>
            )}
          </div>
        </Marker>
      ))}
    </ReactMapGL>
  );
}

