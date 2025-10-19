export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const CATEGORIES = [
  'Tous',
  'Boulangerie-Pâtisserie',
  'Fruits & Légumes',
  'Viande & Poisson',
  'Produits laitiers',
  'Épicerie',
  'Plats préparés',
  'Boissons'
] as const;

export const DEFAULT_VIEW_STATE = {
  latitude: 48.8566, // Paris par défaut
  longitude: 2.3522,
  zoom: 12
};

export const DEFAULT_FILTERS = {
  selectedCategory: 'Tous',
  maxDistance: 20,
  onlyUrgent: false
};

