import { Package, MapPin, Clock, ShoppingCart, Plus } from 'lucide-react';
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
  onAddToCart?: (lot: Lot) => void;
}

/**
 * Composant carte pour afficher un lot disponible
 * Design cohérent avec les cartes marchands
 */
export function LotCard({ lot, onReserve, onViewDetails, onAddToCart }: LotCardProps) {
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
      {/* Image avec overlay */}
      <div className="relative overflow-hidden">
        {/* Image */}
        <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200">
          {lot.image_urls && lot.image_urls.length > 0 ? (
            <img
              src={lot.image_urls[0]}
              alt={lot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package size={36} className="text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Overlay gradient subtil au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges haut gauche - Design pro */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {/* Catégorie - Always visible */}
          <span className="inline-flex items-center px-2 py-0.5 bg-white/75 backdrop-blur-sm text-[9px] font-bold text-gray-800 rounded shadow-md border border-white/30 uppercase tracking-wide">
            {lot.category}
          </span>
          
          {/* Urgent - Icône seule */}
          {lot.is_urgent && (
            <div className="relative group/urgent">
              <span className="inline-flex items-center justify-center w-6 h-6 text-base animate-pulse drop-shadow-lg cursor-help">
                ⚡
              </span>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/urgent:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Produit urgent
                </div>
              </div>
            </div>
          )}
          
          {/* Chaîne du froid - Icône seule */}
          {lot.requires_cold_chain && (
            <div className="relative group/cold">
              <span className="inline-flex items-center justify-center w-6 h-6 text-base drop-shadow-lg cursor-help">
                ❄️
              </span>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/cold:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Chaîne du froid
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge réduction haut droite - Visible au hover avec info */}
        {discount > 0 && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10">
            <div className="relative group/badge">
              {/* Badge circulaire */}
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-green-400/90 via-green-500/90 to-green-600/90 backdrop-blur-sm rounded-full shadow-md">
                <span className="text-white font-black text-[10px]">-{discount}%</span>
              </div>
              {/* Tooltip au hover */}
              <div className="absolute top-full right-0 mt-1.5 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Économie: {(lot.original_price - lot.discounted_price).toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge épuisé - Full overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-20">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded shadow-lg">
                <span className="text-sm">❌</span>
                Épuisé
              </span>
            </div>
          </div>
        )}

        {/* Barre de progression en bas de l'image */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${(availableQty / lot.quantity_total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Contenu compact */}
      <div className="p-2.5">
        {/* Titre et commerçant */}
        <div className="mb-1.5">
          <h3 className="text-[13px] font-bold text-gray-900 line-clamp-1 mb-0.5">
            {lot.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-600 font-light">
            <div className="w-3.5 h-3.5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
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
              <MapPin className={`w-2 h-2 text-gray-500 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
            </div>
            <span className="truncate text-[10px]">{lot.profiles.business_name}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              {lot.discounted_price}€
            </span>
            {lot.original_price > lot.discounted_price && (
              <span className="text-[10px] text-gray-400 line-through">
                {lot.original_price}€
              </span>
            )}
          </div>
        </div>

        {/* Quantité disponible et horaires */}
        <div className="flex items-center justify-between text-[9px] text-gray-500 mb-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>
              {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
            </span>
          </div>
          <div className={`flex items-center gap-0.5 font-semibold ${
            availableQty > 3 ? 'text-green-600' : availableQty > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            <Package className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>{availableQty} dispo</span>
          </div>
        </div>

        {/* Boutons d'action */}
        {onAddToCart ? (
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(lot);
              }}
              disabled={isOutOfStock}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-xs font-semibold ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-primary-600 hover:bg-primary-50 border-2 border-primary-600'
              }`}
              title="Ajouter au panier"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>Panier</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReserve(lot);
              }}
              disabled={isOutOfStock}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-xs font-semibold ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              title="Réserver maintenant"
            >
              <ShoppingCart size={12} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve(lot);
            }}
            disabled={isOutOfStock}
            className={`w-full py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-xs font-semibold ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart size={12} strokeWidth={2} />
            <span>{isOutOfStock ? 'Épuisé' : 'Réserver'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

