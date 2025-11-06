import { useState } from 'react';
import { Package, MapPin, Clock, Key, X, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';
import type { Database } from '../../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  customer_confirmed?: boolean;
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
  onConfirmReceipt?: (reservationId: string) => Promise<void>;
}

/**
 * Composant carte pour afficher une réservation
 * Affiche les détails de la réservation avec les actions appropriées selon le statut
 */
export function ReservationCard({
  reservation,
  onShowQRCode,
  onCancel,
  onConfirmReceipt,
}: ReservationCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
  const canConfirmReceipt = 
    reservation.status === 'completed' && 
    !reservation.customer_confirmed && 
    !reservation.is_donation &&
    onConfirmReceipt;

  const handleConfirmReceipt = async () => {
    if (!onConfirmReceipt) return;

    setConfirming(true);
    try {
      await onConfirmReceipt(reservation.id);
      setShowConfirmModal(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la confirmation de réception'
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

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
        {/* isDonationExpired et le message associé sont supprimés */}

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
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
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
          {reservation.status === 'completed' && !canConfirmReceipt && (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-black rounded-lg text-sm font-medium text-center">
              {reservation.customer_confirmed ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Réception confirmée
                </span>
              ) : (
                '✓ Panier récupéré'
              )}
            </div>
          )}
          {canConfirmReceipt && (
            <button
              onClick={handleOpenConfirmModal}
              disabled={confirming}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} />
              Confirmer la réception
            </button>
          )}
          {reservation.status === 'cancelled' && (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium text-center">
              Panier annulé
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de réception */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !confirming && setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Confirmer la réception</h3>
                    <p className="text-sm text-gray-600 mt-1">Action importante</p>
                  </div>
                </div>
                {!confirming && (
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Fermer"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Confirmez-vous avoir bien reçu ce lot ?
                </p>
                <p className="text-sm text-gray-700">
                  Le commerçant sera payé dès la confirmation.
                </p>
              </div>

              {/* Détails de la réservation */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lot:</span>
                  <span className="text-sm font-semibold text-gray-900">{reservation.lots.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantité:</span>
                  <span className="text-sm font-semibold text-gray-900">{reservation.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commerçant:</span>
                  <span className="text-sm font-semibold text-gray-900">{reservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-sm font-semibold text-gray-900">Montant:</span>
                  <span className="text-lg font-black text-green-600">{formatCurrency(reservation.total_price)}</span>
                </div>
              </div>

              {/* Avertissement */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Wallet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Important:</span> En confirmant, vous validez que vous avez bien récupéré le lot. Le paiement sera effectué au commerçant.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={confirming}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmReceipt}
                  disabled={confirming}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirmer la réception
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

