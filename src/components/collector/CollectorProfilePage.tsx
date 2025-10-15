import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useProfileStats } from '../../hooks/useProfileStats';
import type { CollectorPreferences } from '../../lib/database.types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Edit2,
  Save,
  Award,
  TrendingUp,
  Package,
  Star,
  Truck,
  Snowflake,
  CheckCircle,
  Clock,
  Navigation,
  Battery,
  Zap
} from 'lucide-react';

// Types de véhicules
const VEHICLE_TYPES = [
  { value: 'bike', label: '🚲 Vélo', icon: '🚲', eco: true },
  { value: 'ebike', label: '🚴 Vélo électrique', icon: '🚴', eco: true },
  { value: 'scooter', label: '🛵 Scooter/Moto', icon: '🛵', eco: false },
  { value: 'car', label: '🚗 Voiture', icon: '🚗', eco: false },
  { value: 'van', label: '🚐 Camionnette', icon: '🚐', eco: false },
] as const;

// Équipements disponibles
const EQUIPMENT_OPTIONS = [
  { value: 'cooler_bag', label: '🧊 Sac isotherme', required: true },
  { value: 'large_cooler', label: '❄️ Glacière (grande capacité)', required: false },
  { value: 'thermal_box', label: '📦 Caisse isotherme', required: false },
  { value: 'delivery_bag', label: '🎒 Sac de livraison professionnel', required: false },
] as const;

// Zones de livraison
const DELIVERY_ZONES = [
  { value: 'center', label: '🏛️ Centre-ville' },
  { value: 'suburbs', label: '🏘️ Banlieue proche' },
  { value: 'outskirts', label: '🌳 Périphérie' },
  { value: 'all', label: '🗺️ Toutes zones' },
] as const;

// Disponibilités
const AVAILABILITY_SLOTS = [
  { value: 'morning', label: '🌅 Matin (6h-12h)' },
  { value: 'afternoon', label: '☀️ Après-midi (12h-18h)' },
  { value: 'evening', label: '🌆 Soir (18h-22h)' },
  { value: 'flexible', label: '🔄 Flexible (toute la journée)' },
] as const;

export const CollectorProfilePage = () => {
  const { profile, user, fetchProfile } = useAuthStore();
  const { stats, loading: statsLoading } = useProfileStats(user?.id, 'collector');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state pour infos de base
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  // State pour préférences collecteur (chargées depuis la DB)
  const [preferences, setPreferences] = useState<CollectorPreferences>({
    vehicle_type: profile?.collector_preferences?.vehicle_type || 'bike',
    equipment: profile?.collector_preferences?.equipment || ['cooler_bag'],
    delivery_zones: profile?.collector_preferences?.delivery_zones || ['center'],
    availability: profile?.collector_preferences?.availability || ['flexible'],
    max_distance: profile?.collector_preferences?.max_distance || 5,
    accepts_cold_chain: profile?.collector_preferences?.accepts_cold_chain ?? true,
    bio: profile?.collector_preferences?.bio || '',
  });

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
    });
    setIsEditing(false);
    setError('');
  };

  // Stats du collecteur
  const collectorStats = [
    { 
      label: 'Missions complétées', 
      value: stats.missionsCompleted || 0, 
      icon: CheckCircle, 
      color: 'success',
      description: 'Total de missions réussies'
    },
    { 
      label: 'Taux de réussite', 
      value: `${stats.reliability || 100}%`, 
      icon: Award, 
      color: 'primary',
      description: 'Fiabilité et ponctualité'
    },
    { 
      label: 'Note moyenne', 
      value: stats.rating || '-', 
      icon: Star, 
      color: 'warning',
      description: 'Satisfaction des commerçants'
    },
    { 
      label: 'Distance parcourue', 
      value: `${stats.totalDistance || 0}km`, 
      icon: Navigation, 
      color: 'secondary',
      description: 'Trajet total effectué'
    },
  ];

  // Badges de performance
  const performanceBadges = [
    { 
      id: 'fast', 
      label: '⚡ Rapide', 
      description: '90% de livraisons en moins de 30 min',
      earned: (stats.missionsCompleted || 0) >= 10 && (stats.reliability || 0) >= 90,
      color: 'warning'
    },
    { 
      id: 'reliable', 
      label: '🎯 Fiable', 
      description: '100% de missions complétées',
      earned: (stats.reliability || 0) === 100 && (stats.missionsCompleted || 0) >= 5,
      color: 'success'
    },
    { 
      id: 'eco', 
      label: '🌱 Éco-responsable', 
      description: 'Vélo ou vélo électrique uniquement',
      earned: preferences.vehicle_type === 'bike' || preferences.vehicle_type === 'ebike',
      color: 'primary'
    },
    { 
      id: 'veteran', 
      label: '🏆 Vétéran', 
      description: '50+ missions complétées',
      earned: (stats.missionsCompleted || 0) >= 50,
      color: 'accent'
    },
  ];

  const toggleEquipment = (equipment: string) => {
    setPreferences((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const toggleDeliveryZone = (zone: string) => {
    setPreferences((prev) => ({
      ...prev,
      delivery_zones: prev.delivery_zones.includes(zone)
        ? prev.delivery_zones.filter((z) => z !== zone)
        : [...prev.delivery_zones, zone],
    }));
  };

  const toggleAvailability = (slot: string) => {
    setPreferences((prev) => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter((s) => s !== slot)
        : [...prev.availability, slot],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Messages */}
      {success && (
        <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-success-800 font-semibold flex-1">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-semibold flex-1">{error}</p>
          </div>
        </div>
      )}

      {/* En-tête avec avatar et stats clés */}
      <div className="bg-gradient-to-br from-success-600 via-success-700 to-success-800 rounded-2xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-success-600 text-3xl font-bold shadow-xl">
            {profile?.full_name?.charAt(0).toUpperCase() || 'C'}
          </div>

          {/* Infos principales */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {profile?.full_name || 'Collecteur'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-semibold">
                🚚 Collecteur
              </span>
              {profile?.verified && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-semibold flex items-center gap-1.5">
                  <Shield size={14} strokeWidth={2} />
                  <span>✓ Vérifié</span>
                </span>
              )}
              {preferences.vehicle_type && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-semibold">
                  {VEHICLE_TYPES.find((v) => v.value === preferences.vehicle_type)?.icon} {VEHICLE_TYPES.find((v) => v.value === preferences.vehicle_type)?.label}
                </span>
              )}
            </div>
            {preferences.bio && (
              <p className="text-white/90 leading-relaxed max-w-2xl">
                {preferences.bio}
              </p>
            )}
          </div>

          {/* Bouton éditer */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
            >
              <Edit2 size={20} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Statistiques de performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collectorStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            success: 'from-success-500 to-success-600',
            primary: 'from-primary-500 to-primary-600',
            warning: 'from-warning-500 to-warning-600',
            secondary: 'from-secondary-500 to-secondary-600',
          };
          return (
            <div key={index} className="group bg-white p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={20} strokeWidth={2} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges de performance */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-md">
            <Award size={20} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Badges de Performance</h2>
            <p className="text-sm text-gray-600">Vos accomplissements et réalisations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceBadges.map((badge) => {
            const colors = {
              success: 'from-success-100 to-success-200 border-success-300',
              primary: 'from-primary-100 to-primary-200 border-primary-300',
              warning: 'from-warning-100 to-warning-200 border-warning-300',
              accent: 'from-accent-100 to-accent-200 border-accent-300',
            };
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  badge.earned
                    ? `bg-gradient-to-br ${colors[badge.color as keyof typeof colors]} shadow-md`
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{badge.label.split(' ')[0]}</div>
                <div className="font-semibold text-gray-900 mb-1">
                  {badge.label.split(' ').slice(1).join(' ')}
                </div>
                <div className="text-xs text-gray-600">
                  {badge.description}
                </div>
                {badge.earned && (
                  <div className="mt-2 inline-flex px-2 py-1 bg-white/50 rounded-lg text-xs font-semibold text-gray-700">
                    ✅ Obtenu
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <User size={20} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
              <p className="text-sm text-gray-600">Vos coordonnées et contact</p>
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all font-semibold"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all flex items-center gap-2 font-semibold shadow-lg"
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

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-success-100 focus:border-success-500 outline-none transition-all"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-success-100 focus:border-success-500 outline-none transition-all"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-success-100 focus:border-success-500 outline-none transition-all"
                  placeholder="12 rue de Paris, 75001 Paris"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
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
        )}
      </div>

      {/* Préférences de livraison */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
              <Truck size={20} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Préférences de livraison</h2>
              <p className="text-sm text-gray-600">Configuration de votre activité</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingPreferences(!isEditingPreferences)}
            className="px-5 py-2 border-2 border-gray-200 rounded-xl hover:bg-secondary-50 hover:border-secondary-300 transition-all flex items-center gap-2 font-semibold"
          >
            <Edit2 size={16} strokeWidth={2} />
            <span>{isEditingPreferences ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Type de véhicule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Type de véhicule</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {VEHICLE_TYPES.map((vehicle) => (
                <button
                  key={vehicle.value}
                  type="button"
                  onClick={() => isEditingPreferences && setPreferences({ ...preferences, vehicle_type: vehicle.value })}
                  disabled={!isEditingPreferences}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    preferences.vehicle_type === vehicle.value
                      ? 'border-success-500 bg-gradient-to-br from-success-50 to-success-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isEditingPreferences && 'cursor-default'}`}
                >
                  <div className="text-2xl mb-2">{vehicle.icon}</div>
                  <div className="text-xs font-semibold text-gray-700">{vehicle.label.split(' ').slice(1).join(' ')}</div>
                  {vehicle.eco && (
                    <div className="mt-1 text-[10px] text-success-600 font-semibold">🌱 Éco</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Équipements disponibles</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <label
                  key={equipment.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                    preferences.equipment.includes(equipment.value)
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isEditingPreferences && 'cursor-default'}`}
                >
                  <input
                    type="checkbox"
                    checked={preferences.equipment.includes(equipment.value)}
                    onChange={() => toggleEquipment(equipment.value)}
                    disabled={!isEditingPreferences}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-200"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{equipment.label}</div>
                    {equipment.required && (
                      <div className="text-xs text-accent-600 font-semibold mt-1">⚠️ Requis pour chaîne du froid</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Zones de livraison */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Zones de livraison préférées</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DELIVERY_ZONES.map((zone) => (
                <label
                  key={zone.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    preferences.delivery_zones.includes(zone.value)
                      ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-secondary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isEditingPreferences && 'cursor-default'}`}
                >
                  <input
                    type="checkbox"
                    checked={preferences.delivery_zones.includes(zone.value)}
                    onChange={() => toggleDeliveryZone(zone.value)}
                    disabled={!isEditingPreferences}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-secondary-600 focus:ring-2 focus:ring-secondary-200"
                  />
                  <div className="font-semibold text-gray-900 text-sm">{zone.label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Disponibilités */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Disponibilités</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AVAILABILITY_SLOTS.map((slot) => (
                <label
                  key={slot.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    preferences.availability.includes(slot.value)
                      ? 'border-warning-500 bg-gradient-to-br from-warning-50 to-warning-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isEditingPreferences && 'cursor-default'}`}
                >
                  <input
                    type="checkbox"
                    checked={preferences.availability.includes(slot.value)}
                    onChange={() => toggleAvailability(slot.value)}
                    disabled={!isEditingPreferences}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-warning-600 focus:ring-2 focus:ring-warning-200"
                  />
                  <div className="font-semibold text-gray-900 text-sm">{slot.label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Distance maximale */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Distance maximale de livraison : {preferences.max_distance} km
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={preferences.max_distance}
              onChange={(e) => setPreferences({ ...preferences, max_distance: parseInt(e.target.value) })}
              disabled={!isEditingPreferences}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-success-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 km</span>
              <span>10 km</span>
              <span>20 km</span>
            </div>
          </div>

          {/* Chaîne du froid */}
          <div className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.accepts_cold_chain}
                onChange={(e) => setPreferences({ ...preferences, accepts_cold_chain: e.target.checked })}
                disabled={!isEditingPreferences}
                className="mt-1 w-6 h-6 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake size={20} className="text-primary-600" />
                  <span className="font-bold text-gray-900">J'accepte les missions avec chaîne du froid</span>
                </div>
                <p className="text-sm text-gray-600">
                  Vous devez disposer d'un équipement isotherme (sac ou glacière) pour maintenir la température.
                </p>
              </div>
            </label>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Bio / Présentation <span className="text-gray-400 font-light">(optionnel)</span>
            </label>
            <textarea
              value={preferences.bio}
              onChange={(e) => setPreferences({ ...preferences, bio: e.target.value })}
              disabled={!isEditingPreferences}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-success-100 focus:border-success-500 outline-none transition-all resize-none"
              placeholder="Parlez de vous, votre expérience, votre motivation..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {preferences.bio.length}/200 caractères
            </p>
          </div>

          {isEditingPreferences && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreferences({
                    vehicle_type: profile?.collector_preferences?.vehicle_type || 'bike',
                    equipment: profile?.collector_preferences?.equipment || ['cooler_bag'],
                    delivery_zones: profile?.collector_preferences?.delivery_zones || ['center'],
                    availability: profile?.collector_preferences?.availability || ['flexible'],
                    max_distance: profile?.collector_preferences?.max_distance || 5,
                    accepts_cold_chain: profile?.collector_preferences?.accepts_cold_chain ?? true,
                    bio: profile?.collector_preferences?.bio || '',
                  });
                  setIsEditingPreferences(false);
                }}
                className="flex-1 py-4 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
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
                        collector_preferences: preferences as Record<string, unknown>,
                      })
                      .eq('id', user.id);

                    if (updateError) throw updateError;

                    await fetchProfile();
                    setSuccess('✅ Préférences enregistrées avec succès !');
                    setIsEditingPreferences(false);
                    
                    setTimeout(() => setSuccess(''), 3000);
                  } catch (err) {
                    const error = err as Error;
                    console.error('Erreur lors de la mise à jour des préférences:', error);
                    setError(error.message || 'Erreur lors de la mise à jour des préférences');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} strokeWidth={2} />
                    <span>Enregistrer les préférences</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

