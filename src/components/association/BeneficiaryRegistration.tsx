import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { User, Mail, Lock, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';

export function BeneficiaryRegistration() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Données du formulaire
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    notes: '',
    isVerified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Générer un ID bénéficiaire unique
      const year = new Date().getFullYear();
      const count = Math.floor(Math.random() * 100000);
      const beneficiaryId = `${year}-BEN-${String(count).padStart(5, '0')}`;

      // 3. Créer le profil bénéficiaire
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        role: 'beneficiary',
        full_name: formData.fullName,
        phone: formData.phone || null,
        address: formData.address || null,
        beneficiary_id: beneficiaryId,
        verified: formData.isVerified,
        business_name: null,
        business_address: null,
        business_logo_url: null,
        business_hours: null,
        latitude: null,
        longitude: null,
      });

      if (profileError) throw profileError;

      // 4. Créer l'enregistrement dans la table de liaison
      const { error: registrationError } = await supabase
        .from('association_beneficiary_registrations')
        .insert({
          association_id: profile!.id,
          beneficiary_id: authData.user.id,
          notes: formData.notes || null,
          is_verified: formData.isVerified,
        });

      if (registrationError) throw registrationError;

      // Succès
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        notes: '',
        isVerified: false,
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      {/* En-tête */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Enregistrer un nouveau bénéficiaire
        </h2>
        <p className="text-neutral-600">
          Créez un compte pour une personne accompagnée par votre association.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Informations personnelles
          </h3>
          <div className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="jean.dupont@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Le bénéficiaire pourra modifier ce mot de passe ultérieurement
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Téléphone <span className="text-neutral-500">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Adresse <span className="text-neutral-500">(optionnel)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="12 rue de Paris, 75001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes et vérification */}
        <div className="pt-6 border-t border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Informations complémentaires
          </h3>
          <div className="space-y-4">
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Notes <span className="text-neutral-500">(optionnel)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-neutral-400" size={18} />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none resize-none"
                  placeholder="Informations supplémentaires sur le bénéficiaire..."
                  rows={4}
                />
              </div>
            </div>

            {/* Vérification */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="verified"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="mt-0.5 h-5 w-5 text-purple-600 border-neutral-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="verified" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <CheckCircle size={16} className="text-purple-600" />
                  <span>Marquer comme vérifié</span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  Cochez cette case si vous avez vérifié l'identité et l'éligibilité du bénéficiaire
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-success-50 border-2 border-success-200 rounded-lg">
            <p className="text-sm text-success-800 font-medium">
              ✅ Le bénéficiaire a été enregistré avec succès ! Un email de confirmation lui a été envoyé.
            </p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                notes: '',
                isVerified: false,
              });
              setError('');
              setSuccess(false);
            }}
            className="flex-1 py-3 px-4 rounded-lg border-2 border-neutral-300 font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              'Enregistrer le bénéficiaire'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

