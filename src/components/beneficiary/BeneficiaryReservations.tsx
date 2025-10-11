import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, Key } from 'lucide-react';
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune réservation pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div
              className={`p-4 ${
                reservation.status === 'pending'
                  ? 'bg-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{reservation.lots.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
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

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{reservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatDateTime(reservation.lots.pickup_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span>Quantité: {reservation.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={16} />
                  <span className="font-mono font-bold">PIN: {reservation.pickup_pin}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-pink-100 rounded-lg">
                <p className="text-xs text-pink-700 font-semibold text-center">
                  DON GRATUIT
                </p>
              </div>

              {reservation.status === 'pending' && (
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="w-full mt-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition text-sm font-medium"
                >
                  Voir QR Code
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <QRCodeDisplay
              value={JSON.stringify({
                reservationId: selectedReservation.id,
                pin: selectedReservation.pickup_pin,
                userId: profile?.id,
              })}
              title={selectedReservation.lots.title}
            />
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Code PIN:{' '}
                <span className="font-mono font-bold text-lg">
                  {selectedReservation.pickup_pin}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedReservation(null)}
              className="w-full mt-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
