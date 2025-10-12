import { X, Store, Navigation, Package, Euro, Clock, ShoppingCart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatDistance } from '../../utils/geocodingService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../lib/database.types';

type LotBase = Database['public']['Tables']['lots']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface MerchantLotsModalProps {
  merchant: Profile & { lots: LotBase[]; distance?: number };
  onClose: () => void;
  onReserve: (lot: LotBase) => void;
}

export function MerchantLotsModal({ merchant, onClose, onReserve }: MerchantLotsModalProps) {
  const [selectedLot, setSelectedLot] = useState<LotBase | null>(null);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {merchant.business_name || merchant.full_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {merchant.business_address || merchant.address}
                  </span>
                  {merchant.distance && (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      {formatDistance(merchant.distance)}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    {merchant.lots.length} lot{merchant.lots.length > 1 ? 's' : ''} disponible{merchant.lots.length > 1 ? 's' : ''}
                  </span>
                  {merchant.lots.some(l => l.is_urgent) && (
                    <span className="bg-accent-500 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                      🔥 Lots urgents
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Liste des lots */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {merchant.lots.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">Aucun lot disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {merchant.lots.map((lot) => (
                <div
                  key={lot.id}
                  className={`border-2 rounded-xl p-3 transition-all duration-200 cursor-pointer ${
                    selectedLot?.id === lot.id
                      ? 'border-primary-400 bg-primary-50 shadow-lg scale-[1.02]'
                      : 'border-neutral-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedLot(lot)}
                >
                  {/* Header compact */}
                  <div className="mb-2">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 flex-1">
                        {lot.title}
                      </h3>
                      {lot.is_urgent && (
                        <span className="bg-accent-100 text-accent-700 text-xs px-1.5 py-0.5 rounded font-bold animate-pulse flex-shrink-0">
                          🔥
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {lot.description}
                    </p>
                  </div>

                  {/* Catégorie compacte */}
                  <div className="mb-2">
                    <span className="bg-neutral-100 text-neutral-700 text-xs px-2 py-0.5 rounded-full">
                      {lot.category}
                    </span>
                  </div>

                  {/* Prix compact */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-neutral-400 line-through text-xs">
                        {lot.original_price}€
                      </span>
                      <div className="flex items-center gap-0.5 text-primary-600">
                        <Euro className="w-4 h-4" />
                        <span className="text-xl font-black">{lot.discounted_price}€</span>
                      </div>
                    </div>
                    <div className="bg-success-100 text-success-700 px-1.5 py-0.5 rounded text-xs font-bold">
                      -{Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100)}%
                    </div>
                  </div>

                  {/* Info compacte */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Package className="w-3 h-3 text-neutral-600" />
                      <span className="text-neutral-700">
                        <span className="font-bold text-success-600">
                          {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold}
                        </span>
                        {' '}dispo
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* Bouton compact */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserve(lot);
                    }}
                    disabled={lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold === 0 ? 'Épuisé' : 'Réserver'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

