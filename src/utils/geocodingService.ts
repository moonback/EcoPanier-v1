/**
 * Service de géocodage pour convertir les adresses en coordonnées GPS
 * Utilise l'API Mapbox Geocoding
 */

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  success: boolean;
  error?: string;
}

/**
 * Convertit une adresse en coordonnées GPS (latitude, longitude)
 * @param address - Adresse complète à géocoder
 * @returns Coordonnées GPS et adresse formatée
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address || address.trim() === '') {
    return {
      latitude: 0,
      longitude: 0,
      formattedAddress: '',
      success: false,
      error: 'Adresse vide ou invalide'
    };
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    console.error('VITE_MAPBOX_ACCESS_TOKEN non configuré dans .env');
    return {
      latitude: 0,
      longitude: 0,
      formattedAddress: address,
      success: false,
      error: 'Token Mapbox manquant'
    };
  }

  try {
    // Encoder l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address);
    
    // Appel API Mapbox Geocoding
    // Documentation: https://docs.mapbox.com/api/search/geocoding/
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${MAPBOX_ACCESS_TOKEN}&` +
      `country=FR&` + // Limiter à la France
      `types=address,poi&` + // Types de résultats
      `limit=1` // Un seul résultat
    );

    if (!response.ok) {
      throw new Error(`Erreur API Mapbox: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Vérifier si des résultats ont été trouvés
    if (!data.features || data.features.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        formattedAddress: address,
        success: false,
        error: 'Adresse non trouvée'
      };
    }

    // Extraire les coordonnées du premier résultat
    const feature = data.features[0];
    const [longitude, latitude] = feature.center;
    const formattedAddress = feature.place_name;

    console.log(`✅ Géocodage réussi pour "${address}":`, { latitude, longitude });

    return {
      latitude,
      longitude,
      formattedAddress,
      success: true
    };
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    return {
      latitude: 0,
      longitude: 0,
      formattedAddress: address,
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Géocode plusieurs adresses en lot
 * @param addresses - Tableau d'adresses à géocoder
 * @param delayMs - Délai entre chaque requête (pour respecter les rate limits)
 * @returns Tableau de résultats
 */
export async function geocodeAddressesBatch(
  addresses: string[],
  delayMs: number = 200
): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results.push(result);

    // Délai pour respecter les rate limits de l'API (600 req/min pour Mapbox)
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Calcule la distance entre deux points GPS (en kilomètres)
 * Utilise la formule de Haversine
 * @param lat1 - Latitude du point 1
 * @param lon1 - Longitude du point 1
 * @param lat2 - Latitude du point 2
 * @param lon2 - Longitude du point 2
 * @returns Distance en kilomètres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formate une distance pour l'affichage
 * @param km - Distance en kilomètres
 * @returns Distance formatée (ex: "1.2 km" ou "350 m")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

