import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../lib/database.types';
import { Mail, Lock, User, Phone, MapPin, Building, Heart } from 'lucide-react';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onSuccess?.();
      } else {
        await signUp(email, password, {
          role,
          full_name: fullName,
          phone: phone || null,
          address: address || null,
          business_name: role === 'merchant' ? businessName : null,
          business_address: role === 'merchant' ? businessAddress : null,
          latitude: null,
          longitude: null,
          beneficiary_id: null,
          verified: false,
        });
        setSuccess('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-gradient p-4">
      <div className="max-w-md w-full bg-white rounded-large shadow-soft-xl border border-neutral-100 p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-soft-lg mb-4">
            <Heart size={32} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">
            Plateforme Anti-Gaspillage
          </h1>
          <p className="text-neutral-600">
            {mode === 'signin' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Type de compte
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input"
              >
                <option value="customer">🛒 Client</option>
                <option value="merchant">🏪 Commerçant</option>
                <option value="beneficiary">🤝 Bénéficiaire</option>
                <option value="collector">📦 Collecteur</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-icon"
                placeholder="votre@email.fr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-icon"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-icon"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-icon"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Adresse (optionnel)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-icon"
                    placeholder="12 rue de Paris, 75001 Paris"
                  />
                </div>
              </div>

              {role === 'merchant' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Nom du commerce
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="input-icon"
                        placeholder="Ma Boulangerie"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Adresse du commerce
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className="input-icon"
                        placeholder="15 avenue de la République"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="p-4 bg-accent-50 border-2 border-accent-200 rounded-xl text-accent-700 text-sm font-medium animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 text-sm font-medium animate-fade-in">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-xl text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Chargement...</span>
              </>
            ) : mode === 'signin' ? (
              '🔐 Se connecter'
            ) : (
              "✨ S'inscrire gratuitement"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setSuccess('');
            }}
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover-lift transition-all"
          >
            {mode === 'signin'
              ? "Pas encore de compte ? S'inscrire gratuitement"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};
