import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../lib/database.types';
import { Mail, Lock, User, Phone, MapPin, Building, ShoppingCart, Store, Heart, FileText, FileCheck, Briefcase, ArrowLeft, Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

// Types de commerces disponibles
const BUSINESS_TYPES = [
  { value: 'bakery', label: '🥖 Boulangerie / Pâtisserie', category: 'Commerces de proximité' },
  { value: 'restaurant', label: '🍽️ Restaurant / Bistrot', category: 'Restauration' },
  { value: 'caterer', label: '👨‍🍳 Traiteur événementiel', category: 'Restauration' },
  { value: 'gastronomic', label: '⭐ Restaurant gastronomique', category: 'Restauration' },
  { value: 'brasserie', label: '🍺 Brasserie / Bar à vin', category: 'Restauration' },
  { value: 'fastfood', label: '🍔 Fast-food / Snack', category: 'Restauration' },
  { value: 'cafe', label: '☕ Café / Salon de thé', category: 'Restauration' },
  { value: 'supermarket', label: '🛒 Supermarché / Épicerie', category: 'Commerces de proximité' },
  { value: 'butcher', label: '🥩 Boucherie / Charcuterie', category: 'Commerces de proximité' },
  { value: 'fruits_vegetables', label: '🥬 Fruits & Légumes / Primeur', category: 'Commerces de proximité' },
  { value: 'grocery', label: '🏪 Épicerie fine', category: 'Commerces de proximité' },
  { value: 'fishmonger', label: '🐟 Poissonnerie', category: 'Commerces de proximité' },
  { value: 'cheese_dairy', label: '🧀 Fromagerie / Crèmerie', category: 'Commerces de proximité' },
  { value: 'organic', label: '🌿 Magasin bio / Vrac', category: 'Commerces de proximité' },
  { value: 'other', label: '🏬 Autre commerce alimentaire', category: 'Autre' },
] as const;

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [siret, setSiret] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  // Validation de l'email
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Calcul de la force du mot de passe
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    // Longueur
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    // Minuscules et majuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    // Chiffres
    if (/\d/.test(password)) score++;
    // Caractères spéciaux
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' };
    if (score === 3) return { score, label: 'Moyen', color: 'bg-amber-500' };
    if (score === 4) return { score, label: 'Bon', color: 'bg-blue-500' };
    return { score, label: 'Excellent', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validations pour l'inscription
      if (mode === 'signup') {
        // Validation email
        if (!isEmailValid(email)) {
          throw new Error('Veuillez entrer une adresse email valide.');
        }

        // Validation mot de passe
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
        }

        // Confirmation mot de passe
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.');
        }

        // Acceptation des CGU
        if (!acceptTerms) {
          throw new Error('Vous devez accepter les Conditions Générales d\'Utilisation.');
        }

        // Validation SIRET pour commerçants/associations
        if ((role === 'merchant' || role === 'association') && siret && siret.length !== 14) {
          throw new Error('Le numéro SIRET doit contenir exactement 14 chiffres.');
        }
      }

      if (mode === 'signin') {
        await signIn(email, password);
        onSuccess?.();
      } else {
        await signUp(email, password, {
          role,
          full_name: fullName,
          phone: phone || null,
          address: address || null,
          business_name: (role === 'merchant' || role === 'association') ? businessName : null,
          business_address: (role === 'merchant' || role === 'association') ? businessAddress : null,
          business_logo_url: null,
          business_hours: null,
          siret: (role === 'merchant' || role === 'association') ? siret || null : null,
          business_type: role === 'merchant' ? businessType || null : null,
          business_email: (role === 'merchant' || role === 'association') ? businessEmail || null : null,
          business_description: (role === 'merchant' || role === 'association') ? businessDescription || null : null,
          vat_number: (role === 'merchant' || role === 'association') ? vatNumber || null : null,
          latitude: null,
          longitude: null,
          beneficiary_id: null,
          verified: false,
          collector_preferences: null
        });
        setSuccess('Compte créé ! Vérifiez votre e-mail pour l\'activer.');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white">
      {/* Bouton retour accueil */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md text-gray-900 rounded-xl hover:bg-white transition-all duration-200 font-semibold shadow-md hover:shadow-xl group border border-gray-200/50"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="hidden sm:inline text-sm">Retour accueil</span>
      </button>

      {/* Colonne gauche - Photo/Vidéo FIXE */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-1/2 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        {/* Vidéo en arrière-plan */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/ÉcoPanier.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay avec contenu */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-10 py-8 text-white">
          <div className="w-full max-w-2xl space-y-8">
            {/* Logo et titre */}
            <div className="text-center space-y-3 animate-fade-in-up">
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Chaque panier compte 🌍
              </h1>
              <p className="text-lg text-white/95 font-light leading-relaxed">
                La plateforme solidaire qui lutte contre le gaspillage
              </p>
            </div>

            {/* Avantages en 2 colonnes compactes */}
            <div className="grid grid-cols-2 gap-5 animate-fade-in-up">
              {/* Colonne CLIENTS */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2.5 pb-2 border-b border-white/30">
                  <span className="text-xl">🛒</span>
                  <span>Clients</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">💰</span>
                      </div>
                      <div className="font-bold text-base">-70% sur les invendus</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      Réduisez vos dépenses
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">🌍</span>
                      </div>
                      <div className="font-bold text-base">Impact positif</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      0,9 kg de CO₂ évités/panier
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">❤️</span>
                      </div>
                      <div className="font-bold text-base">Solidarité</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      Financez un panier suspendu
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne BÉNÉFICIAIRES */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2.5 pb-2 border-b border-white/30">
                  <span className="text-xl">🤝</span>
                  <span>Bénéficiaires</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">🎁</span>
                      </div>
                      <div className="font-bold text-base">2 paniers/jour</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      Accès aux paniers suspendus
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">✨</span>
                      </div>
                      <div className="font-bold text-base">Accès simple</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      Juste votre ID, sans paperasse
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg">🏪</span>
                      </div>
                      <div className="font-bold text-base">Produits frais</div>
                    </div>
                    <div className="text-xs text-white/90 font-light leading-relaxed">
                      Qualité des commerces locaux
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats d'impact compactes */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/30 animate-fade-in-up">
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <div className="text-3xl font-black text-white mb-1">12K+</div>
                <div className="text-xs text-white/90 font-medium">Paniers sauvés</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <div className="text-3xl font-black text-white mb-1">10T</div>
                <div className="text-xs text-white/90 font-medium">CO₂ évités</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <div className="text-3xl font-black text-white mb-1">500+</div>
                <div className="text-xs text-white/90 font-medium">Commerçants engagés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="flex-1 lg:ml-[50%] flex items-center justify-center p-6 sm:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <img
            src="/logo.png"
            alt="Logo EcoPanier"
            className="w-36 mx-auto mb-6 rounded-2xl shadow-xl bg-white p-2 object-contain"
            draggable={false}
          />
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            {mode === 'signin' ? 'Heureux de vous revoir 👋' : 'Créer un compte EcoPanier 🌍'}
          </h2>
          <p className="text-base text-gray-600 font-light leading-relaxed">
            {mode === 'signin' 
              ? 'Connectez-vous pour réserver vos paniers' 
              : 'Inscrivez-vous en quelques clics'}
          </p>
        </div>

        {/* Onglets Mode */}
        <div className="flex gap-3 mb-8 p-1.5 bg-gray-100 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
              setConfirmPassword('');
              setAcceptTerms(false);
            }}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
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
              setRememberMe(false);
            }}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="mb-6">
              <label className="block text-base font-bold text-gray-900 mb-4">
                Choisissez votre rôle 🎯
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Client */}
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`group p-5 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                    role === 'customer'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl scale-105'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-flex mb-3 ${role === 'customer' ? 'bg-white/20' : 'bg-primary-50'} group-hover:scale-110 transition-transform duration-200`}>
                    <ShoppingCart size={22} strokeWidth={2} className={role === 'customer' ? 'text-white' : 'text-primary-600'} />
                  </div>
                  <div className="font-bold text-sm mb-1">🛒 Client</div>
                  <div className={`text-xs ${role === 'customer' ? 'text-white/90' : 'text-gray-600'}`}>
                    Réservez des paniers
                  </div>
                  {role === 'customer' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={14} className="text-primary-600" />
                    </div>
                  )}
                </button>

                {/* Commerçant */}
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={`group p-5 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                    role === 'merchant'
                      ? 'border-secondary-600 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white shadow-xl scale-105'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-secondary-300 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-flex mb-3 ${role === 'merchant' ? 'bg-white/20' : 'bg-secondary-50'} group-hover:scale-110 transition-transform duration-200`}>
                    <Store size={22} strokeWidth={2} className={role === 'merchant' ? 'text-white' : 'text-secondary-600'} />
                  </div>
                  <div className="font-bold text-sm mb-1">🏪 Commerçant</div>
                  <div className={`text-xs ${role === 'merchant' ? 'text-white/90' : 'text-gray-600'}`}>
                    Valorisez vos invendus
                  </div>
                  {role === 'merchant' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={14} className="text-secondary-600" />
                    </div>
                  )}
                </button>

                {/* Bénéficiaire */}
                <button
                  type="button"
                  onClick={() => setRole('beneficiary')}
                  className={`group p-5 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                    role === 'beneficiary'
                      ? 'border-accent-600 bg-gradient-to-br from-accent-600 to-accent-700 text-white shadow-xl scale-105'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-accent-300 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-flex mb-3 ${role === 'beneficiary' ? 'bg-white/20' : 'bg-accent-50'} group-hover:scale-110 transition-transform duration-200`}>
                    <Heart size={22} strokeWidth={2} className={role === 'beneficiary' ? 'text-white' : 'text-accent-600'} />
                  </div>
                  <div className="font-bold text-sm mb-1">🤝 Bénéficiaire</div>
                  <div className={`text-xs ${role === 'beneficiary' ? 'text-white/90' : 'text-gray-600'}`}>
                    Recevez 2 paniers/jour
                  </div>
                  {role === 'beneficiary' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={14} className="text-accent-600" />
                    </div>
                  )}
                </button>

                {/* Association */}
                <button
                  type="button"
                  onClick={() => setRole('association')}
                  className={`group p-5 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                    role === 'association'
                      ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl scale-105'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-flex mb-3 ${role === 'association' ? 'bg-white/20' : 'bg-purple-50'} group-hover:scale-110 transition-transform duration-200`}>
                    <FileText size={22} strokeWidth={2} className={role === 'association' ? 'text-white' : 'text-purple-600'} />
                  </div>
                  <div className="font-bold text-sm mb-1">🏛️ Association</div>
                  <div className={`text-xs ${role === 'association' ? 'text-white/90' : 'text-gray-600'}`}>
                    Gérez vos bénéficiaires
                  </div>
                  {role === 'association' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={14} className="text-purple-600" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none font-light shadow-sm hover:shadow-md"
                placeholder="votre@email.com"
                required
              />
              {/* Validation email en temps réel (inscription uniquement) */}
              {mode === 'signup' && email && !isEmailValid(email) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <AlertCircle size={18} className="text-red-500" />
                </div>
              )}
              {mode === 'signup' && email && isEmailValid(email) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 size={18} className="text-green-500" />
                </div>
              )}
            </div>
            {mode === 'signup' && email && !isEmailValid(email) && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-2 font-medium">
                <AlertCircle size={14} />
                <span>Veuillez entrer une adresse email valide</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none font-light shadow-sm hover:shadow-md"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
            {/* Indicateur de force du mot de passe (inscription uniquement) */}
            {mode === 'signup' && password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.label && (
                  <p className="text-xs flex items-center gap-2 font-medium">
                    <Shield size={14} className={passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-amber-500' : 'text-red-500'} />
                    <span className={`${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                      Force du mot de passe : <span className="font-bold">{passwordStrength.label}</span>
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-4">
              {/* Confirmation du mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none font-light shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
                {/* Validation visuelle de la correspondance */}
                {confirmPassword && (
                  <p className={`text-xs mt-2.5 flex items-center gap-2 font-medium ${
                    password === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Les mots de passe correspondent</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        <span>Les mots de passe ne correspondent pas</span>
                      </>
                    )}
                  </p>
                )}
              </div>

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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                    placeholder="12 rue de Paris, 75001"
                  />
                </div>
              </div>

              {(role === 'merchant' || role === 'association') && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="p-3 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl border border-secondary-100">
                    <p className="text-sm text-black font-semibold flex items-center gap-2">
                      <span>{role === 'merchant' ? '🏪' : '🏛️'}</span>
                      <span>Infos {role === 'merchant' ? 'commerce' : 'association'}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {role === 'merchant' 
                        ? 'Publiez vos paniers en quelques minutes' 
                        : 'Suivez vos bénéficiaires partenaires'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nom {role === 'merchant' ? 'du commerce' : 'de l\'association'}
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                        placeholder={role === 'merchant' ? 'Ma Boulangerie' : 'Restos du Cœur'}
                        required
                      />
                    </div>
                  </div>

                  {/* Type d'activité - Juste après le nom pour les commerçants */}
                  {role === 'merchant' && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2 flex items-center gap-2">
                        <span>Type d'activité</span>
                        <span className="text-accent-600 text-xs font-semibold">*Obligatoire</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 transition-all outline-none font-medium appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled>Sélectionnez votre type d'activité</option>
                          
                          {/* Restauration */}
                          <optgroup label="🍽️ Restauration">
                            {BUSINESS_TYPES.filter(t => t.category === 'Restauration').map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </optgroup>

                          {/* Commerces de proximité */}
                          <optgroup label="🏪 Commerces de proximité">
                            {BUSINESS_TYPES.filter(t => t.category === 'Commerces de proximité').map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </optgroup>

                          {/* Autre */}
                          <optgroup label="Autre">
                            {BUSINESS_TYPES.filter(t => t.category === 'Autre').map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                        <span>💡</span>
                        <span>
                          Sélectionnez la catégorie qui vous correspond pour être trouvé facilement.
                        </span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Adresse {role === 'merchant' ? 'du commerce' : 'de l\'association'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                        placeholder="15 avenue de la République"
                        required
                      />
                    </div>
                  </div>

                  {/* SIRET - Obligatoire pour les commerçants français */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Numéro SIRET {role === 'association' && <span className="text-gray-400 font-light">(ou RNA)</span>}
                    </label>
                    <div className="relative">
                      <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setSiret(value.slice(0, 14));
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                        placeholder="12345678901234 (14 chiffres)"
                        maxLength={14}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {siret.length > 0 && siret.length !== 14 && (
                        <span className="text-amber-600">⚠️ 14 chiffres obligatoires</span>
                      )}
                      {siret.length === 14 && (
                        <span className="text-success-600">✓ Format validé</span>
                      )}
                    </p>
                  </div>


                  {/* Email professionnel */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email professionnel <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                        placeholder="contact@moncommerce.fr"
                      />
                    </div>
                  </div>

                  {/* Description du commerce */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Description {role === 'merchant' ? 'du commerce' : 'de l\'association'} <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light resize-none"
                      placeholder={role === 'merchant' ? 'Boulangerie artisanale depuis 1985, spécialisée dans le pain bio...' : 'Association de lutte contre le gaspillage alimentaire...'}
                      rows={3}
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {businessDescription.length}/300 caractères
                    </p>
                  </div>

                  {/* Numéro de TVA - Optionnel */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Numéro de TVA intracommunautaire <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                        placeholder="FR12345678901"
                        maxLength={13}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Se souvenir de moi + Mot de passe oublié (Connexion) */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-100 cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-black transition-colors">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Fonctionnalité de récupération de mot de passe à venir !')}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Checkbox CGU (Inscription) */}
          {mode === 'signup' && (
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-100 cursor-pointer flex-shrink-0"
                  required
                />
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors leading-relaxed">
                  J'accepte les{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/cgu', '_blank')}
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Conditions Générales d'Utilisation
                  </button>
                  {' '}et la{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/privacy', '_blank')}
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Politique de Confidentialité
                  </button>
                </span>
              </label>
              
              {/* Info RGPD */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-semibold">Données protégées.</span> Nous respectons le RGPD et gardons vos informations confidentielles.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-fade-in-up">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={18} className="text-white" />
                </div>
                <p className="text-sm text-red-800 font-medium flex-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm animate-fade-in-up">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <p className="text-sm text-green-800 font-medium flex-1 leading-relaxed">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-100 mt-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Chargement...</span>
              </div>
            ) : mode === 'signin' ? (
              <span className="flex items-center justify-center gap-2">
                <span>Se connecter</span>
                <span className="text-lg">→</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Créer mon compte</span>
                <span className="text-lg">🚀</span>
              </span>
            )}
          </button>
        </form>

        {/* Lien pour changer de mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              const newMode = mode === 'signin' ? 'signup' : 'signin';
              setMode(newMode);
              setError('');
              setSuccess('');
              if (newMode === 'signin') {
                setConfirmPassword('');
                setAcceptTerms(false);
              } else {
                setRememberMe(false);
              }
            }}
            className="text-sm text-gray-600 hover:text-primary-600 font-semibold transition-colors duration-200"
          >
            {mode === 'signin' ? "Pas encore de compte ? " : 'Déjà un compte ? '}
            <span className="text-primary-600 hover:text-primary-700 underline">{mode === 'signin' ? "S'inscrire" : 'Se connecter'}</span>
          </button>
        </div>

        
        </div>
      </div>
    </div>
  );
};
