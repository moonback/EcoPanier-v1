import { useState } from 'react';
import { X, Clock, UserPlus, AlertTriangle, Heart, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { 
      business_name: string; 
      business_address: string;
    };
  };
  profiles: { full_name: string };
};

interface AbsenceModalProps {
  reservation: Reservation;
  onClose: () => void;
  onAction: (action: 'wait' | 'reassign' | 'mark_lost') => Promise<void>;
}

export const AbsenceModal = ({ reservation, onAction, onClose }: AbsenceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'wait' | 'reassign' | 'mark_lost' | null>(null);

  const handleAction = async (action: 'wait' | 'reassign' | 'mark_lost') => {
    setSelectedAction(action);
    setLoading(true);
    try {
      await onAction(action);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickupEnd = new Date(reservation.lots.pickup_end);
  const timeSinceEnd = Math.floor((Date.now() - pickupEnd.getTime()) / (1000 * 60)); // minutes

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-warning-500 via-warning-600 to-orange-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Client Absent</h2>
              <p className="text-sm text-warning-100">
                {timeSinceEnd > 0 
                  ? `Fenêtre de retrait expirée depuis ${timeSinceEnd} min`
                  : 'Fenêtre de retrait expirée'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Détails de la réservation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Package size={32} className="text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{reservation.lots.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reservation.lots.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <UserPlus size={14} strokeWidth={2} />
                    <span className="font-medium">{reservation.profiles.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package size={14} strokeWidth={2} />
                    <span className="font-medium">Qté: {reservation.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={14} strokeWidth={2} />
                    <span className="font-medium">
                      {format(pickupEnd, 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    {reservation.is_donation ? (
                      <>
                        <Heart size={14} strokeWidth={2} className="text-red-500" />
                        <span className="font-medium text-red-600">Don solidaire</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{reservation.total_price.toFixed(2)}€</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options d'action */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-base mb-4">Que souhaitez-vous faire ?</h4>

            {/* Option 1 : Attendre 30 min */}
            <button
              onClick={() => handleAction('wait')}
              disabled={loading && selectedAction !== 'wait'}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'wait' && loading
                  ? 'border-primary-500 bg-primary-50'
                  : selectedAction === 'wait'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedAction === 'wait'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 mb-1">⏳ Attendre 30 minutes supplémentaires</h5>
                  <p className="text-sm text-gray-600 font-medium">
                    Prolonger la fenêtre de retrait jusqu'à {format(new Date(Date.now() + 30 * 60 * 1000), 'HH:mm', { locale: fr })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Le client pourra toujours récupérer son panier pendant 30 minutes supplémentaires
                  </p>
                </div>
                {selectedAction === 'wait' && loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
                )}
              </div>
            </button>

            {/* Option 2 : Réattribuer à un bénéficiaire */}
            <button
              onClick={() => handleAction('reassign')}
              disabled={loading && selectedAction !== 'reassign'}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'reassign' && loading
                  ? 'border-success-500 bg-success-50'
                  : selectedAction === 'reassign'
                  ? 'border-success-500 bg-success-50'
                  : 'border-gray-200 bg-white hover:border-success-300 hover:bg-success-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedAction === 'reassign'
                    ? 'bg-success-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <UserPlus size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Heart size={16} className="text-red-500" strokeWidth={2.5} />
                    Réattribuer à un bénéficiaire
                  </h5>
                  <p className="text-sm text-gray-600 font-medium">
                    Transformer ce panier en lot gratuit disponible pour les bénéficiaires
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    La réservation sera annulée et le lot sera disponible gratuitement pour les bénéficiaires
                  </p>
                </div>
                {selectedAction === 'reassign' && loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-success-500 border-t-transparent"></div>
                )}
              </div>
            </button>

            {/* Option 3 : Marquer comme perdu */}
            <button
              onClick={() => handleAction('mark_lost')}
              disabled={loading && selectedAction !== 'mark_lost'}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'mark_lost' && loading
                  ? 'border-red-500 bg-red-50'
                  : selectedAction === 'mark_lost'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedAction === 'mark_lost'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 mb-1">⚠️ Marquer comme perdu/gaspillé</h5>
                  <p className="text-sm text-gray-600 font-medium">
                    Annuler la réservation et libérer le stock (panier considéré comme gaspillé)
                  </p>
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    ⚠️ Cette action est irréversible. Le panier sera considéré comme gaspillé.
                  </p>
                </div>
                {selectedAction === 'mark_lost' && loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            💡 Conseil : En cas de doute, privilégiez "Attendre" ou "Réattribuer"
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all font-medium text-sm"
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

