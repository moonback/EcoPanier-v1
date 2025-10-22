// Imports externes
import { useState } from 'react';
import { Package } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import {
  ReservationCard,
  QRCodeModal,
  SkeletonReservationCard,
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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonReservationCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full mb-6">
          <Package size={64} className="text-primary-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Votre premier panier vous attend ! 🎁
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          Vous n'avez pas encore de réservation. Explorez les paniers surprises 
          près de chez vous et faites vos premières économies ! 💰
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 hover:shadow-sm transition-all"
        >
          Découvrir les paniers
        </button>
      </div>
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
