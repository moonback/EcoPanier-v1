import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../../stores/cartStore';
import { CartItem } from './CartItem';
import { formatCurrency } from '../../../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}

/**
 * Tiroir latéral affichant le contenu du panier
 * Permet de modifier les quantités, retirer des articles et valider la commande
 */
export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const merchantName = items[0]?.lot.profiles.business_name || '';
  const merchantAddress = items[0]?.lot.profiles.business_address || '';

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      await onCheckout();
      clearCart();
      onClose();
    } catch (err) {
      console.error('Erreur lors de la validation du panier:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de valider le panier. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Tiroir */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-50 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ShoppingBag size={24} className="text-primary-600" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mon Panier</h2>
              <p className="text-sm text-gray-500">
                {items.length} {items.length > 1 ? 'produits' : 'produit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Informations commerçant */}
        {items.length > 0 && (
          <div className="p-4 bg-primary-50 border-b border-primary-100">
            <p className="text-sm font-semibold text-primary-900 mb-1">
              🏪 {merchantName}
            </p>
            <p className="text-xs text-primary-700">
              📍 {merchantAddress}
            </p>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Votre panier est vide
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Parcourez nos lots disponibles et ajoutez-les à votre panier
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Découvrir les lots
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.lot.id}
                  item={item}
                  onUpdateQuantity={(quantity) => updateQuantity(item.lot.id, quantity)}
                  onRemove={() => removeItem(item.lot.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer avec résumé et bouton */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-200 space-y-4">
            {/* Message d'erreur */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Résumé */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            {/* Informations */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 flex items-start gap-2">
                <span className="text-base">✨</span>
                <span>
                  Vous économisez et sauvez des repas du gaspillage ! Un seul QR code sera généré pour tout retirer.
                </span>
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Vider
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validation...</span>
                  </div>
                ) : (
                  'Valider le panier'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

