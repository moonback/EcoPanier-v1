import { GoogleGenerativeAI } from '@google/generative-ai';
import { categories } from './helpers';

/**
 * Service pour l'analyse d'images de produits alimentaires via Gemini 2.0 Flash
 * Extrait automatiquement les informations pertinentes pour créer un lot
 */

// Clé API Gemini (à configurer dans les variables d'environnement)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

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

    // Prompt détaillé pour l'analyse
    const prompt = `
Tu es un expert en analyse de produits alimentaires pour une plateforme anti-gaspillage alimentaire.

Analyse cette image de produit alimentaire et extrais les informations suivantes au format JSON STRICTEMENT :

{
  "title": "Nom du produit (court et descriptif, max 60 caractères)",
  "description": "Description détaillée du produit (ce qu'il contient, état, conservation, max 200 caractères)",
  "category": "Catégorie parmi : ${categories.join(', ')}",
  "original_price": Prix original estimé en euros (nombre décimal),
  "discounted_price": Prix réduit anti-gaspi estimé (30-70% du prix original, nombre décimal),
  "quantity_total": Quantité estimée (nombre d'unités visibles),
  "requires_cold_chain": true si le produit nécessite une chaîne du froid (viandes, poissons, produits laitiers, plats préparés frais, surgelés), false sinon,
  "is_urgent": true si le produit semble très périssable ou proche de la date limite, false sinon,
  "confidence": Score de confiance de 0 à 1 sur la qualité de l'analyse
}

RÈGLES IMPORTANTES :
- Si la catégorie n'est pas claire, choisis "Autres"
- Les prix doivent être réalistes pour le marché français
- Le prix réduit doit représenter 30-70% du prix original
- La quantité doit correspondre au nombre d'unités visibles ou estimées
- requires_cold_chain = true pour TOUS les produits frais/réfrigérés/surgelés
- is_urgent = true si le produit semble très mûr, pain de la veille, DLC proche, etc.
- Réponds UNIQUEMENT avec le JSON, sans markdown, sans \`\`\`json, juste le JSON brut

IMPORTANT : Ta réponse doit commencer par { et finir par } sans aucun texte avant ou après.
`;

    // Appeler l'API Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: imageData,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parser la réponse JSON
    const analysis = parseGeminiResponse(text);

    // Valider et corriger les données
    return validateAndCorrectAnalysis(analysis);
  } catch (error) {
    console.error('Erreur lors de l\'analyse avec Gemini:', error);
    throw new Error(
      'Impossible d\'analyser l\'image. Vérifiez votre connexion et votre clé API Gemini.'
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
 * Valide et corrige les données analysées
 */
function validateAndCorrectAnalysis(analysis: any): LotAnalysisResult {
  // Valider la catégorie
  const validCategory = categories.includes(analysis.category)
    ? analysis.category
    : 'Autres';

  // Valider les prix
  const originalPrice = Math.max(0, parseFloat(analysis.original_price) || 5);
  const discountedPrice = Math.max(
    0,
    Math.min(originalPrice, parseFloat(analysis.discounted_price) || originalPrice * 0.5)
  );

  // Valider la quantité
  const quantity = Math.max(1, parseInt(analysis.quantity_total) || 1);

  // Valider le score de confiance
  const confidence = Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0.5));

  return {
    title: analysis.title?.slice(0, 100) || 'Produit alimentaire',
    description: analysis.description?.slice(0, 300) || 'Produit à sauver du gaspillage',
    category: validCategory,
    original_price: originalPrice,
    discounted_price: discountedPrice,
    quantity_total: quantity,
    requires_cold_chain: Boolean(analysis.requires_cold_chain),
    is_urgent: Boolean(analysis.is_urgent),
    confidence: confidence,
  };
}

/**
 * Vérifie si la clé API Gemini est configurée
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 0);
}

