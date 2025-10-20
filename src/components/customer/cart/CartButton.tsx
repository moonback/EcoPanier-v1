import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';

interface CartButtonProps {
  onClick: () => void;
}

/**
 * Bouton du panier avec badge indiquant le nombre d'articles
 * Affiche un compteur animé quand des articles sont ajoutés
 */
export function CartButton({ onClick }: CartButtonProps) {
  const { getTotalItems } = useCartStore();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-primary-100"
      aria-label={`Panier (${itemCount} articles)`}
    >
      <ShoppingCart size={24} className="text-primary-600" strokeWidth={2} />
      
      {itemCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-accent-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse shadow-md">
          {itemCount}
        </div>
      )}
    </button>
  );
}

