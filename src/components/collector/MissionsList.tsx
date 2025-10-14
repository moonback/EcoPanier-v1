import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { MapPin, DollarSign, Snowflake, AlertCircle, Truck } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Mission = Database['public']['Tables']['missions']['Row'] & {
  profiles: { business_name: string };
};

export const MissionsList = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*, profiles!missions_merchant_id_fkey(business_name)')
        .eq('status', 'available')
        .is('collector_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data as Mission[]);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (missionId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('missions')
        .update({
          collector_id: profile.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;

      alert('Mission acceptée!');
      setSelectedMission(null);
      fetchMissions();
    } catch (error) {
      console.error('Error accepting mission:', error);
      alert('Erreur lors de l\'acceptation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-success-50 to-primary-50 rounded-full mb-6">
          <Truck size={64} className="text-success-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Aucune mission disponible pour le moment 🔍
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-light">
          De nouvelles missions solidaires sont ajoutées régulièrement. 
          Revenez bientôt pour gagner un revenu flexible tout en aidant ! ⏰
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl font-semibold hover:from-success-700 hover:to-success-800 transition-all shadow-lg"
        >
          Actualiser les missions
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 hover:border-success-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-black line-clamp-2 flex-1 group-hover:text-success-600 transition-colors">{mission.title}</h3>
                {mission.is_urgent && (
                  <span className="px-3 py-1 bg-gradient-to-r from-warning-100 to-orange-100 text-warning-700 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap flex-shrink-0 border border-warning-200">
                    <AlertCircle size={12} strokeWidth={2} />
                    <span>🔥 Urgent</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{mission.description}</p>

              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Collecte</p>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <MapPin size={14} className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{mission.pickup_address}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Livraison</p>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <MapPin size={14} className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{mission.delivery_address}</span>
                  </div>
                </div>
              </div>

              {mission.requires_cold_chain && (
                <div className="mb-4 p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200">
                  <span className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
                    <Snowflake size={16} strokeWidth={2} />
                    <span>🧊 Chaîne du froid requise</span>
                  </span>
                </div>
              )}

              <div className="pt-4 border-t-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-semibold">💰 Rémunération</span>
                  <span className="text-3xl font-bold text-success-600">
                    {formatCurrency(mission.payment_amount)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedMission(mission)}
                  className="w-full py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  ✅ Accepter la mission
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up shadow-2xl border-2 border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-success-100 to-success-200 rounded-full mb-4">
                <Truck size={32} className="text-success-600" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">
                Confirmer votre Mission
              </h3>
              <p className="text-sm text-gray-600">Vérifiez les détails avant d'accepter</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100">
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2">
                  <span>📦</span>
                  <span>Mission</span>
                </p>
                <p className="text-base font-bold text-black">{selectedMission.title}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100">
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2">
                  <span>📍</span>
                  <span>Point de collecte</span>
                </p>
                <p className="text-sm font-medium text-gray-800">{selectedMission.pickup_address}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-secondary-50 to-white rounded-xl border-2 border-secondary-100">
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Point de livraison</span>
                </p>
                <p className="text-sm font-medium text-gray-800">{selectedMission.delivery_address}</p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💰</span>
                  <span>Vous allez gagner</span>
                </p>
                <p className="text-4xl font-bold text-success-600">
                  {formatCurrency(selectedMission.payment_amount)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setSelectedMission(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border-2 border-gray-200 transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAccept(selectedMission.id)}
                className="flex-1 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                ✅ J'accepte la mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
