import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface LotReservationBarProps {
  availableQuantity: number;
  quantity: number;
  totalPrice: string;
  totalSavings: string;
  impactMeals: number;
  impactCO2: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReserve: () => void;
}

export function LotReservationBar({
  availableQuantity,
  quantity,
  totalPrice,
  totalSavings,
  impactMeals,
  impactCO2,
  onDecrease,
  onIncrease,
  onReserve,
}: LotReservationBarProps) {
  const isSoldOut = availableQuantity === 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-50 p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        <div className="flex flex-row items-center gap-3">
          {availableQuantity > 0 && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
              <span className="text-xs font-medium text-gray-700">Qté</span>
              <button
                onClick={onDecrease}
                disabled={quantity <= 1}
                className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Diminuer la quantité"
              >
                <Minus className="w-4 h-4" strokeWidth={2} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                onClick={onIncrease}
                disabled={quantity >= availableQuantity}
                className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Augmenter la quantité"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          <button
            onClick={onReserve}
            disabled={isSoldOut}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-base transition-all ${
              isSoldOut
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl hover:shadow-2xl'
            }`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {isSoldOut
              ? 'Épuisé'
              : quantity > 1
              ? `Réserver ${quantity} paniers (${totalPrice}€)`
              : 'Réserver ce panier'}
          </button>
        </div>

        <div className="flex flex-row items-center justify-between px-1 mt-1">
          <div>
            {availableQuantity > 0 && quantity > 1 && (
              <span className="text-xs text-gray-500">Économie: {totalSavings}€</span>
            )}
          </div>
          <div>
            {quantity > 0 && (
              <span className="text-xs text-gray-600">
                🌱 {impactMeals} repas sauvés • {impactCO2.toFixed(1)} kg CO₂ évité
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


