import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Store,
  Mail,
  Phone,
  CheckCircle,
  Info,
  FileText,
  Navigation,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../stores/authStore';
import { formatDistance } from '../../utils/geocodingService';
import { calculateCO2Impact } from '../../hooks/useImpactMetrics';
import { useLots } from '../../hooks/useLots';
import {
  useLotDetails,
  type TimeRemaining,
  type TabId,
  type LotWithProfile,
} from '../../hooks/useLotDetails';
import { ReservationModal } from './components/ReservationModal';
import { formatBusinessHours, getBusinessTypeLabel } from '../../utils/merchantHelpers';
import { LotReservationBar } from './components/lot-details/LotReservationBar';

export function LotDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('product');
  const [quantity, setQuantity] = useState(1);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<
    | { type: 'success'; message: string; pin?: string }
    | { type: 'error'; message: string }
    | null
  >(null);

  const { profile: userProfile } = useAuthStore();
  const { reserveLot } = useLots('');

  const {
    lot,
    loading,
    error,
    timeRemaining,
    pickupTimeInfo,
    distance,
    userLocation,
    similarLots,
    similarLotsLoading,
    availableQuantity,
    shouldShowCountdown,
    isTimeCritical,
    refresh,
  } = useLotDetails({ lotId: id, activeTab, userProfile: userProfile ?? null });

  // Réinitialiser la quantité quand le lot change
  useEffect(() => {
    if (lot?.id) {
      setQuantity(1);
    }
  }, [lot?.id]);

  if (loading && !lot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du lot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Oups...</h2>
          <p className="text-gray-600">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Retour au tableau de bord
            </button>
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              className="btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Lot introuvable</h2>
          <p className="text-gray-600">
            Le lot que vous recherchez n'existe plus ou a été retiré. Retournez au tableau de bord pour découvrir d'autres paniers.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Explorer les paniers
          </button>
        </div>
      </div>
    );
  }

  // Calculs et valeurs dérivées (après le check de lot)
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  const hasMultipleImages = lot.image_urls && lot.image_urls.length > 1;
  const merchant = lot.profiles;
  
  // Calcul du prix total et de l'impact selon la quantité
  const totalPrice = (lot.discounted_price * quantity).toFixed(2);
  const totalSavings = ((lot.original_price - lot.discounted_price) * quantity).toFixed(2);
  const impactMeals = quantity;
  const impactCO2 = calculateCO2Impact(quantity);
  
  // Badge de disponibilité dynamique
  const getAvailabilityBadge = () => {
    if (availableQuantity === 0) return { text: 'Épuisé', color: 'bg-gray-200 text-gray-600', icon: '❌' };
    if (availableQuantity < 2) return { text: 'Dernière chance', color: 'bg-red-100 text-red-700', icon: '⚠️' };
    if (availableQuantity < 3) return { text: 'Stock faible', color: 'bg-orange-100 text-orange-700', icon: '📦' };
    return null;
  };
  
  const availabilityBadge = getAvailabilityBadge();

  const formatTimeRemaining = (time: TimeRemaining): string => {
    if (time.hours > 0) {
      return `${time.hours}h${time.minutes.toString().padStart(2, '0')}`;
    }
    return `${time.minutes}min${time.seconds.toString().padStart(2, '0')}`;
  };

  const nextImage = () => {
    if (lot.image_urls && currentImageIndex < lot.image_urls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const openDirections = () => {
    if (!merchant.business_address) return;

    const encodedAddress = encodeURIComponent(merchant.business_address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    
    if (userLocation) {
      const originUrl = `&origin=${userLocation.lat},${userLocation.lon}`;
      window.open(`${mapsUrl}${originUrl}`, '_blank');
    } else {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > availableQuantity) return;
    setQuantity(newQuantity);
  };

  const handleReserve = () => {
    if (!userProfile || availableQuantity === 0) return;
    setReservationStatus(null);
    setShowReservationModal(true);
  };

  const handleConfirmReservation = async (reservationQuantity: number, useWallet: boolean) => {
    if (!userProfile || !lot) return;

    try {
      const pin = await reserveLot(lot, reservationQuantity, userProfile.id, false, useWallet);
      setShowReservationModal(false);
      setReservationStatus({
        type: 'success',
        message: 'Réservation confirmée. Retrouvez votre code PIN ci-dessous.',
        pin,
      });
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      throw error; // Laisser la modal gérer l'affichage de l'erreur
    }
  };

  const handleLotSelect = (selectedLot: LotWithProfile) => {
    navigate(`/dashboard/lot/${selectedLot.id}`);
  };

  const tabs: Array<{ id: TabId; label: string; icon: typeof Package }> = [
    { id: 'product', label: 'Produit', icon: Package },
    { id: 'merchant', label: 'Commerçant', icon: Store },
    { id: 'details', label: 'Détails', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec bouton retour */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-12xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Détails du lot</h1>
          {shouldShowCountdown && timeRemaining !== null && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
              isTimeCritical
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-orange-100 text-orange-700'
            }`}>
              <Clock className="w-3 h-3" strokeWidth={2} />
              <span>Plus que {formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Navigation par onglets */}
        <div className="max-w-12xl mx-auto px-4 flex items-center gap-1 border-t border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all relative ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {reservationStatus && (
        <div className="max-w-12xl mx-auto px-4 pt-4">
          <div
            className={`rounded-xl border p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              reservationStatus.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex-1">
              <p className={`text-sm font-semibold ${reservationStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {reservationStatus.message}
              </p>
              {reservationStatus.type === 'success' && reservationStatus.pin && (
                <p className="mt-1 text-xs font-mono text-gray-800">
                  Code PIN: <span className="text-base font-bold tracking-widest">{reservationStatus.pin}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {reservationStatus.type === 'success' && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard?tab=reservations')}
                  className="btn-primary"
                >
                  Voir mes réservations
                </button>
              )}
              <button
                type="button"
                onClick={() => setReservationStatus(null)}
                className="btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="max-w-12xl mx-auto px-4 py-6 pb-36">
        {/* Onglet Produit */}
        {activeTab === 'product' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche : Image */}
            <div className="flex flex-col gap-3">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 group">
                {lot.image_urls && lot.image_urls.length > 0 ? (
                  <>
                    <img
                      src={lot.image_urls[currentImageIndex]}
                      alt={lot.title}
                      className="w-full h-96 object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                      onClick={() => setShowImageZoom(true)}
                    />
                    
                    <button
                      onClick={() => setShowImageZoom(true)}
                      className="absolute bottom-2 right-2 bg-primary-600/90 hover:bg-primary-700 text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                      aria-label="Zoomer sur l'image"
                    >
                      <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {hasMultipleImages && (
                      <>
                        {currentImageIndex > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                            aria-label="Image précédente"
                          >
                            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}
                        
                        {currentImageIndex < lot.image_urls.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                            aria-label="Image suivante"
                          >
                            <ChevronRight className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}

                        <div className="absolute bottom-2 left-2 bg-primary-600/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm shadow-md">
                          {currentImageIndex + 1} / {lot.image_urls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" strokeWidth={1} />
                  </div>
                )}

                <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                  {lot.is_urgent && (
                    <span className="inline-flex items-center gap-1 bg-red-600/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                      🔥 Urgent
                    </span>
                  )}
                  <span className="ml-auto bg-primary-600/95 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    -{discount}%
                  </span>
                </div>
              </div>

              {/* Caractéristiques */}
              {lot.requires_cold_chain && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-700">
                      ❄️ Chaîne du froid requise
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite : Informations */}
            <div className="flex flex-col gap-4">
              {/* Titre et catégorie */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {lot.title}
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium">
                  <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {lot.category}
                </span>
              </div>

              {/* Description */}
              <div className="p-4 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {lot.description}
                </p>
              </div>

              {/* Informations principales en grille */}
              <div className="grid grid-cols-3 gap-3">
                {/* Prix */}
                <div className="p-3 bg-gradient-to-br from-primary-50 via-white to-secondary-50/50 rounded-lg border border-primary-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                    <span className="text-primary-600">💰</span>
                    Prix
                  </h4>
                  <div className="space-y-1">
                    <div className="text-gray-400 line-through text-sm font-bold">
                      {lot.original_price}€
                    </div>
                    <div className="text-2xl font-bold text-primary-700">
                      {lot.discounted_price}€
                    </div>
                    <div className="text-xs text-gray-600">
                      -{discount}%
                    </div>
                  </div>
                </div>

                {/* Disponibilité */}
                <div className="p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-primary-600" strokeWidth={1.5} />
                    Stock
                  </h4>
                  <div className="text-2xl font-bold text-primary-700">
                    {availableQuantity}
                    <span className="text-base font-normal text-gray-500">/{lot.quantity_total}</span>
                  </div>
                  {availabilityBadge && (
                    <div className={`text-xs mt-1 px-2 py-1 rounded-full font-medium ${availabilityBadge.color}`}>
                      {availabilityBadge.icon} {availabilityBadge.text}
                    </div>
                  )}
                  {!availabilityBadge && (
                    <div className="text-xs text-gray-600 mt-1">
                      En stock
                    </div>
                  )}
                </div>

                {/* Retrait */}
                <div className="p-3 bg-gradient-to-br from-secondary-50 to-white rounded-lg border border-secondary-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary-600" strokeWidth={1.5} />
                    Retrait
                  </h4>
                  {pickupTimeInfo && (
                    <>
                      <div className="text-base font-bold text-secondary-700 mb-1">
                        {pickupTimeInfo.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </div>
                      {pickupTimeInfo.isAvailable && (
                        <div className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium inline-block">
                          ✓ Disponible maintenant
                        </div>
                      )}
                      {pickupTimeInfo.timeUntilStart && (
                        <div className="mt-1 text-xs text-secondary-600">
                          {pickupTimeInfo.timeUntilStart}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Compte à rebours d'urgence */}
              {shouldShowCountdown && timeRemaining !== null && (
                <div className={`p-3 rounded-lg border-2 ${
                  isTimeCritical
                    ? 'bg-red-50 border-red-300 animate-pulse'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-red-600' : 'text-orange-600'}`} strokeWidth={2} />
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${isTimeCritical ? 'text-red-700' : 'text-orange-700'}`}>
                        {isTimeCritical ? '⏰ Dernière chance !' : '⏱️ Temps limité'}
                      </div>
                      <div className={`text-xs ${isTimeCritical ? 'text-red-600' : 'text-orange-600'}`}>
                        Plus que {formatTimeRemaining(timeRemaining)} pour réserver
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Distance */}
              {distance !== null && (
                <div className="p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                      <span className="text-sm text-gray-700">
                        À {formatDistance(distance)} de vous
                      </span>
                    </div>
                    <button
                      onClick={openDirections}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      <Navigation className="w-3 h-3" strokeWidth={2} />
                      Itinéraire
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Commerçant */}
        {activeTab === 'merchant' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Colonne gauche */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-200">
                    {merchant.business_logo_url ? (
                      <img
                        src={merchant.business_logo_url}
                        alt={merchant.business_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-8 h-8 text-primary-500" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {merchant.business_name}
                      </h3>
                      {merchant.verified && (
                        <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex-shrink-0">
                          <CheckCircle className="w-3 h-3" strokeWidth={2} />
                          <span>Vérifié</span>
                        </span>
                      )}
                    </div>
                    {merchant.business_type && (
                      <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium mb-2">
                        {getBusinessTypeLabel(merchant.business_type)}
                      </span>
                    )}
                    <div className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500 mt-0.5" strokeWidth={1.5} />
                      <span>{merchant.business_address}</span>
                    </div>

                    {distance !== null && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-primary-600 font-medium">
                          📍 À {formatDistance(distance)} de vous
                        </span>
                        <button
                          onClick={openDirections}
                          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
                        >
                          <Navigation className="w-4 h-4" strokeWidth={2} />
                          Itinéraire
                        </button>
                      </div>
                    )}

                    {merchant.business_description && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">À propos</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {merchant.business_description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="grid grid-cols-1 gap-3">
                {merchant.business_hours && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-secondary-100 rounded-lg">
                        <Clock className="w-5 h-5 text-secondary-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Horaires</h4>
                        <p className="text-sm text-gray-700">
                          {formatBusinessHours(merchant.business_hours)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {merchant.business_email && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Mail className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Email</h4>
                        <a 
                          href={`mailto:${merchant.business_email}`}
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline break-all"
                        >
                          {merchant.business_email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {merchant.phone && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Phone className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Téléphone</h4>
                        <a 
                          href={`tel:${merchant.phone}`}
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {merchant.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lots similaires */}
            {similarLots.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                  Autres lots de {merchant.business_name}
                </h4>
                {similarLotsLoading ? (
                  <div className="text-sm text-gray-500 text-center py-4">Chargement...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {similarLots.map((similarLot) => {
                      const similarAvailableQty = similarLot.quantity_total - similarLot.quantity_reserved - similarLot.quantity_sold;
                      return (
                        <button
                          key={similarLot.id}
                          onClick={() => handleLotSelect(similarLot)}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all text-left"
                        >
                          {similarLot.image_urls && similarLot.image_urls.length > 0 && (
                            <img
                              src={similarLot.image_urls[0]}
                              alt={similarLot.title}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                            {similarLot.title}
                          </div>
                          <div className="text-sm font-bold text-primary-700 mb-1">
                            {similarLot.discounted_price}€
                          </div>
                          <div className="text-xs text-gray-500">
                            {similarAvailableQty} disponible{similarAvailableQty > 1 ? 's' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Détails */}
        {activeTab === 'details' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Colonne gauche */}
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Catégorie</div>
                    <div className="text-sm font-medium text-gray-900">{lot.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Statut</div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{lot.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Quantité totale</div>
                    <div className="text-sm font-medium text-gray-900">{lot.quantity_total}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Disponibilité</div>
                    <div className="text-sm font-medium text-gray-900">{availableQuantity}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                  Caractéristiques
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Chaîne du froid</span>
                    <span className={`text-sm font-medium ${lot.requires_cold_chain ? 'text-blue-600' : 'text-gray-400'}`}>
                      {lot.requires_cold_chain ? 'Oui ❄️' : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Lot urgent</span>
                    <span className={`text-sm font-medium ${lot.is_urgent ? 'text-red-600' : 'text-gray-400'}`}>
                      {lot.is_urgent ? 'Oui 🔥' : 'Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Lot gratuit</span>
                    <span className={`text-sm font-medium ${lot.is_free ? 'text-green-600' : 'text-gray-400'}`}>
                      {lot.is_free ? 'Oui 🎁' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                  Informations de retrait
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Date de début</div>
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(lot.pickup_start), 'dd MMM yyyy', { locale: fr })} à {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Date de fin</div>
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(lot.pickup_end), 'dd MMM yyyy', { locale: fr })} à {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-primary-600">💰</span>
                  Détails des prix
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">Prix original</span>
                    <span className="text-sm font-bold text-gray-400 line-through">{lot.original_price}€</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">Prix réduit</span>
                    <span className="text-lg font-bold text-primary-700">{lot.discounted_price}€</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-primary-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Économie</span>
                    <span className="text-base font-bold text-primary-700">
                      {(lot.original_price - lot.discounted_price).toFixed(2)}€ ({discount}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        

        <LotReservationBar
          availableQuantity={availableQuantity}
          quantity={quantity}
          totalPrice={totalPrice}
          totalSavings={totalSavings}
          impactMeals={impactMeals}
          impactCO2={impactCO2}
          onDecrease={() => handleQuantityChange(quantity - 1)}
          onIncrease={() => handleQuantityChange(quantity + 1)}
          onReserve={handleReserve}
        />
      </main>

      {/* Modal Zoom Image Plein Écran */}
      {showImageZoom && lot.image_urls && lot.image_urls.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Fermer le zoom"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>

          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={lot.image_urls[currentImageIndex]}
              alt={lot.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {hasMultipleImages && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-8 h-8" strokeWidth={2} />
                  </button>
                )}
                
                {currentImageIndex < lot.image_urls.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-8 h-8" strokeWidth={2} />
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium">
                  {currentImageIndex + 1} / {lot.image_urls.length}
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
              {lot.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === currentImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${lot.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de réservation avec paiement */}
      {showReservationModal && lot && (
        <ReservationModal
          lot={lot}
          onClose={() => setShowReservationModal(false)}
          onConfirm={handleConfirmReservation}
        />
      )}
    </div>
  );
}

