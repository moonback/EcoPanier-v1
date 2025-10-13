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
      className="group relative overflow-hidden cursor-pointer transition-all duration-300
        /* Mobile : Carte simple avec ombre mobile */
        shadow-mobile-card active:scale-[0.98] 
        /* Desktop : Effet hover élégant */
        md:card md:hover:shadow-2xl md:hover:-translate-y-1"
      onClick={() => onViewDetails?.(lot)}
    >
      {/* Image - Responsive aspect ratio */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200
        /* Mobile : Format paysage compact */
        aspect-[4/3]
        /* Desktop : Format portrait élégant */
        md:aspect-[3/4]">
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

        {/* Badges en haut - Responsive sizing */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
          {lot.is_urgent && (
            <span className="inline-flex items-center gap-1 bg-accent-500 text-white font-bold shadow-mobile-raised animate-pulse border-2 border-white
              /* Mobile : Badge plus petit */
              text-[10px] px-1.5 py-0.5 rounded-full
              /* Desktop : Badge standard */
              md:text-xs md:px-2 md:py-1">
              🔥 Urgent
            </span>
          )}
          <span className="ml-auto bg-success-500 text-white font-bold shadow-mobile-raised border-2 border-white
            /* Mobile : Badge plus petit */
            text-[10px] px-1.5 py-0.5 rounded-full
            /* Desktop : Badge standard */
            md:text-xs md:px-2 md:py-1">
            -{discount}%
          </span>
        </div>

        {/* Prix - Responsive */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
          
          <span className="bg-white/95 backdrop-blur-sm text-neutral-700 font-medium shadow-mobile-raised rounded-full
            /* Mobile : Catégorie compacte */
            text-[10px] px-1.5 py-0.5
            /* Desktop : Catégorie standard */
            md:text-xs md:px-2 md:py-1">
            {lot.category}
          </span>
        </div>

        {/* Overlay détaillé - Desktop uniquement (hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-transform duration-300 ease-out z-20
          /* Mobile : Caché */
          hidden
          /* Desktop : Visible au hover */
          md:block md:translate-y-full md:group-hover:translate-y-0">
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

      {/* Contenu mobile - Affiché sous l'image sur mobile uniquement */}
      <div className="md:hidden p-3 space-y-3 bg-white">
        {/* Titre et commerçant */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-sm line-clamp-2 text-neutral-900">
            {lot.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{lot.profiles.business_name}</span>
          </div>
        </div>

        {/* Prix comparatif */}
        <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-medium">Prix initial</div>
            <div className="text-sm text-neutral-600 line-through font-medium">{lot.original_price}€</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-primary-600 uppercase font-medium">Prix réduit</div>
            <div className="flex items-center gap-0.5">
              <Euro className="w-4 h-4 text-primary-600" />
              <span className="text-xl font-black text-primary-600">{lot.discounted_price}€</span>
            </div>
          </div>
        </div>

        {/* Infos compactes */}
        <div className="flex items-center gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 flex-shrink-0" />
            <span><span className="font-bold text-neutral-900">{availableQty}</span> dispo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
            </span>
          </div>
        </div>

        {/* Boutons tactiles - Mobile optimized */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve(lot);
            }}
            disabled={availableQty === 0}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold transition-all
              /* Taille tactile optimale (min 44px) */
              py-3 text-sm
              /* Feedback tactile */
              active:scale-95
              ${
                availableQty === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white shadow-mobile-raised active:shadow-mobile-card'
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
            className="flex items-center justify-center bg-accent-500 text-white rounded-lg transition-all shadow-mobile-raised active:scale-95 active:shadow-mobile-card
              /* Taille tactile optimale */
              px-4 py-3"
            title="Panier suspendu"
            aria-label="Offrir en panier suspendu"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

