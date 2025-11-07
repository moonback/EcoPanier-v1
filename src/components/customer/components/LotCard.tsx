import { Package, MapPin, Clock, ShoppingCart, Sparkles, Flame } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
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
  const createdAtDate =
    typeof lot.created_at === 'string' || lot.created_at instanceof Date
      ? new Date(lot.created_at)
      : null;
  const isNew =
    createdAtDate !== null
      ? differenceInCalendarDays(new Date(), createdAtDate) <= 5
      : false;
  const popularityRatio =
    lot.quantity_total > 0
      ? (lot.quantity_reserved + lot.quantity_sold) / lot.quantity_total
      : 0;
  const isPopular = popularityRatio >= 0.6;
  const savings = lot.original_price - lot.discounted_price;

  const getHighlightBadge = () => {
    if (isOutOfStock) {
      return null;
    }
    if (isNew) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Nouveau
        </span>
      );
    }
    if (isPopular) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
          <Flame className="h-3 w-3" strokeWidth={2.5} />
          Populaire
        </span>
      );
    }
    return null;
  };
  const highlightBadge = getHighlightBadge();

  return (
    <div
      className={`group hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
      onClick={() => onViewDetails?.(lot)}
    >
      {/* Image avec overlay */}
      <div className="relative overflow-hidden">
        {/* Image */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200">
          {lot.image_urls && lot.image_urls.length > 0 ? (
            <img
              src={lot.image_urls[0]}
              alt={lot.title}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48 md:h-44 lg:h-48"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package size={36} className="text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Overlay gradient subtil au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge mise en avant */}
        {/* Badges haut gauche - Design pro */}
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1.5">
          {highlightBadge}
          {/* Catégorie - Always visible */}
          <span className="inline-flex items-center rounded border border-white/30 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-800 backdrop-blur-sm shadow">
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

        {/* Hover info détaillée */}
        {!isOutOfStock && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="mx-3 mb-3 rounded-xl bg-slate-900/85 px-3 py-2 text-white shadow-xl backdrop-blur-lg">
              <p className="line-clamp-3 text-[11px] text-white/90">
                {lot.description}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-200/90">
                <span>
                  Retrait {format(new Date(lot.pickup_start), 'dd/MM HH:mm', { locale: fr })}
                </span>
                <span>Économie {(savings > 0 ? savings : 0).toFixed(2)}€</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenu compact */}
      <div className="flex flex-1 flex-col p-3">
        {/* Titre et commerçant */}
        <div className="mb-2">
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900">
            {lot.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
              {lot.profiles.business_logo_url ? (
                <img
                  src={lot.profiles.business_logo_url}
                  alt={lot.profiles.business_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <MapPin className={`h-2.5 w-2.5 text-slate-400 ${lot.profiles.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
            </div>
            <span className="truncate">{lot.profiles.business_name}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {lot.discounted_price}€
            </span>
            {lot.original_price > lot.discounted_price && (
              <span className="text-xs text-slate-400 line-through">
                {lot.original_price}€
              </span>
            )}
          </div>
        </div>

        {/* Quantité disponible et horaires */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            <span>
              {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
            </span>
          </div>
          <div className={`flex items-center gap-1 font-semibold ${
            availableQty > 3 ? 'text-emerald-600' : availableQty > 0 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            <Package className="h-3 w-3" strokeWidth={1.5} />
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
          className={
            isOutOfStock
              ? 'flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-200 py-2 text-sm font-semibold text-slate-400'
              : 'btn-primary flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold'
          }
        >
          <ShoppingCart size={14} strokeWidth={2} />
          <span>{isOutOfStock ? 'Épuisé' : 'Réserver'}</span>
        </button>
      </div>
    </div>
  );
}

