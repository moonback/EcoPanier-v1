import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDateTime, generatePIN } from '../../utils/helpers';
import { Package, MapPin, Clock, Heart, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: { business_name: string; business_address: string };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskLotsListProps {
  profile: Profile;
  dailyCount: number;
  onReservationMade: () => void;
  onActivity: () => void;
}

export const KioskLotsList = ({ profile, dailyCount, onReservationMade, onActivity }: KioskLotsListProps) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [reserving, setReserving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ pin: string; lot: string } | null>(null);

  useEffect(() => {
    fetchFreeLots();
  }, []);

  const fetchFreeLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*, profiles(business_name, business_address)')
        .eq('status', 'available')
        .eq('discounted_price', 0)
        .gt('quantity_total', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const availableLots = (data as Lot[]).filter(lot => {
        const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return availableQty > 0;
      });

      setLots(availableLots);
    } catch (error) {
      console.error('Error fetching free lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLot = (lot: Lot) => {
    setSelectedLot(lot);
    onActivity();
  };

  const handleReserve = async () => {
    if (!selectedLot || dailyCount >= 2) return;

    setReserving(true);
    onActivity();

    try {
      const availableQty = selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold;
      if (availableQty < 1) {
        alert('Ce panier n\'est plus disponible');
        setSelectedLot(null);
        setReserving(false);
        return;
      }

      const pin = generatePIN();
      const today = new Date().toISOString().split('T')[0];

      // Créer la réservation
      const { error: reservationError } = await supabase.from('reservations').insert({
        lot_id: selectedLot.id,
        user_id: profile.id,
        quantity: 1,
        total_price: 0,
        pickup_pin: pin,
        status: 'pending',
        is_donation: false,
      });

      if (reservationError) throw reservationError;

      // Mettre à jour le lot
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: selectedLot.quantity_reserved + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLot.id);

      if (updateError) throw updateError;

      // Mettre à jour la limite quotidienne
      const { data: limitData, error: limitFetchError } = await supabase
        .from('beneficiary_daily_limits')
        .select('*')
        .eq('beneficiary_id', profile.id)
        .eq('date', today)
        .maybeSingle();

      if (limitFetchError && limitFetchError.code !== 'PGRST116') throw limitFetchError;

      if (limitData) {
        await supabase
          .from('beneficiary_daily_limits')
          .update({ reservation_count: limitData.reservation_count + 1 })
          .eq('id', limitData.id);
      } else {
        await supabase
          .from('beneficiary_daily_limits')
          .insert({
            beneficiary_id: profile.id,
            date: today,
            reservation_count: 1,
          });
      }

      // Afficher le message de succès avec le PIN
      setSuccessMessage({ pin, lot: selectedLot.title });
      setSelectedLot(null);
      fetchFreeLots();
      onReservationMade();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (dailyCount >= 2) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-success-50 to-accent-50 rounded-full mb-3">
          <Heart size={48} className="text-success-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          Vous avez vos 2 paniers du jour ! 🎉
        </h3>
        <p className="text-sm text-gray-600">
          Revenez demain pour de nouveaux paniers 🌅
        </p>
      </div>
    );
  }

  return (
    <div>
      {lots.length === 0 ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
            <Package size={48} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">
            Aucun panier disponible 🔍
          </h3>
          <p className="text-sm text-gray-600">
            Revenez bientôt ! ⏰
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {lots.map((lot) => {
            const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;

            return (
              <button
                key={lot.id}
                onClick={() => handleSelectLot(lot)}
                className="group bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-soft-md transition-all border border-gray-100 hover:border-accent-300 text-left"
              >
                {/* Image */}
                <div className="relative h-24 bg-gradient-to-br from-accent-100 via-pink-100 to-accent-100">
                  {lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={32} className="text-accent-300" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-1.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
                    <Heart size={10} strokeWidth={2} />
                    <span>GRATUIT</span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">
                    {lot.title}
                  </h3>

                  <div className="space-y-0.5 text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="flex-shrink-0" />
                      <span className="truncate text-xs">{lot.profiles.business_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={10} className="flex-shrink-0" />
                      <span className="font-bold text-pink-600 text-xs">{availableQty} dispo</span>
                    </div>
                  </div>

                  <div className="py-1.5 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 group-hover:from-accent-700 group-hover:to-pink-700 transition-all">
                    <Heart size={12} strokeWidth={2} />
                    <span>Réserver</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation */}
      {selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 max-h-[90vh] overflow-y-auto animate-fade-in-up shadow-soft-xl border-2 border-accent-200">
            <h3 className="text-base font-bold mb-3 text-gray-900 text-center">
              Confirmer la réservation ?
            </h3>

            {/* Image du produit */}
            <div className="mb-3 relative h-32 bg-gradient-to-br from-accent-100 via-pink-100 to-accent-100 rounded-lg overflow-hidden border-2 border-accent-200">
              {selectedLot.image_urls.length > 0 ? (
                <img
                  src={selectedLot.image_urls[0]}
                  alt={selectedLot.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package size={48} className="text-accent-300" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-2 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg border-2 border-white">
                <Heart size={12} strokeWidth={2} />
                <span>GRATUIT</span>
              </div>
            </div>

            <div className="mb-4 p-3 bg-accent-50 rounded-lg border border-accent-200">
              <h4 className="text-sm font-bold text-accent-900 mb-1 line-clamp-2">{selectedLot.title}</h4>
              <div className="space-y-0.5 text-xs text-accent-700">
                <p><strong>Commerçant:</strong> {selectedLot.profiles.business_name}</p>
                <p><strong>Retrait:</strong> {formatDateTime(selectedLot.pickup_start)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedLot(null);
                  onActivity();
                }}
                disabled={reserving}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm border border-gray-300 flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="flex-1 py-3 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-semibold text-sm shadow-soft-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {reserving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Réservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès avec PIN */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 text-center animate-fade-in-up shadow-soft-xl border-2 border-success-200">
            <div className="inline-flex p-3 bg-gradient-to-br from-success-100 to-accent-100 rounded-full mb-3">
              <CheckCircle size={48} className="text-success-600" strokeWidth={2} />
            </div>

            <h3 className="text-xl font-bold text-success-900 mb-2">
              🎉 Réservation confirmée !
            </h3>

            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {successMessage.lot}
            </p>

            <div className="mb-4 p-4 bg-gradient-to-br from-accent-50 to-pink-50 rounded-lg border-2 border-accent-200 shadow-soft">
              <p className="text-sm font-bold text-accent-900 mb-2">
                🔑 Notez bien votre Code PIN
              </p>
              <p className="font-mono font-bold text-5xl text-accent-700 tracking-wider">
                {successMessage.pin}
              </p>
              <p className="text-xs text-accent-700 mt-2 font-semibold">
                À présenter au commerçant
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessMessage(null);
                onActivity();
              }}
              className="w-full py-3 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-semibold text-base shadow-soft-md"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

