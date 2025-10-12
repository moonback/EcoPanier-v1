import { Package, MapPin, Clock, AlertCircle, Heart } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';
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
}

/**
 * Composant carte pour afficher un lot disponible
 * Affiche les informations du lot avec les actions de réservation et don
 */
export function LotCard({ lot, onReserve, onDonate }: LotCardProps) {
  const availableQty =
    lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover-lift">
      {/* Image du lot */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-green-100 to-blue-100">
        {lot.image_urls.length > 0 ? (
          <img
            src={lot.image_urls[0]}
            alt={lot.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package
              size={48}
              className="sm:w-16 sm:h-16 text-gray-400"
              aria-label="Aucune image disponible"
            />
          </div>
        )}

        {/* Badge de réduction */}
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg">
          -{discount}%
        </div>

        {/* Badge urgent */}
        {lot.is_urgent && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1 shadow-lg">
            <AlertCircle size={14} className="sm:w-4 sm:h-4" />
            <span>Urgent</span>
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {lot.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
          {lot.description}
        </p>

        {/* Informations du lot */}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{lot.profiles.business_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              Retrait: {formatDateTime(lot.pickup_start)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-semibold text-primary-600">
              {availableQty} disponible(s)
            </span>
          </div>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(lot.discounted_price)}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
              {formatCurrency(lot.original_price)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onReserve(lot)}
            className="flex-1 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            Réserver
          </button>
          <button
            onClick={() => onDonate(lot)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-all flex items-center justify-center"
            title="Panier suspendu"
            aria-label="Offrir en panier suspendu"
          >
            <Heart size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

