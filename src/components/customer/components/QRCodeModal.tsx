import { X } from 'lucide-react';
import { QRCodeDisplay } from '../../shared/QRCodeDisplay';
import type { Database } from '../../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface QRCodeModalProps {
  reservation: Reservation;
  userId: string;
  onClose: () => void;
}

/**
 * Modal pour afficher le QR code d'une réservation
 * Affiche le QR code et le code PIN pour le retrait
 */
export function QRCodeModal({
  reservation,
  userId,
  onClose,
}: QRCodeModalProps) {
  const qrData = JSON.stringify({
    reservationId: reservation.id,
    pin: reservation.pickup_pin,
    userId,
    lotId: reservation.lot_id,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black">Code de retrait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* QR Code */}
        <QRCodeDisplay value={qrData} title={reservation.lots.title} />

        {/* Affichage du PIN */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 text-center font-light">
            Code PIN
          </p>
          <p className="font-mono font-bold text-3xl text-black text-center mt-2">
            {reservation.pickup_pin}
          </p>
        </div>
      </div>
    </div>
  );
}

