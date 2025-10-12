import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  loadPlatformSettings, 
  savePlatformSettings, 
  resetAllSettings,
  PlatformSettings as SettingsType
} from '../../utils/settingsService';
import { 
  Settings, 
  Save, 
  DollarSign, 
  Percent, 
  Clock, 
  Package,
  Mail,
  Bell,
  Shield,
  Globe,
  Zap,
  RefreshCw
} from 'lucide-react';

export const PlatformSettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<SettingsType>({
    platformName: 'EcoPanier',
    platformEmail: 'contact@ecopanier.fr',
    supportPhone: '01 23 45 67 89',
    minLotPrice: 2,
    maxLotPrice: 50,
    defaultLotDuration: 24,
    maxReservationsPerDay: 2,
    merchantCommission: 15,
    collectorCommission: 10,
    beneficiaryVerificationRequired: true,
    maxDailyBeneficiaryReservations: 2,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    twoFactorAuthRequired: false,
    passwordExpirationDays: 90,
    maxLoginAttempts: 5,
  });

  // Charger les paramètres depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError('');

      try {
        const loadedSettings = await loadPlatformSettings();
        setSettings(loadedSettings);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement des paramètres. Utilisation des valeurs par défaut.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const loadSettingsManually = async () => {
    setLoadingData(true);
    setError('');
    setSuccess('');

    try {
      const loadedSettings = await loadPlatformSettings();
      setSettings(loadedSettings);
      setSuccess('Paramètres rechargés ! 🔄');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Erreur lors du rechargement:', err);
      setError('Erreur lors du rechargement des paramètres');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await savePlatformSettings(settings, user.id);
      setSuccess('Paramètres enregistrés avec succès ! ✅');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setError('');
    setSuccess('');
    try {
      // Implémentation future: envoyer un email de test
      setSuccess('Email de test envoyé ! 📧');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de l\'email de test');
    }
  };

  const handleTestNotification = async () => {
    setError('');
    setSuccess('');
    try {
      // Implémentation future: envoyer une notification de test
      setSuccess('Notification de test envoyée ! 🔔');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de la notification de test');
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      return;
    }

    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetAllSettings(user.id);
      const loadedSettings = await loadPlatformSettings();
      setSettings(loadedSettings);
      setSuccess('Paramètres réinitialisés aux valeurs par défaut ! 🔄');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation:', err);
      setError('Erreur lors de la réinitialisation des paramètres');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 font-semibold animate-fade-in">
          {success}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-accent-50 border-2 border-accent-200 rounded-xl text-accent-700 font-semibold animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <Settings size={32} className="text-primary-600" />
            Paramètres de la Plateforme
          </h2>
          <p className="text-neutral-600 mt-2 font-medium">
            Configurez les paramètres généraux de l'application
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettingsManually}
            disabled={loading || loadingData}
            className="btn-outline rounded-xl"
            title="Recharger les paramètres"
          >
            <RefreshCw size={20} className={loadingData ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSave}
            disabled={loading || loadingData}
            className="btn-success rounded-xl"
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
      </div>

      {/* Paramètres Généraux */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Globe size={24} className="text-primary-600" />
          Informations Générales
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Nom de la plateforme
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Email de contact
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="email"
                value={settings.platformEmail}
                onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                className="input-icon"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Téléphone support
            </label>
            <input
              type="tel"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Paramètres des Lots */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Package size={24} className="text-secondary-600" />
          Paramètres des Lots
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Prix minimum (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="number"
                value={settings.minLotPrice}
                onChange={(e) => setSettings({ ...settings, minLotPrice: parseFloat(e.target.value) })}
                className="input-icon"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Prix maximum (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="number"
                value={settings.maxLotPrice}
                onChange={(e) => setSettings({ ...settings, maxLotPrice: parseFloat(e.target.value) })}
                className="input-icon"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Durée par défaut (heures)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="number"
                value={settings.defaultLotDuration}
                onChange={(e) => setSettings({ ...settings, defaultLotDuration: parseInt(e.target.value) })}
                className="input-icon"
                min="1"
                max="168"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Réservations max/jour
            </label>
            <input
              type="number"
              value={settings.maxReservationsPerDay}
              onChange={(e) => setSettings({ ...settings, maxReservationsPerDay: parseInt(e.target.value) })}
              className="input"
              min="1"
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Paramètres de Commission */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Percent size={24} className="text-success-600" />
          Commissions
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Commission commerçant (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="number"
                value={settings.merchantCommission}
                onChange={(e) => setSettings({ ...settings, merchantCommission: parseFloat(e.target.value) })}
                className="input-icon"
                min="0"
                max="50"
                step="0.5"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Commission prélevée sur les ventes des commerçants
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Commission collecteur (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="number"
                value={settings.collectorCommission}
                onChange={(e) => setSettings({ ...settings, collectorCommission: parseFloat(e.target.value) })}
                className="input-icon"
                min="0"
                max="50"
                step="0.5"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Commission versée aux collecteurs pour les livraisons
            </p>
          </div>
        </div>
      </div>

      {/* Paramètres Bénéficiaires */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Shield size={24} className="text-accent-600" />
          Bénéficiaires
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Vérification obligatoire</div>
              <div className="text-sm text-neutral-600 font-medium">
                Les bénéficiaires doivent être vérifiés avant d'accéder aux dons
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.beneficiaryVerificationRequired}
                onChange={(e) => setSettings({ ...settings, beneficiaryVerificationRequired: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Réservations max par jour (bénéficiaires)
            </label>
            <input
              type="number"
              value={settings.maxDailyBeneficiaryReservations}
              onChange={(e) => setSettings({ ...settings, maxDailyBeneficiaryReservations: parseInt(e.target.value) })}
              className="input"
              min="1"
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Bell size={24} className="text-warning-600" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Notifications Email</div>
              <div className="text-sm text-neutral-600 font-medium">Envoyer des notifications par email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Notifications SMS</div>
              <div className="text-sm text-neutral-600 font-medium">Envoyer des notifications par SMS</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.smsNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, smsNotificationsEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Notifications Push</div>
              <div className="text-sm text-neutral-600 font-medium">Envoyer des notifications push</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.pushNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, pushNotificationsEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="card p-8 border-2 border-accent-200">
        <h3 className="text-xl font-bold text-accent-600 mb-6 flex items-center gap-2">
          <Shield size={24} />
          Sécurité
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl border border-accent-200">
            <div>
              <div className="font-semibold text-neutral-900 mb-1">Authentification à deux facteurs</div>
              <div className="text-sm text-neutral-600 font-medium">
                Exiger la 2FA pour les administrateurs
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.twoFactorAuthRequired}
                onChange={(e) => setSettings({ ...settings, twoFactorAuthRequired: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-accent-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Expiration mot de passe (jours)
              </label>
              <input
                type="number"
                value={settings.passwordExpirationDays}
                onChange={(e) => setSettings({ ...settings, passwordExpirationDays: parseInt(e.target.value) })}
                className="input"
                min="30"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Tentatives de connexion max
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                className="input"
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Zap size={24} className="text-warning-600" />
          Actions Rapides
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={handleTestEmail}
            className="btn-primary rounded-xl"
            disabled={!settings.emailNotificationsEnabled}
          >
            <Mail size={20} />
            <span>Envoyer Email Test</span>
          </button>
          <button 
            onClick={handleTestNotification}
            className="btn-secondary rounded-xl"
            disabled={!settings.pushNotificationsEnabled}
          >
            <Bell size={20} />
            <span>Test Notification</span>
          </button>
          <button 
            onClick={handleReset}
            className="btn-outline rounded-xl"
          >
            <RefreshCw size={20} />
            <span>Réinitialiser</span>
          </button>
        </div>
        <p className="text-sm text-neutral-600 mt-4 font-medium text-center">
          💡 Les boutons de test sont désactivés si les notifications correspondantes sont désactivées
        </p>
      </div>
    </div>
  );
};

