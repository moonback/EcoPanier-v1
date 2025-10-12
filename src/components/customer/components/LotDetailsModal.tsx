import { X, Package, MapPin, Clock, Euro, ShoppingCart, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Détails du lot</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Grille principale : Image + Infos */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Image principale */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
              {lot.image_urls && lot.image_urls.length > 0 ? (
                <img
                  src={lot.image_urls[0]}
                  alt={lot.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-neutral-400" />
                </div>
              )}

              {/* Badges sur l'image */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                {lot.is_urgent && (
                  <span className="inline-flex items-center gap-1.5 bg-accent-500 text-white text-sm px-3 py-1.5 rounded-full font-bold shadow-xl animate-pulse border-2 border-white">
                    🔥 Urgent
                  </span>
                )}
                <span className="ml-auto bg-success-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-xl border-2 border-white">
                  -{discount}%
                </span>
              </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-4">
              {/* Titre */}
              <div>
                <h3 className="text-3xl font-black text-neutral-900 mb-2">
                  {lot.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-sm px-3 py-1.5 rounded-full font-semibold">
                  <Package className="w-4 h-4" />
                  {lot.category}
                </span>
              </div>

              {/* Description */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-700 mb-2">Description</h4>
                <p className="text-neutral-600 leading-relaxed">
                  {lot.description}
                </p>
              </div>

              {/* Prix */}
              <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
                <h4 className="text-sm font-bold text-neutral-700 mb-3">Prix</h4>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-medium mb-1">Prix initial</div>
                    <div className="text-neutral-400 line-through text-xl font-bold">
                      {lot.original_price}€
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 font-medium mb-1">Prix réduit</div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-7 h-7 text-primary-600" />
                      <span className="text-4xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {lot.discounted_price}€
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-block bg-success-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Économisez {(lot.original_price - lot.discounted_price).toFixed(2)}€ ({discount}%)
                  </span>
                </div>
              </div>

              {/* Commerçant */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-700 mb-2">Commerçant</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{lot.profiles.business_name}</div>
                    <div className="text-sm text-neutral-600">{lot.profiles.business_address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Disponibilité */}
            <div className="card p-4 border-2 border-success-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-neutral-600 font-medium">Disponibilité</div>
                  <div className="text-2xl font-black text-success-600">{availableQty}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600">
                Sur <span className="font-bold">{lot.quantity_total}</span> au total
              </div>
            </div>

            {/* Horaire de retrait */}
            <div className="card p-4 border-2 border-primary-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-neutral-600 font-medium">Retrait</div>
                  <div className="text-sm font-bold text-primary-700">Aujourd'hui</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600">
                De {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} à {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
              </div>
            </div>

            {/* Impact environnemental */}
            <div className="card p-4 border-2 border-secondary-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-neutral-600 font-medium">Impact CO₂</div>
                  <div className="text-sm font-bold text-secondary-700">{(availableQty * 0.9).toFixed(1)} kg</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600">
                CO₂ évités potentiel
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          {lot.requires_cold_chain && (
            <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                <span className="font-semibold text-primary-700">
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
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-lg transition-all ${
                availableQty === 0
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {availableQty === 0 ? 'Épuisé' : 'Réserver ce lot'}
            </button>
            <button
              onClick={onDonate}
              className="px-6 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              title="Offrir en panier suspendu"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Offrir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

