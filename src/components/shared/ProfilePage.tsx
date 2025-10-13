import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { BusinessLogoUploader } from '../merchant/BusinessLogoUploader';
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

interface ProfileStats {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

export const ProfilePage = () => {
  const { profile, user, fetchProfile } = useAuthStore();
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
  const [businessHours, setBusinessHours] = useState(profile?.business_hours || null);

  // Role-specific stats
  const getRoleStats = (): ProfileStats[] => {
    switch (profile?.role) {
      case 'customer':
        return [
          { label: 'Réservations', value: '24', icon: Package, color: 'primary' },
          { label: 'Économisé', value: '156€', icon: TrendingUp, color: 'success' },
          { label: 'Paniers offerts', value: '8', icon: Heart, color: 'accent' },
          { label: 'Impact CO₂', value: '45kg', icon: Award, color: 'secondary' },
        ];
      case 'merchant':
        return [
          { label: 'Lots vendus', value: '142', icon: Package, color: 'primary' },
          { label: 'Revenus', value: '2,340€', icon: TrendingUp, color: 'success' },
          { label: 'Note moyenne', value: '4.8', icon: Star, color: 'warning' },
          { label: 'Gaspillage évité', value: '89kg', icon: Award, color: 'secondary' },
        ];
      case 'beneficiary':
        return [
          { label: 'Paniers reçus', value: '18', icon: Package, color: 'primary' },
          { label: 'Valeur totale', value: '234€', icon: Heart, color: 'accent' },
          { label: 'Depuis', value: '3 mois', icon: Calendar, color: 'secondary' },
          { label: 'Impact social', value: 'Fort', icon: Award, color: 'success' },
        ];
      case 'collector':
        return [
          { label: 'Missions', value: '67', icon: Package, color: 'primary' },
          { label: 'Distance', value: '340km', icon: TrendingUp, color: 'secondary' },
          { label: 'Note', value: '4.9', icon: Star, color: 'warning' },
          { label: 'Fiabilité', value: '98%', icon: Award, color: 'success' },
        ];
      case 'admin':
        return [
          { label: 'Utilisateurs', value: '1,234', icon: User, color: 'primary' },
          { label: 'Transactions', value: '5,678', icon: TrendingUp, color: 'success' },
          { label: 'Lots actifs', value: '89', icon: Package, color: 'secondary' },
          { label: 'Satisfaction', value: '96%', icon: Star, color: 'warning' },
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          business_name: formData.business_name || null,
          business_address: formData.business_address || null,
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await fetchProfile();
      setSuccess('Profil mis à jour avec succès ! ✅');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          business_hours: businessHours
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await fetchProfile();
      setSuccess('Horaires d\'ouverture enregistrés avec succès ! ✅');
      setIsEditingHours(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement des horaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBusinessHours = () => {
    setBusinessHours(profile?.business_hours || null);
    setIsEditingHours(false);
    setError('');
  };

  const handleLogoUpdated = async (logoUrl: string | null) => {
    // Rafraîchir le profil pour afficher le nouveau logo
    await fetchProfile();
    setSuccess(`Logo ${logoUrl ? 'mis à jour' : 'supprimé'} avec succès ! ✅`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const stats = getRoleStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 font-semibold animate-fade-in">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-accent-50 border-2 border-accent-200 rounded-xl text-accent-700 font-semibold animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card-gradient p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-5xl font-black shadow-soft-xl group-hover:scale-105 transition-transform">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft-lg hover-lift border-2 border-primary-100">
              <Camera size={20} className="text-primary-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">
                  {profile?.full_name || 'Utilisateur'}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="badge-primary">
                    {getRoleLabel()}
                  </span>
                  {profile?.verified && (
                    <span className="badge-success">
                      <Shield size={14} />
                      <span>Vérifié</span>
                    </span>
                  )}
                  <span className="text-sm text-neutral-600 font-medium flex items-center gap-1">
                    <Calendar size={14} />
                    Membre depuis {new Date(profile?.created_at || '').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline rounded-xl"
                >
                  <Edit2 size={20} />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorMap: Record<string, { bg: string; text: string; border: string }> = {
            primary: { bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' },
            success: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-200' },
            accent: { bg: 'bg-accent-50', text: 'text-accent-600', border: 'border-accent-200' },
            secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600', border: 'border-secondary-200' },
            warning: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-200' },
          };
          const colors = colorMap[stat.color];
          
          return (
            <div
              key={index}
              className={`card p-6 hover-lift ${colors.border} border-2`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 ${colors.bg} rounded-large flex items-center justify-center mb-4`}>
                <Icon size={24} className={colors.text} />
              </div>
              <div className="text-3xl font-black text-neutral-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-600 font-semibold">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Information */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Informations personnelles
          </h2>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="btn-secondary rounded-xl"
                disabled={loading}
              >
                <X size={20} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSubmit}
                className="btn-success rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-icon"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-icon bg-neutral-50"
                  disabled
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-icon"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-icon"
                  placeholder="12 rue de Paris, 75001 Paris"
                />
              </div>
            </div>

            {/* Merchant-specific fields */}
            {profile?.role === 'merchant' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Nom du commerce
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="input-icon"
                      placeholder="Ma Boulangerie"
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
                      value={formData.business_address}
                      onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                      className="input-icon"
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
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Nom complet
                  </div>
                  <div className="text-base font-semibold text-neutral-900">
                    {profile?.full_name || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Email
                  </div>
                  <div className="text-base font-semibold text-neutral-900">
                    {user?.email || 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Téléphone
                  </div>
                  <div className="text-base font-semibold text-neutral-900">
                    {profile?.phone || 'Non renseigné'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Adresse
                  </div>
                  <div className="text-base font-semibold text-neutral-900">
                    {profile?.address || 'Non renseignée'}
                  </div>
                </div>
              </div>

              {profile?.role === 'merchant' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Nom du commerce
                      </div>
                      <div className="text-base font-semibold text-neutral-900">
                        {profile?.business_name || 'Non renseigné'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Adresse du commerce
                      </div>
                      <div className="text-base font-semibold text-neutral-900">
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
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Horaires d'ouverture</h2>
                <p className="text-sm text-neutral-600">Informez vos clients de vos horaires</p>
              </div>
            </div>
            {!isEditingHours && (
              <button
                onClick={() => setIsEditingHours(true)}
                className="btn-secondary rounded-lg flex items-center gap-2"
              >
                <Edit2 size={18} />
                <span>{businessHours ? 'Modifier' : 'Définir'} les horaires</span>
              </button>
            )}
          </div>

          {isEditingHours ? (
            <BusinessHoursEditor
              value={businessHours}
              onChange={setBusinessHours}
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
                  <div key={day} className="p-3 bg-neutral-50 rounded-lg text-center border border-neutral-200">
                    <div className="text-xs font-bold text-neutral-700 mb-1">{dayNames[day]}</div>
                    <div className={`text-xs ${hours.closed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
              <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium">Aucun horaire défini</p>
              <p className="text-sm text-neutral-500 mt-1">Cliquez sur "Définir les horaires" pour ajouter vos horaires d'ouverture</p>
            </div>
          )}
        </div>
      )}

      {/* Business Logo (Merchant only) */}
      {profile?.role === 'merchant' && user && (
        <div className="card p-6">
          <BusinessLogoUploader
            currentLogoUrl={profile?.business_logo_url}
            userId={user.id}
            onLogoUpdated={handleLogoUpdated}
          />
        </div>
      )}

      {/* Account Settings */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">
          Paramètres du compte
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Notifications email</div>
              <div className="text-sm text-neutral-600 font-medium">Recevoir les notifications par email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Profil public</div>
              <div className="text-sm text-neutral-600 font-medium">Rendre mon profil visible aux autres utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Newsletter</div>
              <div className="text-sm text-neutral-600 font-medium">Recevoir les actualités et offres spéciales</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-8 border-2 border-accent-200">
        <h2 className="text-2xl font-bold text-accent-600 mb-6 tracking-tight flex items-center gap-2">
          <Shield size={24} />
          Zone de danger
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl border border-accent-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Changer le mot de passe</div>
              <div className="text-sm text-neutral-600 font-medium">Modifier votre mot de passe de connexion</div>
            </div>
            <button className="btn-outline rounded-xl border-accent-500 text-accent-600 hover:bg-accent-500">
              Modifier
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl border border-accent-200">
            <div>
              <div className="font-semibold text-accent-600 mb-1">Supprimer le compte</div>
              <div className="text-sm text-neutral-600 font-medium">Action irréversible - toutes vos données seront supprimées</div>
            </div>
            <button className="px-6 py-3 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-all">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

