import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Truck, MapPin, DollarSign, Snowflake, AlertCircle, Package } from 'lucide-react';

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
  
  const [formData, setFormData] = useState<MissionFormData>({
    title: '',
    description: '',
    pickup_address: '',
    delivery_address: '',
    payment_amount: 5,
    requires_cold_chain: false,
    is_urgent: false,
  });

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
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <span>💡</span>
              <span>
                Recommandé : 5-10€ selon la distance. Minimum 3€ pour rémunérer équitablement les collecteurs.
              </span>
            </p>
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

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
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
                <span>Créer la Mission</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

