import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadPlatformSettings, PlatformSettings } from '../utils/settingsService';

interface SettingsContextType {
  settings: PlatformSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
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

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await loadPlatformSettings();
      setSettings(loadedSettings);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError(err.message || 'Erreur de chargement');
      // Utiliser les valeurs par défaut en cas d'erreur
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  }
  return context;
};

