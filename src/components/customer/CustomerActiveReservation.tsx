// Imports externes
import { MapPin, Clock, Key, Package, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import { formatDateTime } from '../../utils/helpers';

// Imports types
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface CustomerActiveReservationProps {
  onNavigateToBrowse: () => void;
}

/**
 * Widget pour afficher la réservation active du client
 * Affiche le QR code, le PIN et les détails de retrait
 */
export function CustomerActiveReservation({ onNavigateToBrowse }: CustomerActiveReservationProps) {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { reservations, loading, error } = useReservations(profile?.id);

  // Trouver la réservation active (pending ou confirmed)
  const activeReservation = reservations.find(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  );

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-red-200 p-6 shadow-lg">
        <p className="text-red-600 font-semibold text-center">{error}</p>
      </div>
    );
  }

  // Si aucune réservation active
  if (!activeReservation) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-lg">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <span>Votre panier actif</span>
        </h2>
        <div className="text-center py-8">
          <div className="inline-flex p-6 bg-gradient-to-br from-primary-50 to-success-50 rounded-full mb-4">
            <Package size={48} className="text-primary-400" strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 mb-6 font-light">
            Vous n'avez aucune réservation en cours. Et si vous sauviez un panier ? 🌿
          </p>
          <button
            onClick={onNavigateToBrowse}
            className="btn-primary px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg inline-flex items-center gap-2"
          >
            <span>Trouver un panier</span>
            <ArrowRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // Générer les données du QR Code
  const qrData = JSON.stringify({
    reservationId: activeReservation.id,
    pin: activeReservation.pickup_pin,
    userId: profile?.id,
    lotId: activeReservation.lot_id,
    timestamp: new Date().toISOString(),
  });

  // Render principal avec réservation active
  return (
    <div className="card bg-gradient-to-br from-primary-50 to-white rounded-2xl border-2 border-primary-300 p-6 shadow-lg">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <span>Votre panier actif</span>
        </h2>
        <span className="px-3 py-1 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full text-xs font-bold shadow-sm animate-pulse">
          ✓ Réservé
        </span>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche : Informations */}
        <div className="space-y-4">
          {/* Titre du lot */}
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-bold text-black mb-2">
              {activeReservation.lots.title}
            </h3>
            <p className="text-sm text-gray-600 font-light">
              Quantité : {activeReservation.quantity}
            </p>
          </div>

          {/* Détails du commerçant */}
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-black">
                  {activeReservation.lots.profiles.business_name}
                </p>
                <p className="text-sm text-gray-600 font-light">
                  {activeReservation.lots.profiles.business_address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={20} className="text-primary-600 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-gray-700 font-medium">Heure de retrait</p>
                <p className="text-sm text-gray-600 font-light">
                  {formatDateTime(activeReservation.lots.pickup_start)}
                </p>
              </div>
            </div>
          </div>

          {/* Code PIN */}
          {!activeReservation.is_donation && (
            <div className="p-4 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-xl border-2 border-warning-300">
              <div className="flex items-center gap-3 mb-2">
                <Key size={20} className="text-warning-700" strokeWidth={2} />
                <p className="text-sm font-semibold text-warning-900">Code PIN de retrait</p>
              </div>
              <p className="text-3xl font-bold text-warning-700 tracking-widest text-center py-2">
                {activeReservation.pickup_pin}
              </p>
            </div>
          )}
        </div>

        {/* Colonne droite : QR Code */}
        {!activeReservation.is_donation && (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Présentez ce QR Code au retrait
            </p>
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center font-light">
              Scannez ce code à la station de retrait
            </p>
          </div>
        )}

        {/* Message spécial pour panier suspendu */}
        {activeReservation.is_donation && (
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-accent-50 to-pink-50 rounded-xl border-2 border-accent-200">
            <div className="text-center">
              <span className="text-6xl mb-4 block">❤️</span>
              <h3 className="text-xl font-bold text-accent-700 mb-2">
                Panier Suspendu
              </h3>
              <p className="text-sm text-gray-700 font-light">
                Merci pour votre générosité !<br />
                Ce panier sera distribué à une personne dans le besoin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

