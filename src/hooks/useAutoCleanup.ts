import { useEffect } from 'react';
import { cleanupUnclaimedLots } from '../utils/expiredLotsService';

/**
 * Hook pour nettoyer automatiquement les lots non récupérés
 * 
 * Ce hook exécute la fonction cleanupUnclaimedLots périodiquement
 * pour supprimer les lots non retirés 24h après la date de remise.
 * 
 * Par défaut, le nettoyage se fait :
 * - Au montage du composant
 * - Toutes les heures
 * 
 * @param options Options de configuration
 * @param options.enabled Active ou désactive le nettoyage automatique (défaut: true)
 * @param options.interval Intervalle en millisecondes entre chaque nettoyage (défaut: 1 heure)
 * @param options.onCleanup Callback appelé après chaque nettoyage réussi
 */
export function useAutoCleanup(options: {
  enabled?: boolean;
  interval?: number;
  onCleanup?: (result: { deletedLots: number; cancelledReservations: number }) => void;
} = {}) {
  const { 
    enabled = true, 
    interval = 60 * 60 * 1000, // 1 heure par défaut
    onCleanup 
  } = options;

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const performCleanup = async () => {
      try {
        const result = await cleanupUnclaimedLots();
        
        if (result.success && isMounted && onCleanup) {
          onCleanup({
            deletedLots: result.deletedLots,
            cancelledReservations: result.cancelledReservations
          });
        }
      } catch (error) {
        console.error('Erreur lors du nettoyage automatique:', error);
      }

      if (isMounted) {
        // Programmer le prochain nettoyage
        timeoutId = setTimeout(performCleanup, interval);
      }
    };

    // Exécuter le nettoyage immédiatement
    performCleanup();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [enabled, interval, onCleanup]);
}

