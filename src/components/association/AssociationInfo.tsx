import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Building2, MapPin, Phone, User, Mail, Save, AlertCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function AssociationInfo() {
  const { profile, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    business_address: profile?.business_address || '',
    phone: profile?.phone || '',
    full_name: profile?.full_name || '',
    address: profile?.address || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        business_address: profile.business_address || '',
        phone: profile.phone || '',
        full_name: profile.full_name || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          business_name: formData.business_name,
          business_address: formData.business_address,
          phone: formData.phone || null,
          full_name: formData.full_name,
          address: formData.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Rafraîchir le profil dans le store
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        useAuthStore.setState({ profile: updatedProfile as Profile });
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Impossible de mettre à jour les informations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Building2 size={28} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Informations de votre association</h2>
            <p className="text-neutral-600 mt-1">
              Gérez les informations de votre association et vos coordonnées
            </p>
          </div>
        </div>
      </div>

      {/* Messages de retour */}
      {success && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-success-100 rounded-lg">
            <Save size={20} className="text-success-600" />
          </div>
          <p className="text-success-800 font-medium">
            Informations mises à jour avec succès !
          </p>
        </div>
      )}

      {error && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-accent-100 rounded-lg">
            <AlertCircle size={20} className="text-accent-600" />
          </div>
          <p className="text-accent-800">{error}</p>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'association */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-purple-600" />
            Informations de l'association
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-neutral-700 mb-2">
                Nom de l'association *
              </label>
              <input
                type="text"
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Association Solidarité"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="business_address" className="block text-sm font-medium text-neutral-700 mb-2">
              Adresse de l'association *
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-neutral-400" />
              <textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => handleChange('business_address', e.target.value)}
                required
                rows={2}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                placeholder="123 Rue de la Solidarité, 75000 Paris"
              />
            </div>
          </div>
        </div>

        {/* Informations du responsable */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-purple-600" />
            Informations du responsable
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email (lecture seule)
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                L'email ne peut pas être modifié ici
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
              Adresse personnelle
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-neutral-400" />
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                placeholder="456 Avenue du Responsable, 75000 Paris (optionnel)"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              if (profile) {
                setFormData({
                  business_name: profile.business_name || '',
                  business_address: profile.business_address || '',
                  phone: profile.phone || '',
                  full_name: profile.full_name || '',
                  address: profile.address || '',
                });
              }
              setError(null);
              setSuccess(false);
            }}
            className="px-6 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Informations supplémentaires */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informations importantes :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Les champs marqués d'un astérisque (*) sont obligatoires</li>
              <li>Ces informations seront visibles par les bénéficiaires que vous enregistrez</li>
              <li>Pour modifier votre email, contactez l'administrateur de la plateforme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

