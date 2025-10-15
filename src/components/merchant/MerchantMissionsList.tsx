import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { MapPin, DollarSign, Snowflake, AlertCircle, Truck, User, CheckCircle, Clock } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Mission = Database['public']['Tables']['missions']['Row'] & {
  collector_profile?: {
    full_name: string;
    phone: string | null;
  };
};

export const MerchantMissionsList = () => {
  const { profile } = useAuthStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          collector_profile:profiles!missions_collector_id_fkey(full_name, phone)
        `)
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data as Mission[]);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelMission = async (missionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette mission ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('missions')
        .update({ status: 'cancelled' })
        .eq('id', missionId)
        .eq('merchant_id', profile?.id); // Sécurité : vérifier que c'est bien la mission du commerçant

      if (error) throw error;

      alert('Mission annulée avec succès');
      fetchMissions();
    } catch (error) {
      console.error('Error cancelling mission:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const filteredMissions = missions.filter((mission) => {
    if (filter === 'all') return true;
    return mission.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-black mb-1">
              📦 Mes Missions de Livraison
            </h2>
            <p className="text-sm text-gray-600">
              Suivez vos missions confiées aux collecteurs
            </p>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({missions.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'available'
                  ? 'bg-gradient-to-r from-warning-600 to-warning-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disponibles ({missions.filter((m) => m.status === 'available').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'in_progress'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En cours ({missions.filter((m) => m.status === 'accepted' || m.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terminées ({missions.filter((m) => m.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des missions */}
      {filteredMissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md border-2 border-gray-100">
          <div className="inline-flex p-6 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-full mb-6">
            <Truck size={64} className="text-secondary-400" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-bold text-black mb-3">
            {filter === 'all' ? 'Aucune mission créée' : `Aucune mission ${filter === 'available' ? 'disponible' : filter === 'in_progress' ? 'en cours' : 'terminée'}`}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-light">
            {filter === 'all'
              ? 'Créez votre première mission pour faire livrer vos paniers suspendus'
              : 'Aucune mission ne correspond à ce filtre'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((mission) => (
            <div
              key={mission.id}
              className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 hover:border-gray-200"
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-black line-clamp-2 flex-1 group-hover:text-secondary-600 transition-colors">
                    {mission.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 shadow-sm whitespace-nowrap flex-shrink-0 ${
                      mission.status === 'available'
                        ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300'
                        : mission.status === 'accepted'
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border-primary-300'
                        : mission.status === 'in_progress'
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border-primary-300'
                        : mission.status === 'completed'
                        ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                    }`}
                  >
                    {mission.status === 'available' && '📋 Disponible'}
                    {mission.status === 'accepted' && '✅ Acceptée'}
                    {mission.status === 'in_progress' && '🚚 En livraison'}
                    {mission.status === 'completed' && '✅ Livrée'}
                    {mission.status === 'cancelled' && '❌ Annulée'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mission.description}</p>

                {/* Badges urgence et chaîne du froid */}
                {(mission.is_urgent || mission.requires_cold_chain) && (
                  <div className="flex gap-2 mb-4">
                    {mission.is_urgent && (
                      <span className="px-2 py-1 bg-warning-100 text-warning-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-warning-200">
                        <AlertCircle size={12} />
                        🔥 Urgent
                      </span>
                    )}
                    {mission.requires_cold_chain && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-primary-200">
                        <Snowflake size={12} />
                        🧊 Froid
                      </span>
                    )}
                  </div>
                )}

                {/* Adresses */}
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Collecte</p>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0 text-warning-600" />
                      <span className="line-clamp-1">{mission.pickup_address}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Livraison</p>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0 text-success-600" />
                      <span className="line-clamp-1">{mission.delivery_address}</span>
                    </div>
                  </div>
                </div>

                {/* Collecteur assigné */}
                {mission.collector_id && mission.collector_profile && (
                  <div className="p-3 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border border-success-200 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-success-600" />
                      <span className="font-semibold text-gray-800">
                        Collecteur : {mission.collector_profile.full_name}
                      </span>
                    </div>
                    {mission.collector_profile.phone && (
                      <p className="text-xs text-gray-600 mt-1 ml-6">
                        📞 {mission.collector_profile.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>Créée le {formatDateTime(mission.created_at)}</span>
                  </div>
                  {mission.accepted_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} />
                      <span>Acceptée le {formatDateTime(mission.accepted_at)}</span>
                    </div>
                  )}
                  {mission.completed_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-success-600" />
                      <span className="text-success-600 font-semibold">
                        Livrée le {formatDateTime(mission.completed_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer avec rémunération et actions */}
                <div className="pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Rémunération versée</p>
                      <p className="text-2xl font-bold text-success-600 flex items-center gap-1">
                        <DollarSign size={20} />
                        {formatCurrency(mission.payment_amount)}
                      </p>
                    </div>

                    {/* Bouton d'annulation si disponible */}
                    {mission.status === 'available' && (
                      <button
                        onClick={() => cancelMission(mission.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm border-2 border-red-200"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {/* Photos de preuve si complétée */}
                {mission.status === 'completed' && mission.proof_urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📸</span>
                      <span>Preuves de livraison</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {mission.proof_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Proof ${i + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-success-400 transition-colors cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résumé en bas */}
      {missions.length > 0 && (
        <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl border-2 border-secondary-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">{missions.length}</p>
              <p className="text-xs text-gray-600 mt-1">Missions totales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warning-600">
                {missions.filter((m) => m.status === 'available').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">En attente</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">
                {missions.filter((m) => m.status === 'accepted' || m.status === 'in_progress').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">En cours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-success-600">
                {missions.filter((m) => m.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Complétées</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

