import { Package, MapPin, Clock, Heart, Euro, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
  };
};

interface LotCardProps {
  lot: Lot;
  onReserve: (lot: Lot) => void;
  onDonate: (lot: Lot) => void;
  onViewDetails?: (lot: Lot) => void;
}

/**
 * Composant carte pour afficher un lot disponible
 * Design moderne avec image complète et overlay détaillé au hover
 */
export function LotCard({ lot, onReserve, onDonate, onViewDetails }: LotCardProps) {
  const availableQty =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  return (
    <div 
      className="group relative card overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={() => onViewDetails?.(lot)}
    >
      {/* Image plein format */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
        {lot.image_urls && lot.image_urls.length > 0 ? (
          <img
            src={lot.image_urls[0]}
            alt={lot.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-neutral-400" />
          </div>
        )}

        {/* Badges fixes en haut */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
          {lot.is_urgent && (
            <span className="inline-flex items-center gap-1 bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-xl animate-pulse border-2 border-white">
              🔥 Urgent
            </span>
          )}
          <span className="ml-auto bg-success-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-xl border-2 border-white">
            -{discount}%
          </span>
        </div>

        {/* Prix simple en bas (toujours visible) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <Euro className="w-4 h-4 text-primary-600" />
            <span className="text-lg font-black text-primary-600">{lot.discounted_price}€</span>
          </div>
          <span className="bg-white/95 backdrop-blur-sm text-neutral-700 text-xs px-2 py-1 rounded-full font-medium shadow-lg">
            {lot.category}
          </span>
        </div>

        {/* Overlay détaillé au hover - Apparaît par le bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-3">
            {/* Titre */}
            <h3 className="font-bold text-lg line-clamp-2">
              {lot.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/90 line-clamp-2">
              {lot.description}
            </p>

            {/* Commerçant */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="truncate">{lot.profiles.business_name}</span>
            </div>

            {/* Prix détaillé */}
            <div className="flex items-center justify-between py-2 px-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <div>
                <div className="text-xs text-white/70">Prix initial</div>
                <div className="text-white/80 line-through font-medium">{lot.original_price}€</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/70">Prix réduit</div>
                <div className="flex items-center gap-1">
                  <Euro className="w-5 h-5" />
                  <span className="text-2xl font-black">{lot.discounted_price}€</span>
                </div>
              </div>
            </div>

            {/* Infos détaillées */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <span>
                  <span className="font-bold">{availableQty}</span> unités disponibles
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>
                  Retrait : {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                </span>
              </div>
            </div>

            {/* Actions - Boutons dans l'overlay */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReserve(lot);
                }}
                disabled={availableQty === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  availableQty === 0
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {availableQty === 0 ? 'Épuisé' : 'Réserver'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDonate(lot);
                }}
                className="px-4 py-3 bg-accent-500/90 hover:bg-accent-600 text-white rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                title="Panier suspendu"
                aria-label="Offrir en panier suspendu"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

