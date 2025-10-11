import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatDateTime, categories, generatePIN } from '../../utils/helpers';
import { Package, MapPin, Clock, Heart } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: { business_name: string; business_address: string };
};

interface FreeLotsListProps {
  dailyCount: number;
  onReservationMade: () => void;
}

export const FreeLotsList = ({ dailyCount, onReservationMade }: FreeLotsListProps) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchFreeLots();
  }, [selectedCategory]);

  const fetchFreeLots = async () => {
    try {
      let query = supabase
        .from('lots')
        .select('*, profiles(business_name, business_address)')
        .eq('status', 'available')
        .eq('discounted_price', 0)
        .gt('quantity_total', 0)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLots(data as Lot[]);
    } catch (error) {
      console.error('Error fetching free lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (lot: Lot) => {
    if (!profile || dailyCount >= 2) {
      alert('Limite quotidienne de 2 réservations atteinte');
      return;
    }

    try {
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      if (quantity > availableQty) {
        alert('Quantité non disponible');
        return;
      }

      const pin = generatePIN();
      const today = new Date().toISOString().split('T')[0];

      const { error: reservationError } = await supabase.from('reservations').insert({
        lot_id: lot.id,
        user_id: profile.id,
        quantity,
        total_price: 0,
        pickup_pin: pin,
        status: 'pending',
        is_donation: false,
      });

      if (reservationError) throw reservationError;

      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: lot.quantity_reserved + quantity,
        })
        .eq('id', lot.id);

      if (updateError) throw updateError;

      const { data: limitData, error: limitFetchError } = await supabase
        .from('beneficiary_daily_limits')
        .select('*')
        .eq('beneficiary_id', profile.id)
        .eq('date', today)
        .maybeSingle();

      if (limitFetchError && limitFetchError.code !== 'PGRST116') throw limitFetchError;

      if (limitData) {
        const { error: limitUpdateError } = await supabase
          .from('beneficiary_daily_limits')
          .update({ reservation_count: limitData.reservation_count + 1 })
          .eq('id', limitData.id);

        if (limitUpdateError) throw limitUpdateError;
      } else {
        const { error: limitInsertError } = await supabase
          .from('beneficiary_daily_limits')
          .insert({
            beneficiary_id: profile.id,
            date: today,
            reservation_count: 1,
          });

        if (limitInsertError) throw limitInsertError;
      }

      alert(`Réservation confirmée! Code PIN: ${pin}`);
      setSelectedLot(null);
      fetchFreeLots();
      onReservationMade();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la réservation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (dailyCount >= 2) {
    return (
      <div className="text-center py-12">
        <Heart size={64} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Limite quotidienne atteinte
        </h3>
        <p className="text-gray-600">
          Vous avez atteint votre limite de 2 réservations pour aujourd'hui.
          <br />
          Revenez demain pour plus de dons!
        </p>
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
              ? 'bg-pink-600 text-white'
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
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun don gratuit disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => {
            const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;

            return (
              <div
                key={lot.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-red-100">
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
                  <div className="absolute top-2 right-2 bg-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                    <Heart size={16} />
                    GRATUIT
                  </div>
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

                  <button
                    onClick={() => {
                      setSelectedLot(lot);
                      setQuantity(1);
                    }}
                    className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
                  >
                    Réserver Gratuitement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Réserver {selectedLot.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
              <input
                type="number"
                min="1"
                max={Math.min(
                  selectedLot.quantity_total -
                    selectedLot.quantity_reserved -
                    selectedLot.quantity_sold,
                  2
                )}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4 p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-800">
                Ce don est entièrement gratuit. Merci à nos généreux donateurs!
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
                onClick={() => handleReserve(selectedLot)}
                className="flex-1 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
