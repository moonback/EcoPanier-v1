import { supabase } from '../lib/supabase';

export interface PlatformSettings {
  // Paramètres généraux
  platformName: string;
  platformEmail: string;
  supportPhone: string;
  
  // Paramètres des lots
  minLotPrice: number;
  maxLotPrice: number;
  defaultLotDuration: number;
  maxReservationsPerDay: number;
  
  // Paramètres de commission
  merchantCommission: number;
  collectorCommission: number;
  
  // Paramètres bénéficiaires
  beneficiaryVerificationRequired: boolean;
  maxDailyBeneficiaryReservations: number;
  
  // Notifications
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  // Sécurité
  twoFactorAuthRequired: boolean;
  passwordExpirationDays: number;
  maxLoginAttempts: number;
}

const defaultSettings: PlatformSettings = {
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
};

// Convertir snake_case en camelCase
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

// Convertir camelCase en snake_case
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Charger tous les paramètres de la plateforme
 */
export const loadPlatformSettings = async (): Promise<PlatformSettings> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value');

    if (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return defaultSettings;
    }

    if (!data || data.length === 0) {
      console.warn('Aucun paramètre trouvé, utilisation des valeurs par défaut');
      return defaultSettings;
    }

    const settingsMap: any = { ...defaultSettings };
    data.forEach((item) => {
      const camelKey = snakeToCamel(item.key);
      settingsMap[camelKey] = item.value;
    });

    return settingsMap as PlatformSettings;
  } catch (err) {
    console.error('Erreur inattendue lors du chargement:', err);
    return defaultSettings;
  }
};

/**
 * Sauvegarder tous les paramètres de la plateforme
 */
export const savePlatformSettings = async (
  settings: PlatformSettings, 
  userId: string
): Promise<void> => {
  try {
    // Convertir les paramètres en tableau pour la mise à jour
    const updates = Object.entries(settings).map(([key, value]) => ({
      key: camelToSnake(key),
      value,
      userId,
    }));

    // Mettre à jour chaque paramètre individuellement
    for (const update of updates) {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          value: update.value,
          updated_by: update.userId,
        })
        .eq('key', update.key);

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de ${update.key}: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    throw err;
  }
};

/**
 * Obtenir un paramètre spécifique
 */
export const getSetting = async (key: string): Promise<any> => {
  try {
    const snakeKey = camelToSnake(key);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', snakeKey)
      .single();

    if (error) throw error;
    return data?.value;
  } catch (err) {
    console.error(`Erreur lors de la récupération du paramètre ${key}:`, err);
    return (defaultSettings as any)[key];
  }
};

/**
 * Mettre à jour un paramètre spécifique
 */
export const updateSetting = async (
  key: string, 
  value: any, 
  userId: string
): Promise<void> => {
  try {
    const snakeKey = camelToSnake(key);
    const { error } = await supabase
      .from('platform_settings')
      .update({
        value,
        updated_by: userId,
      })
      .eq('key', snakeKey);

    if (error) throw error;
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du paramètre ${key}:`, err);
    throw err;
  }
};

/**
 * Obtenir l'historique des modifications d'un paramètre
 */
export const getSettingHistory = async (key: string): Promise<any[]> => {
  try {
    const snakeKey = camelToSnake(key);
    const { data, error } = await supabase
      .from('platform_settings_history')
      .select(`
        *,
        changed_by_profile:profiles!changed_by(full_name, role)
      `)
      .eq('setting_key', snakeKey)
      .order('changed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Erreur lors de la récupération de l'historique:`, err);
    return [];
  }
};

/**
 * Réinitialiser tous les paramètres aux valeurs par défaut
 */
export const resetAllSettings = async (userId: string): Promise<void> => {
  try {
    await savePlatformSettings(defaultSettings, userId);
  } catch (err) {
    console.error('Erreur lors de la réinitialisation:', err);
    throw err;
  }
};

