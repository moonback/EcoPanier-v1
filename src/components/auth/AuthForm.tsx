import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../lib/database.types';
import { Mail, Lock, User, Phone, MapPin, Building, ShoppingCart, Store, Heart, Truck, FileText, FileCheck, Briefcase } from 'lucide-react';

// Types de commerces disponibles
const BUSINESS_TYPES = [
  { value: 'bakery', label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'restaurant', label: '🍽️ Restaurant / Bistrot' },
  { value: 'supermarket', label: '🛒 Supermarché / Épicerie' },
  { value: 'butcher', label: '🥩 Boucherie / Charcuterie' },
  { value: 'fruits_vegetables', label: '🥬 Fruits & Légumes / Primeur' },
  { value: 'grocery', label: '🏪 Épicerie fine / Traiteur' },
  { value: 'cafe', label: '☕ Café / Salon de thé' },
  { value: 'fastfood', label: '🍔 Fast-food / Snack' },
  { value: 'fishmonger', label: '🐟 Poissonnerie' },
  { value: 'cheese_dairy', label: '🧀 Fromagerie / Crèmerie' },
  { value: 'other', label: '🏬 Autre commerce alimentaire' },
] as const;

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
  const [siret, setSiret] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [vatNumber, setVatNumber] = useState('');
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
        });
        setSuccess('🎉 Félicitations ! Votre compte a été créé avec succès. Vérifiez votre email pour activer votre compte et commencer à sauver des paniers !');
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
          <h2 className="text-2xl font-bold text-black mb-2">
            {mode === 'signin' ? 'Bon retour parmi nous ! 👋' : 'Rejoignez l\'aventure ! 🌍'}
          </h2>
          <p className="text-sm text-gray-600 font-light">
            {mode === 'signin' 
              ? 'Connectez-vous pour continuer à sauver des paniers' 
              : 'Créez votre compte en 2 minutes et faites la différence'}
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
                Quel est votre profil ? 🎯
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Client */}
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`group p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    role === 'customer'
                      ? 'border-primary-600 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-black hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-2 ${role === 'customer' ? 'bg-white/20' : 'bg-primary-50'}`}>
                    <ShoppingCart size={20} strokeWidth={2} className={role === 'customer' ? 'text-white' : 'text-primary-600'} />
                  </div>
                  <div className="font-semibold text-sm">🛒 Client</div>
                  <div className={`text-xs mt-1 ${role === 'customer' ? 'text-white/80' : 'text-gray-500'}`}>
                    Économiser -70%
                  </div>
                  {role === 'customer' && <span className="absolute top-2 right-2 text-xs">✓</span>}
                </button>

                {/* Commerçant */}
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={`group p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    role === 'merchant'
                      ? 'border-secondary-600 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-black hover:border-secondary-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-2 ${role === 'merchant' ? 'bg-white/20' : 'bg-secondary-50'}`}>
                    <Store size={20} strokeWidth={2} className={role === 'merchant' ? 'text-white' : 'text-secondary-600'} />
                  </div>
                  <div className="font-semibold text-sm">🏪 Commerçant</div>
                  <div className={`text-xs mt-1 ${role === 'merchant' ? 'text-white/80' : 'text-gray-500'}`}>
                    Valoriser invendus
                  </div>
                  {role === 'merchant' && <span className="absolute top-2 right-2 text-xs">✓</span>}
                </button>

                {/* Bénéficiaire */}
                <button
                  type="button"
                  onClick={() => setRole('beneficiary')}
                  className={`group p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    role === 'beneficiary'
                      ? 'border-accent-600 bg-gradient-to-br from-accent-600 to-accent-700 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-black hover:border-accent-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-2 ${role === 'beneficiary' ? 'bg-white/20' : 'bg-accent-50'}`}>
                    <Heart size={20} strokeWidth={2} className={role === 'beneficiary' ? 'text-white' : 'text-accent-600'} />
                  </div>
                  <div className="font-semibold text-sm">🤝 Bénéficiaire</div>
                  <div className={`text-xs mt-1 ${role === 'beneficiary' ? 'text-white/80' : 'text-gray-500'}`}>
                    Aide gratuite
                  </div>
                  {role === 'beneficiary' && <span className="absolute top-2 right-2 text-xs">✓</span>}
                </button>

                {/* Collecteur */}
                <button
                  type="button"
                  onClick={() => setRole('collector')}
                  className={`group p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    role === 'collector'
                      ? 'border-success-600 bg-gradient-to-br from-success-600 to-success-700 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-black hover:border-success-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-2 ${role === 'collector' ? 'bg-white/20' : 'bg-success-50'}`}>
                    <Truck size={20} strokeWidth={2} className={role === 'collector' ? 'text-white' : 'text-success-600'} />
                  </div>
                  <div className="font-semibold text-sm">🚴 Collecteur</div>
                  <div className={`text-xs mt-1 ${role === 'collector' ? 'text-white/80' : 'text-gray-500'}`}>
                    Revenus flexibles
                  </div>
                  {role === 'collector' && <span className="absolute top-2 right-2 text-xs">✓</span>}
                </button>

                {/* Association */}
                <button
                  type="button"
                  onClick={() => setRole('association')}
                  className={`group p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    role === 'association'
                      ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-black hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-2 ${role === 'association' ? 'bg-white/20' : 'bg-purple-50'}`}>
                    <FileText size={20} strokeWidth={2} className={role === 'association' ? 'text-white' : 'text-purple-600'} />
                  </div>
                  <div className="font-semibold text-sm">🏛️ Association</div>
                  <div className={`text-xs mt-1 ${role === 'association' ? 'text-white/80' : 'text-gray-500'}`}>
                    Enregistrer bénéficiaires
                  </div>
                  {role === 'association' && <span className="absolute top-2 right-2 text-xs">✓</span>}
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                placeholder="votre@email.com"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light"
                placeholder="••••••••"
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
                      <span>Informations de {role === 'merchant' ? 'votre commerce' : 'votre association'}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {role === 'merchant' 
                        ? 'Pour créer vos premiers lots d\'invendus' 
                        : 'Pour enregistrer vos bénéficiaires'}
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
                        <span className="text-amber-600">⚠️ Le SIRET doit contenir exactement 14 chiffres</span>
                      )}
                      {siret.length === 14 && (
                        <span className="text-success-600">✓ SIRET valide</span>
                      )}
                    </p>
                  </div>

                  {/* Type de commerce - Uniquement pour merchants */}
                  {role === 'merchant' && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Type de commerce
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-black focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none font-light appearance-none"
                          required
                        >
                          <option value="">Sélectionnez un type</option>
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

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

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm text-red-800 font-light flex-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-success-800 font-light flex-1">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-100 mt-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Chargement...</span>
              </div>
            ) : mode === 'signin' ? (
              <span className="flex items-center justify-center gap-2">
                <span>Se connecter</span>
                <span>→</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Créer mon compte gratuitement</span>
                <span>🚀</span>
              </span>
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

        {/* Info sécurité et avantages */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs text-center text-primary-700 font-medium flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>Données 100% sécurisées et cryptées</span>
            </p>
          </div>
          {mode === 'signup' && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-primary-600">Gratuit</div>
                <div className="text-[10px] text-gray-500">0€ / mois</div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-success-600">2 min</div>
                <div className="text-[10px] text-gray-500">Inscription</div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-secondary-600">10k+</div>
                <div className="text-[10px] text-gray-500">Utilisateurs</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
