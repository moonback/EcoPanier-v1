import { useState } from 'react';
import { X, Package, MapPin, Clock, ShoppingCart, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
};

interface LotDetailsModalProps {
  lot: Lot;
  onClose: () => void;
  onReserve: () => void;
  onMerchantClick?: () => void;
}

export function LotDetailsModal({ lot, onClose, onReserve, onMerchantClick }: LotDetailsModalProps) {
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  const hasMultipleImages = lot.image_urls && lot.image_urls.length > 1;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-white to-primary-50/30 border-b border-gray-200/50 p-3 sm:p-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Détails du lot</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-12">
          {/* Grille principale : Image + Infos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Image principale avec zoom */}
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 group">
              {lot.image_urls && lot.image_urls.length > 0 ? (
                <>
                  <img
                    src={lot.image_urls[currentImageIndex]}
                    alt={lot.title}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setShowImageZoom(true)}
                  />
                  
                  {/* Bouton zoom */}
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 sm:p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    aria-label="Zoomer sur l'image"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                  </button>

                  {/* Navigation images si plusieurs */}
                  {hasMultipleImages && (
                    <>
                      {currentImageIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                        </button>
                      )}
                      
                      {currentImageIndex < lot.image_urls.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all shadow-lg"
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                        </button>
                      )}

                      {/* Indicateur de position */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-primary-600/90 text-white text-[10px] sm:text-xs px-2 py-1 rounded-md backdrop-blur-sm shadow-md">
                        {currentImageIndex + 1} / {lot.image_urls.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" strokeWidth={1} />
                </div>
              )}

              {/* Badges sur l'image */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-start justify-between">
                {lot.is_urgent && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-red-600/95 backdrop-blur-sm text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium shadow-lg">
                    🔥 Urgent
                  </span>
                )}
                <span className="ml-auto bg-primary-600/95 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  -{discount}%
                </span>
              </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-3 sm:space-y-4">
              {/* Titre */}
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {lot.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                  {lot.category}
                </span>
              </div>

              {/* Description */}
              <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl border border-gray-200">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" strokeWidth={1.5} />
                  Description
                </h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light">
                  {lot.description}
                </p>
              </div>

              {/* Prix et Commerçant sur la même ligne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Prix */}
                <div className="p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-secondary-50/50 rounded-xl border border-primary-100">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5">
                    <span className="text-primary-600">💰</span>
                    Prix
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[10px] sm:text-xs text-gray-600 font-light mb-1">Prix initial</div>
                      <div className="text-gray-400 line-through text-base sm:text-lg font-bold">
                        {lot.original_price}€
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs text-gray-600 font-light mb-1">Prix réduit</div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary-700">
                        {lot.discounted_price}€
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-md">
                      Économisez {(lot.original_price - lot.discounted_price).toFixed(2)}€ ({discount}%)
                    </span>
                  </div>
                </div>

                {/* Commerçant avec logo - Cliquable */}
                <div 
                  className={`p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl border border-gray-200 transition-all ${
                    onMerchantClick 
                      ? 'cursor-pointer hover:bg-primary-50 hover:border-primary-300 hover:shadow-md' 
                      : ''
                  }`}
                  onClick={onMerchantClick}
                >
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" strokeWidth={1.5} />
                    Commerçant
                    {onMerchantClick && (
                      <span className="ml-auto text-[10px] sm:text-xs text-primary-600 font-medium hover:text-primary-700">
                        Voir tous →
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg bg-gray-200">
                      {lot.profiles.business_logo_url ? (
                        <img
                          src={lot.profiles.business_logo_url}
                          alt={lot.profiles.business_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm sm:text-base mb-0.5 truncate">{lot.profiles.business_name}</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-light flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-gray-500" strokeWidth={1.5} />
                        <span className="truncate">{lot.profiles.business_address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations complémentaires - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {/* Disponibilité */}
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-light">Disponible</div>
                  <div className="text-lg sm:text-xl font-bold text-primary-700">{availableQty}<span className="text-xs sm:text-sm font-normal text-gray-500">/{lot.quantity_total}</span></div>
                </div>
              </div>
            </div>

            {/* Horaire de retrait */}
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-secondary-50 to-white rounded-xl border border-secondary-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-secondary-100 rounded-lg">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-light">Retrait</div>
                  <div className="text-xs sm:text-sm font-bold text-secondary-700">
                    {format(new Date(lot.pickup_start), 'dd MMM', { locale: fr })}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-light">
                    {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact environnemental */}
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <span className="text-base sm:text-lg">🌱</span>
                </div>
                <div className="flex-1">
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-light">Impact CO₂</div>
                  <div className="text-xs sm:text-sm font-bold text-green-700">{(availableQty * 0.9).toFixed(1)} kg</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-light">évités</div>
                </div>
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          {lot.requires_cold_chain && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-blue-700">
                  ❄️ Produit nécessitant une chaîne du froid
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={onReserve}
            disabled={availableQty === 0}
            className={`w-full flex items-center justify-center gap-2 sm:gap-2.5 py-3 sm:py-4 rounded-xl font-medium text-base sm:text-lg transition-all ${
              availableQty === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
            {availableQty === 0 ? 'Épuisé' : 'Réserver ce panier'}
          </button>
        </div>
      </div>

      {/* Modal Zoom Image Plein Écran */}
      {showImageZoom && lot.image_urls && lot.image_urls.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setShowImageZoom(false)}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Fermer le zoom"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </button>

          {/* Image zoomée */}
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={lot.image_urls[currentImageIndex]}
              alt={lot.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation si plusieurs images */}
            {hasMultipleImages && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
                  </button>
                )}
                
                {currentImageIndex < lot.image_urls.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
                  </button>
                )}

                {/* Compteur d'images */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm text-xs sm:text-sm font-medium">
                  {currentImageIndex + 1} / {lot.image_urls.length}
                </div>
              </>
            )}
          </div>

          {/* Miniatures si plusieurs images */}
          {hasMultipleImages && (
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-black/50 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
              {lot.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
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
    </div>
  );
}

