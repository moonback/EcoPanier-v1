# Configuration de l'Analyse IA avec Gemini 2.0 Flash

## 📋 Vue d'ensemble

EcoPanier intègre l'API Gemini 2.0 Flash de Google pour analyser automatiquement les images de produits alimentaires et remplir intelligemment les champs du formulaire de création de lots.

## ✨ Fonctionnalités

L'analyse IA peut extraire automatiquement :
- **Titre** : Nom court et descriptif du produit
- **Description** : Description détaillée (composition, état, conservation)
- **Catégorie** : Classification automatique parmi les catégories disponibles
- **Prix original** : Estimation du prix de vente normal
- **Prix réduit** : Prix anti-gaspi (30-70% du prix original)
- **Quantité** : Nombre d'unités estimées
- **Chaîne du froid** : Détection si le produit nécessite réfrigération
- **Urgence** : Détection si le produit est très périssable

## 🚀 Configuration

### 1. Obtenir une clé API Gemini

1. Rendez-vous sur [Google AI Studio](https://ai.google.dev/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Get API Key" dans le menu latéral
4. Créez une nouvelle clé API (gratuit pour l'usage personnel)
5. Copiez votre clé API

### 2. Configurer la variable d'environnement

Créez un fichier `.env` à la racine du projet (s'il n'existe pas déjà) :

```bash
# Fichier .env

# Configuration Supabase (déjà existante)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase

# Configuration Gemini AI
VITE_GEMINI_API_KEY=votre_cle_gemini_ici
```

### 3. Redémarrer le serveur de développement

```bash
npm run dev
```

## 📖 Utilisation

### Pour les commerçants

1. Cliquez sur **"Nouveau Lot"** dans la section "Gestion des Lots"
2. Dans le formulaire, vous verrez une section **"🤖 Analyse Intelligente par IA"**
3. Cliquez sur **"Analyser une image avec l'IA"**
4. Sélectionnez une photo claire de votre produit alimentaire
5. Attendez quelques secondes pendant l'analyse
6. ✅ Tous les champs sont remplis automatiquement !
7. Vérifiez et ajustez si nécessaire (un score de confiance est affiché)
8. Complétez les horaires de retrait
9. Enregistrez le lot

### Conseils pour de meilleures analyses

- 📸 **Photo claire** : Prenez une photo nette et bien éclairée
- 🎯 **Produit visible** : Le produit doit être clairement identifiable
- 🏷️ **Étiquettes lisibles** : Si possible, montrez les étiquettes/packaging
- 📦 **Vue d'ensemble** : Montrez le produit dans son ensemble
- ❌ **Évitez** : Photos floues, sombres ou avec plusieurs produits mélangés

## 🔧 Détails techniques

### Modèle utilisé
- **Gemini 2.0 Flash Experimental** : Modèle multimodal optimisé pour la vision et le texte
- Analyse rapide (généralement < 3 secondes)
- Haute précision pour l'identification de produits alimentaires

### Processus d'analyse

1. **Upload de l'image** : Conversion en base64
2. **Envoi à Gemini** : Prompt détaillé avec instructions spécifiques
3. **Extraction JSON** : Parsing des informations structurées
4. **Validation** : Vérification et correction des données
5. **Pré-remplissage** : Application au formulaire

### Structure de la réponse

```typescript
interface LotAnalysisResult {
  title: string;              // Titre du produit
  description: string;        // Description détaillée
  category: string;           // Catégorie (validée)
  original_price: number;     // Prix original estimé (€)
  discounted_price: number;   // Prix réduit estimé (€)
  quantity_total: number;     // Quantité estimée
  requires_cold_chain: boolean; // Nécessite chaîne du froid ?
  is_urgent: boolean;         // Produit urgent ?
  confidence: number;         // Score de confiance (0-1)
}
```

### Code source

- **Service** : `src/utils/geminiService.ts`
- **Composant** : `src/components/merchant/LotManagement.tsx`
- **Package** : `@google/generative-ai`

## 💡 Limitations et considérations

### Quotas gratuits (Google AI Studio)
- **60 requêtes par minute**
- **1500 requêtes par jour**
- Suffisant pour un usage normal d'un commerçant

### Précision
- Le score de confiance indique la fiabilité de l'analyse
- **< 70%** : Vérifiez attentivement les informations
- **≥ 70%** : Analyse généralement fiable
- **≥ 90%** : Analyse très précise

### Gestion d'erreurs

Le système gère automatiquement :
- ❌ Clé API manquante ou invalide
- ❌ Image non valide ou trop volumineuse
- ❌ Erreur réseau ou timeout
- ❌ Réponse Gemini malformée

Des messages d'erreur clairs sont affichés à l'utilisateur.

## 🔐 Sécurité

⚠️ **Important** : 
- Ne partagez JAMAIS votre clé API publiquement
- Ne committez JAMAIS le fichier `.env` dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Pour la production, utilisez les variables d'environnement de votre hébergeur

## 🆘 Dépannage

### Erreur "Clé API non configurée"
➡️ Vérifiez que `VITE_GEMINI_API_KEY` est bien dans votre fichier `.env`

### Erreur "Invalid API key"
➡️ Vérifiez que votre clé API est correcte et active sur Google AI Studio

### Analyse très longue (> 10 secondes)
➡️ Vérifiez votre connexion internet ou réessayez

### Résultats incohérents
➡️ Essayez avec une photo plus claire du produit

### L'icône "Analyser une image" n'apparaît pas
➡️ Cette fonctionnalité est uniquement disponible lors de la **création** d'un nouveau lot (pas en édition)

## 📚 Ressources

- [Documentation Gemini API](https://ai.google.dev/docs)
- [Google AI Studio](https://ai.google.dev/)
- [Package @google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini 2.0 Flash Features](https://ai.google.dev/gemini-api/docs/models/gemini-v2)

## 🎯 Améliorations futures

- [ ] Support de plusieurs images pour analyse plus précise
- [ ] Détection de dates de péremption (OCR)
- [ ] Suggestions de prix basées sur l'historique
- [ ] Analyse batch (plusieurs produits d'un coup)
- [ ] Historique des analyses pour apprentissage

---

**Version** : 1.0.0
**Dernière mise à jour** : Janvier 2025

