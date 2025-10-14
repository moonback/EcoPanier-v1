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
      className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
        isSelected
          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white shadow-xl scale-105'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      {/* Indicateur pour clic sélectionné */}
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg z-10 animate-pulse">
          👆 Cliquez pour voir les paniers
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
          isSelected
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 scale-110'
            : merchant.lots.some(l => l.is_urgent)
            ? 'bg-gradient-to-br from-warning-500 to-orange-500 animate-pulse'
            : 'bg-gradient-to-br from-gray-700 to-gray-800 group-hover:from-primary-500 group-hover:to-primary-600'
        }`}>
          <Store className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black truncate text-sm group-hover:text-primary-600 transition-colors">
            {merchant.business_name || merchant.full_name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {merchant.lots.some(l => l.is_urgent) && (
              <span className="bg-gradient-to-r from-warning-100 to-orange-100 text-warning-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-warning-200">
                🔥 Urgent
              </span>
            )}
            {merchant.distance && (
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Navigation className="w-3 h-3" strokeWidth={2} />
                {formatDistance(merchant.distance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Liste compacte des lots */}
      <div className="space-y-2">
        {merchant.lots.slice(0, 2).map((lot) => (
          <div key={lot.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-200 hover:border-primary-200 transition-all group/lot">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-black truncate group-hover/lot:text-primary-600 transition-colors">
                  {lot.title}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <Package className="w-3 h-3" strokeWidth={2} />
                    <span>{lot.quantity_total - lot.quantity_reserved - lot.quantity_sold} dispo</span>
                  </span>
                  <span className="text-primary-600 font-bold flex items-center gap-1">
                    <Euro className="w-3 h-3" strokeWidth={2} />
                    <span>{lot.discounted_price}€</span>
                  </span>
                </div>
              </div>
              {lot.is_urgent && (
                <span className="text-xs bg-gradient-to-r from-warning-100 to-orange-100 text-warning-700 px-2 py-1 rounded-full font-semibold border border-warning-200">
                  🔥
                </span>
              )}
            </div>
          </div>
        ))}
        {merchant.lots.length > 2 && (
          <div className="text-xs text-center text-primary-600 font-semibold py-2 bg-primary-50 rounded-lg border border-primary-100">
            +{merchant.lots.length - 2} autre{merchant.lots.length - 2 > 1 ? 's' : ''} panier{merchant.lots.length - 2 > 1 ? 's' : ''} 🎁
          </div>
        )}
      </div>
    </div>
  );
}

