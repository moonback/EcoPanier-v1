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
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Camera,
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-light">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-light">
          ⚠️ {error}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-black rounded-2xl flex items-center justify-center text-white text-5xl font-bold transition">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
              <Camera size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  {profile?.full_name || 'Utilisateur'}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-black text-white text-sm rounded-lg font-medium">
                    {getRoleLabel()}
                  </span>
                  {profile?.verified && (
                    <span className="px-3 py-1 bg-gray-100 text-black text-sm rounded-lg font-medium flex items-center gap-1">
                      <Shield size={14} strokeWidth={1.5} />
                      <span>Vérifié</span>
                    </span>
                  )}
                  <span className="text-sm text-gray-600 font-light flex items-center gap-1">
                    <Calendar size={14} strokeWidth={1.5} />
                    Membre depuis {new Date(profile?.created_at || '').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
                >
                  <Edit2 size={20} strokeWidth={1.5} />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
              <div className="h-8 bg-gray-200 rounded mb-2 w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))
        ) : (
          roleStats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold text-black mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-light">
                  {stat.label}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">
            Informations personnelles
          </h2>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
                disabled={loading}
              >
                <X size={20} strokeWidth={1.5} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} strokeWidth={1.5} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-light">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="12 rue de Paris, 75001 Paris"
                />
              </div>
            </div>

            {/* Merchant-specific fields */}
            {profile?.role === 'merchant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nom du commerce
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Ma Boulangerie"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Adresse du commerce
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                    <input
                      type="text"
                      value={formData.business_address}
                      onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="15 avenue de la République"
                    />
                  </div>
                </div>
              </>
            )}
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Display Mode */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Nom complet
                  </div>
                  <div className="text-base font-medium text-black">
                    {profile?.full_name || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Email
                  </div>
                  <div className="text-base font-medium text-black">
                    {user?.email || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Téléphone
                  </div>
                  <div className="text-base font-medium text-black">
                    {profile?.phone || 'Non renseigné'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Adresse
                  </div>
                  <div className="text-base font-medium text-black">
                    {profile?.address || 'Non renseignée'}
                  </div>
                </div>
              </div>

              {profile?.role === 'merchant' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Nom du commerce
                      </div>
                      <div className="text-base font-medium text-black">
                        {profile?.business_name || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Adresse du commerce
                      </div>
                      <div className="text-base font-medium text-black">
                        {profile?.business_address || 'Non renseignée'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Business Hours (Merchant only) */}
      {profile?.role === 'merchant' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Horaires d'ouverture</h2>
                <p className="text-sm text-gray-600 font-light">Informez vos clients de vos horaires</p>
              </div>
            </div>
            {!isEditingHours && (
              <button
                onClick={() => setIsEditingHours(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
              >
                <Edit2 size={18} strokeWidth={1.5} />
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
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
              {Object.entries(businessHours).map(([day, hours]) => {
                const dayNames: Record<string, string> = {
                  monday: 'Lun',
                  tuesday: 'Mar',
                  wednesday: 'Mer',
                  thursday: 'Jeu',
                  friday: 'Ven',
                  saturday: 'Sam',
                  sunday: 'Dim'
                };
                return (
                  <div key={day} className="p-3 bg-gray-50 rounded-lg text-center border border-gray-200">
                    <div className="text-xs font-bold text-black mb-1">{dayNames[day]}</div>
                    <div className={`text-xs font-light ${hours.closed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1} />
              <p className="text-gray-700 font-medium">Aucun horaire défini</p>
              <p className="text-sm text-gray-500 font-light mt-1">Cliquez sur "Définir les horaires" pour ajouter vos horaires d'ouverture</p>
            </div>
          )}
        </div>
      )}

      {/* Business Logo (Merchant only) */}
      {profile?.role === 'merchant' && user && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <BusinessLogoUploader
            currentLogoUrl={profile?.business_logo_url}
            userId={user.id}
            onLogoUpdated={handleLogoUpdated}
          />
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Paramètres du compte
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-black mb-1">Notifications email</div>
              <div className="text-sm text-gray-600 font-light">Recevoir les notifications par email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-black mb-1">Profil public</div>
              <div className="text-sm text-gray-600 font-light">Rendre mon profil visible aux autres utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-black mb-1">Newsletter</div>
              <div className="text-sm text-gray-600 font-light">Recevoir les actualités et offres spéciales</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
          <Shield size={24} strokeWidth={1.5} />
          Zone de danger
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-black mb-1">Changer le mot de passe</div>
              <div className="text-sm text-gray-600 font-light">Modifier votre mot de passe de connexion</div>
            </div>
            <button className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition font-medium">
              Modifier
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-red-600 mb-1">Supprimer le compte</div>
              <div className="text-sm text-gray-600 font-light">Action irréversible - toutes vos données seront supprimées</div>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

