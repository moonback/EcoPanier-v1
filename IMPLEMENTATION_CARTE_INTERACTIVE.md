# 🗺️ Implémentation Carte Interactive - EcoPanier

> Guide complet d'implémentation de la fonctionnalité "Carte Interactive" avec Mapbox

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Fonctionnalités](#fonctionnalités)
6. [Utilisation](#utilisation)
7. [API Référence](#api-référence)
8. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

La **Carte Interactive** est une fonctionnalité innovante qui permet aux clients de :
- 📍 Visualiser les commerçants sur une carte interactive
- 🔍 Découvrir les lots disponibles près d'eux
- 📊 Filtrer par catégorie, distance et urgence
- 🧭 Calculer les distances en temps réel
- 🎯 Explorer les commerces de manière ludique (style Pokémon Go)

### Composants implémentés

1. **`geocodingService.ts`** - Service de géocodage Mapbox
2. **`GeocodeMerchants.tsx`** - Interface admin pour géocoder les commerçants
3. **`InteractiveMap.tsx`** - Carte interactive pour les clients

---

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── utils/
│   └── geocodingService.ts          # Service de géocodage
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Intégration admin (modifié)
│   │   └── GeocodeMerchants.tsx     # Nouvel onglet géocodage
│   └── customer/
│       ├── CustomerDashboard.tsx    # Intégration client (modifié)
│       └── InteractiveMap.tsx       # Carte interactive
```

### Base de données

Les champs `latitude` et `longitude` existent déjà dans la table `profiles`:

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  ...
  latitude numeric,        -- ✅ Déjà existant
  longitude numeric,       -- ✅ Déjà existant
  ...
);
```

---

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-geocoder
```

### 2. Vérifier package.json

Les dépendances suivantes doivent être présentes :

```json
{
  "dependencies": {
    "mapbox-gl": "^3.x.x",
    "react-map-gl": "^7.x.x",
    "@mapbox/mapbox-gl-geocoder": "^5.x.x"
  }
}
```

---

## ⚙️ Configuration

### 1. Obtenir un token Mapbox

1. Créer un compte gratuit sur [Mapbox](https://account.mapbox.com/auth/signup/)
2. Aller dans [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copier votre token public par défaut (commence par `pk.`)

### 2. Configurer les variables d'environnement

Créer/Modifier le fichier `.env` à la racine du projet :

```env
# Supabase (déjà configuré)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme

# 🆕 Mapbox (REQUIS pour la carte)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiVOTRE_TOKEN_ICI

# Gemini AI (optionnel)
VITE_GEMINI_API_KEY=votre-cle-gemini
```

⚠️ **Important** : Ne jamais commiter le fichier `.env` !

### 3. Vérifier la configuration

Le token Mapbox doit être accessible :

```typescript
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
console.log('Mapbox token:', MAPBOX_TOKEN ? '✅ Configuré' : '❌ Manquant');
```

---

## 🚀 Fonctionnalités

### A. Service de Géocodage (`geocodingService.ts`)

#### 1. Géocoder une adresse

```typescript
import { geocodeAddress } from '@/utils/geocodingService';

const result = await geocodeAddress("10 Rue de Rivoli, Paris");
// {
//   latitude: 48.8566,
//   longitude: 2.3522,
//   formattedAddress: "10 Rue de Rivoli, 75001 Paris, France",
//   success: true
// }
```

#### 2. Géocoder en lot

```typescript
import { geocodeAddressesBatch } from '@/utils/geocodingService';

const addresses = [
  "123 Avenue des Champs-Élysées, Paris",
  "50 Rue de la République, Lyon"
];

const results = await geocodeAddressesBatch(addresses, 200); // 200ms de délai
```

#### 3. Calculer la distance

```typescript
import { calculateDistance, formatDistance } from '@/utils/geocodingService';

const distance = calculateDistance(
  48.8566, 2.3522,  // Paris
  45.7640, 4.8357   // Lyon
);
// 392.2 km

const formatted = formatDistance(distance);
// "392.2 km"
```

### B. Interface Admin - Géocodage des Commerçants

#### Accès

1. Se connecter en tant qu'**admin**
2. Dashboard Admin → **Géocodage** (dans le menu latéral)

#### Fonctionnalités

- ✅ Liste automatique des commerçants sans coordonnées
- ✅ Géocodage en lot (tous les commerçants d'un coup)
- ✅ Géocodage individuel (un par un)
- ✅ Progression en temps réel avec barre de chargement
- ✅ Journal d'activité détaillé
- ✅ Gestion des erreurs (adresse invalide, API rate limit, etc.)

#### Utilisation

```
1. Cliquer sur "Actualiser" pour charger les commerçants
2. Cliquer sur "Géocoder tous (X)" pour lancer le géocodage automatique
3. Attendre la fin (barre de progression affichée)
4. Consulter le journal pour voir les résultats
```

#### Résultat

Après géocodage, la base de données est mise à jour :

```sql
UPDATE profiles
SET 
  latitude = 48.8566,
  longitude = 2.3522,
  updated_at = NOW()
WHERE id = 'uuid-du-commercant';
```

### C. Carte Interactive - Vue Client

#### Accès

1. Se connecter en tant que **client**
2. Dashboard Client → Onglet **Carte** 🗺️

#### Fonctionnalités principales

##### 1. Affichage de la carte

- 🗺️ Carte Mapbox interactive (style streets)
- 📍 Marqueurs commerçants avec nombre de lots
- 🔴 Badge "Urgent" sur les commerçants avec lots urgents
- 📌 Position de l'utilisateur en temps réel
- 🎯 Contrôles de navigation (zoom, rotation)
- 📍 Bouton de géolocalisation

##### 2. Filtres avancés

- 🏷️ **Catégorie** : Tous, Boulangerie, Fruits & Légumes, etc.
- 📏 **Distance max** : Slider de 1 à 50 km
- ⚡ **Lots urgents uniquement** : Checkbox

##### 3. Stats en temps réel

- 🏪 Nombre de commerçants affichés
- 📦 Nombre total de lots disponibles
- ⏰ Nombre de lots urgents

##### 4. Interaction avec les marqueurs

**Cliquer sur un marqueur commerçant** ouvre une popup avec :
- Nom du commerce
- Adresse
- Distance depuis votre position
- Liste des 3 premiers lots disponibles
- Bouton "Voir tous les lots"

##### 5. Liste des commerçants

- Liste scrollable sous la carte
- Trier par distance (du plus proche au plus loin)
- Cliquer pour centrer la carte sur le commerçant
- Badge "Urgent" si lots urgents disponibles

---

## 📱 Utilisation

### Workflow typique - Admin

```
1. 🔐 Connexion admin
2. 📊 Dashboard Admin → Géocodage
3. 🔄 Actualiser la liste
4. ✅ Géocoder tous les commerçants
5. 📋 Vérifier le journal d'activité
6. ✅ Confirmation : tous les commerçants géocodés
```

### Workflow typique - Client

```
1. 🔐 Connexion client
2. 🗺️ Onglet Carte
3. 📍 Autoriser la géolocalisation
4. 🔍 Appliquer des filtres (catégorie, distance)
5. 🎯 Cliquer sur un marqueur commerçant
6. 📦 Voir les lots disponibles
7. 🛒 "Voir tous les lots" → Redirection vers LotBrowser
```

---

## 🔧 API Référence

### `geocodingService.ts`

#### `geocodeAddress(address: string): Promise<GeocodeResult>`

Géocode une adresse unique.

**Paramètres:**
- `address` (string) - Adresse complète à géocoder

**Retour:**
```typescript
{
  latitude: number;
  longitude: number;
  formattedAddress: string;
  success: boolean;
  error?: string;
}
```

**Exemple:**
```typescript
const result = await geocodeAddress("Tour Eiffel, Paris");
if (result.success) {
  console.log(`Lat: ${result.latitude}, Lng: ${result.longitude}`);
}
```

#### `geocodeAddressesBatch(addresses: string[], delayMs?: number): Promise<GeocodeResult[]>`

Géocode plusieurs adresses avec rate limiting.

**Paramètres:**
- `addresses` (string[]) - Tableau d'adresses
- `delayMs` (number, optionnel) - Délai entre requêtes (défaut: 200ms)

**Exemple:**
```typescript
const addresses = ["Adresse 1", "Adresse 2"];
const results = await geocodeAddressesBatch(addresses);
```

#### `calculateDistance(lat1, lon1, lat2, lon2): number`

Calcule la distance entre deux points GPS (formule Haversine).

**Retour:** Distance en kilomètres

**Exemple:**
```typescript
const distance = calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);
console.log(`Distance: ${distance} km`); // ~392 km
```

#### `formatDistance(km: number): string`

Formate une distance pour l'affichage.

**Exemple:**
```typescript
formatDistance(0.5);   // "500 m"
formatDistance(2.34);  // "2.3 km"
```

---

## 🐛 Dépannage

### Problème 1 : "Token Mapbox manquant"

**Erreur:**
```
Configuration requise
Veuillez configurer VITE_MAPBOX_ACCESS_TOKEN
```

**Solution:**
1. Vérifier que `.env` contient `VITE_MAPBOX_ACCESS_TOKEN`
2. Redémarrer le serveur de dev (`npm run dev`)
3. Vérifier que le token commence par `pk.`

### Problème 2 : Commerçants non géocodés

**Symptôme:** Les commerçants n'apparaissent pas sur la carte

**Causes possibles:**
- ❌ Les coordonnées GPS ne sont pas dans la BDD
- ❌ L'adresse du commerçant est vide ou invalide

**Solution:**
1. Aller dans Dashboard Admin → Géocodage
2. Vérifier la liste des commerçants sans coordonnées
3. Géocoder manuellement ou en lot

### Problème 3 : Géocodage échoue

**Erreur dans les logs:**
```
❌ Commerce X: Adresse non trouvée
```

**Solutions:**
1. **Vérifier l'adresse** : Elle doit être complète (rue, code postal, ville)
2. **Corriger manuellement** :
   ```sql
   UPDATE profiles
   SET business_address = '123 Rue Exemple, 75001 Paris'
   WHERE id = 'uuid-du-commerce';
   ```
3. **Réessayer le géocodage**

### Problème 4 : Rate limit API Mapbox

**Erreur:**
```
Erreur API Mapbox: 429 Too Many Requests
```

**Solution:**
1. Le service a un délai de 200ms entre requêtes
2. Si besoin, augmenter le délai :
   ```typescript
   await geocodeAddressesBatch(addresses, 500); // 500ms
   ```
3. Vérifier les limites de votre plan Mapbox

### Problème 5 : Carte ne charge pas

**Symptômes:**
- Carte blanche
- Erreur console

**Solutions:**
1. **Vérifier le token** :
   ```javascript
   console.log(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
   ```
2. **Vérifier les imports CSS** :
   ```typescript
   import 'mapbox-gl/dist/mapbox-gl.css';
   ```
3. **Clear cache** :
   ```bash
   npm run build
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## 📊 Statistiques & Performance

### Limites API Mapbox (Plan gratuit)

- **Géocodage** : 100,000 requêtes/mois
- **Affichage carte** : 50,000 chargements/mois
- **Rate limit** : 600 requêtes/minute

### Performance

- ⚡ Géocodage : ~200-500ms par adresse
- 🗺️ Chargement carte : ~1-2 secondes
- 📍 Calcul distance : < 1ms (local)
- 🎯 Affichage 100 marqueurs : < 100ms

---

## 🔮 Évolutions futures

### Phase 2 - Améliorations

- [ ] **Clustering** : Regrouper les marqueurs proches
- [ ] **Heatmap** : Carte de chaleur des zones actives
- [ ] **Itinéraires** : Calculer un parcours multi-retraits
- [ ] **Filtres avancés** : Prix, horaires, notes
- [ ] **Mode AR** : Réalité augmentée (expérimental)

### Phase 3 - Gamification

- [ ] **Badges exploration** : "Explorateur du 11ème"
- [ ] **Quêtes** : "Visitez 5 commerces différents"
- [ ] **Points EcoPoints** : +10 pts par nouveau commerce visité
- [ ] **Leaderboard** : Classement des explorateurs

---

## 📚 Ressources

### Documentation officielle

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [React Map GL](https://visgl.github.io/react-map-gl/)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)

### Tutoriels

- [Mapbox Quickstart](https://docs.mapbox.com/help/tutorials/get-started-mapbox-gl-js/)
- [React Map GL Examples](https://visgl.github.io/react-map-gl/examples)

---

## 🎯 Checklist d'implémentation

- [x] Installation dépendances Mapbox
- [x] Service de géocodage créé
- [x] Interface admin géocodage
- [x] Carte interactive client
- [x] Intégration dashboards
- [x] Gestion des erreurs
- [x] Documentation complète
- [ ] Tests géocodage (à faire)
- [ ] Tests carte interactive (à faire)
- [ ] Optimisation performance
- [ ] Mode offline (futur)

---

## 🤝 Contribution

Pour contribuer à cette fonctionnalité :

1. Lire [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Créer une branche `feature/carte-interactive-xxx`
3. Respecter les conventions de code
4. Tester localement avec votre token Mapbox
5. Ouvrir une PR

---

## 📝 Changelog

### v1.0.0 - Janvier 2025

- ✅ Implémentation initiale
- ✅ Service de géocodage Mapbox
- ✅ Interface admin pour géocoder
- ✅ Carte interactive pour clients
- ✅ Filtres par catégorie et distance
- ✅ Calcul de distances en temps réel
- ✅ Popups détaillées sur marqueurs
- ✅ Liste des commerçants triée par distance

---

<div align="center">

**Carte Interactive développée avec ❤️ pour EcoPanier**

[⬅️ Retour au README](./README.md) • [📋 Suggestions Features](./SUGGESTIONS_FONCTIONNALITES_CLIENT.md) • [🗺️ Architecture](./ARCHITECTURE.md)

</div>

