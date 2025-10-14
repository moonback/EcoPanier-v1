# 🏪 Composants Commerçants

## Vue d'ensemble

Ce dossier contient tous les composants dédiés à l'interface commerçant.

---

## 📁 Structure

### 🎛️ Dashboard principal
- **`MerchantDashboard.tsx`** : Dashboard principal avec navigation par onglets
  - Gestion des lots
  - Commandes/Réservations
  - Statistiques de vente
  - Profil

### 📦 Gestion des lots
- **`LotManagement.tsx`** : Gestion complète des lots (CRUD)
  - Création avec formulaire multi-étapes
  - Édition de lots existants
  - Suppression de lots
  - Analyse d'image avec Gemini AI
  - Upload d'images multiples

- **`QuickAddProduct.tsx`** 🆕 : Ajout rapide de produits via scan EAN13
  - Scan de code-barres
  - Récupération automatique depuis OpenFoodFacts
  - Validation partielle par le commerçant
  - Gain de temps considérable

### 📋 Réservations
- **`MerchantReservations.tsx`** : Liste et gestion des commandes
  - Filtrage par statut
  - Détails des réservations
  - Codes PIN de retrait
  - Gestion des annulations

### 📊 Statistiques
- **`SalesStats.tsx`** : Statistiques de vente
  - Nombre de lots créés
  - Chiffre d'affaires
  - Articles vendus
  - Impact environnemental (CO₂, repas sauvés)

### 🖼️ Utilitaires
- **`BusinessLogoUploader.tsx`** : Upload du logo du commerce
  - Preview en temps réel
  - Compression d'image
  - Stockage Supabase

---

## 🚀 Nouvelles fonctionnalités

### ⚡ Ajout Rapide de Produits (QuickAddProduct)

**Accès** : Bouton vert "Ajout Rapide" dans l'en-tête du dashboard

**Flux utilisateur** :
```
1. Scanner le code-barres EAN13
   └─> Interrogation de l'API OpenFoodFacts
   
2. Validation des informations
   ├─> Pré-remplissage du formulaire
   ├─> Ajustement des prix
   ├─> Configuration des horaires
   └─> Options (chaîne du froid, urgence)
   
3. Publication du lot
   └─> Disponible immédiatement
```

**Technologies utilisées** :
- OpenFoodFacts API (base de données collaborative)
- Service `openFoodFactsService.ts`
- Mapping intelligent des catégories
- Estimation automatique des prix

**Avantages** :
- ⏱️ Gain de temps : 30s vs 5min
- 📸 Image incluse automatiquement
- ✅ Données précises et vérifiées
- 💰 Prix suggérés intelligemment

**Documentation complète** : Voir `/docs/QUICK_ADD_PRODUCT.md`

---

## 🎨 Design System

### Couleurs principales
- **Primary** : Bleu (actions principales)
- **Secondary** : Violet (navigation, accents)
- **Success** : Vert (ajout rapide, succès)
- **Warning** : Orange (lots urgents)
- **Danger** : Rouge (suppression, erreurs)

### Composants UI
- **Cards** : `.card` pour les sections
- **Boutons** : `.btn-primary`, `.btn-secondary`
- **Badges** : Statuts colorés pour les lots
- **Modals** : Formulaires et confirmations

---

## 📊 État global

### AuthStore (Zustand)
```typescript
const { profile } = useAuthStore();
// profile.role === 'merchant'
// profile.business_name
// profile.business_logo_url
```

---

## 🔧 Hooks personnalisés

### `useLots()`
Gestion des lots (fetch, create, update, delete)

### `useReservations()`
Gestion des réservations

### `useProfileStats()`
Statistiques du profil commerçant

---

## 🗄️ Base de données

### Tables principales utilisées

#### `lots`
```typescript
{
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  category: string;
  original_price: number;
  discounted_price: number;
  quantity_total: number;
  quantity_reserved: number;
  quantity_sold: number;
  pickup_start: string; // ISO timestamp
  pickup_end: string; // ISO timestamp
  status: 'available' | 'reserved' | 'sold_out' | 'expired';
  image_urls: string[] | null;
  barcode: string | null; // 🆕 Code-barres EAN13
  requires_cold_chain: boolean;
  is_urgent: boolean;
}
```

#### `reservations`
```typescript
{
  id: string;
  lot_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  pickup_pin: string; // Code à 6 chiffres
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  is_donation: boolean;
}
```

---

## 🔐 Sécurité

### Protection des routes
```typescript
if (!profile || profile.role !== 'merchant') {
  return <AccessDenied />;
}
```

### Validation des données
- Vérification des prix (prix réduit < prix original)
- Validation des quantités (> 0)
- Contrôle des horaires de retrait
- Sanitization des entrées

---

## 📱 Responsive

Tous les composants sont **fully responsive** :
- Mobile-first design
- Breakpoints Tailwind (sm, md, lg, xl)
- Navigation bottom bar sur mobile
- Grids adaptatifs

---

## 🧪 Fonctionnalités avancées

### IA d'analyse d'images (Gemini)
- Upload d'une image de produit
- Analyse automatique avec Gemini 2.0 Flash
- Extraction : titre, description, catégorie, prix
- Pré-remplissage du formulaire

### Upload d'images multiples
- Jusqu'à 5 images par lot
- Compression automatique
- Stockage Supabase Storage
- Preview en temps réel

### Filtres et recherche
- Filtrage par statut
- Recherche par titre
- Tri par date/prix

---

## 🚀 Prochaines évolutions

### Phase 2
- [ ] Scanner caméra natif (WebRTC)
- [ ] Dashboard analytics avancé
- [ ] Notifications push (réservations)
- [ ] Historique des modifications

### Phase 3
- [ ] Multi-commerce (gestion de plusieurs commerces)
- [ ] Intégration calendrier (Google, Outlook)
- [ ] Export CSV des ventes
- [ ] API publique pour caisse enregistreuse

---

## 📖 Documentation

- **Architecture** : `/docs/ARCHITECTURE.md`
- **API** : `/docs/API_DOCS.md`
- **Base de données** : `/docs/DB_SCHEMA.md`
- **Ajout rapide** : `/docs/QUICK_ADD_PRODUCT.md` 🆕
- **Guide commerçant** : `/docs/GUIDE_AJOUT_RAPIDE_COMMERCANT.md` 🆕

---

## 🐛 Debugging

### Logs utiles
```typescript
console.log('Profile:', profile);
console.log('Lots:', lots);
console.log('Reservations:', reservations);
```

### Erreurs courantes

#### "Unauthorized"
→ Vérifier que l'utilisateur est bien connecté et que `profile.role === 'merchant'`

#### "Image upload failed"
→ Vérifier la configuration Supabase Storage et les permissions

#### "OpenFoodFacts API error"
→ Vérifier la connexion internet et le code-barres

---

## 📝 Conventions de code

Respectez strictement les règles définies dans `.cursorrules` :
- TypeScript obligatoire (jamais `any`)
- Gestion d'erreurs explicite
- Classes Tailwind ordonnées
- Composants < 300 lignes
- Commits conventionnels (`feat:`, `fix:`, etc.)

---

**Version** : 2.0.0 (avec QuickAddProduct)  
**Dernière mise à jour** : Janvier 2025  
**Mainteneur** : Équipe EcoPanier

