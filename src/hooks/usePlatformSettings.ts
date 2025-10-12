import { useState, useEffect } from 'react';
import { loadPlatformSettings, PlatformSettings } from '../utils/settingsService';

/**
 * Hook personnalisé pour accéder aux paramètres de la plateforme
 * Charge les paramètres une seule fois et les met en cache
 */
export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const loadedSettings = await loadPlatformSettings();
        setSettings(loadedSettings);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const loadedSettings = await loadPlatformSettings();
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du rechargement des paramètres:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de rechargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refresh
  };
};

