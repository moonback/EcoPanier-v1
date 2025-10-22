// Imports externes
import { useState } from 'react';
import { Package, Calendar, MapPin, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { useReservations } from '../../hooks/useReservations';
import { formatCurrency } from '../../utils/helpers';
import { QRCodeModal } from './components';

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

interface CustomerReservationHistoryProps {
  onNavigateToReservations: () => void;
}

/**
 * Widget pour afficher l'historique récent des réservations
 * Affiche les 3 dernières réservations avec statuts
 */
export function CustomerReservationHistory({ onNavigateToReservations }: CustomerReservationHistoryProps) {
  // État local
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const { reservations, loading, error } = useReservations(profile?.id);

  // Filtrer les réservations terminées ou annulées (historique)
  const historyReservations = reservations
    .filter((r) => r.status === 'completed' || r.status === 'cancelled')
    .slice(0, 3); // Prendre les 3 plus récentes

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Récupéré',
          icon: CheckCircle,
          bgColor: 'bg-success-50',
          textColor: 'text-success-700',
          borderColor: 'border-success-200',
        };
      case 'cancelled':
        return {
          label: 'Annulé',
          icon: XCircle,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          label: status,
          icon: Package,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
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

  // Si aucun historique
  if (historyReservations.length === 0) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span>Historique récent</span>
        </h2>
        <div className="text-center py-8">
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-4">
            <Package size={48} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 mb-2 font-light">
            Votre historique de réservations apparaîtra ici.
          </p>
          <p className="text-sm text-gray-500 font-light">
            Commencez dès maintenant à sauver des paniers ! 🌿
          </p>
        </div>
      </div>
    );
  }

  // Render principal avec historique
  return (
    <>
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span>Historique récent</span>
          </h2>
          {reservations.length > 3 && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              +{reservations.length - 3} autres
            </span>
          )}
        </div>

        {/* Liste des réservations */}
        <div className="space-y-3">
          {historyReservations.map((reservation) => {
            const statusBadge = getStatusBadge(reservation.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={reservation.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 ${statusBadge.borderColor} ${statusBadge.bgColor} hover:shadow-md transition-all`}
              >
                {/* Icône de statut */}
                <div className="flex-shrink-0">
                  <StatusIcon
                    size={24}
                    className={statusBadge.textColor}
                    strokeWidth={2}
                  />
                </div>

                {/* Informations principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-black text-sm truncate">
                      {reservation.lots.title}
                    </h3>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bgColor} ${statusBadge.textColor}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 font-light">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} strokeWidth={1.5} />
                      {reservation.lots.profiles.business_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} strokeWidth={1.5} />
                      {format(new Date(reservation.created_at), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    {!reservation.is_donation && (
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(reservation.total_price)}
                      </span>
                    )}
                    {reservation.is_donation && (
                      <span className="text-accent-600 font-semibold">
                        ❤️ Don solidaire
                      </span>
                    )}
                  </div>
                </div>

                {/* Bouton Voir détails */}
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="flex-shrink-0 p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                  aria-label="Voir les détails"
                >
                  <Eye
                    size={20}
                    className="text-gray-600 group-hover:text-primary-600 transition-colors"
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bouton Voir tout */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onNavigateToReservations}
            className="btn-secondary w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-primary-300 transition-all"
          >
            Voir tout l'historique
          </button>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedReservation && profile && (
        <QRCodeModal
          reservation={selectedReservation}
          userId={profile.id}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  );
}

