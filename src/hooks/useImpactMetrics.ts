import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ImpactMetric = Database['public']['Tables']['impact_metrics']['Row'];

interface AggregatedMetrics {
  meals_saved: number;
  co2_saved: number;
  money_saved: number;
  donations_made: number;
}

interface UseImpactMetricsReturn {
  metrics: AggregatedMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Constante pour le calcul de CO₂
// Source: ADEME 2024 - 2.5 kg CO₂ par repas sauvé
const CO2_PER_MEAL = 2.5;

/**
 * Hook personnalisé pour gérer les métriques d'impact d'un utilisateur
 * Calcule automatiquement le CO₂ économisé basé sur les repas sauvés
 */
export function useImpactMetrics(
  userId: string | undefined
): UseImpactMetricsReturn {
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    meals_saved: 0,
    co2_saved: 0,
    money_saved: 0,
    donations_made: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('impact_metrics')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Agréger les métriques par type
      const aggregated = data.reduce(
        (acc, metric: ImpactMetric) => {
          acc[metric.metric_type] += metric.value;
          return acc;
        },
        {
          meals_saved: 0,
          co2_saved: 0,
          money_saved: 0,
          donations_made: 0,
        } as AggregatedMetrics
      );

      setMetrics(aggregated);
    } catch (err) {
      console.error('Erreur lors du chargement des métriques:', err);
      setError('Impossible de charger vos statistiques d\'impact.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

/**
 * Calcule le CO₂ économisé basé sur le nombre de repas sauvés
 * @param meals Nombre de repas sauvés
 * @returns CO₂ économisé en kg
 */
export function calculateCO2Impact(meals: number): number {
  return meals * CO2_PER_MEAL;
}

/**
 * Calcule l'équivalent en arbres préservés
 * @param meals Nombre de repas sauvés
 * @returns Nombre d'arbres équivalents
 */
export function calculateTreesEquivalent(meals: number): number {
  return meals * 0.1;
}

/**
 * Calcule l'eau économisée en litres
 * @param meals Nombre de repas sauvés
 * @returns Eau économisée en litres
 */
export function calculateWaterSaved(meals: number): number {
  return meals * 50;
}

/**
 * Calcule l'énergie économisée en kWh
 * @param meals Nombre de repas sauvés
 * @returns Énergie économisée en kWh
 */
export function calculateEnergySaved(meals: number): number {
  return meals * 0.5;
}

