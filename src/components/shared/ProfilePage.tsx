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
  Clock
} from 'lucide-react';

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
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Header Section - Minimalist */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile?.full_name || 'Utilisateur'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full font-medium">
                {getRoleLabel()}
              </span>
              {profile?.verified && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium flex items-center gap-1">
                  <Shield size={12} />
                  Vérifié
                </span>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Key Stats - Essential only */}
        {!statsLoading && roleStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.slice(0, 4).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 font-light">
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Informations personnelles
            </h2>
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="12 rue de Paris, 75001 Paris"
                  />
                </div>
              </div>

              {/* Merchant-specific fields */}
              {profile?.role === 'merchant' && (
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du commerce
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="15 avenue de la République"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <User size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Nom complet</div>
                      <div className="text-base font-semibold text-gray-900">
                        {profile?.full_name || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Mail size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="text-base font-semibold text-gray-900">
                        {user?.email || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Phone size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Téléphone</div>
                      <div className="text-base font-semibold text-gray-900">
                        {profile?.phone || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Adresse</div>
                      <div className="text-base font-semibold text-gray-900">
                        {profile?.address || 'Non renseignée'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant-specific information */}
              {profile?.role === 'merchant' && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations du commerce
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Nom du commerce</div>
                        <div className="text-base font-semibold text-gray-900">
                          {profile?.business_name || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Adresse du commerce</div>
                        <div className="text-base font-semibold text-gray-900">
                          {profile?.business_address || 'Non renseignée'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Hours & Logo (Merchant only) */}
      {profile?.role === 'merchant' && (
        <>
          {/* Business Hours */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Horaires d'ouverture</h2>
                  <p className="text-sm text-gray-600">Gérez vos horaires d'ouverture</p>
                </div>
              </div>
              {!isEditingHours && (
                <button
                  onClick={() => setIsEditingHours(true)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  <span>{businessHours ? 'Modifier' : 'Définir'} les horaires</span>
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

          {/* Business Logo */}
          {user && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8">
              <BusinessLogoUploader
                currentLogoUrl={profile?.business_logo_url}
                userId={user.id}
                onLogoUpdated={handleLogoUpdated}
              />
            </div>
          )}
        </>
      )}

      {/* Settings & Danger Zone */}
      <div className="mt-8 space-y-8">
        {/* Account Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Préférences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">Notifications email</div>
                <div className="text-sm text-gray-600">Recevoir les notifications</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">Newsletter</div>
                <div className="text-sm text-gray-600">Recevoir les actualités</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
          <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
            <Shield size={20} />
            Zone de danger
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <div className="font-medium text-gray-900">Changer le mot de passe</div>
                <div className="text-sm text-gray-600">Modifier votre mot de passe</div>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Modifier
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <div className="font-medium text-red-600">Supprimer le compte</div>
                <div className="text-sm text-gray-600">Action irréversible</div>
              </div>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

