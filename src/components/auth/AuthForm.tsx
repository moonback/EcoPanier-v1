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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-3 sm:p-4">
      {/* Vidéo en arrière-plan */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/ÉcoPanier.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay avec dégradé pour lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-secondary-900/70 to-neutral-900/80 backdrop-blur-sm"></div>
      
      {/* Conteneur du formulaire */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-5 sm:p-8 animate-fade-in-up relative z-10">
        {/* Header avec logo et titre */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl shadow-soft-lg mb-3 sm:mb-4">
            <Heart size={28} className="sm:w-8 sm:h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1 sm:mb-2 tracking-tight">
            🌱 ÉcoPanier
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-medium">
            {mode === 'signin' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Onglets Mode */}
        <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              mode === 'signin'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            🔐 Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              mode === 'signup'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ✨ Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                Type de compte
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base font-medium"
              >
                <option value="customer">🛒 Client - Acheter des lots anti-gaspi</option>
                <option value="merchant">🏪 Commerçant - Vendre mes invendus</option>
                <option value="beneficiary">🤝 Bénéficiaire - Accéder aux dons gratuits</option>
                <option value="collector">📦 Collecteur - Effectuer des livraisons</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                placeholder="votre@email.fr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-3 sm:space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                  Téléphone <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                  Adresse <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                    placeholder="12 rue de Paris, 75001 Paris"
                  />
                </div>
              </div>

              {role === 'merchant' && (
                <div className="space-y-3 sm:space-y-4 pt-3 border-t-2 border-neutral-100 animate-fade-in">
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-xs sm:text-sm text-primary-800 font-semibold">
                      🏪 Informations du commerce
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                      Nom du commerce
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                        placeholder="Ma Boulangerie"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-2">
                      Adresse du commerce
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-sm sm:text-base"
                        placeholder="15 avenue de la République"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 bg-accent-50 border-2 border-accent-200 rounded-xl animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-accent-600 flex-shrink-0 text-lg">⚠️</span>
                <p className="text-xs sm:text-sm text-accent-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-4 bg-success-50 border-2 border-success-200 rounded-xl animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-success-600 flex-shrink-0 text-lg">✅</span>
                <p className="text-xs sm:text-sm text-success-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-primary-200 mt-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Chargement...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <span>🔐</span>
                <span>Se connecter</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>S'inscrire gratuitement</span>
              </>
            )}
          </button>
        </form>

        {/* Barre de séparation pour mobile */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-neutral-100">
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm text-neutral-500">
              {mode === 'signin' ? "Vous n'avez pas encore de compte ?" : 'Vous avez déjà un compte ?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setSuccess('');
              }}
              className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-bold hover-lift transition-all underline decoration-2 underline-offset-4"
            >
              {mode === 'signin' ? "S'inscrire gratuitement" : 'Se connecter'}
            </button>
          </div>
        </div>

        {/* Info sécurité */}
        <div className="mt-6 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-xs text-center text-neutral-600">
            🔒 Vos données sont sécurisées et ne seront jamais partagées
          </p>
        </div>
      </div>
    </div>
  );
};
