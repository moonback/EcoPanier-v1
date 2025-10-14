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
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-accent-50 to-pink-50 rounded-full mb-6">
          <Package size={64} className="text-accent-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Vos paniers solidaires vous attendent ! 🎁
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-light">
          Vous n'avez pas encore de réservation. Explorez les paniers gratuits 
          disponibles et profitez du programme solidaire ! ❤️
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:from-accent-700 hover:to-accent-800 transition-all shadow-lg"
        >
          Découvrir les paniers gratuits
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 hover:border-gray-200"
          >
            <div
              className={`p-4 ${
                reservation.status === 'pending'
                  ? 'bg-gradient-to-br from-accent-50 to-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-gradient-to-br from-success-50 to-white'
                  : 'bg-gradient-to-br from-gray-50 to-white'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-bold text-base text-black line-clamp-2 flex-1 group-hover:text-accent-600 transition-colors">
                  {reservation.lots.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border-2 shadow-sm ${
                    reservation.status === 'pending'
                      ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300'
                      : reservation.status === 'completed'
                      ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {reservation.status === 'pending'
                    ? '⏳ En attente'
                    : reservation.status === 'completed'
                    ? '✅ Récupéré'
                    : '❌ Annulé'}
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

              <div className="mt-4 p-3 bg-gradient-to-r from-accent-100 to-pink-100 rounded-xl border-2 border-accent-200 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <Heart size={16} className="text-accent-600" strokeWidth={2} />
                  <p className="text-xs font-bold text-accent-700">
                    ❤️ PANIER SOLIDAIRE GRATUIT
                  </p>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  📱 Voir mon QR Code
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
            
            <div className="mb-4 p-5 bg-gradient-to-r from-accent-50 to-pink-50 rounded-xl border-2 border-accent-200 shadow-sm">
              <div className="text-center">
                <p className="text-sm text-accent-800 font-bold mb-3 flex items-center justify-center gap-2">
                  <span>🔑</span>
                  <span>Votre Code PIN</span>
                </p>
                <p className="font-mono font-bold text-4xl text-accent-700 tracking-wider">
                  {selectedReservation.pickup_pin}
                </p>
                <p className="text-xs text-accent-600 mt-2">À communiquer au commerçant</p>
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
