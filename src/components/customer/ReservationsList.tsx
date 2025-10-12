// Imports externes
import { useState } from 'react';
import { Package } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import {
  ReservationCard,
  QRCodeModal,
  EmptyState,
  InlineSpinner,
} from './components';

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

/**
 * Composant pour afficher la liste des réservations d'un client
 * Permet de voir les détails, afficher le QR code et annuler une réservation
 */
export const ReservationsList = () => {
  // État local
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    null
  );

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { reservations, loading, error, cancelReservation } = useReservations(
    profile?.id
  );

  // Handlers
  const handleCancelReservation = async (
    reservationId: string,
    lotId: string,
    quantity: number
  ) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    try {
      await cancelReservation(reservationId, lotId, quantity);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l\'annulation de la réservation'
      );
    }
  };

  // Early returns (conditions de sortie)
  if (loading) return <InlineSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucune réservation pour le moment"
        description="Vos réservations apparaîtront ici une fois que vous aurez réservé un lot."
      />
    );
  }

  // Render principal
  return (
    <div>
      {/* Grille de réservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onShowQRCode={setSelectedReservation}
            onCancel={handleCancelReservation}
          />
        ))}
      </div>

      {/* Modal QR Code */}
      {selectedReservation && profile && (
        <QRCodeModal
          reservation={selectedReservation}
          userId={profile.id}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};
