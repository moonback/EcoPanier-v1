import { Package, MapPin, Clock, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
  requires_cold_chain?: boolean;
};

interface LotCardProps {
  lot: Lot;
  onReserve: (lot: Lot) => void;
  onViewDetails?: (lot: Lot) => void;
}

/**
 * Composant carte pour afficher un lot disponible
 * Design cohérent avec les cartes marchands
 */
export function LotCard({ lot, onReserve, onViewDetails }: LotCardProps) {
  const availableQty =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );
  const isOutOfStock = availableQty === 0;

  return (
    <div 
      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
      onClick={() => onViewDetails?.(lot)}
    >
      {/* En-tête avec image et badges */}
      <div className="relative">
        {/* Badges superposés */}
        <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {/* Badge catégorie */}
            <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-md shadow-sm">
              {lot.category}
            </span>
            
            {/* Badge urgent */}
            {lot.is_urgent && (
              <span className="px-2 py-0.5 bg-red-500/95 backdrop-blur-sm text-xs font-medium text-white rounded-md shadow-sm flex items-center gap-1">
                <span className="animate-pulse">⚡</span>
                Urgent
              </span>
            )}
            
            {/* Badge chaîne du froid */}
            {lot.requires_cold_chain && (
              <span className="px-2 py-0.5 bg-blue-500/95 backdrop-blur-sm text-xs font-medium text-white rounded-md shadow-sm">
                🧊 Frais
              </span>
            )}
          </div>

          {/* Badge réduction et statut */}
          <div className="flex flex-col items-end gap-1.5">
            {discount > 0 && !isOutOfStock && (
              <span className="px-2 py-0.5 bg-green-500/95 backdrop-blur-sm text-xs font-bold text-white rounded-md shadow-sm">
                -{discount}%
              </span>
            )}
            <span className={`px-2 py-0.5 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm ${
              isOutOfStock 
                ? 'bg-gray-800/95 text-white' 
                : 'bg-green-500/95 text-white'
            }`}>
              {isOutOfStock ? '❌ Épuisé' : '✅ Dispo'}
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200">
          {lot.image_urls && lot.image_urls.length > 0 ? (
            <img
              src={lot.image_urls[0]}
              alt={lot.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package size={40} className="text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Barre de progression */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(availableQty / lot.quantity_total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Contenu compact */}
      <div className="p-3">
        {/* Titre et commerçant */}
        <div className="mb-2">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
            {lot.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-light">
            <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
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
              <MapPin className={`w-2.5 h-2.5 text-gray-500 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
            </div>
            <span className="truncate text-[11px]">{lot.profiles.business_name}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {lot.discounted_price}€
            </span>
            {lot.original_price > lot.discounted_price && (
              <span className="text-xs text-gray-400 line-through">
                {lot.original_price}€
              </span>
            )}
          </div>
        </div>

        {/* Quantité disponible et horaires */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span>
              {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
            </span>
          </div>
          <div className={`flex items-center gap-1 font-semibold ${
            availableQty > 3 ? 'text-green-600' : availableQty > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            <Package className="w-3 h-3" strokeWidth={1.5} />
            <span>{availableQty} dispo</span>
          </div>
        </div>

        {/* Bouton d'action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReserve(lot);
          }}
          disabled={isOutOfStock}
          className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm font-semibold ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200'
          }`}
        >
          <ShoppingCart size={14} strokeWidth={2} />
          <span>{isOutOfStock ? 'Épuisé' : 'Réserver'}</span>
        </button>
      </div>
    </div>
  );
}

