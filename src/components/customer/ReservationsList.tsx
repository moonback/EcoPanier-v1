// Imports externes
import { useState } from 'react';
import { Package } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import {
  ReservationCard,
  QRCodeModal,
  GroupQRCodeModal,
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
  const [selectedGroup, setSelectedGroup] = useState<Reservation[] | null>(null);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { reservations, loading, error, cancelReservation } = useReservations(
    profile?.id
  );

  // Grouper les réservations par cart_group_id
  const groupedReservations = reservations.reduce((groups, reservation) => {
    const key = reservation.cart_group_id || `single_${reservation.id}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(reservation);
    return groups;
  }, {} as Record<string, Reservation[]>);

  // Convertir en tableau pour l'affichage
  const reservationGroups = Object.values(groupedReservations);

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
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
        >
          Découvrir les paniers
        </button>
      </div>
    );
  }

  const handleShowQRCode = (reservation: Reservation) => {
    // Vérifier si c'est un panier groupé
    if (reservation.cart_group_id) {
      const group = groupedReservations[reservation.cart_group_id];
      if (group && group.length > 1) {
        setSelectedGroup(group);
        return;
      }
    }
    // Sinon, afficher le QR code simple
    setSelectedReservation(reservation);
  };

  // Render principal
  return (
    <div>
      {/* Grille de réservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservationGroups.map((group, index) => {
          const isGroup = group.length > 1;
          const firstReservation = group[0];
          
          if (isGroup) {
            // Afficher une carte groupée
            const totalPrice = group.reduce((sum, r) => sum + r.total_price, 0);
            const totalQuantity = group.reduce((sum, r) => sum + r.quantity, 0);
            
            return (
              <div
                key={`group_${firstReservation.cart_group_id}_${index}`}
                className="bg-white rounded-xl border-2 border-primary-200 shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={20} className="text-primary-600" strokeWidth={2} />
                      <h3 className="text-lg font-bold text-gray-900">
                        Panier Groupé
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {group.length} produits • {firstReservation.lots.profiles.business_name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    firstReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    firstReservation.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {firstReservation.status === 'pending' ? 'En attente' :
                     firstReservation.status === 'completed' ? 'Récupéré' : 
                     firstReservation.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {group.map((r, i) => (
                    <div key={r.id} className="text-sm text-gray-700">
                      • {r.lots.title} <span className="text-gray-500">(x{r.quantity})</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(group);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
                >
                  Voir le QR Code
                </button>
              </div>
            );
          }
          
          // Afficher une carte de réservation normale
          return (
            <ReservationCard
              key={firstReservation.id}
              reservation={firstReservation}
              onShowQRCode={handleShowQRCode}
              onCancel={handleCancelReservation}
            />
          );
        })}
      </div>

      {/* Modal QR Code simple */}
      {selectedReservation && profile && !selectedReservation.cart_group_id && (
        <QRCodeModal
          reservation={selectedReservation}
          userId={profile.id}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* Modal QR Code groupé */}
      {selectedGroup && profile && (
        <GroupQRCodeModal
          reservations={selectedGroup}
          userId={profile.id}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};
