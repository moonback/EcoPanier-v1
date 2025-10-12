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
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
        isSelected
          ? 'border-primary-400 bg-primary-50 shadow-lg'
          : 'border-neutral-200 bg-white hover:border-primary-200 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Indicateur pour clic sélectionné */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce z-10">
          Cliquez pour voir les lots
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected
            ? 'bg-gradient-to-br from-accent-500 to-accent-600 animate-pulse'
            : merchant.lots.some(l => l.is_urgent)
            ? 'bg-gradient-to-br from-accent-400 to-accent-600 animate-pulse'
            : 'bg-gradient-to-br from-primary-500 to-primary-600'
        }`}>
          <Store className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-neutral-900 truncate text-sm">
            {merchant.business_name || merchant.full_name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {merchant.lots.some(l => l.is_urgent) && (
              <span className="bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                🔥 Urgent
              </span>
            )}
            {merchant.distance && (
              <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {formatDistance(merchant.distance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Liste compacte des lots */}
      <div className="space-y-2">
        {merchant.lots.slice(0, 2).map((lot) => (
          <div key={lot.id} className="bg-neutral-50 rounded-lg p-2 border border-neutral-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-neutral-900 truncate">
                  {lot.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-neutral-600">
                    <Package className="w-3 h-3 inline mr-0.5" />
                    {lot.quantity_total - lot.quantity_reserved - lot.quantity_sold}
                  </span>
                  <span className="text-primary-600 font-bold">
                    <Euro className="w-3 h-3 inline mr-0.5" />
                    {lot.discounted_price}€
                  </span>
                </div>
              </div>
              {lot.is_urgent && (
                <span className="text-xs bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded font-medium">
                  Urgent
                </span>
              )}
            </div>
          </div>
        ))}
        {merchant.lots.length > 2 && (
          <div className="text-xs text-center text-neutral-600 py-1">
            +{merchant.lots.length - 2} autre{merchant.lots.length - 2 > 1 ? 's' : ''} lot{merchant.lots.length - 2 > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

