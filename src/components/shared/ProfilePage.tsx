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
    <div className="max-w-12xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <p className="text-green-800 font-semibold flex-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-red-700 font-semibold flex-1">{error}</p>
          </div>
        </div>
      )}

      {/* Header Section - Minimalist */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile?.full_name || 'Utilisateur'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm rounded-full font-semibold shadow-md">
                {getRoleLabel()}
              </span>
              {profile?.verified && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-sm rounded-full font-semibold flex items-center gap-1.5 border-2 border-green-200 shadow-sm">
                  <Shield size={14} strokeWidth={2} />
                  <span>✓ Vérifié</span>
                </span>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 bg-gradient-to-r from-white to-primary-50 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all group"
            >
              <Edit2 size={20} strokeWidth={2} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>
          )}
        </div>

        {/* Key Stats - Essential only */}
        {!statsLoading && roleStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.slice(0, 4).map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                primary: 'from-primary-500 to-primary-600',
                success: 'from-success-500 to-success-600',
                accent: 'from-accent-500 to-accent-600',
                secondary: 'from-secondary-500 to-secondary-600',
                warning: 'from-warning-500 to-warning-600',
              };
                return (
                <div key={index} className="group bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon size={18} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-gray-100 bg-gradient-to-r from-white to-primary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <User size={20} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Informations personnelles
                </h2>
                <p className="text-xs text-gray-600">Gérez vos informations</p>
              </div>
            </div>
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200 rounded-xl transition-all font-semibold"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} strokeWidth={2} />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">

          {isEditing ? (
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                />
              </div>

              {/* Phone & Address Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                    placeholder="12 rue de Paris, 75001 Paris"
                  />
                </div>
              </div>

              {/* Merchant-specific fields */}
              {profile?.role === 'merchant' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
                    <p className="text-sm text-primary-800 font-bold flex items-center gap-2">
                      <span>🏪</span>
                      <span>Informations professionnelles du commerce</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du commerce
                      </label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ma Boulangerie"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse du commerce
                      </label>
                      <input
                        type="text"
                        value={formData.business_address}
                        onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        placeholder="15 avenue de la République"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro SIRET
                      </label>
                      <input
                        type="text"
                        value={formData.siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, siret: value.slice(0, 14) });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        placeholder="12345678901234 (14 chiffres)"
                        maxLength={14}
                      />
                      {formData.siret && formData.siret.length !== 14 && (
                        <p className="text-xs text-amber-600 mt-1">⚠️ Le SIRET doit contenir exactement 14 chiffres</p>
                      )}
                      {formData.siret && formData.siret.length === 14 && (
                        <p className="text-xs text-success-600 mt-1">✓ SIRET valide</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de commerce
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all appearance-none bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email professionnel <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                      placeholder="contact@moncommerce.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du commerce <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <textarea
                      value={formData.business_description}
                      onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all resize-none"
                      placeholder="Boulangerie artisanale depuis 1985, spécialisée dans le pain bio..."
                      rows={3}
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {formData.business_description.length}/300 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de TVA intracommunautaire <span className="text-gray-400 font-light">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vat_number}
                      onChange={(e) => setFormData({ ...formData, vat_number: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                      <User size={20} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Nom complet</div>
                      <div className="text-base font-bold text-gray-900 truncate">
                        {profile?.full_name || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-secondary-50 to-white rounded-xl border-2 border-secondary-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                      <Mail size={20} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Email</div>
                      <div className="text-base font-bold text-gray-900 truncate">
                        {user?.email || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-md">
                      <Phone size={20} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Téléphone</div>
                      <div className="text-base font-bold text-gray-900 truncate">
                        {profile?.phone || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-md">
                      <MapPin size={20} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Adresse</div>
                      <div className="text-base font-bold text-gray-900 truncate">
                        {profile?.address || 'Non renseignée'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant-specific information */}
              {profile?.role === 'merchant' && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                      <Building size={20} strokeWidth={2} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Informations professionnelles
                      </h3>
                      <p className="text-sm text-gray-600">Détails de votre commerce</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-secondary-50 to-white rounded-xl border-2 border-secondary-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-md">
                        <Building size={18} strokeWidth={2} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Nom du commerce</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {profile?.business_name || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                        <Briefcase size={18} strokeWidth={2} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Type de commerce</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {profile?.business_type 
                            ? BUSINESS_TYPES.find(t => t.value === profile.business_type)?.label || profile.business_type
                            : 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center shadow-md">
                        <MapPin size={18} strokeWidth={2} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Adresse du commerce</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {profile?.business_address || 'Non renseignée'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileCheck size={18} strokeWidth={2} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 mb-1">SIRET</div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {profile?.siret || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    {profile?.business_email && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-accent-50 to-white rounded-xl border-2 border-accent-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-md">
                          <Mail size={18} strokeWidth={2} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Email professionnel</div>
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {profile.business_email}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile?.vat_number && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <FileText size={18} strokeWidth={2} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Numéro de TVA</div>
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {profile.vat_number}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {profile?.business_description && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 mb-2">Description</div>
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
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Logo */}
          {user && (
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg">
              <BusinessLogoUploader
                currentLogoUrl={profile?.business_logo_url}
                userId={user.id}
                onLogoUpdated={handleLogoUpdated}
              />
            </div>
          )}

          {/* Business Hours */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                  <Clock size={20} strokeWidth={2} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Horaires d'ouverture</h2>
                  <p className="text-sm text-gray-600">Informez vos clients de vos horaires</p>
                </div>
              </div>
              {!isEditingHours && (
                <button
                  onClick={() => setIsEditingHours(true)}
                  className="px-5 py-2 bg-gradient-to-r from-white to-primary-50 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all flex items-center gap-2 font-semibold group"
                >
                  <Edit2 size={16} strokeWidth={2} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                  <span className="text-gray-700 group-hover:text-primary-600 transition-colors">{businessHours ? 'Modifier' : 'Définir'}</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(businessHours).map(([day, hours]) => {
                  const dayNames: Record<string, string> = {
                    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
                    thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim'
                  };
                  return (
                    <div key={day} className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs font-bold text-gray-900 mb-1">{dayNames[day]}</div>
                      <div className={`text-xs ${hours.closed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Aucun horaire défini</p>
                <p className="text-sm text-gray-500">Ajoutez vos horaires d'ouverture</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings & Danger Zone */}
      <div className="mt-8 space-y-8">
        {/* Account Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Préférences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Notifications email</div>
                <div className="text-sm text-gray-600">Recevoir les notifications</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Newsletter</div>
                <div className="text-sm text-gray-600">Recevoir les actualités</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-xl">
              <Shield size={20} strokeWidth={2} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-600">
                Zone de danger
              </h2>
              <p className="text-sm text-gray-600">Actions sensibles sur votre compte</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <div className="font-semibold text-gray-900">Changer le mot de passe</div>
                  <div className="text-sm text-gray-600">Modifier votre mot de passe</div>
                </div>
              </div>
              <button className="px-5 py-2 bg-gradient-to-r from-warning-50 to-orange-50 border-2 border-warning-300 text-warning-700 rounded-xl hover:bg-warning-100 hover:border-warning-400 transition-all font-semibold">
                Modifier
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-red-600">Supprimer le compte</div>
                  <div className="text-sm text-gray-600">Action irréversible</div>
                </div>
              </div>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg hover:shadow-xl">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

