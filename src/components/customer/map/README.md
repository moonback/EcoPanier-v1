# 🗺️ Module Carte Interactive - Architecture

## 📁 Structure

```
map/
├── InteractiveMap.tsx        # Composant principal orchestrateur
├── MapView.tsx               # Vue de la carte Mapbox avec marqueurs
├── MerchantSidebar.tsx       # Sidebar avec liste des commerçants
├── MerchantCard.tsx          # Carte individuelle d'un commerçant
├── FilterPanel.tsx           # Panneau de filtres (desktop & mobile)
├── MerchantLotsView.tsx      # Vue détaillée des lots d'un commerçant
├── MapControls.tsx           # Boutons de contrôle (toggle sidebar, centrer)
├── useMerchantsData.ts       # Hook personnalisé pour charger les données
├── types.ts                  # Types TypeScript partagés
├── constants.ts              # Constantes (token Mapbox, catégories, etc.)
└── index.ts                  # Point d'export du module
```

## 🎯 Responsabilités des composants

### `InteractiveMap.tsx` (Orchestrateur - ~200 lignes)
**Rôle** : Coordonne tous les sous-composants et gère l'état global de la carte.

**État géré** :
- Position de la carte (`viewState`)
- Position utilisateur (`userLocation`)
- Commerçants sélectionnés
- UI (sidebar, filtres, modals)
- Filtres de recherche

**Responsabilités** :
- Charger la position utilisateur au montage
- Gérer les clics sur les commerçants
- Gérer les réservations
- Coordonner les interactions entre composants

### `MapView.tsx` (~100 lignes)
**Rôle** : Affiche la carte Mapbox et les marqueurs.

**Props reçues** :
- `viewState` : État de la vue carte
- `userLocation` : Position de l'utilisateur
- `merchants` : Liste des commerçants à afficher
- `selectedMerchant` : Commerçant actuellement sélectionné
- Handlers pour les interactions

**Responsabilités** :
- Afficher la carte Mapbox
- Gérer les contrôles de navigation
- Afficher le marqueur utilisateur avec animation
- Afficher les marqueurs commerçants avec états (sélectionné, urgent)

### `MerchantSidebar.tsx` (~120 lignes)
**Rôle** : Sidebar avec statistiques et liste des commerçants.

**Contenu** :
- Header avec bouton de fermeture
- Stats (nombre de commerces, lots, urgents)
- Bouton filtres avec badge
- Liste scrollable des commerçants via `MerchantCard`

**Responsabilités** :
- Afficher les statistiques en temps réel
- Gérer l'affichage des filtres
- Gérer l'état ouvert/fermé de la sidebar
- Afficher un état de chargement ou vide

### `MerchantCard.tsx` (~80 lignes)
**Rôle** : Carte individuelle d'un commerçant dans la sidebar.

**Affiche** :
- Nom du commerce
- Distance par rapport à l'utilisateur
- Badge "Urgent" si lots urgents
- Aperçu de 2 premiers lots
- Indicateur de sélection

**États visuels** :
- Normal : bordure neutre
- Sélectionné : bordure primaire + badge "Cliquez pour voir les lots"
- Urgent : icône de feu animée

### `FilterPanel.tsx` (~80 lignes)
**Rôle** : Panneau de filtres adaptatif (desktop/mobile).

**Filtres disponibles** :
- Catégorie (select desktop / grid mobile)
- Distance maximale (slider)
- Lots urgents uniquement (checkbox)

**Modes** :
- **Desktop** : Intégré dans la sidebar
- **Mobile** : Modal plein écran avec overlay

### `MerchantLotsView.tsx` (~150 lignes)
**Rôle** : Vue détaillée des lots d'un commerçant.

**Affiche** :
- Header avec retour vers la carte
- Infos du commerçant (nom, adresse, distance)
- Stats (nombre de lots, unités totales, lots urgents)
- Grille de cartes de lots
- Bouton de réservation par lot

**Caractéristiques** :
- Responsive (1-4 colonnes selon écran)
- Images avec fallback
- Badges (urgent, réduction)
- Heures de retrait

### `MapControls.tsx` (~40 lignes)
**Rôle** : Boutons de contrôle flottants.

**Contrôles** :
- Bouton "Ouvrir sidebar" (si fermée)
- Bouton "Centrer sur ma position" (si géolocalisation active)

**Positionnement** : Fixed, adaptatif selon état de la sidebar

### `useMerchantsData.ts` (~80 lignes)
**Rôle** : Hook personnalisé pour charger les données des commerçants.

**Paramètres** :
- `filters` : Filtres de recherche
- `userLocation` : Position utilisateur pour calcul de distance

**Retourne** :
- `merchants` : Liste des commerçants avec leurs lots
- `loading` : État de chargement
- `reload` : Fonction pour recharger les données

**Logique** :
1. Requête Supabase avec filtres
2. Groupement des lots par commerçant
3. Calcul des distances
4. Tri par distance
5. Filtrage par distance max

## 🔄 Flux de données

```
InteractiveMap (état global)
    ↓
    ├─→ MapView (affichage carte + marqueurs)
    │       └─→ Clic marqueur → handleMerchantClick()
    │
    ├─→ MerchantSidebar (liste)
    │       ├─→ FilterPanel (filtres)
    │       │       └─→ Change filtre → handleFiltersChange()
    │       │
    │       └─→ MerchantCard (item)
    │               └─→ Clic → handleMerchantClick()
    │
    ├─→ MapControls (boutons)
    │       ├─→ Toggle sidebar
    │       └─→ Centrer utilisateur
    │
    └─→ MerchantLotsView (si commerçant sélectionné)
            └─→ Clic lot → handleReserveLot()
                    └─→ ReservationModal
```

## 🎨 Conventions de code

### Typage strict
- Tous les types dans `types.ts`
- Pas de `any`
- Props interfaces explicites

### Ordre des imports
1. React et bibliothèques externes
2. Composants locaux
3. Hooks et utils
4. Types
5. CSS

### Ordre dans un composant
1. Props interface
2. Props destructuring
3. État local
4. Hooks personnalisés
5. useEffect
6. Handlers
7. Early returns
8. Render

### Classes Tailwind
Ordre : Layout → Spacing → Sizing → Colors → Typography → Effects

## 🔌 Intégration

### Dans CustomerDashboard
```tsx
import { InteractiveMap } from './InteractiveMap';
// ou
import { InteractiveMap } from './map';

<InteractiveMap />
```

### Dans App.tsx (routing)
```tsx
<Route path="/carte" element={<InteractiveMap />} />
```

## 📦 Dépendances

- `react-map-gl` : Wrapper React pour Mapbox
- `mapbox-gl` : Bibliothèque Mapbox
- `lucide-react` : Icônes
- `date-fns` : Formatage des dates
- `supabase` : Base de données
- Hooks personnalisés : `useAuthStore`, `useLots`
- Utils : `geocodingService`, `helpers`

## 🚀 Performances

### Optimisations appliquées
- **Chargement différé** : Les lots ne sont chargés que quand nécessaire
- **Regroupement** : Lots groupés par commerçant (évite N+1 queries)
- **Filtrage côté client** : Distance calculée côté client après requête
- **Mémoisation** : `useCallback` pour `loadMerchantsWithLots`
- **Hook custom** : Logique de chargement isolée et réutilisable

### Pistes d'amélioration futures
- [ ] Virtualisation de la liste (React Window)
- [ ] Clustering des marqueurs (Mapbox Supercluster)
- [ ] Pagination des lots
- [ ] Cache des données commerçants
- [ ] Debounce des filtres

## 🧪 Tests (à implémenter)

### Tests unitaires
- [ ] `useMerchantsData` : Logique de filtrage et tri
- [ ] `FilterPanel` : Changement des filtres
- [ ] `MerchantCard` : Affichage conditionnel

### Tests d'intégration
- [ ] Clic sur marqueur → Sélection + centrage
- [ ] Double clic sur marqueur → Ouvrir modal lots
- [ ] Réservation complète (clic lot → modal → confirmation)
- [ ] Filtres → Mise à jour liste commerçants

### Tests E2E (Playwright)
- [ ] Géolocalisation → Affichage carte centrée
- [ ] Recherche par catégorie
- [ ] Recherche par distance
- [ ] Réservation complète avec PIN

## 📚 Documentation complémentaire

- **API Mapbox** : https://docs.mapbox.com/
- **react-map-gl** : https://visgl.github.io/react-map-gl/
- **Supabase Queries** : Voir `/API_DOCS.md`
- **Types DB** : Voir `/lib/database.types.ts`
- **Schéma DB** : Voir `/DB_SCHEMA.md`

## 🐛 Dépannage

### La carte ne s'affiche pas
- Vérifier `VITE_MAPBOX_ACCESS_TOKEN` dans `.env`
- Vérifier la console pour erreurs Mapbox

### Les commerçants ne s'affichent pas
- Vérifier que les commerçants ont `latitude` et `longitude` non null
- Vérifier les filtres (distance, catégorie)
- Vérifier la requête Supabase dans la console

### La géolocalisation ne fonctionne pas
- Vérifier les permissions du navigateur
- Utiliser HTTPS (requis pour geolocation)
- Fallback sur Paris si refusé

## 🎯 Maintenance

### Pour ajouter un filtre
1. Ajouter le champ dans `MapFilters` (types.ts)
2. Ajouter dans `DEFAULT_FILTERS` (constants.ts)
3. Ajouter UI dans `FilterPanel.tsx`
4. Ajouter logique dans `useMerchantsData.ts`

### Pour ajouter un type de marqueur
1. Étendre `Profile` ou créer un nouveau type
2. Ajouter logique d'affichage dans `MapView.tsx`
3. Ajouter filtre si nécessaire

### Pour modifier le style de carte
Modifier `mapStyle` dans `MapView.tsx` :
- `streets-v12` (actuel)
- `light-v11`
- `dark-v11`
- `satellite-v9`

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Mainteneur** : Équipe EcoPanier

