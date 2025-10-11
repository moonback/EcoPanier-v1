import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, categories, generatePIN } from '../../utils/helpers';
import { Package, MapPin, Clock, AlertCircle, Heart, Check } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: { business_name: string; business_address: string };
};

export const LotBrowser = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDonationModal, setShowDonationModal] = useState(false);
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
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Toutes les catégories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => {
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          const discount = Math.round(
            ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
          );

          return (
            <div key={lot.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                {lot.image_urls.length > 0 ? (
                  <img
                    src={lot.image_urls[0]}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                  -{discount}%
                </div>
                {lot.is_urgent && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    Urgent
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{lot.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lot.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{lot.profiles.business_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Retrait: {formatDateTime(lot.pickup_start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={16} />
                    <span>{availableQty} disponible(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(lot.discounted_price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
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
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Réserver
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLot(lot);
                      setQuantity(1);
                      setShowDonationModal(true);
                    }}
                    className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                    title="Panier suspendu"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedLot && !showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Réserver {selectedLot.title}</h3>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <p className="text-lg font-semibold">
                Total: {formatCurrency(selectedLot.discounted_price * quantity)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLot(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReserve(selectedLot, false)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonationModal && selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <Heart size={48} className="text-pink-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold">Panier Suspendu</h3>
              <p className="text-sm text-gray-600 mt-2">
                Offrez ce produit à une personne dans le besoin
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité à donner
              </label>
              <input
                type="number"
                min="1"
                max={selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDonationModal(false);
                  setSelectedLot(null);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReserve(selectedLot, true)}
                className="flex-1 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Offrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
