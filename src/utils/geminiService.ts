import { GoogleGenerativeAI } from '@google/generative-ai';
import { CATEGORIES } from './helpers';

/**
 * Service pour l'analyse d'images de produits alimentaires via Gemini 2.0 Flash
 * Extrait automatiquement les informations pertinentes pour créer un lot
 * 
 * Améliorations V2 :
 * - Analyse multi-produits (détecte plusieurs items)
 * - Suggestions de prix basées sur le marché français
 * - Détection de la fraîcheur visuelle
 * - Extraction de la DLC/DDM si visible
 * - Gestion des erreurs améliorée
 */

// Clé API Gemini (à configurer dans les variables d'environnement)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Timeout pour l'API (30 secondes max)
const API_TIMEOUT = 30000;

interface LotAnalysisResult {
  title: string;
  description: string;
  category: string;
  original_price: number;
  discounted_price: number;
  quantity_total: number;
  requires_cold_chain: boolean;
  is_urgent: boolean;
  confidence: number;
  // Nouveaux champs optionnels
  expiry_date?: string; // DLC/DDM détectée
  freshness_score?: number; // Score de fraîcheur 0-1
  suggested_pickup_time?: string; // Créneau suggéré
  alternative_titles?: string[]; // Suggestions de titres
}

/**
 * Analyse une image de produit alimentaire avec Gemini 2.0 Flash
 * @param imageFile - Fichier image à analyser
 * @returns Informations extraites du produit
 */
export async function analyzeFoodImage(imageFile: File): Promise<LotAnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      '⚠️ Clé API Gemini non configurée. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env'
    );
  }

  try {
    // Initialiser Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convertir l'image en base64
    const imageData = await fileToBase64(imageFile);

    // Prompt optimisé V2 pour l'analyse
    const prompt = `
Tu es un expert en analyse de produits alimentaires pour ÉcoPanier, une plateforme anti-gaspillage alimentaire française.

MISSION : Analyse cette image de produit(s) alimentaire(s) et extrais TOUTES les informations visibles.

RÉPONDS AU FORMAT JSON STRICT (sans markdown, sans \`\`\`, juste le JSON brut) :

{
  "title": "Nom commercial exact du produit si visible, sinon nom descriptif (max 80 caractères)",
  "description": "Description détaillée : ingrédients/contenu, état visuel, conditionnement, conservation (max 250 caractères)",
  "category": "UNE SEULE catégorie parmi : ${CATEGORIES.join(', ')}",
  "original_price": Prix de vente habituel en France (nombre avec décimales, ex: 12.50),
  "discounted_price": Prix anti-gaspi (40-70% du prix original, ex: 6.00),
  "quantity_total": Nombre exact d'unités/portions visibles (minimum 1),
  "requires_cold_chain": true/false (true pour TOUS produits frais, surgelés, réfrigérés, viandes, poissons, laitiers, traiteur),
  "is_urgent": true/false (true si visiblement très mûr, pain de veille, emballage ouvert, DLC proche),
  "confidence": Score 0-1 basé sur la netteté de l'image et la visibilité des infos,
  "expiry_date": "Date DLC/DDM si VISIBLE sur l'emballage au format DD/MM/YYYY, sinon null",
  "freshness_score": Score 0-1 de fraîcheur visuelle (1=parfait état, 0.5=correct, 0=limite),
  "suggested_pickup_time": "midi" OU "soir" OU "matin" selon type de produit,
  "alternative_titles": ["Variante 1 du titre", "Variante 2 du titre"]
}

📋 RÈGLES DE PRIX (MARCHÉ FRANÇAIS 2025) :
- Pain/Viennoiseries : 0.80-8€ → -50-70%
- Fruits/Légumes : 1-15€/kg → -40-60%
- Viandes/Poissons : 8-30€/kg → -50-60%
- Produits laitiers : 1-6€ → -40-50%
- Plats préparés : 4-15€ → -50-70%
- Pâtisseries : 3-25€ → -50-70%

🧊 CHAÎNE DU FROID = true POUR :
Viandes, poissons, charcuterie, laitiers, fromages, œufs, plats préparés frais, surgelés, traiteur

🔥 URGENT = true SI :
Pain/viennoiserie de veille, fruits très mûrs, DLC <48h, emballage entamé, aspect visuel limite

⏰ CRÉNEAU SUGGÉRÉ :
- Viennoiseries/pain : "matin"
- Plats préparés/traiteur : "midi" ou "soir"
- Pâtisseries : "soir"
- Reste : "midi"

✅ QUALITÉ :
- Si l'image est floue ou l'étiquette illisible : confidence < 0.6
- Si tout est clair et lisible : confidence > 0.8
- Si plusieurs produits : décrire le principal

⚠️ VALIDATION :
- discounted_price doit être 40-70% de original_price
- quantity_total ≥ 1
- category doit être EXACTEMENT une des catégories listées
- expiry_date au format DD/MM/YYYY ou null

IMPORTANT : Réponds UNIQUEMENT avec le JSON. Commence par { et finis par } sans aucun texte supplémentaire.
`;

    // Appeler l'API Gemini avec timeout
    const analysisPromise = model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: imageData,
        },
      },
    ]);

    // Timeout de 30 secondes
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏱️ Analyse trop longue (>30s). Réessayez avec une image plus légère.')), API_TIMEOUT)
    );

    const result = (await Promise.race([analysisPromise, timeoutPromise])) as Awaited<typeof analysisPromise>;
    const response = await result.response;
    const text = response.text();

    console.log('📊 Réponse brute Gemini:', text.substring(0, 200) + '...');

    // Parser la réponse JSON
    const analysis = parseGeminiResponse(text);

    // Valider et corriger les données
    const validatedAnalysis = validateAndCorrectAnalysis(analysis);

    console.log('✅ Analyse validée:', {
      title: validatedAnalysis.title,
      category: validatedAnalysis.category,
      confidence: validatedAnalysis.confidence,
    });

    return validatedAnalysis;
  } catch (error: unknown) {
    console.error('❌ Erreur lors de l\'analyse avec Gemini:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Messages d'erreur personnalisés
    if (errorMessage.includes('API key')) {
      throw new Error('🔑 Clé API Gemini invalide. Vérifiez votre configuration dans .env');
    }
    if (errorMessage.includes('quota')) {
      throw new Error('📊 Quota API Gemini dépassé. Réessayez plus tard ou vérifiez votre plan.');
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('trop longue')) {
      throw error;
    }
    if (errorMessage.includes('JSON')) {
      throw new Error('🔧 Format de réponse invalide. L\'IA n\'a pas bien compris l\'image. Réessayez avec une photo plus nette.');
    }
    
    throw new Error(
      '💥 Impossible d\'analyser l\'image. Vérifiez : 1) Votre connexion internet, 2) La qualité de l\'image, 3) Votre clé API Gemini.'
    );
  }
}

/**
 * Convertit un fichier image en base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Parse la réponse de Gemini en enlevant les éventuels marqueurs markdown
 */
function parseGeminiResponse(text: string): LotAnalysisResult {
  try {
    // Enlever les éventuels backticks et marqueurs markdown
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();

    // Parser le JSON
    const parsed = JSON.parse(cleanText);
    return parsed;
  } catch (error) {
    console.error('Erreur de parsing JSON:', error);
    console.error('Texte reçu:', text);
    throw new Error('Format de réponse invalide de Gemini. Réessayez.');
  }
}

/**
 * Valide et corrige les données analysées (V2 avec nouveaux champs)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateAndCorrectAnalysis(analysis: any): LotAnalysisResult {
  // Valider la catégorie
  const validCategory = CATEGORIES.includes(analysis.category)
    ? analysis.category
    : 'Autres';

  // Valider les prix avec fourchettes réalistes
  const originalPrice = Math.max(0.5, Math.min(100, parseFloat(analysis.original_price) || 5));
  
  // S'assurer que le prix réduit est bien 40-70% du prix original
  let discountedPrice = parseFloat(analysis.discounted_price) || originalPrice * 0.5;
  const minDiscount = originalPrice * 0.3; // 70% de réduction max
  const maxDiscount = originalPrice * 0.6; // 40% de réduction min
  discountedPrice = Math.max(minDiscount, Math.min(maxDiscount, discountedPrice));
  discountedPrice = Math.round(discountedPrice * 100) / 100; // 2 décimales

  // Valider la quantité
  const quantity = Math.max(1, Math.min(50, parseInt(analysis.quantity_total) || 1));

  // Valider le score de confiance
  const confidence = Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0.5));

  // Valider la fraîcheur
  const freshness = analysis.freshness_score 
    ? Math.max(0, Math.min(1, parseFloat(analysis.freshness_score)))
    : undefined;

  // Valider la date d'expiration (format DD/MM/YYYY)
  const expiryDate = analysis.expiry_date && /^\d{2}\/\d{2}\/\d{4}$/.test(analysis.expiry_date)
    ? analysis.expiry_date
    : undefined;

  // Valider le créneau suggéré
  const validTimeSlots = ['matin', 'midi', 'soir'];
  const suggestedTime = validTimeSlots.includes(analysis.suggested_pickup_time)
    ? analysis.suggested_pickup_time
    : undefined;

  // Valider les titres alternatifs
  const alternativeTitles = Array.isArray(analysis.alternative_titles)
    ? analysis.alternative_titles.slice(0, 3).map((t: string) => t?.slice(0, 80))
    : undefined;

  return {
    title: analysis.title?.slice(0, 100) || 'Produit alimentaire à sauver',
    description: analysis.description?.slice(0, 300) || 'Produit de qualité à sauver du gaspillage. Récupération rapide recommandée.',
    category: validCategory,
    original_price: originalPrice,
    discounted_price: discountedPrice,
    quantity_total: quantity,
    requires_cold_chain: Boolean(analysis.requires_cold_chain),
    is_urgent: Boolean(analysis.is_urgent),
    confidence: confidence,
    expiry_date: expiryDate,
    freshness_score: freshness,
    suggested_pickup_time: suggestedTime,
    alternative_titles: alternativeTitles,
  };
}

/**
 * Vérifie si la clé API Gemini est configurée
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 0);
}

/**
 * Analyse rapide pour obtenir juste un titre et une catégorie (plus rapide)
 * Utile pour une preview instantanée avant l'analyse complète
 */
export async function quickAnalyzeImage(imageFile: File): Promise<{ title: string; category: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error('Clé API Gemini non configurée');
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const imageData = await fileToBase64(imageFile);

    const prompt = `Identifie rapidement ce produit alimentaire. Réponds en JSON :
{
  "title": "Nom du produit (court, max 60 caractères)",
  "category": "Catégorie parmi : ${CATEGORIES.join(', ')}"
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: imageFile.type, data: imageData } },
    ]);

    const text = (await result.response).text();
    const parsed = parseGeminiResponse(text);
    
    return {
      title: parsed.title || 'Produit alimentaire',
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Autres',
    };
  } catch (error) {
    console.error('Erreur analyse rapide:', error);
    return { title: 'Produit alimentaire', category: 'Autres' };
  }
}

/**
 * Obtenir des statistiques d'utilisation de l'API
 */
export function getAnalysisStats() {
  const stats = {
    apiConfigured: isGeminiConfigured(),
    timeoutDuration: API_TIMEOUT / 1000, // en secondes
    supportedCategories: CATEGORIES.length,
    maxImageSize: '10MB recommandé',
    features: [
      'Détection DLC/DDM',
      'Score de fraîcheur',
      'Créneau de retrait suggéré',
      'Titres alternatifs',
      'Prix marché français',
      'Chaîne du froid auto',
    ],
  };
  return stats;
}

/**
 * Compresser une image avant analyse (optimisation)
 */
export async function compressImage(file: File, maxSizeMB = 2): Promise<File> {
  // Si l'image est déjà petite, la retourner telle quelle
  if (file.size / (1024 * 1024) <= maxSizeMB) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Réduire la taille proportionnellement
        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`🗜️ Image compressée : ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(compressed);
            } else {
              reject(new Error('Erreur de compression'));
            }
          },
          'image/jpeg',
          0.85 // Qualité 85%
        );
      };
      img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

