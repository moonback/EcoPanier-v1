import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Truck, MapPin, DollarSign, Snowflake, AlertCircle, Package, Users, CheckCircle, XCircle, Star } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type CollectorProfile = Database['public']['Tables']['profiles']['Row'];

interface MissionFormData {
  title: string;
  description: string;
  pickup_address: string;
  delivery_address: string;
  payment_amount: number;
  requires_cold_chain: boolean;
  is_urgent: boolean;
}

export const MissionCreation = () => {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [availableCollectors, setAvailableCollectors] = useState<CollectorProfile[]>([]);
  const [compatibleCount, setCompatibleCount] = useState(0);
  
  const [formData, setFormData] = useState<MissionFormData>({
    title: '',
    description: '',
    pickup_address: '',
    delivery_address: '',
    payment_amount: 5,
    requires_cold_chain: false,
    is_urgent: false,
  });

  // Charger les collecteurs disponibles
  useEffect(() => {
    fetchAvailableCollectors();
  }, []);

  // Recalculer les collecteurs compatibles quand les critères changent
  useEffect(() => {
    calculateCompatibleCollectors();
  }, [formData.requires_cold_chain, availableCollectors]);

  const fetchAvailableCollectors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'collector')
        .eq('verified', true);

      if (error) throw error;
      setAvailableCollectors(data || []);
    } catch (err) {
      console.error('Error fetching collectors:', err);
    }
  };

  const calculateCompatibleCollectors = () => {
    let compatible = availableCollectors;

    // Filtrer par chaîne du froid
    if (formData.requires_cold_chain) {
      compatible = compatible.filter(
        (c) => c.collector_preferences?.accepts_cold_chain === true
      );
    }

    setCompatibleCount(compatible.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!profile) {
        throw new Error('Vous devez être connecté pour créer une mission');
      }

      // Validation
      if (formData.payment_amount < 3) {
        throw new Error('Le montant minimum est de 3€ pour motiver les collecteurs');
      }

      // Créer la mission
      const { data, error: insertError } = await supabase
        .from('missions')
        .insert({
          merchant_id: profile.id,
          title: formData.title,
          description: formData.description,
          pickup_address: formData.pickup_address || profile.business_address || '',
          delivery_address: formData.delivery_address,
          payment_amount: formData.payment_amount,
          requires_cold_chain: formData.requires_cold_chain,
          is_urgent: formData.is_urgent,
          status: 'available',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess('✅ Mission créée avec succès ! Un collecteur va bientôt l\'accepter.');
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        pickup_address: '',
        delivery_address: '',
        payment_amount: 5,
        requires_cold_chain: false,
        is_urgent: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Error creating mission:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 md:p-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-success-100 to-success-200 rounded-full mb-4">
            <Truck size={32} className="text-success-600" strokeWidth={2} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Créer une Mission de Livraison
          </h2>
          <p className="text-gray-600 font-light">
            Faites livrer vos paniers suspendus par un collecteur local
          </p>
        </div>

        {/* Alertes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-red-800 font-light flex-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success-50 border-2 border-success-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-lg">✅</span>
              <p className="text-sm text-success-800 font-light flex-1">{success}</p>
            </div>
          </div>
        )}

        {/* Collecteurs disponibles */}
        <div className="mb-6 p-5 bg-gradient-to-br from-success-50 to-primary-50 rounded-xl border-2 border-success-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center shadow-md">
                <Users size={20} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Collecteurs Disponibles</h3>
                <p className="text-xs text-gray-600">Compatibles avec vos critères</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-success-600">
                {compatibleCount}
              </div>
              <div className="text-xs text-gray-600">sur {availableCollectors.length}</div>
            </div>
          </div>

          {formData.requires_cold_chain && compatibleCount < availableCollectors.length && (
            <div className="mt-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-primary-200">
              <p className="text-xs text-gray-700 flex items-start gap-2">
                <Snowflake size={14} className="mt-0.5 text-primary-600 flex-shrink-0" />
                <span>
                  <strong>{availableCollectors.length - compatibleCount}</strong> collecteur(s) exclu(s) car ils n'acceptent pas la chaîne du froid.
                  {compatibleCount === 0 && (
                    <span className="text-warning-700 font-semibold"> Retirez cette option pour élargir votre recherche.</span>
                  )}
                </span>
              </p>
            </div>
          )}

          {compatibleCount === 0 && availableCollectors.length > 0 && (
            <div className="mt-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
              <p className="text-xs text-warning-800 font-semibold flex items-center gap-2">
                <AlertCircle size={14} />
                <span>⚠️ Aucun collecteur ne correspond à vos critères. Modifiez les options pour trouver des collecteurs.</span>
              </p>
            </div>
          )}

          {compatibleCount > 0 && (
            <div className="mt-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-success-200">
              <p className="text-xs text-success-800 font-semibold flex items-center gap-2">
                <CheckCircle size={14} />
                <span>✅ Excellente nouvelle ! Votre mission peut être acceptée par {compatibleCount} collecteur{compatibleCount > 1 ? 's' : ''}.</span>
              </p>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Package size={16} />
              <span>Titre de la mission</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-success-500 focus:ring-2 focus:ring-success-100 transition-all outline-none"
              placeholder="Ex: Livraison de 3 paniers suspendus"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description détaillée
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-success-500 focus:ring-2 focus:ring-success-100 transition-all outline-none resize-none"
              placeholder="Détails de la livraison, instructions spéciales..."
              rows={4}
              required
            />
          </div>

          {/* Adresses */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Adresse de collecte */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-warning-600" />
                <span>Point de collecte</span>
              </label>
              <input
                type="text"
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-warning-500 focus:ring-2 focus:ring-warning-100 transition-all outline-none"
                placeholder={profile?.business_address || 'Adresse de collecte'}
                defaultValue={profile?.business_address || ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Par défaut : votre adresse commerciale
              </p>
            </div>

            {/* Adresse de livraison */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-success-600" />
                <span>Point de livraison</span>
              </label>
              <input
                type="text"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-success-500 focus:ring-2 focus:ring-success-100 transition-all outline-none"
                placeholder="Adresse de destination"
                required
              />
            </div>
          </div>

          {/* Rémunération */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-success-600" />
              <span>Rémunération du collecteur</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="3"
                step="0.5"
                value={formData.payment_amount}
                onChange={(e) => setFormData({ ...formData, payment_amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-300 bg-white text-black focus:border-success-500 focus:ring-2 focus:ring-success-100 transition-all outline-none text-lg font-semibold"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">€</span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <span>💡</span>
                <span>Minimum 3€ pour rémunérer équitablement les collecteurs.</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_amount: 5 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    formData.payment_amount === 5
                      ? 'bg-success-100 text-success-700 border-2 border-success-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  5€ · Courte distance
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_amount: 7 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    formData.payment_amount === 7
                      ? 'bg-success-100 text-success-700 border-2 border-success-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  7€ · Distance moyenne
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_amount: 10 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    formData.payment_amount === 10
                      ? 'bg-success-100 text-success-700 border-2 border-success-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  10€ · Longue distance
                </button>
                {formData.is_urgent && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_amount: 12 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      formData.payment_amount === 12
                        ? 'bg-warning-100 text-warning-700 border-2 border-warning-300'
                        : 'bg-warning-50 text-warning-700 border-2 border-warning-200 hover:border-warning-300'
                    }`}
                  >
                    🔥 12€ · Urgent
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Options de livraison</h3>
            
            {/* Chaîne du froid */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.requires_cold_chain}
                onChange={(e) => setFormData({ ...formData, requires_cold_chain: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Snowflake size={16} className="text-primary-600" />
                  <span className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    Chaîne du froid requise
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Le collecteur devra maintenir la température (sac isotherme requis)
                </p>
              </div>
            </label>

            {/* Urgence */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_urgent}
                onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-warning-600 focus:ring-2 focus:ring-warning-200 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-warning-600" />
                  <span className="font-semibold text-gray-800 group-hover:text-warning-600 transition-colors">
                    🔥 Livraison urgente
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  La mission sera mise en avant pour les collecteurs (livraison sous 2h)
                </p>
              </div>
            </label>
          </div>

          {/* Aperçu des collecteurs compatibles */}
          {compatibleCount > 0 && (
            <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={16} />
                <span>Collecteurs Compatibles ({compatibleCount})</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCollectors
                  .filter((c) => 
                    !formData.requires_cold_chain || c.collector_preferences?.accepts_cold_chain === true
                  )
                  .slice(0, 5)
                  .map((collector) => (
                    <div
                      key={collector.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-success-300 transition-all"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold">
                        {collector.full_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {collector.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {collector.collector_preferences?.vehicle_type && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                              {collector.collector_preferences.vehicle_type === 'bike' && '🚲 Vélo'}
                              {collector.collector_preferences.vehicle_type === 'ebike' && '🚴 Vélo élec.'}
                              {collector.collector_preferences.vehicle_type === 'scooter' && '🛵 Scooter'}
                              {collector.collector_preferences.vehicle_type === 'car' && '🚗 Voiture'}
                              {collector.collector_preferences.vehicle_type === 'van' && '🚐 Camionnette'}
                            </span>
                          )}
                          {collector.collector_preferences?.accepts_cold_chain && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full flex items-center gap-1">
                              <Snowflake size={10} />
                              <span>Froid OK</span>
                            </span>
                          )}
                          {collector.verified && (
                            <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded-full flex items-center gap-1">
                              <CheckCircle size={10} />
                              <span>Vérifié</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {compatibleCount > 5 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  + {compatibleCount - 5} autre{compatibleCount - 5 > 1 ? 's' : ''} collecteur{compatibleCount - 5 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || compatibleCount === 0}
            className="w-full py-4 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Création en cours...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Truck size={20} />
                <span>
                  {compatibleCount === 0 
                    ? 'Aucun collecteur disponible' 
                    : 'Créer la Mission'}
                </span>
              </span>
            )}
          </button>

          {/* Message si aucun collecteur */}
          {compatibleCount === 0 && (
            <div className="p-4 bg-warning-50 border-2 border-warning-200 rounded-xl">
              <p className="text-sm text-warning-800 font-semibold text-center">
                ⚠️ Impossible de créer la mission : aucun collecteur ne correspond à vos critères.
              </p>
              {formData.requires_cold_chain && (
                <p className="text-xs text-warning-700 text-center mt-2">
                  Essayez de retirer l'option "Chaîne du froid" pour élargir votre recherche.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

