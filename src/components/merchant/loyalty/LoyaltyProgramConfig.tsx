import { useState, useEffect } from 'react';
import { Save, Settings, Gift, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoyaltyProgramConfigProps {
  merchantId: string;
}

export const LoyaltyProgramConfig = ({ merchantId }: LoyaltyProgramConfigProps) => {
  const [config, setConfig] = useState({
    is_active: true,
    points_per_euro: 1,
    points_per_donation: 5,
    points_per_review: 10,
    points_per_referral: 25,
    welcome_bonus: 10,
    birthday_bonus: 50,
    level_up_bonus: 25,
    expiration_days: 365,
    auto_enrollment: true,
    email_notifications: true,
    push_notifications: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [merchantId]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('merchant_id', merchantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({ ...config, ...data.config });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('loyalty_programs')
        .upsert({
          merchant_id: merchantId,
          config: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Configuration sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration du Programme</h2>
        <p className="text-gray-600">Personnalisez votre programme de fidélité selon vos besoins</p>
      </div>

      {/* Statut du programme */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-purple-600" />
            Statut du Programme
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Programme actif</span>
            </label>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-800">
            {config.is_active 
              ? "✅ Votre programme de fidélité est actif et visible par vos clients"
              : "⏸️ Votre programme de fidélité est temporairement désactivé"
            }
          </p>
        </div>
      </div>

      {/* Configuration des points */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star size={20} className="text-yellow-600" />
          Attribution des Points
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points par euro dépensé
            </label>
            <input
              type="number"
              value={config.points_per_euro}
              onChange={(e) => handleInputChange('points_per_euro', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Recommandé: 1 point par euro</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points par euro donné
            </label>
            <input
              type="number"
              value={config.points_per_donation}
              onChange={(e) => handleInputChange('points_per_donation', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Encouragez la solidarité</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points par avis laissé
            </label>
            <input
              type="number"
              value={config.points_per_review}
              onChange={(e) => handleInputChange('points_per_review', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Encouragez les retours clients</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points par parrainage
            </label>
            <input
              type="number"
              value={config.points_per_referral}
              onChange={(e) => handleInputChange('points_per_referral', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Encouragez le bouche-à-oreille</p>
          </div>
        </div>
      </div>

      {/* Bonus spéciaux */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift size={20} className="text-green-600" />
          Bonus Spéciaux
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus de bienvenue
            </label>
            <input
              type="number"
              value={config.welcome_bonus}
              onChange={(e) => handleInputChange('welcome_bonus', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points offerts à l'inscription</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus anniversaire
            </label>
            <input
              type="number"
              value={config.birthday_bonus}
              onChange={(e) => handleInputChange('birthday_bonus', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points offerts à l'anniversaire</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus montée de niveau
            </label>
            <input
              type="number"
              value={config.level_up_bonus}
              onChange={(e) => handleInputChange('level_up_bonus', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Points bonus lors d'un changement de niveau</p>
          </div>
        </div>
      </div>

      {/* Paramètres avancés */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Paramètres Avancés</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration des points (en jours)
            </label>
            <input
              type="number"
              value={config.expiration_days}
              onChange={(e) => handleInputChange('expiration_days', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="30"
            />
            <p className="text-xs text-gray-500 mt-1">Les points expirent après cette période d'inactivité</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_enrollment"
                checked={config.auto_enrollment}
                onChange={(e) => handleInputChange('auto_enrollment', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="auto_enrollment" className="text-sm font-medium text-gray-700">
                Inscription automatique des nouveaux clients
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email_notifications"
                checked={config.email_notifications}
                onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                Notifications par email
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="push_notifications"
                checked={config.push_notifications}
                onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="push_notifications" className="text-sm font-medium text-gray-700">
                Notifications push
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Sauvegarder la configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

