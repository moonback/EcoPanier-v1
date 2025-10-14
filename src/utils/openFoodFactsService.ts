/**
 * Service pour interroger l'API OpenFoodFacts
 * Permet de récupérer les informations d'un produit via son code-barres EAN13
 */

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands: string;
  categories: string;
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  quantity?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  ingredients_text?: string;
  allergens?: string;
  expiration_date?: string;
  labels?: string;
}

export interface OpenFoodFactsResponse {
  success: boolean;
  product?: OpenFoodFactsProduct;
  error?: string;
}

/**
 * Récupère les informations d'un produit depuis OpenFoodFacts
 * @param barcode - Code-barres EAN13 du produit
 * @returns Informations du produit ou erreur
 */
export async function fetchProductByBarcode(barcode: string): Promise<OpenFoodFactsResponse> {
  try {
    // Validation basique du code-barres
    if (!barcode || barcode.length < 8) {
      return {
        success: false,
        error: 'Code-barres invalide'
      };
    }

    // Requête vers l'API OpenFoodFacts
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'EcoPanier - Anti-Gaspillage App',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Vérifier si le produit existe
    if (data.status === 0 || !data.product) {
      return {
        success: false,
        error: 'Produit non trouvé dans la base OpenFoodFacts'
      };
    }

    return {
      success: true,
      product: data.product
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Mappe les catégories OpenFoodFacts vers les catégories EcoPanier
 */
export function mapOpenFoodFactsCategory(offCategories?: string): string {
  if (!offCategories) return 'Autre';

  const categories = offCategories.toLowerCase();

  if (categories.includes('pain') || categories.includes('boulangerie') || categories.includes('viennoiserie')) {
    return 'Boulangerie';
  }
  if (categories.includes('fruit') || categories.includes('légume') || categories.includes('vegetable')) {
    return 'Fruits & Légumes';
  }
  if (categories.includes('viande') || categories.includes('meat') || categories.includes('volaille')) {
    return 'Viandes & Poissons';
  }
  if (categories.includes('fromage') || categories.includes('yaourt') || categories.includes('lait') || categories.includes('dairy')) {
    return 'Produits laitiers';
  }
  if (categories.includes('plat') || categories.includes('meal') || categories.includes('prepared')) {
    return 'Plats cuisinés';
  }
  if (categories.includes('boisson') || categories.includes('drink') || categories.includes('beverage')) {
    return 'Boissons';
  }
  if (categories.includes('épicerie') || categories.includes('grocery') || categories.includes('conserve')) {
    return 'Épicerie';
  }
  if (categories.includes('snack') || categories.includes('confiserie') || categories.includes('dessert')) {
    return 'Snacks & Desserts';
  }

  return 'Autre';
}

/**
 * Estime un prix basé sur la catégorie et la quantité
 * (Utilisé comme suggestion pour le commerçant)
 */
export function estimatePrice(category: string, quantity?: string): { original: number; discounted: number } {
  // Prix de base par catégorie (en euros)
  const basePrices: Record<string, number> = {
    'Boulangerie': 8,
    'Fruits & Légumes': 5,
    'Viandes & Poissons': 15,
    'Produits laitiers': 6,
    'Plats cuisinés': 12,
    'Boissons': 4,
    'Épicerie': 7,
    'Snacks & Desserts': 5,
    'Autre': 8,
  };

  const basePrice = basePrices[category] || 8;

  // Ajustement selon la quantité si disponible
  let multiplier = 1;
  if (quantity) {
    const quantityLower = quantity.toLowerCase();
    if (quantityLower.includes('kg')) {
      const kg = parseFloat(quantityLower);
      if (!isNaN(kg)) multiplier = kg;
    } else if (quantityLower.includes('l')) {
      const l = parseFloat(quantityLower);
      if (!isNaN(l)) multiplier = l;
    }
  }

  const originalPrice = Math.round(basePrice * multiplier * 100) / 100;
  const discountedPrice = Math.round(originalPrice * 0.4 * 100) / 100; // -60% par défaut

  return {
    original: originalPrice,
    discounted: discountedPrice,
  };
}

