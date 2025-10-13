import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../lib/database.types';
import { Mail, Lock, User, Phone, MapPin, Building, ShoppingCart, Store, Heart, Truck } from 'lucide-react';

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
          business_logo_url: null,
          business_hours: null,
          latitude: null,
          longitude: null,
          beneficiary_id: null,
          verified: false,
        });
        setSuccess('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter.');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-black">
      {/* Vidéo en arrière-plan */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/ÉcoPanier.mp4" type="video/mp4" />
      </video>
      
      {/* Conteneur du formulaire */}
      <div className="max-w-md w-full bg-white p-8 relative z-10 rounded-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Logo EcoPanier"
            className="w-32 mx-auto mb-4 rounded-lg shadow-lg bg-white object-contain"
            draggable={false}
          />
          <p className="text-sm text-gray-600 font-light text-center">
            {mode === 'signin' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Onglets Mode */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
              mode === 'signin'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
              mode === 'signup'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Client */}
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    role === 'customer'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}
                >
                  <ShoppingCart className="mb-2" size={24} strokeWidth={1.5} />
                  <div className="font-medium text-sm">Client</div>
                  <div className={`text-xs mt-1 ${role === 'customer' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Acheter des lots
                  </div>
                </button>

                {/* Commerçant */}
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    role === 'merchant'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}
                >
                  <Store className="mb-2" size={24} strokeWidth={1.5} />
                  <div className="font-medium text-sm">Commerçant</div>
                  <div className={`text-xs mt-1 ${role === 'merchant' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Vendre invendus
                  </div>
                </button>

                {/* Bénéficiaire */}
                <button
                  type="button"
                  onClick={() => setRole('beneficiary')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    role === 'beneficiary'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}
                >
                  <Heart className="mb-2" size={24} strokeWidth={1.5} />
                  <div className="font-medium text-sm">Bénéficiaire</div>
                  <div className={`text-xs mt-1 ${role === 'beneficiary' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Dons gratuits
                  </div>
                </button>

                {/* Collecteur */}
                <button
                  type="button"
                  onClick={() => setRole('collector')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    role === 'collector'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}
                >
                  <Truck className="mb-2" size={24} strokeWidth={1.5} />
                  <div className="font-medium text-sm">Collecteur</div>
                  <div className={`text-xs mt-1 ${role === 'collector' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Livraisons
                  </div>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                placeholder="votre@email.fr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Téléphone <span className="text-gray-400 font-light">(optionnel)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Adresse <span className="text-gray-400 font-light">(optionnel)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                    placeholder="12 rue de Paris, 75001"
                  />
                </div>
              </div>

              {role === 'merchant' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-black font-medium">
                      Informations du commerce
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nom du commerce
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
                        placeholder="Ma Boulangerie"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Adresse du commerce
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 transition-all outline-none font-light"
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-light">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-light">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg font-medium text-base transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-gray-900 focus:ring-gray-200 mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Chargement...</span>
              </div>
            ) : mode === 'signin' ? (
              'Se connecter'
            ) : (
              'S\'inscrire'
            )}
          </button>
        </form>

        {/* Lien pour changer de mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setSuccess('');
            }}
            className="text-sm text-gray-600 hover:text-black font-light"
          >
            {mode === 'signin' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {/* Info sécurité */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-center text-gray-600 font-light">
            Vos données sont sécurisées
          </p>
        </div>
      </div>
    </div>
  );
};
