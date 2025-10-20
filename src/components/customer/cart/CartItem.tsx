import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import type { CartItem as CartItemType } from '../../../stores/cartStore';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

/**
 * Composant affichant un article dans le panier
 * Permet de modifier la quantité ou de retirer l'article
 */
export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { lot, quantity } = item;
  const availableQuantity = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const maxQuantity = Math.min(availableQuantity, 99);

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onUpdateQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    } else {
      onRemove();
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
      {/* Image du lot */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
        {lot.image_urls && lot.image_urls[0] ? (
          <img
            src={lot.image_urls[0]}
            alt={lot.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            🛍️
          </div>
        )}
      </div>

      {/* Informations du lot */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
          {lot.title}
        </h4>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {lot.description}
        </p>
        
        {/* Prix */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary-600">
            {formatCurrency(lot.discounted_price)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(lot.original_price)}
          </span>
        </div>
      </div>

      {/* Contrôles de quantité */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          aria-label="Retirer du panier"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-1">
          <button
            onClick={handleDecrease}
            className="p-1 hover:bg-white rounded transition-all active:scale-95"
            aria-label="Diminuer la quantité"
            disabled={quantity <= 1}
          >
            <Minus size={14} strokeWidth={2} className={quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          
          <span className="text-sm font-semibold text-gray-900 min-w-[20px] text-center">
            {quantity}
          </span>
          
          <button
            onClick={handleIncrease}
            className="p-1 hover:bg-white rounded transition-all active:scale-95"
            aria-label="Augmenter la quantité"
            disabled={quantity >= maxQuantity}
          >
            <Plus size={14} strokeWidth={2} className={quantity >= maxQuantity ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {/* Total pour cet item */}
        <div className="text-sm font-bold text-gray-900">
          {formatCurrency(lot.discounted_price * quantity)}
        </div>
      </div>
    </div>
  );
}

