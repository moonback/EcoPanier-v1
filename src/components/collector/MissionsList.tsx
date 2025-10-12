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
      <div className="text-center py-8 sm:py-12 px-4">
        <Truck size={48} className="sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-sm sm:text-base text-gray-600">Aucune mission disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover-lift"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 flex-1">{mission.title}</h3>
                {mission.is_urgent && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                    <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Urgent</span>
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
                <div className="flex items-center gap-1.5 mb-3 sm:mb-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <Snowflake size={14} className="sm:w-4 sm:h-4" />
                    Chaîne du froid requise
                  </span>
                </div>
              )}

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Rémunération</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(mission.payment_amount)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedMission(mission)}
                  className="w-full py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
                >
                  Accepter la mission
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-800">Confirmer la mission</h3>
            <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Mission</p>
                <p className="text-sm sm:text-base text-gray-600">{selectedMission.title}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Collecte</p>
                <p className="text-sm sm:text-base text-gray-600">{selectedMission.pickup_address}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Livraison</p>
                <p className="text-sm sm:text-base text-gray-600">{selectedMission.delivery_address}</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Rémunération</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatCurrency(selectedMission.payment_amount)}
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedMission(null)}
                className="flex-1 py-2.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAccept(selectedMission.id)}
                className="flex-1 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                Accepter la mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
