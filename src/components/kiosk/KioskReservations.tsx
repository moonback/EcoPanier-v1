import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, Key, Heart, QrCode } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskReservationsProps {
  profile: Profile;
  onActivity: () => void;
  showOnlyPending?: boolean;
}

export const KioskReservations = ({ profile, onActivity, showOnlyPending = false }: KioskReservationsProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id);

      if (showOnlyPending) {
        query = query.eq('status', 'pending');
      }

      query = query.order('created_at', { ascending: false }).limit(10);

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    onActivity();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-accent-50 to-pink-50 rounded-full mb-3">
          <Package size={48} className="text-accent-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          {showOnlyPending ? 'Aucune réservation active 📦' : 'Aucune réservation 🎁'}
        </h3>
        <p className="text-sm text-gray-600">
          {showOnlyPending ? 'Réservez un panier pour le voir ici !' : 'Réservez votre premier panier !'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-lg shadow-soft overflow-hidden border border-gray-100"
          >
            <div
              className={`p-2 ${
                reservation.status === 'pending'
                  ? 'bg-gradient-to-br from-accent-50 to-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-gradient-to-br from-success-50 to-white'
                  : 'bg-gradient-to-br from-gray-50 to-white'
              }`}
            >
              {/* Statut */}
              <div className="flex justify-between items-start gap-1 mb-2">
                <h3 className="font-bold text-xs text-black line-clamp-2 flex-1 leading-tight">
                  {reservation.lots.title}
                </h3>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 border ${
                    reservation.status === 'pending'
                      ? 'bg-warning-100 text-warning-800 border-warning-300'
                      : reservation.status === 'completed'
                      ? 'bg-success-100 text-success-800 border-success-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {reservation.status === 'pending'
                    ? '⏳'
                    : reservation.status === 'completed'
                    ? '✅'
                    : '❌'}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-0.5 text-xs text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{reservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package size={10} className="flex-shrink-0" />
                  <span className="font-bold">Qté: {reservation.quantity}</span>
                </div>
              </div>

              {/* Code PIN */}
              <div className="mb-2 p-2 bg-gradient-to-r from-accent-100 to-pink-100 rounded-lg border border-accent-200">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-0.5">
                    <Key size={10} />
                    <span className="text-xs font-bold text-accent-900">PIN</span>
                  </div>
                  <Heart size={10} className="text-accent-600" strokeWidth={2} />
                </div>
                <p className="font-mono font-bold text-xl text-accent-700 text-center tracking-wider leading-tight">
                  {reservation.pickup_pin}
                </p>
              </div>

              {/* Bouton QR Code */}
              {reservation.status === 'pending' && (
                <button
                  onClick={() => handleShowQR(reservation)}
                  className="w-full py-1.5 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-bold text-xs shadow-soft flex items-center justify-center gap-1"
                >
                  <QrCode size={12} strokeWidth={2} />
                  <span>QR Code</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR Code */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 text-center animate-fade-in-up shadow-soft-xl border-2 border-accent-200">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              QR Code de Retrait
            </h3>

            {/* QR Code */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg inline-block border border-gray-200">
              <QRCodeSVG
                value={JSON.stringify({
                  reservationId: selectedReservation.id,
                  pin: selectedReservation.pickup_pin,
                  userId: profile.id,
                })}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            {/* Code PIN */}
            <div className="mb-3 p-3 bg-gradient-to-r from-accent-50 to-pink-50 rounded-lg border-2 border-accent-200">
              <p className="text-xs font-bold text-accent-900 mb-2 flex items-center justify-center gap-1">
                <Key size={12} />
                <span>Code PIN</span>
              </p>
              <p className="font-mono font-bold text-4xl text-accent-700 tracking-wider">
                {selectedReservation.pickup_pin}
              </p>
            </div>

            {/* Informations */}
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                {selectedReservation.lots.title}
              </h4>
              <div className="space-y-0.5 text-xs text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <MapPin size={12} />
                  <span className="font-medium">{selectedReservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Clock size={12} />
                  <span>{formatDateTime(selectedReservation.lots.pickup_start)}</span>
                </div>
              </div>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={() => {
                setSelectedReservation(null);
                onActivity();
              }}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm border border-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

