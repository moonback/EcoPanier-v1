import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { BusinessLogoUploader } from '../merchant/BusinessLogoUploader';
import { useProfileStats } from '../../hooks/useProfileStats';
import type { LucideIcon } from 'lucide-react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Edit2,
  Save,
  Award,
  TrendingUp,
  Heart,
  Package,
  Star,
  Clock,
  FileCheck,
  Briefcase,
  FileText
} from 'lucide-react';

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

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface ProfileStats {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export const ProfilePage = () => {
  const { profile, user, fetchProfile } = useAuthStore();
  const { stats, loading: statsLoading } = useProfileStats(user?.id, profile?.role);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    business_name: profile?.business_name || '',
    business_address: profile?.business_address || '',
    siret: profile?.siret || '',
    business_type: profile?.business_type || '',
    business_email: profile?.business_email || '',
    business_description: profile?.business_description || '',
    vat_number: profile?.vat_number || '',
  });

  // Business hours state
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(
    profile?.business_hours as BusinessHours | null || null
  );

  // Role-specific stats
  const getRoleStats = (): ProfileStats[] => {
    if (statsLoading) {
      return [];
    }

    switch (profile?.role) {
      case 'customer':
        return [
          { label: 'Réservations', value: stats.totalReservations || 0, icon: Package, color: 'primary' },
          { label: 'Économisé', value: `${stats.moneySaved?.toFixed(2) || 0}€`, icon: TrendingUp, color: 'success' },
          { label: 'Paniers offerts', value: stats.donationsMade || 0, icon: Heart, color: 'accent' },
          { label: 'Impact CO₂', value: `${stats.co2Impact?.toFixed(1) || 0}kg`, icon: Award, color: 'secondary' },
        ];
      case 'merchant':
        return [
          { label: 'Lots vendus', value: stats.lotsSold || 0, icon: Package, color: 'primary' },
          { label: 'Revenus', value: `${stats.revenue?.toFixed(2) || 0}€`, icon: TrendingUp, color: 'success' },
          { label: 'Note moyenne', value: stats.averageRating || '-', icon: Star, color: 'warning' },
          { label: 'Gaspillage évité', value: `${stats.wasteAvoided?.toFixed(1) || 0}kg`, icon: Award, color: 'secondary' },
        ];
      case 'beneficiary':
        // Pas de statistiques pour les bénéficiaires
        return [];
      case 'collector':
        return [
          { label: 'Missions', value: stats.missionsCompleted || 0, icon: Package, color: 'primary' },
          { label: 'Distance', value: `${stats.totalDistance || 0}km`, icon: TrendingUp, color: 'secondary' },
          { label: 'Note', value: stats.rating || '-', icon: Star, color: 'warning' },
          { label: 'Fiabilité', value: `${stats.reliability || 100}%`, icon: Award, color: 'success' },
        ];
      case 'admin':
        return [
          { label: 'Utilisateurs', value: stats.totalUsers || 0, icon: User, color: 'primary' },
          { label: 'Transactions', value: stats.totalTransactions || 0, icon: TrendingUp, color: 'success' },
          { label: 'Lots actifs', value: stats.activeLots || 0, icon: Package, color: 'secondary' },
          { label: 'Satisfaction', value: `${stats.satisfaction || 0}%`, icon: Star, color: 'warning' },
        ];
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    const roleLabels: Record<string, string> = {
      customer: '🛒 Client',
      merchant: '🏪 Commerçant',
      beneficiary: '🤝 Bénéficiaire',
      collector: '📦 Collecteur',
      admin: '👑 Administrateur',
    };
    return roleLabels[profile?.role || ''] || profile?.role;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          business_name: formData.business_name || null,
          business_address: formData.business_address || null,
          siret: formData.siret || null,
          business_type: formData.business_type || null,
          business_email: formData.business_email || null,
          business_description: formData.business_description || null,
          vat_number: formData.vat_number || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      setSuccess('Profil mis à jour avec succès ! ✅');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      business_name: profile?.business_name || '',
      business_address: profile?.business_address || '',
      siret: profile?.siret || '',
      business_type: profile?.business_type || '',
      business_email: profile?.business_email || '',
      business_description: profile?.business_description || '',
      vat_number: profile?.vat_number || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleSaveBusinessHours = async () => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({
          business_hours: businessHours as Record<string, { open: string | null; close: string | null; closed: boolean }> | null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      setSuccess('Horaires d\'ouverture enregistrés avec succès ! ✅');
      setIsEditingHours(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors de l\'enregistrement des horaires:', error);
      setError(error.message || 'Erreur lors de l\'enregistrement des horaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBusinessHours = () => {
    setBusinessHours((profile?.business_hours as BusinessHours | null) || null);
    setIsEditingHours(false);
    setError('');
  };

  const handleLogoUpdated = async (logoUrl: string | null) => {
    // Rafraîchir le profil pour afficher le nouveau logo
    await fetchProfile();
    setSuccess(`Logo ${logoUrl ? 'mis à jour' : 'supprimé'} avec succès ! ✅`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const roleStats = getRoleStats();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <span className="text-lg">✓</span>
            </div>
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-red-600">
              <span className="text-lg">⚠</span>
            </div>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header Section - Clean & Professional */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {profile?.full_name || 'Utilisateur'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded">
                  {getRoleLabel()}
                </span>
                {profile?.verified && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1.5 border border-green-200">
                    <Shield size={12} />
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        {/* Key Stats - Clean Grid */}
        {!statsLoading && roleStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.slice(0, 4).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-gray-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Informations personnelles
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">Gérez vos informations</p>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          {isEditing ? (
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  disabled
                />
              </div>

              {/* Phone & Address Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                    placeholder="12 rue de Paris, 75001 Paris"
                  />
                </div>
              </div>

              {/* Merchant-specific fields */}
              {profile?.role === 'merchant' && (
                <div className="space-y-5 pt-4 border-t border-gray-200">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      <Building size={16} />
                      <span>Informations professionnelles</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nom du commerce
                      </label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="Ma Boulangerie"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Adresse du commerce
                      </label>
                      <input
                        type="text"
                        value={formData.business_address}
                        onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="15 avenue de la République"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Numéro SIRET
                      </label>
                      <input
                        type="text"
                        value={formData.siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, siret: value.slice(0, 14) });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                        placeholder="12345678901234 (14 chiffres)"
                        maxLength={14}
                      />
                      {formData.siret && formData.siret.length !== 14 && (
                        <p className="text-xs text-amber-600 mt-1">⚠ Le SIRET doit contenir exactement 14 chiffres</p>
                      )}
                      {formData.siret && formData.siret.length === 14 && (
                        <p className="text-xs text-green-600 mt-1">✓ SIRET valide</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type de commerce
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none bg-white text-sm"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email professionnel <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                      placeholder="contact@moncommerce.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description du commerce <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <textarea
                      value={formData.business_description}
                      onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none text-sm"
                      placeholder="Boulangerie artisanale depuis 1985, spécialisée dans le pain bio..."
                      rows={3}
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {formData.business_description.length}/300 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Numéro de TVA intracommunautaire <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vat_number}
                      onChange={(e) => setFormData({ ...formData, vat_number: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                      placeholder="FR12345678901"
                      maxLength={13}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User size={18} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Nom complet</div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {profile?.full_name || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail size={18} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Email</div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user?.email || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone size={18} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Téléphone</div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {profile?.phone || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin size={18} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Adresse</div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {profile?.address || 'Non renseignée'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant-specific information */}
              {profile?.role === 'merchant' && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Informations professionnelles
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">Détails de votre commerce</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <Building size={16} className="text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 mb-0.5">Nom du commerce</div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {profile?.business_name || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <Briefcase size={16} className="text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 mb-0.5">Type de commerce</div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {profile?.business_type 
                            ? BUSINESS_TYPES.find(t => t.value === profile.business_type)?.label || profile.business_type
                            : 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <MapPin size={16} className="text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 mb-0.5">Adresse du commerce</div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {profile?.business_address || 'Non renseignée'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <FileCheck size={16} className="text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 mb-0.5">SIRET</div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {profile?.siret || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    {profile?.business_email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <Mail size={16} className="text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600 mb-0.5">Email professionnel</div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {profile.business_email}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile?.vat_number && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <FileText size={16} className="text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600 mb-0.5">Numéro de TVA</div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {profile.vat_number}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {profile?.business_description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Description</div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {profile.business_description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Hours & Logo (Merchant only) */}
      {profile?.role === 'merchant' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Logo */}
          {user && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <BusinessLogoUploader
                currentLogoUrl={profile?.business_logo_url}
                userId={user.id}
                onLogoUpdated={handleLogoUpdated}
              />
            </div>
          )}

          {/* Business Hours */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Horaires d'ouverture</h2>
                <p className="text-sm text-gray-600 mt-0.5">Informez vos clients de vos horaires</p>
              </div>
              {!isEditingHours && (
                <button
                  onClick={() => setIsEditingHours(true)}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit2 size={14} />
                  <span>{businessHours ? 'Modifier' : 'Définir'}</span>
                </button>
              )}
            </div>

            {isEditingHours ? (
              <BusinessHoursEditor
                value={businessHours as Record<string, DayHours> | null}
                onChange={(hours) => setBusinessHours(hours as BusinessHours)}
                onSave={handleSaveBusinessHours}
                onCancel={handleCancelBusinessHours}
                saving={loading}
              />
            ) : businessHours ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {Object.entries(businessHours).map(([day, hours]) => {
                  const dayNames: Record<string, string> = {
                    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
                    thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim'
                  };
                  return (
                    <div key={day} className="p-2 bg-gray-50 rounded-lg text-center border border-gray-200">
                      <div className="text-xs font-semibold text-gray-900 mb-0.5">{dayNames[day]}</div>
                      <div className={`text-xs ${hours.closed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 text-sm mb-0.5">Aucun horaire défini</p>
                <p className="text-xs text-gray-500">Ajoutez vos horaires d'ouverture</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings & Danger Zone */}
      <div className="mt-6 space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Préférences
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900 text-sm">Notifications email</div>
                <div className="text-xs text-gray-600">Recevoir les notifications</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900 text-sm">Newsletter</div>
                <div className="text-xs text-gray-600">Recevoir les actualités</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-300 p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-red-600">
              Zone de danger
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">Actions sensibles sur votre compte</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="text-xl">🔑</div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Changer le mot de passe</div>
                  <div className="text-xs text-gray-600">Modifier votre mot de passe</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                Modifier
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-300">
              <div className="flex items-center gap-3">
                <div className="text-xl">⚠</div>
                <div>
                  <div className="font-medium text-red-600 text-sm">Supprimer le compte</div>
                  <div className="text-xs text-gray-600">Action irréversible</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

