import { PlatformSettings } from './settingsService';

/**
 * Valide le prix d'un lot selon les paramètres de la plateforme
 */
export const validateLotPrice = (price: number, settings: PlatformSettings): { valid: boolean; error?: string } => {
  if (price < settings.minLotPrice) {
    return {
      valid: false,
      error: `Le prix minimum est de ${settings.minLotPrice}€`
    };
  }
  
  if (price > settings.maxLotPrice) {
    return {
      valid: false,
      error: `Le prix maximum est de ${settings.maxLotPrice}€`
    };
  }
  
  return { valid: true };
};

/**
 * Valide la durée d'un lot
 */
export const validateLotDuration = (hours: number, settings: PlatformSettings): { valid: boolean; error?: string } => {
  if (hours < 1) {
    return {
      valid: false,
      error: 'La durée minimum est de 1 heure'
    };
  }
  
  if (hours > 168) { // 7 jours max
    return {
      valid: false,
      error: 'La durée maximum est de 7 jours (168 heures)'
    };
  }
  
  return { valid: true };
};

/**
 * Vérifie si un bénéficiaire peut faire une nouvelle réservation
 */
export const canBeneficiaryReserve = (
  dailyCount: number, 
  settings: PlatformSettings
): { canReserve: boolean; message?: string } => {
  if (dailyCount >= settings.maxDailyBeneficiaryReservations) {
    return {
      canReserve: false,
      message: `Vous avez atteint la limite de ${settings.maxDailyBeneficiaryReservations} réservations par jour`
    };
  }
  
  return { canReserve: true };
};

/**
 * Calcule la commission commerçant
 */
export const calculateMerchantCommission = (
  amount: number, 
  settings: PlatformSettings
): number => {
  return (amount * settings.merchantCommission) / 100;
};

/**
 * Calcule la commission collecteur
 */
export const calculateCollectorCommission = (
  amount: number, 
  settings: PlatformSettings
): number => {
  return (amount * settings.collectorCommission) / 100;
};

/**
 * Calcule le montant net pour un commerçant après commission
 */
export const calculateMerchantNetAmount = (
  grossAmount: number,
  settings: PlatformSettings
): {
  grossAmount: number;
  commission: number;
  netAmount: number;
  commissionRate: number;
} => {
  const commission = calculateMerchantCommission(grossAmount, settings);
  const netAmount = grossAmount - commission;
  
  return {
    grossAmount,
    commission,
    netAmount,
    commissionRate: settings.merchantCommission
  };
};

/**
 * Formate un montant avec la commission
 */
export const formatAmountWithCommission = (
  amount: number,
  settings: PlatformSettings,
  type: 'merchant' | 'collector'
): string => {
  const commission = type === 'merchant' 
    ? calculateMerchantCommission(amount, settings)
    : calculateCollectorCommission(amount, settings);
    
  const net = type === 'merchant' ? amount - commission : commission;
  
  return `${amount.toFixed(2)}€ (Net: ${net.toFixed(2)}€)`;
};

/**
 * Obtient la durée par défaut d'un lot
 */
export const getDefaultLotDuration = (settings: PlatformSettings): number => {
  return settings.defaultLotDuration;
};

/**
 * Vérifie si les notifications sont activées
 */
export const areNotificationsEnabled = (
  type: 'email' | 'sms' | 'push',
  settings: PlatformSettings
): boolean => {
  switch (type) {
    case 'email':
      return settings.emailNotificationsEnabled;
    case 'sms':
      return settings.smsNotificationsEnabled;
    case 'push':
      return settings.pushNotificationsEnabled;
    default:
      return false;
  }
};

