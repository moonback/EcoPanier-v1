import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, categories, generatePIN } from '../../utils/helpers';
import { Package, MapPin, Clock, AlertCircle, Heart, Check, Filter, X } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: { business_name: string; business_address: string };
};

export const LotBrowser = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchLots();
  }, [selectedCategory]);

  const fetchLots = async () => {
    try {
      let query = supabase
        .from('lots')
        .select('*, profiles(business_name, business_address)')
        .eq('status', 'available')
        .gt('quantity_total', 0)
        .gt('discounted_price', 0)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filtrer les lots avec une quantité disponible réelle > 0
      const availableLots = (data as Lot[]).filter(lot => {
        const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return availableQty > 0;
      });
      
      setLots(availableLots);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (lot: Lot, isDonation: boolean = false) => {
    if (!profile) return;

    try {
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      if (quantity > availableQty) {
        alert('Quantité non disponible');
        return;
      }

      const pin = generatePIN();
      const totalPrice = isDonation ? 0 : lot.discounted_price * quantity;

      const { error: reservationError } = await supabase.from('reservations').insert({
        lot_id: lot.id,
        user_id: profile.id,
        quantity,
        total_price: totalPrice,
        pickup_pin: pin,
        status: 'pending',
        is_donation: isDonation,
      });

      if (reservationError) throw reservationError;

      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: lot.quantity_reserved + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lot.id);

      if (updateError) throw updateError;

      if (isDonation) {
        await supabase.from('impact_metrics').insert({
          user_id: profile.id,
          metric_type: 'donations_made',
          value: quantity,
        });
      } else {
        await supabase.from('impact_metrics').insert({
          user_id: profile.id,
          metric_type: 'meals_saved',
          value: quantity,
        });
      }

      alert(
        isDonation
          ? 'Panier suspendu créé avec succès!'
          : `Réservation confirmée! Code PIN: ${pin}`
      );

      setShowDonationModal(false);
      setSelectedLot(null);
      fetchLots();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la réservation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Bouton de filtre compact */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-primary-300 font-medium text-sm"
        >
          <Filter size={18} />
          <span>Filtrer par catégorie</span>
          {selectedCategory && (
            <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              1
            </span>
          )}
        </button>
        
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
          >
            <X size={16} />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Affichage du filtre actif */}
      {selectedCategory && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
          <Check size={16} className="text-primary-600" />
          <span className="text-sm text-primary-800 font-medium">
            Catégorie : <span className="font-bold">{selectedCategory}</span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lots.map((lot) => {
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          const discount = Math.round(
            ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
          );

          return (
            <div key={lot.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover-lift">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-green-100 to-blue-100">
                {lot.image_urls.length > 0 ? (
                  <img
                    src={lot.image_urls[0]}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={48} className="sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg">
                  -{discount}%
                </div>
                {lot.is_urgent && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1 shadow-lg">
                    <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                    <span>Urgent</span>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">{lot.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{lot.description}</p>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{lot.profiles.business_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Retrait: {formatDateTime(lot.pickup_start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-semibold text-primary-600">{availableQty} disponible(s)</span>
                  </div>
                </div>

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

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedLot(lot);
                      setQuantity(1);
                    }}
                    className="flex-1 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
                  >
                    Réserver
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLot(lot);
                      setQuantity(1);
                      setShowDonationModal(true);
                    }}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-all flex items-center justify-center"
                    title="Panier suspendu"
                  >
                    <Heart size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de filtres */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[80vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-primary-600" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Filtrer par catégorie
                </h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setShowFilterModal(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>Toutes les catégories</span>
                {selectedCategory === '' && <Check size={20} />}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowFilterModal(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check size={20} />}
                </button>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {selectedLot && !showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 line-clamp-2">
              Réserver {selectedLot.title}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                max={selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-base"
              />
            </div>
            <div className="mb-5 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                Total: <span className="text-xl sm:text-2xl text-green-600">{formatCurrency(selectedLot.discounted_price * quantity)}</span>
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedLot(null)}
                className="flex-1 py-2.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReserve(selectedLot, false)}
                className="flex-1 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de don (panier suspendu) */}
      {showDonationModal && selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="text-center mb-5">
              <Heart size={48} className="sm:w-14 sm:h-14 text-pink-500 mx-auto mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Panier Suspendu</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Offrez ce produit à une personne dans le besoin
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité à donner
              </label>
              <input
                type="number"
                min="1"
                max={selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-base"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDonationModal(false);
                  setSelectedLot(null);
                }}
                className="flex-1 py-2.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReserve(selectedLot, true)}
                className="flex-1 py-2.5 sm:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                Offrir généreusement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
