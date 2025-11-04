# 🔍 Recherche Globale Admin - Documentation

## 📋 Vue d'ensemble

La recherche globale permet aux administrateurs de trouver rapidement n'importe quel élément de la plateforme (utilisateurs, lots, réservations) depuis n'importe quelle page de l'interface admin.

---

## ✨ Fonctionnalités

### 🎯 Recherche Intelligente Multi-Tables

La recherche interroge simultanément **3 tables Supabase** :

1. **👥 Utilisateurs (profiles)**
   - Nom complet
   - Téléphone
   - ID Bénéficiaire
   - Nom du commerce
   - Tous les rôles (client, commerçant, bénéficiaire, collecteur, admin)

2. **📦 Lots**
   - Titre du lot
   - Description
   - Catégorie
   - Nom du commerçant associé

3. **📊 Réservations**
   - Code PIN de retrait
   - Informations du client
   - Titre du lot associé

### ⚡ Performance

- **Debounce de 300ms** : Évite les requêtes inutiles pendant la frappe
- **Limite de 5 résultats** par catégorie pour des performances optimales
- **Recherche insensible à la casse** (ILIKE Postgres)
- **Chargement asynchrone** avec indicateur visuel

---

## 🎨 Interface Utilisateur

### Activation

1. **Clic sur l'icône** 🔍 dans le header
2. **Fermeture** : Bouton X ou touche Échap (à venir)

### États Visuels

#### 🔵 En cours de recherche
```
┌─────────────────────────────────────┐
│ 🔍 Rechercher...         🔄 [X]     │
└─────────────────────────────────────┘
   ↳ Spinner animé à droite
```

#### ✅ Résultats trouvés
```
┌─────────────────────────────────────┐
│ 🔍 jean dupont                  [X] │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 👥 UTILISATEURS (2)                 │
├─────────────────────────────────────┤
│ 🛒 Jean Dupont                      │
│    client • 06 12 34 56 78          │
├─────────────────────────────────────┤
│ 🏪 Jean Martin                      │
│    Boulangerie Martin               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📦 LOTS (1)                         │
├─────────────────────────────────────┤
│ 📦 Panier légumes                   │
│    Boulangerie Martin • Fruits      │
│                              5.99€  │
└─────────────────────────────────────┘
```

#### ❌ Aucun résultat
```
┌─────────────────────────────────────┐
│ 🔍 xyz123                       [X] │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│          🔍                         │
│   Aucun résultat trouvé            │
│   Essayez avec d'autres termes     │
└─────────────────────────────────────┘
```

---

## 🔧 Architecture Technique

### Structure de l'État

```typescript
// États de la recherche
const [searchQuery, setSearchQuery] = useState('');
const [isSearching, setIsSearching] = useState(false);
const [searchResults, setSearchResults] = useState<{
  users: any[];
  lots: any[];
  reservations: any[];
}>({ users: [], lots: [], reservations: [] });
```

### Fonction de Recherche

```typescript
const performSearch = async (query: string) => {
  setIsSearching(true);
  
  try {
    const searchTerm = query.toLowerCase();

    // Recherche parallèle dans 3 tables
    const [usersResult, lotsResult, reservationsResult] = await Promise.all([
      // Utilisateurs
      supabase
        .from('profiles')
        .select('...')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,...`)
        .limit(5),
      
      // Lots
      supabase
        .from('lots')
        .select('...')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,...`)
        .limit(5),
      
      // Réservations
      supabase
        .from('reservations')
        .select('...')
        .ilike('pickup_pin', `%${searchTerm}%`)
        .limit(5)
    ]);

    // Mise à jour des résultats
    setSearchResults({
      users: usersResult.data || [],
      lots: lotsResult.data || [],
      reservations: reservationsResult.data || []
    });
  } catch (error) {
    console.error('Erreur recherche:', error);
  } finally {
    setIsSearching(false);
  }
};
```

### Debounce avec useEffect

```typescript
useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults({ users: [], lots: [], reservations: [] });
    return;
  }

  // Attendre 300ms avant de lancer la recherche
  const debounceTimer = setTimeout(() => {
    performSearch(searchQuery);
  }, 300);

  // Nettoyer le timer si la requête change
  return () => clearTimeout(debounceTimer);
}, [searchQuery]);
```

---

## 🎯 Actions sur les Résultats

### Navigation Intelligente

Cliquer sur un résultat redirige automatiquement vers la section appropriée :

| Type | Destination |
|------|-------------|
| 👥 Utilisateur | Tab "Utilisateurs" |
| 📦 Lot | Tab "Modération Lots" |
| 📊 Réservation | Tab "Analytics" |

**Comportement après clic :**
1. Fermeture automatique du panel de recherche
2. Navigation vers l'onglet approprié
3. Réinitialisation de la recherche

```typescript
onClick={() => {
  setActiveTab('users'); // ou 'lots', 'analytics'
  setShowSearch(false);
  setSearchQuery('');
}}
```

---

## 🎨 Design System

### Badges de Rôles

```typescript
const roleColors = {
  customer: 'bg-primary-500',    // 🛒 Bleu
  merchant: 'bg-secondary-500',  // 🏪 Violet
  beneficiary: 'bg-accent-500',  // 🤝 Rouge
  collector: 'bg-success-500',   // 🚴 Vert
  admin: 'bg-gray-500'           // 👑 Gris
};
```

### Couleurs par Catégorie

| Catégorie | Dégradé | Utilisation |
|-----------|---------|-------------|
| Utilisateurs | `from-primary-50 to-secondary-50` | Header section |
| Lots | `from-success-50 to-emerald-50` | Header section |
| Réservations | `from-warning-50 to-orange-50` | Header section |

### Animations

```css
/* Panel de résultats */
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

/* Spinner de chargement */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover sur résultats */
.hover:bg-gray-50 {
  transition: background-color 0.15s ease;
}
```

---

## 📊 Requêtes Supabase

### Recherche d'Utilisateurs

```sql
SELECT 
  id, 
  full_name, 
  role, 
  phone, 
  beneficiary_id, 
  business_name, 
  created_at
FROM profiles
WHERE 
  full_name ILIKE '%query%' OR
  phone ILIKE '%query%' OR
  beneficiary_id ILIKE '%query%' OR
  business_name ILIKE '%query%'
LIMIT 5;
```

### Recherche de Lots avec Relations

```sql
SELECT 
  lots.*,
  profiles.full_name AS merchant_name,
  profiles.business_name
FROM lots
LEFT JOIN profiles ON lots.merchant_id = profiles.id
WHERE 
  lots.title ILIKE '%query%' OR
  lots.description ILIKE '%query%' OR
  lots.category ILIKE '%query%'
LIMIT 5;
```

### Recherche de Réservations

```sql
SELECT 
  reservations.*,
  profiles.full_name AS customer_name,
  lots.title AS lot_title
FROM reservations
LEFT JOIN profiles ON reservations.customer_id = profiles.id
LEFT JOIN lots ON reservations.lot_id = lots.id
WHERE 
  reservations.pickup_pin ILIKE '%query%'
LIMIT 5;
```

---

## 🚀 Améliorations Futures

### Court terme

- [ ] **Raccourci clavier Ctrl+K**
  ```typescript
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  ```

- [ ] **Touche Échap pour fermer**
  ```typescript
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showSearch]);
  ```

- [ ] **Navigation clavier dans les résultats**
  - ↑ / ↓ : Naviguer entre les résultats
  - Enter : Sélectionner le résultat actuel
  - Tab : Passer à la catégorie suivante

- [ ] **Historique de recherche**
  - Stocker les 10 dernières recherches
  - Afficher l'historique au focus
  - Effacer l'historique

### Moyen terme

- [ ] **Recherche avancée avec filtres**
  ```typescript
  interface SearchFilters {
    type: 'all' | 'users' | 'lots' | 'reservations';
    role?: 'customer' | 'merchant' | 'beneficiary';
    status?: 'available' | 'sold_out' | 'expired';
    dateRange?: { start: Date; end: Date };
  }
  ```

- [ ] **Suggestions automatiques (autocomplete)**
  - Suggestions basées sur les recherches populaires
  - Correction orthographique
  - Synonymes

- [ ] **Recherche floue (fuzzy search)**
  ```typescript
  // Utiliser une bibliothèque comme fuse.js
  import Fuse from 'fuse.js';
  
  const fuse = new Fuse(data, {
    keys: ['full_name', 'business_name', 'title'],
    threshold: 0.3 // Tolérance aux fautes de frappe
  });
  ```

- [ ] **Mise en évidence (highlighting)**
  ```typescript
  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i}>{part}</mark> 
        : part
    );
  };
  ```

### Long terme

- [ ] **Recherche full-text avec PostgreSQL**
  ```sql
  -- Créer un index full-text
  CREATE INDEX idx_profiles_fulltext 
  ON profiles 
  USING gin(to_tsvector('french', full_name || ' ' || COALESCE(business_name, '')));

  -- Requête optimisée
  SELECT * FROM profiles
  WHERE to_tsvector('french', full_name || ' ' || COALESCE(business_name, ''))
  @@ to_tsquery('french', 'query');
  ```

- [ ] **Recherche avec Elasticsearch**
  - Indexation asynchrone
  - Recherche ultra-rapide
  - Facettes et agrégations
  - Pertinence des résultats

- [ ] **Analytics de recherche**
  - Termes les plus recherchés
  - Taux de clics par type de résultat
  - Recherches sans résultats
  - Temps de réponse moyen

- [ ] **Recherche vocale**
  ```typescript
  const startVoiceSearch = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.start();
  };
  ```

---

## 💡 Best Practices

### Performance

1. **Limiter les résultats** : Maximum 5 par catégorie
2. **Debounce obligatoire** : Éviter les requêtes à chaque frappe
3. **Indexer les colonnes** : Créer des index sur les champs recherchés
4. **Cache les résultats** : Mémoriser les recherches récentes

### UX

1. **Feedback immédiat** : Spinner pendant le chargement
2. **Messages clairs** : "Aucun résultat trouvé"
3. **Navigation intuitive** : Cliquer sur un résultat pour naviguer
4. **Fermeture facile** : Bouton X, Échap, clic extérieur

### Sécurité

1. **Sanitisation** : Supabase gère automatiquement
2. **RLS (Row Level Security)** : Activer pour la production
3. **Rate limiting** : Limiter le nombre de recherches par utilisateur
4. **Logging** : Enregistrer les recherches pour audit

---

## 🐛 Dépannage

### Problème : Pas de résultats

**Causes possibles :**
- Termes de recherche trop spécifiques
- Faute d'orthographe
- Données manquantes dans la base

**Solutions :**
```typescript
// Ajouter un message d'aide
if (searchResults.users.length === 0 && searchQuery.length < 3) {
  return "Tapez au moins 3 caractères";
}
```

### Problème : Recherche lente

**Causes possibles :**
- Pas d'index sur les colonnes
- Trop de résultats
- Requêtes non optimisées

**Solutions :**
```sql
-- Créer des index
CREATE INDEX idx_profiles_name ON profiles(full_name);
CREATE INDEX idx_lots_title ON lots(title);
CREATE INDEX idx_reservations_pin ON reservations(pickup_pin);
```

### Problème : Résultats non pertinents

**Solutions :**
- Implémenter un système de scoring
- Ajouter des poids aux champs
- Utiliser full-text search

---

## 📈 Métriques de Succès

### KPIs à surveiller

1. **Taux d'utilisation** : % d'admins qui utilisent la recherche
2. **Taux de succès** : % de recherches avec résultats
3. **Temps de réponse** : Médiane et P95
4. **CTR (Click-Through Rate)** : % de clics sur les résultats
5. **Termes populaires** : Top 10 des recherches

### Objectifs

- ✅ Temps de réponse < 500ms (P95)
- ✅ Taux de succès > 80%
- ✅ Taux d'utilisation > 50%
- ✅ CTR > 70%

---

## 📚 Ressources

### Documentation

- [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [PostgreSQL ILIKE](https://www.postgresql.org/docs/current/functions-matching.html)
- [React Debounce Patterns](https://www.freecodecamp.org/news/debounce-and-throttle-in-react-with-hooks/)

### Bibliothèques Recommandées

- **fuse.js** : Recherche floue client-side
- **react-highlight-words** : Mise en évidence des résultats
- **downshift** : Composant autocomplete accessible
- **react-hotkeys-hook** : Gestion des raccourcis clavier

---

## 🤝 Contribution

Pour améliorer la recherche :

1. **Fork** le projet
2. **Créer** une branche feature
3. **Tester** avec de vraies données
4. **Documenter** les changements
5. **Pull Request** avec screenshots

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025  
**Développé avec** : React 18 + TypeScript + Supabase

🔍 **Recherche Globale Admin** - Trouvez tout, instantanément.

