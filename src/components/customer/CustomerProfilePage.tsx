// Imports externes
import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  TrendingUp,
  Package,
  Shield,
  X,
  Leaf,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { useProfileStats } from '../../hooks/useProfileStats';

// Types

/**
 * Profil client amélioré avec statistiques détaillées
 */
export const CustomerProfilePage = () => {
  // Hooks (stores, contexts, router)
  const { profile, user, fetchProfile } = useAuthStore();
  const { stats, loading: statsLoading } = useProfileStats(user?.id, profile?.role);

  // État local
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });


  // Mettre à jour le formulaire quand le profil change
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // Statistiques enrichies
  const enrichedStats = [
    {
      label: 'Réservations',
      value: stats.totalReservations || 0,
      icon: Package,
      color: 'primary',
      description: 'Paniers réservés',
    },
    {
      label: 'Économies',
      value: `${(stats.moneySaved || 0).toFixed(2)}€`,
      icon: TrendingUp,
      color: 'success',
      description: 'Total économisé',
    },
    {
      label: 'Impact CO₂',
      value: `${(stats.co2Impact || 0).toFixed(1)}kg`,
      icon: Leaf,
      color: 'secondary',
      description: 'CO₂ évité',
    },
  ];

  // Handlers
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

  // Early returns
  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  // Render principal
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Messages de succès/erreur */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="text-green-600">✓</div>
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="text-red-600">⚠</div>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* En-tête du profil */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.full_name || 'Utilisateur'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full border border-primary-200">
                  🛒 Client
                </span>
                {profile.verified && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1.5 border border-green-200">
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
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
            >
              <Edit2 size={16} />
              Modifier
            </button>
          )}
        </div>

        {/* Statistiques principales */}
        {!statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {enrichedStats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                primary: 'bg-primary-50 text-primary-600 border-primary-200',
                success: 'bg-success-50 text-success-600 border-success-200',
                accent: 'bg-accent-50 text-accent-600 border-accent-200',
                secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
              };

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${colorClasses[stat.color as keyof typeof colorClasses]} transition-transform hover:scale-105`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50">
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-xs font-medium opacity-80">{stat.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{stat.description}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Informations personnelles</h2>
            <p className="text-sm text-gray-600">Gérez vos informations de contact</p>
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 rounded-lg transition-colors text-sm font-medium"
                disabled={loading}
              >
                <X size={16} className="inline mr-1" />
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-md"
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

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email || ''}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                disabled
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                  placeholder="12 rue de Paris, 75001 Paris"
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 mb-0.5">Nom complet</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {profile.full_name || 'Non renseigné'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mail size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 mb-0.5">Email</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user.email || 'Non renseigné'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Phone size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 mb-0.5">Téléphone</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {profile.phone || 'Non renseigné'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 mb-0.5">Adresse</div>
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {profile.address || 'Non renseignée'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paramètres et zone de danger */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Préférences */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Préférences</h2>
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

        {/* Zone de danger */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-red-600">Zone de danger</h2>
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
              <button className="px-4 py-2 bg-white border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
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
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-md">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

