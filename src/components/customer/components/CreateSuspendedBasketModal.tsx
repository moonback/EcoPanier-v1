import { useState, useEffect } from 'react';
import { X, Heart, Package, AlertCircle, Wallet, Plus, Minus, Search } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { suspendedBasketService, type CreateSuspendedBasketInput } from '../../../utils/suspendedBasketService';
import { getWalletBalance, payFromWallet } from '../../../utils/walletService';
import { formatCurrency, getCategoryLabel } from '../../../utils/helpers';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
};

interface CreateSuspendedBasketModalProps {
  onClose: () => void;
  onSuccess: () => void;
  lotId?: string; // Lot pré-sélectionné (optionnel)
}

/**
 * Modal pour créer un nouveau panier suspendu à partir d'un lot
 * Permet au client de sélectionner un lot disponible et une quantité
 */
export function CreateSuspendedBasketModal({
  onClose,
  onSuccess,
  lotId: initialLotId,
}: CreateSuspendedBasketModalProps) {
  // Hooks
  const { user } = useAuthStore();

  // État local
  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Charger les lots disponibles et le solde
  useEffect(() => {
    const loadData = async () => {
      setLoadingLots(true);
      try {
        const [lotsData, balance] = await Promise.all([
          loadAvailableLots(),
          user?.id ? getWalletBalance(user.id) : Promise.resolve(0),
        ]);
        setLots(lotsData);
        setWalletBalance(balance);
        
        // Si un lot est pré-sélectionné, le charger
        if (initialLotId) {
          const lot = lotsData.find((l) => l.id === initialLotId);
          if (lot) {
            setSelectedLot(lot);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoadingLots(false);
      }
    };

    loadData();
  }, [user?.id, initialLotId]);

  const loadAvailableLots = async (): Promise<Lot[]> => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select(`
          *,
          profiles!merchant_id(business_name, business_address, business_logo_url)
        `)
        .eq('status', 'available')
        .neq('is_free', true) // Exclure les lots gratuits
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrer pour ne garder que ceux avec du stock disponible
      return (data || []).filter((lot) => {
        const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return availableQty > 0;
      }) as Lot[];
    } catch (error) {
      console.error('Erreur lors du chargement des lots:', error);
      return [];
    }
  };

  // Filtrer les lots selon la recherche
  const filteredLots = lots.filter((lot) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lot.title.toLowerCase().includes(query) ||
      lot.category.toLowerCase().includes(query) ||
      lot.profiles.business_name.toLowerCase().includes(query)
    );
  });

  // Calculer le montant total
  const totalAmount = selectedLot ? selectedLot.discounted_price * quantity : 0;
  const maxQuantity = selectedLot
    ? selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold
    : 0;

  // Handlers
  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Vous devez être connecté');
      return;
    }

    if (!selectedLot) {
      setError('Veuillez sélectionner un lot');
      return;
    }

    if (quantity <= 0 || quantity > maxQuantity) {
      setError(`La quantité doit être entre 1 et ${maxQuantity}`);
      return;
    }

    if (walletBalance === null || walletBalance < totalAmount) {
      setError('Solde insuffisant dans votre portefeuille');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer le panier suspendu
      const basketInput: CreateSuspendedBasketInput = {
        lot_id: selectedLot.id,
        quantity,
        notes: notes.trim() || undefined,
      };

      const basket = await suspendedBasketService.createBasket(basketInput, user.id);

      // Débiter le portefeuille
      await payFromWallet(
        user.id,
        totalAmount,
        `Panier suspendu: ${selectedLot.title} (x${quantity})`,
        basket.id,
        'suspended_basket'
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur lors de la création du panier:', err);
      setError(err instanceof Error ? err.message : 'Impossible de créer le panier suspendu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-6 border-b-2 border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Offrir un panier suspendu</h3>
                <p className="text-sm text-gray-600 mt-1">Sélectionnez un lot à offrir</p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Message d'information */}
          <div className="bg-gradient-to-r from-accent-50 to-pink-50 border-2 border-accent-200 rounded-xl p-4">
            <p className="text-sm text-gray-800 font-medium">
              💝 En offrant un panier suspendu, vous permettez à une personne dans le besoin de récupérer ce lot gratuitement.
            </p>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un lot..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition-all"
            />
          </div>

          {/* Liste des lots ou sélection */}
          {!selectedLot ? (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Sélectionner un lot</h4>
              {loadingLots ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Chargement des lots...</p>
                </div>
              ) : filteredLots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    {searchQuery ? 'Aucun lot trouvé' : 'Aucun lot disponible'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredLots.map((lot) => {
                    const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
                    const discount = Math.round(
                      ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
                    );
                    return (
                      <button
                        key={lot.id}
                        onClick={() => setSelectedLot(lot)}
                        className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-accent-500 hover:shadow-md transition-all"
                      >
                        <div className="flex gap-4">
                          {lot.image_urls && lot.image_urls.length > 0 ? (
                            <img
                              src={lot.image_urls[0]}
                              alt={lot.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 truncate">{lot.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{lot.profiles.business_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-lg font-black text-accent-600">
                                {formatCurrency(lot.discounted_price)}
                              </span>
                              {discount > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                  -{discount}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {availableQty} disponible{availableQty > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lot sélectionné */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-accent-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Lot sélectionné</h4>
                  <button
                    onClick={() => setSelectedLot(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Changer
                  </button>
                </div>
                <div className="flex gap-4">
                  {selectedLot.image_urls && selectedLot.image_urls.length > 0 ? (
                    <img
                      src={selectedLot.image_urls[0]}
                      alt={selectedLot.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900">{selectedLot.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{selectedLot.profiles.business_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{getCategoryLabel(selectedLot.category)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-black text-accent-600">
                        {formatCurrency(selectedLot.discounted_price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(selectedLot.original_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={loading}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(maxQuantity, val)));
                    }}
                    disabled={loading}
                    className="w-20 text-center px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none font-semibold disabled:bg-gray-100"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={loading || quantity >= maxQuantity}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="text-sm text-gray-600 ml-2">
                    (max: {maxQuantity})
                  </span>
                </div>
              </div>

              {/* Notes optionnelles */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  placeholder="Un message de solidarité pour le bénéficiaire..."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {notes.length}/200
                </p>
              </div>

              {/* Résumé */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Prix unitaire:</span>
                  <span className="font-semibold">{formatCurrency(selectedLot.discounted_price)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Quantité:</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-black text-accent-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Solde du portefeuille */}
              {walletBalance !== null && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">Solde disponible</span>
                    </div>
                    <span className={`text-lg font-black ${walletBalance >= totalAmount ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                  {walletBalance < totalAmount && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Solde insuffisant. Rechargez votre portefeuille.
                    </p>
                  )}
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {selectedLot && (
          <div className="p-6 border-t-2 border-gray-200 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || quantity <= 0 || quantity > maxQuantity || (walletBalance !== null && walletBalance < totalAmount)}
              className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Heart size={18} />
                  Offrir {formatCurrency(totalAmount)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
