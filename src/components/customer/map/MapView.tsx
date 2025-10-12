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
  );
}

