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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in-up">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Code de retrait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code */}
        <QRCodeDisplay value={qrData} title={reservation.lots.title} />

        {/* Affichage du PIN */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Code PIN:{' '}
            <span className="font-mono font-bold text-lg">
              {reservation.pickup_pin}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

