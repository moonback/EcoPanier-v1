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

/**
 * Constantes pour le calcul d'impact environnemental
 * Sources scientifiques crédibles :
 * - ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie) : 0.9 kg CO₂ par repas gaspillé évité
 * - FAO (Food and Agriculture Organization) : 50 litres d'eau par kg de nourriture gaspillée
 * - WWF : 1 kg de nourriture = ~0.5 kWh d'énergie (production, transport, stockage)
 * - ONF (Office National des Forêts) : 1 arbre mature absorbe ~22 kg CO₂/an
 */
const CO2_PER_MEAL = 0.9; // kg CO₂ par repas sauvé (source: ADEME 2024)
const WATER_PER_MEAL = 50; // litres d'eau par repas (source: FAO)
const ENERGY_PER_MEAL = 0.5; // kWh par repas (source: WWF)
const CO2_PER_TREE_YEAR = 22; // kg CO₂ absorbés par un arbre mature par an (source: ONF)

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
 * Formule : 0.9 kg CO₂ par repas sauvé
 * Source : ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie) - 2024
 * @param meals Nombre de repas sauvés
 * @returns CO₂ économisé en kg
 */
export function calculateCO2Impact(meals: number): number {
  return meals * CO2_PER_MEAL;
}

/**
 * Calcule l'équivalent en arbres préservés
 * Formule : CO₂ économisé / 22 kg CO₂ par arbre par an
 * Source : ONF (Office National des Forêts) - 1 arbre mature absorbe ~22 kg CO₂/an
 * @param meals Nombre de repas sauvés
 * @returns Nombre d'arbres équivalents (capacité d'absorption annuelle)
 */
export function calculateTreesEquivalent(meals: number): number {
  const co2Saved = calculateCO2Impact(meals);
  return co2Saved / CO2_PER_TREE_YEAR;
}

/**
 * Calcule l'eau économisée en litres
 * Formule : 50 litres d'eau par repas sauvé
 * Source : FAO (Food and Agriculture Organization) - Rapport sur le gaspillage alimentaire
 * @param meals Nombre de repas sauvés
 * @returns Eau économisée en litres
 */
export function calculateWaterSaved(meals: number): number {
  return meals * WATER_PER_MEAL;
}

/**
 * Calcule l'énergie économisée en kWh
 * Formule : 0.5 kWh par repas sauvé (production, transport, stockage)
 * Source : WWF - Empreinte énergétique du gaspillage alimentaire
 * @param meals Nombre de repas sauvés
 * @returns Énergie économisée en kWh
 */
export function calculateEnergySaved(meals: number): number {
  return meals * ENERGY_PER_MEAL;
}

