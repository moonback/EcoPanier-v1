import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, Key, Heart } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
};

export const BeneficiaryReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Package size={48} className="sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-sm sm:text-base text-gray-600">Aucune réservation pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
          >
            <div
              className={`p-3 sm:p-4 ${
                reservation.status === 'pending'
                  ? 'bg-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 flex-1">
                  {reservation.lots.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                    reservation.status === 'pending'
                      ? 'bg-pink-100 text-pink-700'
                      : reservation.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {reservation.status === 'pending'
                    ? 'En attente'
                    : reservation.status === 'completed'
                    ? 'Récupéré'
                    : 'Annulé'}
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{reservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{formatDateTime(reservation.lots.pickup_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-semibold">Quantité: {reservation.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-mono font-bold text-sm sm:text-base text-pink-700">
                    PIN: {reservation.pickup_pin}
                  </span>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-pink-100 rounded-lg border border-pink-200">
                <div className="flex items-center justify-center gap-1.5">
                  <Heart size={14} className="text-pink-600" />
                  <p className="text-xs font-semibold text-pink-700">
                    AIDE SOLIDAIRE
                  </p>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Voir QR Code
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-800">
              QR Code de Retrait
            </h3>
            
            <div className="mb-4">
              <QRCodeDisplay
                value={JSON.stringify({
                  reservationId: selectedReservation.id,
                  pin: selectedReservation.pickup_pin,
                  userId: profile?.id,
                })}
                title={selectedReservation.lots.title}
              />
            </div>
            
            <div className="mb-4 p-3 sm:p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-pink-800 font-semibold mb-2">
                  Code PIN de retrait
                </p>
                <p className="font-mono font-bold text-2xl sm:text-3xl text-pink-700 tracking-wider">
                  {selectedReservation.pickup_pin}
                </p>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">{selectedReservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{formatDateTime(selectedReservation.lots.pickup_start)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedReservation(null)}
              className="w-full py-2.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
