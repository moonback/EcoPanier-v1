// Fonctions utilitaires liées aux commerçants

import type { Database } from '../lib/database.types';

type BusinessHours = Database['public']['Tables']['profiles']['Row']['business_hours'];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  bakery: 'Boulangerie',
  restaurant: 'Restaurant',
  supermarket: 'Supermarché',
  grocery: 'Épicerie',
  market: 'Marché',
  cafe: 'Café',
  patisserie: 'Pâtisserie',
  butcher: 'Boucherie',
  fishmonger: 'Poissonnerie',
  organic: 'Bio',
  other: 'Autre',
};

/**
 * Retourne un libellé lisible pour un type de commerce
 */
export function getBusinessTypeLabel(type: string | null | undefined): string {
  if (!type) {
    return '';
  }

  return BUSINESS_TYPE_LABELS[type] ?? type;
}

/**
 * Retourne une chaîne décrivant les horaires d'ouverture du jour courant
 */
export function formatBusinessHours(
  businessHours: BusinessHours
): string {
  if (!businessHours) {
    return 'Non renseigné';
  }

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  const today = new Date().getDay();
  const todayKey = days[today === 0 ? 6 : today - 1];
  const todayHours = businessHours[todayKey];

  if (todayHours?.closed || !todayHours?.open || !todayHours?.close) {
    return "Fermé aujourd'hui";
  }

  return `Aujourd'hui: ${todayHours.open} - ${todayHours.close}`;
}


