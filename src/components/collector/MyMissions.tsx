import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, uploadImage } from '../../utils/helpers';
import { MapPin, DollarSign, CheckCircle, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Mission = Database['public']['Tables']['missions']['Row'] & {
  profiles: { business_name: string };
};

export const MyMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchMyMissions();
  }, []);

  const fetchMyMissions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*, profiles!missions_merchant_id_fkey(business_name)')
        .eq('collector_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data as Mission[]);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => uploadImage(file));
    const imageUrls = await Promise.all(imagePromises);
    setProofImages([...proofImages, ...imageUrls]);
  };

  const handleComplete = async (missionId: string) => {
    if (proofImages.length === 0) {
      alert('Veuillez ajouter au moins une photo de preuve');
      return;
    }

    try {
      const { error } = await supabase
        .from('missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          proof_urls: proofImages,
        })
        .eq('id', missionId);

      if (error) throw error;

      alert('Mission terminée!');
      setSelectedMission(null);
      setProofImages([]);
      fetchMyMissions();
    } catch (error) {
      console.error('Error completing mission:', error);
      alert('Erreur lors de la complétion');
    }
  };

  const updateStatus = async (missionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ status })
        .eq('id', missionId);

      if (error) throw error;
      fetchMyMissions();
    } catch (error) {
      console.error('Error updating status:', error);
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
        <CheckCircle size={64} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune mission en cours</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{mission.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    mission.status === 'accepted'
                      ? 'bg-yellow-100 text-yellow-700'
                      : mission.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : mission.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {mission.status === 'accepted'
                    ? 'Acceptée'
                    : mission.status === 'in_progress'
                    ? 'En cours'
                    : mission.status === 'completed'
                    ? 'Terminée'
                    : 'Annulée'}
                </span>
              </div>

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

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Rémunération</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(mission.payment_amount)}
                  </span>
                </div>

                {mission.status === 'accepted' && (
                  <button
                    onClick={() => updateStatus(mission.id, 'in_progress')}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Démarrer la mission
                  </button>
                )}

                {mission.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      setSelectedMission(mission);
                      setProofImages([]);
                    }}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Terminer la mission
                  </button>
                )}

                {mission.status === 'completed' && mission.proof_urls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Preuves de livraison</p>
                    <div className="grid grid-cols-3 gap-2">
                      {mission.proof_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Proof ${i}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Terminer la mission</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ajoutez des photos de preuve (livraison, signature, etc.)
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos de preuve
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {proofImages.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {proofImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Preview ${i}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMission(null);
                  setProofImages([]);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleComplete(selectedMission.id)}
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
