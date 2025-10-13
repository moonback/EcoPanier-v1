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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className={`p-6 ${statusStyles.bg}`}>
        {/* En-tête avec titre et statut */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-black">{reservation.lots.title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.badge}`}
          >
            {statusStyles.label}
          </span>
        </div>

        {/* Informations de la réservation */}
        <div className="space-y-3 text-sm text-gray-700 font-light">
          <div className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.5} />
            <span>{reservation.lots.profiles.business_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} strokeWidth={1.5} />
            <span>{formatDateTime(reservation.lots.pickup_start)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={16} strokeWidth={1.5} />
            <span>Quantité: {reservation.quantity}</span>
          </div>
          {/* Ne pas afficher le PIN pour les dons (c'est le bénéficiaire qui l'utilisera) */}
          {!reservation.is_donation && (
            <div className="flex items-center gap-2">
              <Key size={16} strokeWidth={1.5} />
              <span className="font-mono font-semibold">
                PIN: {reservation.pickup_pin}
              </span>
            </div>
          )}
        </div>

        {/* Badge panier suspendu */}
        {reservation.is_donation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-black font-medium">
              Panier Suspendu - Merci pour votre générosité!
            </p>
            {reservation.status === 'pending' && isDonationCancellable && (
              <p className="text-xs text-gray-600 mt-1 font-light">
                Annulation possible pendant encore {30 - minutesSinceCreation} min
              </p>
            )}
          </div>
        )}
        
        {/* Message si le don ne peut plus être annulé */}
        {isDonationExpired && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2">
            <AlertCircle size={16} className="text-gray-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-gray-700 font-light">
              Le délai d'annulation (30 min) est dépassé. Votre don est maintenant confirmé.
            </p>
          </div>
        )}

        {/* Prix total (masqué pour les dons) */}
        {!reservation.is_donation && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-lg font-bold text-black">
              {formatCurrency(reservation.total_price)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {canShowQRCode && (
            <button
              onClick={() => onShowQRCode(reservation)}
              className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition text-sm font-medium"
            >
              Voir QR Code
            </button>
          )}
          {canCancel && (
            <button
              onClick={() =>
                onCancel(reservation.id, reservation.lot_id, reservation.quantity)
              }
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              aria-label="Annuler la réservation"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          )}
          {reservation.status === 'completed' && (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-black rounded-lg text-sm font-medium text-center">
              ✓ Lot récupéré
            </div>
          )}
          {reservation.status === 'cancelled' && (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium text-center">
              Réservation annulée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

