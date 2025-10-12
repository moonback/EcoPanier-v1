import { Package, MapPin, Clock, Key, X, AlertCircle } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';
import type { Database } from '../../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface ReservationCardProps {
  reservation: Reservation;
  onShowQRCode: (reservation: Reservation) => void;
  onCancel: (reservationId: string, lotId: string, quantity: number) => void;
}

/**
 * Composant carte pour afficher une réservation
 * Affiche les détails de la réservation avec les actions appropriées selon le statut
 */
export function ReservationCard({
  reservation,
  onShowQRCode,
  onCancel,
}: ReservationCardProps) {
  // Fonction pour obtenir les styles selon le statut
  const getStatusStyles = () => {
    switch (reservation.status) {
      case 'pending':
        return {
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-700',
          label: 'En attente',
        };
      case 'completed':
        return {
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-700',
          label: 'Récupéré',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Annulé',
        };
      case 'confirmed':
        return {
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-700',
          label: 'Confirmé',
        };
      default:
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: reservation.status,
        };
    }
  };

  const statusStyles = getStatusStyles();
  // Ne pas afficher le QR code pour les dons (paniers suspendus)
  const canShowQRCode =
    (reservation.status === 'pending' || reservation.status === 'confirmed') &&
    !reservation.is_donation;
  
  // Vérifier si le don peut être annulé (max 30 minutes après création)
  const minutesSinceCreation = differenceInMinutes(
    new Date(),
    new Date(reservation.created_at)
  );
  const isDonationCancellable = reservation.is_donation
    ? minutesSinceCreation <= 30
    : true;
  
  const canCancel = reservation.status === 'pending' && isDonationCancellable;
  
  // Message si le don ne peut plus être annulé
  const isDonationExpired = 
    reservation.is_donation && 
    reservation.status === 'pending' && 
    !isDonationCancellable;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`p-4 ${statusStyles.bg}`}>
        {/* En-tête avec titre et statut */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800">{reservation.lots.title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles.badge}`}
          >
            {statusStyles.label}
          </span>
        </div>

        {/* Informations de la réservation */}
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
          {/* Ne pas afficher le PIN pour les dons (c'est le bénéficiaire qui l'utilisera) */}
          {!reservation.is_donation && (
            <div className="flex items-center gap-2">
              <Key size={16} />
              <span className="font-mono font-bold">
                PIN: {reservation.pickup_pin}
              </span>
            </div>
          )}
        </div>

        {/* Badge panier suspendu */}
        {reservation.is_donation && (
          <div className="mt-2 p-2 bg-pink-100 rounded-lg">
            <p className="text-xs text-pink-700 font-semibold">
              Panier Suspendu - Merci pour votre générosité!
            </p>
            {reservation.status === 'pending' && isDonationCancellable && (
              <p className="text-xs text-pink-600 mt-1">
                Annulation possible pendant encore {30 - minutesSinceCreation} min
              </p>
            )}
          </div>
        )}
        
        {/* Message si le don ne peut plus être annulé */}
        {isDonationExpired && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              Le délai d'annulation (30 min) est dépassé. Votre don est maintenant confirmé.
            </p>
          </div>
        )}

        {/* Prix total (masqué pour les dons) */}
        {!reservation.is_donation && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(reservation.total_price)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {canShowQRCode && (
            <button
              onClick={() => onShowQRCode(reservation)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Voir QR Code
            </button>
          )}
          {canCancel && (
            <button
              onClick={() =>
                onCancel(reservation.id, reservation.lot_id, reservation.quantity)
              }
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              aria-label="Annuler la réservation"
            >
              <X size={20} />
            </button>
          )}
          {reservation.status === 'completed' && (
            <div className="flex-1 py-2 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center">
              ✓ Lot récupéré
            </div>
          )}
          {reservation.status === 'cancelled' && (
            <div className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium text-center">
              Réservation annulée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

