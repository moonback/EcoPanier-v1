import { X } from 'lucide-react';
import { QRCodeDisplay } from '../../shared/QRCodeDisplay';
import type { Database } from '../../../lib/database.types';

// Typage explicite et structuré pour la réservation et les données associées
type Profile = {
  business_name: string;
  business_address: string;
};

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: Profile;
};

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Lot;
};

// Props du composant avec typage strict et description des attentes
interface QRCodeModalProps {
  reservation: Reservation;
  userId: string;
  onClose: () => void;
}

/**
 * Modal pour afficher le QR code d'une réservation et le code PIN de retrait.
 * @param {QRCodeModalProps} props - Props du composant
 * @returns {JSX.Element} - Élément JSX représentant la modale
 */
export function QRCodeModal({ reservation, userId, onClose }: QRCodeModalProps): JSX.Element {
  // Vérification de la présence des données critiques
  if (!reservation?.id || !reservation?.pickup_pin || !reservation?.lots?.title) {
    throw new Error("Les données de réservation sont incomplètes.");
  }

  // Génération des données pour le QR code, avec gestion de l'erreur de sérialisation
  let qrData: string;
  try {
    qrData = JSON.stringify({
      reservationId: reservation.id,
      pin: reservation.pickup_pin,
      userId,
      lotId: reservation.lot_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la génération des données QR:", error);
    throw new Error("Impossible de générer les données pour le QR code.");
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Code de retrait"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-lg my-auto max-h-[100vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Code de retrait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer la modale"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <QRCodeDisplay
            value={qrData}
            title={reservation.lots.title}
          />
        </div>

        {/* Affichage du PIN */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center font-medium mb-2">
            Votre code PIN
          </p>
          <p
            className="font-mono font-bold text-3xl text-gray-900 text-center tracking-wider"
            aria-live="polite"
          >
            {reservation.pickup_pin}
          </p>
        </div>

        {/* Instructions supplémentaires */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Présentez ce code et ce QR code au point de retrait.
        </p>
      </div>
    </div>
  );
}
