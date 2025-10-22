# 🎨 Refonte du Dashboard Client - Documentation

## 📋 Vue d'ensemble

Cette refonte transforme l'interface client en un **dashboard moderne orienté widgets** avec une architecture modulaire et une UX optimisée.

---

## 🏗️ Architecture

### Structure des Fichiers

```
src/components/customer/
├── CustomerDashboard.tsx              # Container principal avec navigation
├── CustomerImpactStats.tsx            # Widget statistiques d'impact
├── CustomerActiveReservation.tsx      # Widget réservation active + QR Code
├── CustomerActions.tsx                # Widget actions rapides (CTA)
├── CustomerReservationHistory.tsx     # Widget historique récent
├── LotBrowser.tsx                     # Page parcourir les lots (existant)
├── ReservationsList.tsx               # Page liste réservations (existant)
├── ImpactDashboard.tsx                # Page impact complet (existant)
├── InteractiveMap.tsx                 # Page carte interactive (existant)
└── components/                        # Composants réutilisables
```

---

## 🎯 Layout Principal

Le dashboard utilise un layout **CSS Grid responsive** :

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Widget 1 : lg:col-span-3 (100% largeur) */}
  {/* Widget 2 : lg:col-span-2 (66% largeur) */}
  {/* Widget 3 : lg:col-span-1 (33% largeur) */}
  {/* Widget 4 : lg:col-span-3 (100% largeur) */}
</div>
```

### Breakpoints

- **Mobile** (`< 1024px`) : 1 colonne (empilé verticalement)
- **Desktop** (`≥ 1024px`) : 3 colonnes avec répartition optimisée

---

## 📦 Widgets

### 1. CustomerActiveReservation

**Objectif** : Afficher la réservation en cours (pending/confirmed)

**Fonctionnalités** :
- ✅ Détection automatique de la réservation active
- ✅ Affichage du QR Code (200x200px, niveau de correction H)
- ✅ Code PIN en gros caractères avec tracking espacé
- ✅ Informations commerçant (nom, adresse, horaires)
- ✅ Distinction paniers normaux / paniers suspendus
- ✅ CTA "Trouver un panier" si aucune réservation
- ✅ Loading skeleton avec animation pulse

**Props** :
```typescript
interface CustomerActiveReservationProps {
  onNavigateToBrowse: () => void;
}
```

**États** :
- `loading` : Skeleton loader
- `error` : Message d'erreur
- `no active reservation` : CTA pour trouver un panier
- `active reservation` : Affichage complet avec QR Code

**Données Supabase** :
```sql
SELECT 
  *,
  lots(*, profiles(business_name, business_address))
FROM reservations
WHERE user_id = ${userId}
  AND status IN ('pending', 'confirmed')
ORDER BY created_at DESC
LIMIT 1
```

---

### 2. CustomerImpactStats

**Objectif** : Afficher les statistiques d'impact personnel

**Fonctionnalités** :
- ✅ 4 statistiques en grille 2x2 :
  - 🍽️ Repas Sauvés (success green)
  - 🌱 CO₂ Évité (primary blue)
  - 💰 Économies (warning orange)
  - ❤️ Dons Solidaires (accent red)
- ✅ Icônes Lucide React avec dégradés
- ✅ Badge "🔥 Actif !" si repas > 0
- ✅ Message motivationnel dynamique
- ✅ Hover effects pour interactivité

**Calculs** :
```typescript
// Formule CO₂ (ADEME 2024)
const co2Saved = mealsSaved * 2.5; // kg CO₂ par repas

// Données depuis impact_metrics table
meals_saved, money_saved, donations_made
```

**Design Pattern** :
- Cartes colorées avec bordures thématiques
- Icônes dans cercles avec gradients
- Texte en gros (text-2xl) pour les valeurs
- Labels descriptifs en petit (text-sm)

---

### 3. CustomerActions

**Objectif** : Actions rapides et navigation intuitive

**Fonctionnalités** :
- ✅ 4 boutons CTA prioritaires :
  1. **Trouver un panier** (primary, animé)
  2. Voir la carte (secondary)
  3. Mes réservations (secondary)
  4. Mon impact complet (secondary)
- ✅ Icônes + emojis pour meilleure lisibilité
- ✅ Descriptions courtes sous chaque action
- ✅ Hover effects avec scale sur emojis
- ✅ Message motivationnel en bas

**Props** :
```typescript
interface CustomerActionsProps {
  onNavigateToMap: () => void;
  onNavigateToReservations: () => void;
  onNavigateToImpact: () => void;
  onNavigateToBrowse: () => void;
}
```

**Design** :
- Action principale : Gradient primary avec texte blanc
- Actions secondaires : Fond blanc avec bordures
- Animation pulse-soft sur le premier bouton
- Emoji scale au hover pour feedback visuel

---

### 4. CustomerReservationHistory

**Objectif** : Afficher les 3 dernières réservations terminées/annulées

**Fonctionnalités** :
- ✅ Liste des 3 réservations récentes (completed/cancelled)
- ✅ Badges de statut avec icônes (CheckCircle, XCircle)
- ✅ Informations : commerçant, date, prix, type
- ✅ Bouton "Voir détails" ouvre modal QRCodeModal
- ✅ Indicateur "+X autres" si plus de 3 réservations
- ✅ CTA "Voir tout l'historique" en bas
- ✅ Support paniers suspendus (icône ❤️)

**États** :
- `loading` : Skeleton avec 3 lignes
- `error` : Message d'erreur
- `no history` : Message encourageant
- `with history` : Liste des réservations

**Données** :
```typescript
const historyReservations = reservations
  .filter(r => r.status === 'completed' || r.status === 'cancelled')
  .slice(0, 3);
```

---

## 🎨 Palette de Couleurs

### Widgets

| Widget | Couleur Principale | Usage |
|--------|-------------------|-------|
| **ActiveReservation** | primary (Bleu) | Réservation en cours |
| **ImpactStats** | success (Vert) | Impact écologique |
| **Actions** | success + primary | Gradients dynamiques |
| **History** | gray | Neutre pour historique |

### Statistiques d'Impact

| Stat | Couleur | Classes |
|------|---------|---------|
| Repas Sauvés | success-500/600 | `bg-success-50 border-success-200 text-success-700` |
| CO₂ Évité | primary-500/600 | `bg-primary-50 border-primary-200 text-primary-700` |
| Économies | warning-500/600 | `bg-warning-50 border-warning-200 text-warning-700` |
| Dons | accent-500/600 | `bg-accent-50 border-accent-200 text-accent-700` |

---

## 🔄 Navigation

### Onglets

Le dashboard utilise un système d'onglets avec navigation en bas :

```typescript
type TabId = 'home' | 'browse' | 'map' | 'reservations' | 'impact' | 'profile';

const tabs = [
  { id: 'home', label: 'Accueil', icon: ShoppingBag, emoji: '🏠' },
  { id: 'map', label: 'Carte', icon: MapPin, emoji: '🗺️' },
  { id: 'reservations', label: 'Mes paniers', icon: History, emoji: '📦' },
  { id: 'impact', label: 'Mon impact', icon: TrendingUp, emoji: '🌍' },
  { id: 'profile', label: 'Profil', icon: User, emoji: '👤' },
];
```

### Flow de Navigation

```
Accueil (Home)
  ├─> Trouver un panier → Browse
  ├─> Voir la carte → Map
  ├─> Mes réservations → Reservations
  └─> Mon impact complet → Impact
```

---

## 📊 Hooks Utilisés

### useReservations

```typescript
const { reservations, loading, error, refetch, cancelReservation } = useReservations(userId);
```

**Utilisation** :
- `CustomerActiveReservation` : Pour trouver la réservation active
- `CustomerReservationHistory` : Pour l'historique

### useImpactMetrics

```typescript
const { metrics, loading, error, refetch } = useImpactMetrics(userId);
```

**Utilisation** :
- `CustomerImpactStats` : Pour toutes les statistiques

### useAuthStore

```typescript
const { profile } = useAuthStore();
```

**Utilisation** : Tous les widgets pour obtenir l'ID utilisateur

---

## 🎭 États de Chargement

### Pattern Standard

Tous les widgets suivent le même pattern :

```typescript
// 1. Loading State
if (loading) {
  return <SkeletonLoader />;
}

// 2. Error State
if (error) {
  return <ErrorMessage error={error} />;
}

// 3. Empty State
if (data.length === 0) {
  return <EmptyStateWithCTA />;
}

// 4. Success State
return <WidgetContent data={data} />;
```

---

## ♿ Accessibilité

### ARIA Labels

```tsx
<button aria-label="Voir les détails">
<button aria-current={isActive ? 'page' : undefined}>
```

### Keyboard Navigation

- ✅ Tous les boutons sont focusables
- ✅ Navigation au clavier dans les onglets
- ✅ Modales fermables avec Escape

### Contraste

- ✅ Ratio de contraste WCAG AA respecté
- ✅ Texte minimum 14px (font-light)
- ✅ Couleurs accessibles pour daltoniens

---

## 📱 Responsive Design

### Mobile First

```tsx
className="
  flex flex-col          // Mobile: colonne
  gap-4                  // Mobile: petit espacement
  p-4                    // Mobile: petit padding
  md:gap-6              // Tablette: espacement moyen
  md:p-6                // Tablette: padding moyen
  lg:flex-row           // Desktop: ligne
"
```

### Grille Adaptive

```tsx
// Mobile: 1 colonne (empilé)
grid-cols-1

// Desktop: 3 colonnes
lg:grid-cols-3

// Répartition des widgets
lg:col-span-3  // Pleine largeur
lg:col-span-2  // 2/3 largeur
lg:col-span-1  // 1/3 largeur
```

---

## 🚀 Performance

### Optimisations

1. **Lazy Loading** : Composants chargés à la demande par onglet
2. **Memoization** : Hooks `useCallback` pour fonctions stables
3. **Skeleton Loaders** : Affichage immédiat avec placeholders
4. **Single Query** : Requêtes Supabase avec JOIN (pas de N+1)

### Exemple Query Optimisée

```typescript
// ✅ BON - Single query avec relations
const { data } = await supabase
  .from('reservations')
  .select('*, lots(*, profiles(business_name, business_address))')
  .eq('user_id', userId);

// ❌ MAUVAIS - Multiple queries
const reservations = await supabase.from('reservations').select();
for (const r of reservations) {
  const lot = await supabase.from('lots').select().eq('id', r.lot_id);
}
```

---

## 🧪 Tests Suggérés

### Tests Unitaires

```typescript
describe('CustomerActiveReservation', () => {
  it('should display empty state when no active reservation');
  it('should display QR code for active reservation');
  it('should hide QR code for donation baskets');
  it('should call onNavigateToBrowse when CTA clicked');
});
```

### Tests d'Intégration

```typescript
describe('CustomerDashboard', () => {
  it('should render all widgets on home tab');
  it('should navigate between tabs correctly');
  it('should fetch data on mount');
});
```

---

## 🔧 Maintenance

### Ajouter un Nouveau Widget

1. Créer `CustomerNewWidget.tsx` dans `src/components/customer/`
2. Suivre le pattern standard (Props, Hooks, Early Returns, Render)
3. Importer dans `CustomerDashboard.tsx`
4. Ajouter dans la grille avec `lg:col-span-X`
5. Tester responsive et loading states

### Modifier la Disposition

Éditer `renderHomeTab()` dans `CustomerDashboard.tsx` :

```tsx
// Exemple : Passer widget Actions en pleine largeur
<div className="lg:col-span-3"> {/* au lieu de lg:col-span-1 */}
  <CustomerActions {...props} />
</div>
```

---

## 📚 Ressources

### Documentation

- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [Lucide React Icons](https://lucide.dev/)
- [QRCode.react](https://github.com/zpao/qrcode.react)
- [Date-fns](https://date-fns.org/)

### Hooks Personnalisés

- `useReservations` : `src/hooks/useReservations.ts`
- `useImpactMetrics` : `src/hooks/useImpactMetrics.ts`
- `useAuthStore` : `src/stores/authStore.ts`

---

## ✅ Checklist de Migration

- [x] Créer `CustomerImpactStats.tsx`
- [x] Créer `CustomerActiveReservation.tsx`
- [x] Créer `CustomerActions.tsx`
- [x] Créer `CustomerReservationHistory.tsx`
- [x] Refactorer `CustomerDashboard.tsx` avec widgets
- [x] Ajouter onglet "Accueil"
- [x] Tester responsive mobile/desktop
- [x] Vérifier loading states
- [x] Vérifier error handling
- [x] Tester navigation entre onglets
- [x] Valider accessibilité (ARIA, keyboard)
- [ ] Tester avec données réelles
- [ ] Ajouter graphique d'évolution (optionnel)
- [ ] Tests unitaires (optionnel)

---

## 🎉 Résultat Final

Le nouveau dashboard client offre :

✅ **UX Moderne** : Layout widget-based avec priorisation de l'information  
✅ **Performance** : Loading states et requêtes optimisées  
✅ **Responsive** : Mobile-first design adaptatif  
✅ **Accessible** : ARIA labels et navigation clavier  
✅ **Maintenable** : Architecture modulaire et réutilisable  
✅ **TypeScript Strict** : Aucun `any`, typage complet  
✅ **Tailwind CSS** : Classes organisées, pas de styles inline  

**Respect total des règles .cursorrules** ✅

---

**Version** : 1.0.0  
**Date** : Octobre 2024  
**Auteur** : Équipe EcoPanier

