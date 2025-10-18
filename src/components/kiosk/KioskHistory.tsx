import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskHistoryProps {
  profile: Profile;
  onActivity: () => void;
}

export const KioskHistory = ({ profile, onActivity }: KioskHistoryProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Hourglass size={10} />,
          text: 'En attente',
          className: 'bg-warning-100 text-warning-800 border-warning-300'
        };
      case 'completed':
        return {
          icon: <CheckCircle size={10} />,
          text: 'Récupéré',
          className: 'bg-success-100 text-success-800 border-success-300'
        };
      case 'cancelled':
        return {
          icon: <XCircle size={10} />,
          text: 'Annulé',
          className: 'bg-gray-100 text-gray-800 border-gray-300'
        };
      default:
        return {
          icon: <Package size={10} />,
          text: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-accent-50 to-pink-50 rounded-full mb-3">
          <Package size={48} className="text-accent-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          Aucun historique 📜
        </h3>
        <p className="text-sm text-gray-600">
          Vos réservations passées apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {reservations.map((reservation) => {
          const statusBadge = getStatusBadge(reservation.status);
          
          return (
            <div
              key={reservation.id}
              className={`bg-white rounded-lg shadow-soft overflow-hidden border transition-all ${
                reservation.status === 'pending' 
                  ? 'border-warning-300' 
                  : reservation.status === 'completed'
                  ? 'border-success-300'
                  : 'border-gray-200'
              }`}
              onClick={onActivity}
            >
              <div className="p-2 flex items-center gap-2">
                {/* Date et statut */}
                <div className="flex-shrink-0">
                  <div className={`px-2 py-1 rounded-lg border ${statusBadge.className}`}>
                    <div className="flex items-center gap-1">
                      {statusBadge.icon}
                      <span className="text-xs font-bold">{statusBadge.text}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 text-center">
                    {new Date(reservation.created_at).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  </p>
                </div>

                {/* Informations du lot */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-black line-clamp-1 leading-tight mb-1">
                    {reservation.lots.title}
                  </h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">
                        {reservation.lots.profiles.business_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">
                        {new Date(reservation.lots.pickup_start).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Code PIN et quantité */}
                <div className="flex-shrink-0 text-right">
                  <div className="bg-accent-50 px-2 py-1 rounded-lg border border-accent-200 mb-1">
                    <p className="text-xs text-accent-900 font-bold font-mono">
                      {reservation.pickup_pin}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-0.5">
                    <Package size={10} className="text-gray-500" />
                    <span className="text-xs text-gray-600 font-semibold">
                      ×{reservation.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info bas de page */}
      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 text-center">
          📊 {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
        </p>
      </div>
    </div>
  );
};

