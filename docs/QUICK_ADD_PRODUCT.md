# 📱 Ajout Rapide de Produits via Scan EAN13

## 🎯 Vue d'ensemble

La fonctionnalité **Ajout Rapide de Produits** permet aux commerçants d'ajouter rapidement des lots à la plateforme en scannant simplement le code-barres EAN13 d'un produit. Les informations sont automatiquement récupérées depuis la base de données collaborative **OpenFoodFacts**.

---

## 🚀 Fonctionnalités

### 1. **Scan de code-barres EAN13**
- Saisie manuelle du code-barres
- Scanner intégré (à venir)
- Validation instantanée

### 2. **Récupération automatique des données**
Source : **OpenFoodFacts API** (https://world.openfoodfacts.org)

Données récupérées :
- ✅ Nom du produit
- ✅ Marque
- ✅ Catégorie
- ✅ Image du produit
- ✅ Quantité/Volume
- ✅ Ingrédients
- ✅ Nutriscore (si disponible)
- ✅ Éco-score (si disponible)

### 3. **Mapping intelligent des catégories**
Conversion automatique des catégories OpenFoodFacts vers les catégories EcoPanier :
- Boulangerie
- Fruits & Légumes
- Viandes & Poissons
- Produits laitiers
- Plats cuisinés
- Boissons
- Épicerie
- Snacks & Desserts
- Autre

### 4. **Estimation des prix**
Suggestion automatique basée sur :
- Catégorie du produit
- Quantité/Volume
- Prix de base par catégorie
- Réduction typique de 60%

### 5. **Validation par le commerçant**
Le commerçant peut ajuster :
- Titre du lot
- Description
- Catégorie
- Prix original
- Prix réduit
- Quantité disponible
- Horaires de retrait
- Options (chaîne du froid, urgence)
- Images supplémentaires

---

## 📍 Accès

### Pour les commerçants

**Depuis le dashboard :**
- Bouton "Ajout Rapide" (⚡) dans l'en-tête
- Couleur : Vert
- Position : À gauche du bouton "Station Retrait"

**URL directe :**
```
/quick-add-product
```

---

## 🔄 Flux utilisateur

### Étape 1 : Scanner le code-barres
```
1. Le commerçant clique sur "Ajout Rapide"
2. Saisit le code-barres EAN13 (ex: 3017620425035)
3. Clique sur "Scanner le produit"
4. L'API OpenFoodFacts est interrogée
```

### Étape 2 : Validation des données
```
1. Affichage des informations récupérées
2. Pré-remplissage du formulaire
3. Le commerçant ajuste les informations :
   - Prix suggérés
   - Quantité disponible
   - Horaires de retrait
   - Options spécifiques
4. Validation finale
```

### Étape 3 : Publication
```
1. Le lot est créé avec le code-barres
2. Disponible immédiatement pour les clients
3. Retour au dashboard
```

---

## 💾 Structure de données

### Nouveau champ dans la table `lots`

```sql
ALTER TABLE lots
ADD COLUMN barcode VARCHAR(20);

CREATE INDEX idx_lots_barcode ON lots(barcode);
```

### Type TypeScript mis à jour

```typescript
lots: {
  Row: {
    // ... autres champs
    barcode: string | null;
  };
  Insert: {
    // ... autres champs
    barcode?: string | null;
  };
}
```

---

## 🔧 Architecture technique

### Nouveau service : `openFoodFactsService.ts`

**Localisation :** `src/utils/openFoodFactsService.ts`

**Fonctions principales :**

#### `fetchProductByBarcode(barcode: string)`
Récupère les données d'un produit depuis OpenFoodFacts.

```typescript
const result = await fetchProductByBarcode('3017620425035');
// result.success: boolean
// result.product: OpenFoodFactsProduct | undefined
// result.error: string | undefined
```

#### `mapOpenFoodFactsCategory(offCategories: string)`
Mappe les catégories OpenFoodFacts vers les catégories EcoPanier.

```typescript
const category = mapOpenFoodFactsCategory('fr:pains');
// Retourne: 'Boulangerie'
```

#### `estimatePrice(category: string, quantity?: string)`
Estime le prix original et le prix réduit.

```typescript
const prices = estimatePrice('Boulangerie', '500g');
// prices.original: 8.00
// prices.discounted: 3.20 (réduction de 60%)
```

---

### Nouveau composant : `QuickAddProduct.tsx`

**Localisation :** `src/components/merchant/QuickAddProduct.tsx`

**Structure :**
- État `scan` : Scanner/saisir le code-barres
- État `validate` : Valider et ajuster les informations

**Protections :**
- Vérification du rôle (merchant uniquement)
- Validation des champs obligatoires
- Gestion des erreurs OpenFoodFacts

---

## 🎨 Design

### Bouton "Ajout Rapide" dans le dashboard

```tsx
<Link
  to="/quick-add-product"
  className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl"
>
  <Zap size={18} className="inline mr-2" />
  Ajout Rapide
</Link>
```

### Page de scan
- Icône : Scan (Lucide React)
- Couleur principale : Secondary (violet)
- Champ de saisie centré
- Message d'erreur contextualisé
- Info OpenFoodFacts en bas

### Page de validation
- Aperçu du produit scanné (image + infos)
- Formulaire complet pré-rempli
- Options avancées (chaîne du froid, urgence)
- Boutons "Annuler" et "Valider"

---

## 🔍 Gestion d'erreurs

### Produit non trouvé
```
❌ "Produit non trouvé dans la base OpenFoodFacts"

Solution :
- Vérifier le code-barres
- Ajouter le produit sur openfoodfacts.org
- Créer le lot manuellement
```

### Code-barres invalide
```
❌ "Code-barres invalide"

Solution :
- Vérifier que le code a au moins 8 caractères
- Utiliser un code EAN13 valide
```

### Erreur réseau
```
❌ "Erreur lors de la récupération des données"

Solution :
- Vérifier la connexion internet
- Réessayer dans quelques instants
```

---

## 📊 Avantages

### Pour les commerçants
✅ **Gain de temps** : Ajout en 30 secondes vs 5 minutes
✅ **Données précises** : Informations vérifiées et complètes
✅ **Moins d'erreurs** : Pré-remplissage automatique
✅ **Photos incluses** : Image du produit automatiquement ajoutée

### Pour la plateforme
✅ **Qualité des données** : Informations standardisées
✅ **Base de connaissances** : Liens vers OpenFoodFacts
✅ **Traçabilité** : Code-barres stocké pour référence
✅ **Analytics** : Suivi des produits les plus ajoutés

---

## 🛠️ Configuration requise

### API OpenFoodFacts
- **Aucune clé API nécessaire** (API publique)
- Rate limit : Raisonnable (pas de limite stricte)
- User-Agent : `EcoPanier - Anti-Gaspillage App`

### Navigateur
- Support moderne (ES2020+)
- Connexion internet active
- JavaScript activé

---

## 🔮 Évolutions futures

### Phase 2 (à venir)
- [ ] Scanner de caméra natif (accès webcam)
- [ ] Support des codes QR
- [ ] Ajout en masse (plusieurs produits d'un coup)
- [ ] Historique des scans
- [ ] Produits favoris/récurrents

### Phase 3 (moyen terme)
- [ ] Scanner avec l'application mobile
- [ ] Import depuis une photo
- [ ] Reconnaissance d'image sans code-barres (Gemini Vision)
- [ ] Suggestions intelligentes de prix

---

## 📖 Références

### OpenFoodFacts
- Site : https://world.openfoodfacts.org
- API Docs : https://wiki.openfoodfacts.org/API
- Base collaborative : Plus de 2,5 millions de produits

### Code source
- Service : `src/utils/openFoodFactsService.ts`
- Composant : `src/components/merchant/QuickAddProduct.tsx`
- Migration : `supabase/migrations/20250117_add_barcode_to_lots.sql`
- Types : `src/lib/database.types.ts`

---

## 🐛 Dépannage

### Le bouton "Ajout Rapide" n'apparaît pas
- Vérifier que vous êtes connecté en tant que commerçant
- Rafraîchir la page

### L'API OpenFoodFacts ne répond pas
- Vérifier votre connexion internet
- Essayer un autre code-barres
- Vérifier le statut : https://status.openfoodfacts.org

### Le produit scanné a des données incomplètes
- Les données viennent de la communauté OpenFoodFacts
- Vous pouvez compléter manuellement
- Contribuer sur openfoodfacts.org pour améliorer la base

---

## 📝 Notes importantes

⚠️ **OpenFoodFacts** est une base de données collaborative. La qualité et la complétude des données dépendent des contributions de la communauté.

✅ **Validation obligatoire** : Le commerçant doit toujours valider et ajuster les informations avant publication.

💡 **Astuce** : Encouragez vos commerçants à ajouter les produits manquants sur OpenFoodFacts pour enrichir la base.

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Équipe EcoPanier  
**Status** : ✅ Production Ready

