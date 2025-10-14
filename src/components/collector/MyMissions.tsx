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
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-success-50 to-primary-50 rounded-full mb-6">
          <CheckCircle size={64} className="text-success-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Aucune mission en cours 📦
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-light">
          Acceptez vos premières missions solidaires et commencez à gagner 
          un revenu flexible tout en aidant votre quartier ! 💚
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl font-semibold hover:from-success-700 hover:to-success-800 transition-all shadow-lg"
        >
          Voir les missions disponibles
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div key={mission.id} className="group bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-black group-hover:text-success-600 transition-colors">{mission.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-2 shadow-sm ${
                    mission.status === 'accepted'
                      ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300'
                      : mission.status === 'in_progress'
                      ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border-primary-300'
                      : mission.status === 'completed'
                      ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {mission.status === 'accepted'
                    ? '📋 Acceptée'
                    : mission.status === 'in_progress'
                    ? '🚚 En cours'
                    : mission.status === 'completed'
                    ? '✅ Terminée'
                    : '❌ Annulée'}
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

              <div className="pt-4 border-t-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-semibold flex items-center gap-1">
                    <span>💰</span>
                    <span>Vous gagnez</span>
                  </span>
                  <span className="text-2xl font-bold text-success-600">
                    {formatCurrency(mission.payment_amount)}
                  </span>
                </div>

                {mission.status === 'accepted' && (
                  <button
                    onClick={() => updateStatus(mission.id, 'in_progress')}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg"
                  >
                    🚀 Démarrer la mission
                  </button>
                )}

                {mission.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      setSelectedMission(mission);
                      setProofImages([]);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg"
                  >
                    ✅ Terminer la mission
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-success-100 to-success-200 rounded-full mb-4">
                <CheckCircle size={32} className="text-success-600" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">
                Finaliser votre Mission
              </h3>
              <p className="text-sm text-gray-600">Ajoutez vos photos de preuve de livraison</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>📸</span>
                <span>Photos de Preuve</span>
              </label>
              <label className="block cursor-pointer">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-success-400 hover:bg-success-50 transition-all text-center">
                  <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter des photos</p>
                  <p className="text-xs text-gray-500 mt-1">Livraison, signature, etc.</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </label>
              {proofImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">✅ {proofImages.length} photo{proofImages.length > 1 ? 's' : ''} ajoutée{proofImages.length > 1 ? 's' : ''}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {proofImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-20 object-cover rounded-xl border-2 border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedMission(null);
                  setProofImages([]);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border-2 border-gray-200 transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleComplete(selectedMission.id)}
                disabled={proofImages.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
