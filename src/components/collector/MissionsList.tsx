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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck size={64} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune mission disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{mission.title}</h3>
                {mission.is_urgent && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <AlertCircle size={14} />
                    Urgent
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{mission.description}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Collecte</p>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{mission.pickup_address}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Livraison</p>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{mission.delivery_address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                {mission.requires_cold_chain && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Snowflake size={16} />
                    Chaîne du froid
                  </span>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Rémunération</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(mission.payment_amount)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedMission(mission)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Accepter la mission
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirmer la mission</h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-700">Mission</p>
                <p className="text-gray-600">{selectedMission.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Collecte</p>
                <p className="text-gray-600">{selectedMission.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Livraison</p>
                <p className="text-gray-600">{selectedMission.delivery_address}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Rémunération</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedMission.payment_amount)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMission(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAccept(selectedMission.id)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
