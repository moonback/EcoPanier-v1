import { supabase } from '../lib/supabase';

/**
 * Catégories de produits disponibles
 */
const CATEGORIES = [
  'bakery',
  'fruits_vegetables',
  'dairy',
  'meat_fish',
  'prepared_meals',
  'grocery',
  'frozen',
  'other',
];

/**
 * Template de lots fictifs avec toutes les informations nécessaires
 */
const LOT_TEMPLATES = [
  // Boulangerie
  {
    title: 'Panier Boulangerie du Jour',
    description: 'Sélection de pains et viennoiseries fraîches de la journée. Contient : baguettes, croissants, pains au chocolat et pains aux raisins.',
    category: 'bakery',
    originalPrice: 15.0,
    discountedPrice: 5.0,
    quantity: 8,
    requiresColdChain: false,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
  {
    title: 'Assortiment Viennoiseries Premium',
    description: 'Viennoiseries artisanales fraîches du matin : croissants au beurre, pains au chocolat, brioches et chaussons aux pommes.',
    category: 'bakery',
    originalPrice: 12.0,
    discountedPrice: 4.0,
    quantity: 10,
    requiresColdChain: false,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
  },
  {
    title: 'Mix Pains Spéciaux',
    description: 'Assortiment de pains spéciaux artisanaux : pain aux céréales, pain de campagne, pain complet et baguette tradition.',
    category: 'bakery',
    originalPrice: 10.0,
    discountedPrice: 3.5,
    quantity: 12,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800',
  },
  
  // Fruits et Légumes
  {
    title: 'Panier Fruits de Saison',
    description: 'Fruits frais de saison légèrement marqués mais excellents. Pommes, poires, oranges, bananes et kiwis.',
    category: 'fruits_vegetables',
    originalPrice: 18.0,
    discountedPrice: 6.0,
    quantity: 15,
    requiresColdChain: false,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
  },
  {
    title: 'Lot Légumes Frais Bio',
    description: 'Légumes bio de saison : carottes, courgettes, tomates, poivrons, salade et pommes de terre.',
    category: 'fruits_vegetables',
    originalPrice: 20.0,
    discountedPrice: 7.0,
    quantity: 10,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  },
  {
    title: 'Mix Agrumes Vitaminés',
    description: 'Sélection d\'agrumes frais : oranges, citrons, pamplemousses et clémentines. Parfait pour les jus et vitamines.',
    category: 'fruits_vegetables',
    originalPrice: 14.0,
    discountedPrice: 4.5,
    quantity: 20,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800',
  },

  // Produits laitiers
  {
    title: 'Assortiment Produits Laitiers',
    description: 'Sélection de produits laitiers frais : yaourts nature et aux fruits, fromages blancs et crème fraîche. DLC courte.',
    category: 'dairy',
    originalPrice: 16.0,
    discountedPrice: 5.5,
    quantity: 12,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  },
  {
    title: 'Plateau Fromages Variés',
    description: 'Assortiment de fromages français : camembert, brie, comté, chèvre et roquefort. À consommer rapidement.',
    category: 'dairy',
    originalPrice: 22.0,
    discountedPrice: 8.0,
    quantity: 6,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800',
  },
  {
    title: 'Pack Yaourts Artisanaux',
    description: 'Yaourts artisanaux fabriqués sur place. Différents parfums : vanille, fraise, fruits des bois et nature.',
    category: 'dairy',
    originalPrice: 12.0,
    discountedPrice: 4.0,
    quantity: 15,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
  },

  // Viande et Poisson
  {
    title: 'Lot Viandes Fraîches',
    description: 'Sélection de viandes fraîches du boucher : poulet, bœuf et porc. Qualité premium à consommer sous 48h.',
    category: 'meat_fish',
    originalPrice: 25.0,
    discountedPrice: 9.0,
    quantity: 5,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
  },
  {
    title: 'Poissons Frais du Marché',
    description: 'Poissons frais de la criée : dorade, saumon, cabillaud et crevettes. Pêche responsable du jour.',
    category: 'meat_fish',
    originalPrice: 30.0,
    discountedPrice: 11.0,
    quantity: 4,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1535007165-23c28f9c4750?w=800',
  },
  {
    title: 'Charcuterie Artisanale',
    description: 'Assortiment de charcuteries artisanales : jambon, saucisson, pâté et rillettes. DLC courte.',
    category: 'meat_fish',
    originalPrice: 18.0,
    discountedPrice: 6.5,
    quantity: 8,
    requiresColdChain: true,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  },

  // Plats préparés
  {
    title: 'Plat Cuisiné Maison',
    description: 'Plat fait maison du jour : lasagnes, quiches, tartes salées ou gratins. Recettes traditionnelles.',
    category: 'prepared_meals',
    originalPrice: 12.0,
    discountedPrice: 4.5,
    quantity: 10,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  },
  {
    title: 'Menu Complet du Jour',
    description: 'Menu complet équilibré : entrée, plat principal et dessert. Cuisine française traditionnelle.',
    category: 'prepared_meals',
    originalPrice: 15.0,
    discountedPrice: 5.5,
    quantity: 8,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Salades Fraîches Composées',
    description: 'Salades composées du jour : César, niçoise, chèvre chaud et poulet curry. Fraîches et savoureuses.',
    category: 'prepared_meals',
    originalPrice: 10.0,
    discountedPrice: 3.5,
    quantity: 12,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  },

  // Épicerie
  {
    title: 'Lot Épicerie Sèche',
    description: 'Assortiment de produits d\'épicerie : pâtes, riz, conserves, huiles et condiments. DLC longue.',
    category: 'grocery',
    originalPrice: 20.0,
    discountedPrice: 7.0,
    quantity: 15,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800',
  },
  {
    title: 'Pack Petit Déjeuner',
    description: 'Kit complet petit déjeuner : céréales, confitures, miel, thé, café et biscuits.',
    category: 'grocery',
    originalPrice: 16.0,
    discountedPrice: 5.5,
    quantity: 10,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  },
  {
    title: 'Lot Conserves Premium',
    description: 'Sélection de conserves de qualité : légumes, poissons, fruits et plats cuisinés. DLC proche.',
    category: 'grocery',
    originalPrice: 18.0,
    discountedPrice: 6.0,
    quantity: 12,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800',
  },

  // Surgelés
  {
    title: 'Assortiment Surgelés',
    description: 'Produits surgelés variés : légumes, poissons, viandes et plats préparés. Chaîne du froid respectée.',
    category: 'frozen',
    originalPrice: 24.0,
    discountedPrice: 8.5,
    quantity: 8,
    requiresColdChain: true,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
  },
  {
    title: 'Glaces et Desserts Glacés',
    description: 'Sélection de glaces et desserts glacés : pots de glace, esquimaux et sorbets artisanaux.',
    category: 'frozen',
    originalPrice: 15.0,
    discountedPrice: 5.0,
    quantity: 10,
    requiresColdChain: true,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
  },
  {
    title: 'Mix Pizzas et Snacks',
    description: 'Pizzas surgelées et snacks : pizzas margarita, 4 fromages, frites et nuggets. Idéal pour repas rapide.',
    category: 'frozen',
    originalPrice: 20.0,
    discountedPrice: 7.0,
    quantity: 12,
    requiresColdChain: true,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  },

  // Autres
  {
    title: 'Panier Anti-Gaspi Surprise',
    description: 'Panier surprise avec assortiment varié de produits divers : un peu de tout pour découvrir !',
    category: 'other',
    originalPrice: 20.0,
    discountedPrice: 6.5,
    quantity: 15,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  },
  {
    title: 'Lot Pâtisseries Fines',
    description: 'Pâtisseries artisanales du jour : éclairs, tartelettes, macarons et mille-feuilles.',
    category: 'bakery',
    originalPrice: 18.0,
    discountedPrice: 6.0,
    quantity: 6,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
  },
  {
    title: 'Boissons Fraîches Variées',
    description: 'Assortiment de boissons : jus de fruits, sodas, eaux aromatisées et boissons énergisantes.',
    category: 'other',
    originalPrice: 14.0,
    discountedPrice: 4.5,
    quantity: 20,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800',
  },
  {
    title: 'Sandwiches et Wraps',
    description: 'Sandwiches et wraps frais du jour : jambon-beurre, poulet curry, thon crudités et végétarien.',
    category: 'prepared_meals',
    originalPrice: 12.0,
    discountedPrice: 4.0,
    quantity: 15,
    requiresColdChain: true,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800',
  },
  {
    title: 'Fruits Exotiques Mix',
    description: 'Sélection de fruits exotiques : mangues, ananas, fruits de la passion, litchis et noix de coco.',
    category: 'fruits_vegetables',
    originalPrice: 16.0,
    discountedPrice: 5.5,
    quantity: 10,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
  },
  {
    title: 'Herbes et Aromates Frais',
    description: 'Bouquets d\'herbes fraîches : basilic, persil, coriandre, menthe, thym et romarin.',
    category: 'fruits_vegetables',
    originalPrice: 8.0,
    discountedPrice: 2.5,
    quantity: 25,
    requiresColdChain: false,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1466065478348-0b967a1eb08f?w=800',
  },
  {
    title: 'Produits Végétariens Bio',
    description: 'Sélection de produits végétariens bio : tofu, seitan, steaks végétaux et lait d\'amande.',
    category: 'other',
    originalPrice: 15.0,
    discountedPrice: 5.0,
    quantity: 8,
    requiresColdChain: true,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=800',
  },
  {
    title: 'Chocolats et Confiseries',
    description: 'Assortiment de chocolats fins et confiseries : tablettes, pralinés, truffes et bonbons.',
    category: 'other',
    originalPrice: 12.0,
    discountedPrice: 4.0,
    quantity: 18,
    requiresColdChain: false,
    isUrgent: false,
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
  },
];

/**
 * Génère des dates de retrait (aujourd'hui en fin de journée)
 */
function generatePickupDates(): { pickupStart: string; pickupEnd: string } {
  const today = new Date();
  
  // Heure de début : 18h00 aujourd'hui
  const pickupStart = new Date(today);
  pickupStart.setHours(18, 0, 0, 0);
  
  // Heure de fin : 20h00 aujourd'hui
  const pickupEnd = new Date(today);
  pickupEnd.setHours(20, 0, 0, 0);
  
  return {
    pickupStart: pickupStart.toISOString(),
    pickupEnd: pickupEnd.toISOString(),
  };
}

/**
 * Génère un code-barres aléatoire
 */
function generateBarcode(): string {
  const prefix = '33'; // Code pays France
  const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return prefix + random;
}

/**
 * Génère 30 lots fictifs pour un commerçant
 */
export async function generateFictionalLots(merchantId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!merchantId) {
      throw new Error('ID du commerçant requis');
    }

    const lotsToCreate = [];

    // Créer 30 lots en utilisant les templates
    for (let i = 0; i < 30; i++) {
      const template = LOT_TEMPLATES[i % LOT_TEMPLATES.length];
      const { pickupStart, pickupEnd } = generatePickupDates();

      const lot = {
        merchant_id: merchantId,
        title: template.title,
        description: template.description,
        category: template.category,
        original_price: template.originalPrice,
        discounted_price: template.discountedPrice,
        quantity_total: template.quantity,
        quantity_reserved: 0,
        quantity_sold: 0,
        pickup_start: pickupStart,
        pickup_end: pickupEnd,
        requires_cold_chain: template.requiresColdChain,
        is_urgent: template.isUrgent,
        status: 'available',
        image_urls: [template.imageUrl],
        barcode: generateBarcode(),
        is_free: false,
      };

      lotsToCreate.push(lot);
    }

    // Insérer tous les lots en une seule requête
    const { data, error } = await supabase
      .from('lots')
      .insert(lotsToCreate)
      .select();

    if (error) {
      console.error('Erreur Supabase lors de la création des lots:', error);
      throw error;
    }

    return {
      success: true,
      count: data?.length || 0,
    };

  } catch (error) {
    console.error('Erreur lors de la génération des lots fictifs:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

