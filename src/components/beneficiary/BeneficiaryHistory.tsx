// Imports externes
import { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

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

interface BeneficiaryHistoryProps {
  onNavigateToReservations: () => void;
}

/**
 * Widget pour afficher l'historique simplifié du bénéficiaire
 * Affiche les 5 dernières réservations (completed/cancelled)
 * Design épuré pour ne pas surcharger l'interface
 */
export function BeneficiaryHistory({ onNavigateToReservations }: BeneficiaryHistoryProps) {
  // État local
  const [historyReservations, setHistoryReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Effet pour charger l'historique
  useEffect(() => {
    fetchHistory();
  }, [profile]);

  // Fonction pour récupérer l'historique
  const fetchHistory = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      // Récupérer toutes les réservations completed ou cancelled
      const { data: allData, error } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const all = (allData as Reservation[]) || [];
      setTotalCount(all.length);
      setHistoryReservations(all.slice(0, 5)); // Prendre les 5 plus récentes
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return {
        icon: CheckCircle,
        label: 'Récupéré',
        textColor: 'text-success-700',
        bgColor: 'bg-success-50',
        borderColor: 'border-success-200',
      };
    }
    return {
      icon: XCircle,
      label: 'Annulé',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    };
  };

  // Early returns (conditions de sortie)
  if (loading) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Si aucun historique
  if (historyReservations.length === 0) {
    return (
      <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <span>Historique</span>
        </h2>
        <div className="text-center py-8">
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-4">
            <Package size={48} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-base md:text-lg text-gray-600 font-light">
            Votre historique apparaîtra ici après votre premier panier récupéré.
          </p>
        </div>
      </div>
    );
  }

  // Render principal avec historique
  return (
    <div className="card bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 shadow-lg">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <span>Historique</span>
        </h2>
        {totalCount > 5 && (
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm font-semibold">
            +{totalCount - 5} autres
          </span>
        )}
      </div>

      {/* Liste simplifiée - 5 derniers */}
      <div className="space-y-3">
        {historyReservations.map((reservation) => {
          const statusBadge = getStatusBadge(reservation.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={reservation.id}
              className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 ${statusBadge.borderColor} ${statusBadge.bgColor} hover:shadow-md transition-all`}
            >
              {/* Icône de statut */}
              <div className="flex-shrink-0">
                <StatusIcon
                  size={24}
                  className={statusBadge.textColor}
                  strokeWidth={2}
                />
              </div>

              {/* Informations */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-black truncate">
                  {reservation.lots.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-zinc-500 font-light mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} strokeWidth={1.5} />
                    {reservation.lots.profiles.business_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} strokeWidth={1.5} />
                    {format(new Date(reservation.created_at), 'dd MMM', { locale: fr })}
                  </span>
                </div>
              </div>

              {/* Badge de statut */}
              <span
                className={`flex-shrink-0 px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bgColor} ${statusBadge.textColor}`}
              >
                {statusBadge.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lien vers l'historique complet */}
      <button
        onClick={onNavigateToReservations}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all font-semibold text-sm md:text-base group"
      >
        <span>Voir tout l'historique</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={2} />
      </button>

      {/* Compteur de paniers récupérés */}
      {totalCount > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border-2 border-success-200">
          <p className="text-sm md:text-base text-center font-semibold text-gray-800">
            🎉 Vous avez déjà récupéré <strong className="text-success-700">{totalCount} panier{totalCount > 1 ? 's' : ''} solidaire{totalCount > 1 ? 's' : ''}</strong> !
          </p>
        </div>
      )}
    </div>
  );
}

