import { Store, Navigation, Package, Euro } from 'lucide-react';
import { formatDistance } from '../../../utils/geocodingService';
import type { MerchantWithLots } from './types';

interface MerchantCardProps {
  merchant: MerchantWithLots;
  isSelected: boolean;
  onClick: () => void;
}

export function MerchantCard({ merchant, isSelected, onClick }: MerchantCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl border cursor-pointer transition relative ${
        isSelected
          ? 'border-black bg-gray-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Indicateur pour clic sélectionné */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
          Cliquez pour voir les lots
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition ${
          isSelected
            ? 'bg-black'
            : merchant.lots.some(l => l.is_urgent)
            ? 'bg-black animate-pulse'
            : 'bg-black'
        }`}>
          <Store className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black truncate text-sm">
            {merchant.business_name || merchant.full_name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {merchant.lots.some(l => l.is_urgent) && (
              <span className="bg-gray-100 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                🔥 Urgent
              </span>
            )}
            {merchant.distance && (
              <span className="text-xs text-gray-600 font-light flex items-center gap-1">
                <Navigation className="w-3 h-3" strokeWidth={1.5} />
                {formatDistance(merchant.distance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Liste compacte des lots */}
      <div className="space-y-2">
        {merchant.lots.slice(0, 2).map((lot) => (
          <div key={lot.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-black truncate">
                  {lot.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-gray-600 font-light">
                    <Package className="w-3 h-3 inline mr-0.5" strokeWidth={1.5} />
                    {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold}
                  </span>
                  <span className="text-black font-bold">
                    <Euro className="w-3 h-3 inline mr-0.5" strokeWidth={1.5} />
                    {lot.discounted_price}€
                  </span>
                </div>
              </div>
              {lot.is_urgent && (
                <span className="text-xs bg-gray-100 text-black px-1.5 py-0.5 rounded font-medium">
                  Urgent
                </span>
              )}
            </div>
          </div>
        ))}
        {merchant.lots.length > 2 && (
          <div className="text-xs text-center text-gray-600 font-light py-1">
            +{merchant.lots.length - 2} autre{merchant.lots.length - 2 > 1 ? 's' : ''} lot{merchant.lots.length - 2 > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

