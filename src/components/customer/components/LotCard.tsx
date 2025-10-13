import { Package, MapPin, Clock, Heart, Euro, ShoppingCart } from 'lucide-react';
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

interface LotCardProps {
  lot: Lot;
  onReserve: (lot: Lot) => void;
  onDonate: (lot: Lot) => void;
  onViewDetails?: (lot: Lot) => void;
}

/**
 * Composant carte pour afficher un lot disponible
 * Version mobile : Layout vertical avec infos toujours visibles
 * Version desktop : Design avec overlay détaillé au hover
 */
export function LotCard({ lot, onReserve, onDonate, onViewDetails }: LotCardProps) {
  const availableQty =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onViewDetails?.(lot)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        {lot.image_urls && lot.image_urls.length > 0 ? (
          <img
            src={lot.image_urls[0]}
            alt={lot.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {lot.is_urgent && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium">
              🔥 Urgent
            </span>
          )}
          <span className="ml-auto bg-black text-white px-2 py-1 rounded-full text-xs font-medium">
            -{discount}%
          </span>
        </div>

        {/* Catégorie */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-black font-medium text-xs px-2 py-1 rounded-full">
            {lot.category}
          </span>
        </div>

      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Titre */}
        <h3 className="font-bold text-base line-clamp-2 text-black">
          {lot.title}
        </h3>

        {/* Commerçant */}
        <div className="flex items-center gap-2 text-sm text-gray-600 font-light">
          <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
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
            <MapPin className={`w-3 h-3 text-gray-500 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
          </div>
          <span className="truncate">{lot.profiles.business_name}</span>
        </div>

        {/* Prix */}
        <div className="flex items-end justify-between py-3 border-t border-b border-gray-100">
          <div>
            <div className="text-xs text-gray-500 font-light">Prix initial</div>
            <div className="text-sm text-gray-400 line-through">{lot.original_price}€</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-light">Prix réduit</div>
            <div className="text-2xl font-bold text-black">{lot.discounted_price}€</div>
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-2 text-xs text-gray-600 font-light">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{availableQty} unités disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>
              {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve(lot);
            }}
            disabled={availableQty === 0}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-medium transition-all py-3 text-sm ${
              availableQty === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
            {availableQty === 0 ? 'Épuisé' : 'Réserver'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDonate(lot);
            }}
            className="flex items-center justify-center bg-gray-100 text-black rounded-lg transition-all hover:bg-gray-200 px-4 py-3"
            title="Panier suspendu"
            aria-label="Offrir en panier suspendu"
          >
            <Heart className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

