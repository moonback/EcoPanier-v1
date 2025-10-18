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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Détails du lot</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6">
          {/* Grille principale : Image + Infos */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Image principale avec zoom */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group">
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
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Zoomer sur l'image"
                  >
                    <ZoomIn className="w-5 h-5" strokeWidth={1.5} />
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
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-all"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                        </button>
                      )}
                      
                      {currentImageIndex < lot.image_urls.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-all"
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="w-5 h-5" strokeWidth={2} />
                        </button>
                      )}

                      {/* Indicateur de position */}
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
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
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                {lot.is_urgent && (
                  <span className="inline-flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-medium">
                    🔥 Urgent
                  </span>
                )}
                <span className="ml-auto bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  -{discount}%
                </span>
              </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-4">
              {/* Titre */}
              <div>
                <h3 className="text-3xl font-bold text-black mb-2">
                  {lot.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-black text-sm px-3 py-1.5 rounded-full font-medium">
                  <Package className="w-4 h-4" strokeWidth={1.5} />
                  {lot.category}
                </span>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-black mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed font-light">
                  {lot.description}
                </p>
              </div>

              {/* Prix */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-black mb-3">Prix</h4>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-gray-600 font-light mb-1">Prix initial</div>
                    <div className="text-gray-400 line-through text-xl font-bold">
                      {lot.original_price}€
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 font-light mb-1">Prix réduit</div>
                    <div className="flex items-center gap-1">
                      <span className="text-4xl font-bold text-black">
                        {lot.discounted_price}€
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
                    Économisez {(lot.original_price - lot.discounted_price).toFixed(2)}€ ({discount}%)
                  </span>
                </div>
              </div>

              {/* Commerçant avec logo - Cliquable */}
              <div 
                className={`p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all ${
                  onMerchantClick 
                    ? 'cursor-pointer hover:bg-primary-50 hover:border-primary-300' 
                    : ''
                }`}
                onClick={onMerchantClick}
              >
                <h4 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  Commerçant
                  {onMerchantClick && (
                    <span className="ml-auto text-xs text-primary-600 font-medium">
                      Voir tous ses produits →
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg bg-gray-200">
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
                    <MapPin className={`w-6 h-6 text-gray-400 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black text-base mb-0.5 truncate">{lot.profiles.business_name}</div>
                    <div className="text-sm text-gray-600 font-light flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{lot.profiles.business_address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Disponibilité */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-black" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-gray-600 font-light">Disponibilité</div>
                  <div className="text-2xl font-bold text-black">{availableQty}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 font-light">
                Sur {lot.quantity_total} au total
              </div>
            </div>

            {/* Horaire de retrait */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-black" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-gray-600 font-light">Retrait</div>
                  <div className="text-sm font-bold text-black">
                    {format(new Date(lot.pickup_start), 'dd MMM', { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 font-light">
                {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
              </div>
            </div>

            {/* Impact environnemental */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🌱</span>
                <div>
                  <div className="text-xs text-gray-600 font-light">Impact CO₂</div>
                  <div className="text-sm font-bold text-black">{(availableQty * 0.9).toFixed(1)} kg</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 font-light">
                Évités potentiel
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          {lot.requires_cold_chain && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black">
                  ❄️ Produit nécessitant une chaîne du froid
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={onReserve}
            disabled={availableQty === 0}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-medium text-lg transition-all ${
              availableQty === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
            {availableQty === 0 ? 'Épuisé' : 'Réserver'}
          </button>
        </div>
      </div>

      {/* Modal Zoom Image Plein Écran */}
      {showImageZoom && lot.image_urls && lot.image_urls.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowImageZoom(false)}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Fermer le zoom"
          >
            <X className="w-6 h-6" strokeWidth={2} />
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

                {/* Compteur d'images */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium">
                  {currentImageIndex + 1} / {lot.image_urls.length}
                </div>
              </>
            )}
          </div>

          {/* Miniatures si plusieurs images */}
          {hasMultipleImages && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
              {lot.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
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

