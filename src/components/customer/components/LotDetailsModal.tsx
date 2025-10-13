import { X, Package, MapPin, Clock, Euro, ShoppingCart, Heart } from 'lucide-react';
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
  onDonate: () => void;
}

export function LotDetailsModal({ lot, onClose, onReserve, onDonate }: LotDetailsModalProps) {
  const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
            {/* Image principale */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              {lot.image_urls && lot.image_urls.length > 0 ? (
                <img
                  src={lot.image_urls[0]}
                  alt={lot.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" strokeWidth={1} />
                </div>
              )}

              {/* Badges sur l'image */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                {lot.is_urgent && (
                  <span className="inline-flex items-center gap-1.5 bg-black text-white text-sm px-3 py-1.5 rounded-full font-medium">
                    🔥 Urgent
                  </span>
                )}
                <span className="ml-auto bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium">
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

              {/* Commerçant avec logo */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  Commerçant
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
          <div className="flex gap-3">
            <button
              onClick={onReserve}
              disabled={availableQty === 0}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl font-medium text-lg transition-all ${
                availableQty === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {availableQty === 0 ? 'Épuisé' : 'Réserver'}
            </button>
            <button
              onClick={onDonate}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              title="Offrir en panier suspendu"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Offrir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

