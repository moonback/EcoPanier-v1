# 🏗️ Architecture EcoPanier

> **Document d'architecture système** - Structure technique détaillée de la plateforme anti-gaspillage alimentaire

---

## 📊 Vue d'ensemble

EcoPanier est une application web moderne construite sur une architecture **client-serveur** avec un backend managé (BaaS - Backend as a Service).

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React App (SPA)                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │  Components  │  │    Stores    │  │    Contexts     │ │ │
│  │  │   (React)    │  │   (Zustand)  │  │                 │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   Routing    │  │   Styling    │  │   Animations    │ │ │
│  │  │ (React Router)│  │  (Tailwind)  │  │(Framer Motion) │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────┬───────────────────┘
                        │                     │
                    HTTPS/WSS            HTTPS REST
                        │                     │
         ┌──────────────┴─────────┐   ┌──────┴─────────┐
         │                        │   │                │
         │   SUPABASE (BaaS)      │   │  GEMINI AI     │
         │                        │   │  (Google)      │
         │  ┌──────────────────┐  │   │                │
         │  │   PostgreSQL     │  │   │  Image Analysis│
         │  │   (Database)     │  │   │  + Extraction  │
         │  └──────────────────┘  │   │                │
         │  ┌──────────────────┐  │   └────────────────┘
         │  │   Auth Service   │  │
         │  └──────────────────┘  │
         │  ┌──────────────────┐  │
         │  │   Storage        │  │
         │  │  (Images/Logos)  │  │
         │  └──────────────────┘  │
         │  ┌──────────────────┐  │
         │  │   Realtime       │  │
         │  │  (WebSockets)    │  │
         │  └──────────────────┘  │
         └─────────────────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack

- **React 18.3.1** : Framework UI avec hooks et concurrent features
- **TypeScript 5.5.3** : Typage statique strict (mode `strict` activé)
- **Vite 5.4.2** : Build tool avec HMR ultra-rapide
- **React Router DOM 7.9.4** : Routing déclaratif côté client

### Design Pattern : Feature-Based Architecture

Le projet utilise une **architecture feature-based** où les composants sont organisés par **domaine métier** plutôt que par type technique.

```
src/components/
├── admin/           # Tout ce qui concerne l'administration
├── auth/            # Authentification et autorisation
├── beneficiary/     # Fonctionnalités bénéficiaires
├── collector/       # Fonctionnalités collecteurs
├── customer/        # Fonctionnalités clients
├── merchant/        # Fonctionnalités commerçants
├── landing/         # Page d'accueil publique
├── pages/           # Pages transversales
├── pickup/          # Station de retrait
└── shared/          # Composants réutilisables
```

#### Avantages de cette architecture

✅ **Scalabilité** : Facile d'ajouter de nouvelles fonctionnalités  
✅ **Maintenabilité** : Code isolé par domaine métier  
✅ **Collaboration** : Équipes peuvent travailler en parallèle  
✅ **Réutilisabilité** : Composants `shared/` utilisables partout  

### State Management

#### 1. Zustand (Global State)

Utilisé pour l'**état d'authentification** :

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  profile: Profile | null;
  signIn: (credentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

**Pourquoi Zustand ?**
- ✅ Léger (1KB gzippé)
- ✅ Pas de boilerplate
- ✅ Performance optimale
- ✅ TypeScript natif

#### 2. React Context (Settings)

Utilisé pour les **paramètres de la plateforme** :

```typescript
// contexts/SettingsContext.tsx
interface SettingsContext {
  settings: PlatformSettings;
  loading: boolean;
  updateSetting: (key, value) => Promise<void>;
}
```

#### 3. Local State (useState, useReducer)

Pour l'état local des composants (formulaires, UI, etc.).

### Routing Strategy

```typescript
// App.tsx - Routes principales
/                        → Landing Page (public)
/login                   → Authentification (public)
/dashboard               → Redirection selon rôle (protected)
/admin/*                 → Admin dashboard (protected, role: admin)
/merchant/*              → Merchant dashboard (protected, role: merchant)
/customer/*              → Customer dashboard (protected, role: customer)
/beneficiary/*           → Beneficiary dashboard (protected, role: beneficiary)
/collector/*             → Collector dashboard (protected, role: collector)
/pickup                  → Pickup station (public)
/how-it-works            → Guide d'utilisation (public)
/help                    → Centre d'aide (public)
```

#### Protection des routes

```typescript
// Pattern de protection par rôle
if (!user) return <Navigate to="/login" />;
if (profile?.role !== 'admin') return <AccessDenied />;
```

### Styling Architecture

#### Tailwind CSS 3.4.1 (Utility-First)

Configuration personnalisée avec :

```javascript
// tailwind.config.js
colors: {
  primary: { 50-950 },    // Bleu (brand)
  secondary: { 50-950 },  // Violet
  accent: { 50-950 },     // Rouge
  success: { 50-950 },    // Vert
  warning: { 50-950 },    // Orange
}
```

**Classes custom disponibles** :
- `.card` : Carte standard
- `.btn-primary` : Bouton principal
- `.btn-secondary` : Bouton secondaire
- `.section-gradient` : Dégradé de section
- `.hover-lift` : Effet de levée au hover
- `.animate-fade-in-up` : Animation d'entrée

#### Ordre des classes Tailwind (OBLIGATOIRE)

```
Layout → Spacing → Sizing → Colors → Typography → Effects
```

Exemple :
```tsx
<div className="flex items-center justify-between gap-4 p-6 w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
```

### Animations : Framer Motion

Utilisé pour les animations fluides de la landing page :

```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

---

## 🔧 Backend Architecture

### Supabase (Backend as a Service)

EcoPanier utilise **Supabase** comme backend managé complet.

#### Services utilisés

1. **PostgreSQL Database**
   - Base de données relationnelle
   - Triggers et fonctions SQL
   - Full-text search

2. **Supabase Auth**
   - Authentification email/password
   - Session management
   - JWT tokens

3. **Row Level Security (RLS)**
   - Sécurité au niveau ligne
   - Policies basées sur les rôles
   - Activé sur tables sensibles : `platform_settings`, `suspended_baskets`

4. **Storage**
   - Stockage d'images de lots
   - Stockage de logos commerçants
   - Buckets : `lot-images`, `business-logos`

5. **Realtime** (Futur)
   - WebSockets pour notifications
   - Mise à jour en temps réel

### Database Schema

#### Tables Principales

```sql
-- Profils utilisateurs (étend auth.users)
profiles
├── id (PK, FK → auth.users)
├── role (ENUM: customer, merchant, beneficiary, collector, admin)
├── full_name
├── phone
├── verified (BOOLEAN)
├── beneficiary_id (TEXT, format: YYYY-BEN-XXXXX)
├── business_name (TEXT, pour commerçants)
├── business_hours (JSONB, horaires)
├── business_logo_url (TEXT)
└── timestamps

-- Lots d'invendus
lots
├── id (PK)
├── merchant_id (FK → profiles)
├── title
├── description
├── category (ENUM)
├── original_price
├── discounted_price
├── quantity_total
├── quantity_reserved
├── quantity_sold
├── is_free (BOOLEAN, pour bénéficiaires)
├── status (ENUM: available, reserved, sold_out, expired)
├── images (TEXT[], URLs Storage)
├── pickup_start (TIMESTAMP)
├── pickup_end (TIMESTAMP)
└── timestamps

-- Réservations
reservations
├── id (PK)
├── user_id (FK → profiles)
├── lot_id (FK → lots)
├── quantity
├── total_price
├── pickup_pin (TEXT, 6 chiffres)
├── status (ENUM: pending, confirmed, completed, cancelled)
├── completed_at (TIMESTAMP)
└── timestamps

-- Missions collecteurs
missions
├── id (PK)
├── collector_id (FK → profiles)
├── merchant_id (FK → profiles)
├── pickup_location (POINT)
├── delivery_location (POINT)
├── status (ENUM)
├── payment_amount
└── timestamps

-- Paramètres plateforme (RLS activé)
platform_settings
├── id (PK)
├── key (UNIQUE)
├── value (JSONB)
├── updated_by (FK → profiles)
└── timestamps

-- Logs d'activité
activity_logs
├── id (PK)
├── user_id (FK → profiles)
├── action_type
├── details (JSONB)
└── created_at
```

#### Relations

```
profiles 1────N lots
profiles 1────N reservations
lots 1────N reservations
profiles 1────N missions (as collector)
profiles 1────N missions (as merchant)
```

### API Patterns

#### Pattern de requête Supabase standard

```typescript
try {
  const { data, error } = await supabase
    .from('lots')
    .select('*, merchant:profiles!merchant_id(full_name, business_name)')
    .eq('status', 'available')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Erreur lors du chargement des lots:', error);
  throw new Error('Impossible de charger les lots');
}
```

**Règles importantes** :
- ✅ TOUJOURS vérifier `error`
- ✅ Utiliser try/catch pour gestion d'erreurs
- ✅ Messages utilisateur-friendly
- ✅ Logger les erreurs en console

#### Optimisation : Requêtes avec relations (JOIN)

```typescript
// ✅ BON - Une seule requête avec relations
const { data } = await supabase
  .from('reservations')
  .select(`
    *,
    lot:lots(*),
    user:profiles(full_name, phone)
  `);

// ❌ MAUVAIS - Multiples requêtes (N+1 problem)
const reservations = await supabase.from('reservations').select();
for (const res of reservations) {
  const lot = await supabase.from('lots').select().eq('id', res.lot_id);
}
```

---

## 🤖 Intelligence Artificielle : Gemini 2.0 Flash

### Architecture de l'analyse d'images

```
┌─────────────────────────────────────────────────────────┐
│  Commerçant                                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. Prend photo du produit                     │    │
│  │  2. Upload image (File)                        │    │
│  └────────────────────┬───────────────────────────┘    │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │   geminiService.ts          │
          │                             │
          │  analyzeImageWithGemini()   │
          │                             │
          │  1. Convert File → Base64   │
          │  2. Send to Gemini API      │
          │  3. Parse response          │
          │  4. Validate data           │
          └────────┬────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────┐
          │   Gemini 2.0 Flash API      │
          │   (Google AI)               │
          │                             │
          │  - Vision + Language Model  │
          │  - Multi-modal analysis     │
          │  - Fast inference (<3s)     │
          └────────┬────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────┐
          │   Extracted Data            │
          │                             │
          │  {                          │
          │    title,                   │
          │    description,             │
          │    category,                │
          │    originalPrice,           │
          │    discountedPrice,         │
          │    quantity,                │
          │    requiresColdChain,       │
          │    isUrgent,                │
          │    confidence              │
          │  }                          │
          └────────┬────────────────────┘
                   │
                   ▼
          ┌─────────────────────────────┐
          │   Auto-fill Form            │
          │                             │
          │  - Pre-populate fields      │
          │  - Merchant can adjust      │
          │  - Save lot                 │
          └─────────────────────────────┘
```

### Prompt Engineering

Le système utilise un **prompt structuré et spécialisé** :

```typescript
const prompt = `
Tu es un expert en analyse de produits alimentaires.
Analyse cette image et extrais les informations suivantes...

IMPORTANT:
- Détecte le type exact de produit
- Estime le prix original basé sur le marché français
- Propose un prix anti-gaspi (30-70% de réduction)
- Identifie si chaîne du froid nécessaire
- Détecte l'urgence (DLC proche)
`;
```

### Gestion des erreurs

```typescript
// Fallback si Gemini indisponible
if (!GEMINI_API_KEY) {
  return {
    success: false,
    error: 'Clé API Gemini non configurée'
  };
}

// Retry logic avec exponential backoff
const MAX_RETRIES = 3;
```

---

## 🔐 Authentification & Autorisation

### Flow d'authentification

```
1. User → Email + Password
2. Supabase Auth → Vérification
3. JWT Token généré
4. Profile récupéré (role, infos)
5. Zustand store mis à jour
6. Redirection selon rôle
```

### Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **Customer** | Browse lots, Reserve, View impact |
| **Merchant** | Create lots, Manage reservations, View stats, Use IA |
| **Beneficiary** | Access free lots (2/day max), Reserve |
| **Collector** | View missions, Accept missions, Complete |
| **Admin** | Full access, User management, Settings, Logs |

### Protection des routes

```typescript
// HOC pour protection
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile } = useAuthStore();
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && profile?.role !== requiredRole) {
    return <AccessDenied />;
  }
  
  return children;
};
```

---

## 📦 Storage Architecture

### Buckets Supabase

1. **lot-images**
   - Images des lots créés par commerçants
   - Public access : true
   - Max size : 5MB par image
   - Formats acceptés : jpg, png, webp

2. **business-logos**
   - Logos des commerces
   - Public access : true
   - Max size : 2MB
   - Formats : jpg, png

### Upload Pattern

```typescript
const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('lot-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('lot-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

---

## 🚀 Performance & Optimisation

### Code Splitting

```typescript
// Lazy loading des routes
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const MerchantDashboard = lazy(() => import('./components/merchant/MerchantDashboard'));
```

### Optimisations React

- **React.memo** : Composants purs
- **useMemo** : Calculs coûteux
- **useCallback** : Fonctions stables
- **Lazy loading** : Images et composants

### Caching Strategy

- **Supabase** : Cache automatique des requêtes
- **Browser** : LocalStorage pour settings
- **Images** : CDN + lazy loading

---

## 🛡️ Sécurité

### Frontend Security

- ✅ Variables d'environnement (pas de secrets en dur)
- ✅ Validation des entrées utilisateur
- ✅ XSS protection (React échappe automatiquement)
- ✅ CSRF protection (Supabase)

### Backend Security (Supabase)

- ✅ Row Level Security (RLS) sur tables sensibles
- ✅ Policies basées sur les rôles
- ✅ JWT tokens avec expiration
- ✅ HTTPS only

### RLS Policies Examples

```sql
-- Exemple : Seuls les admins peuvent modifier les settings
CREATE POLICY "Admin only can update settings"
ON platform_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

## 📊 Monitoring & Logs

### Activity Logs

Toutes les actions importantes sont loggées :

```typescript
await supabase.from('activity_logs').insert({
  user_id: user.id,
  action_type: 'lot_created',
  details: {
    lot_id: newLot.id,
    title: newLot.title,
    price: newLot.discounted_price
  }
});
```

### Error Tracking (Futur)

- Sentry pour tracking des erreurs
- Source maps pour debugging
- Alertes en temps réel

---

## 🔄 Deployment Architecture

### Build Process

```bash
npm run build
  → TypeScript compilation
  → Vite bundling
  → Assets optimization
  → dist/ folder ready
```

### Hosting (Netlify/Vercel)

```
GitHub → Push → CI/CD → Build → Deploy → CDN
```

### Environment Variables

```
Production:
  VITE_SUPABASE_URL=https://prod.supabase.co
  VITE_SUPABASE_ANON_KEY=prod-key
  VITE_GEMINI_API_KEY=prod-gemini-key

Development:
  VITE_SUPABASE_URL=https://dev.supabase.co
  VITE_SUPABASE_ANON_KEY=dev-key
  VITE_GEMINI_API_KEY=dev-gemini-key
```

---

## 📈 Scalability

### Current Architecture

- ✅ Horizontal scaling via Netlify/Vercel
- ✅ Supabase auto-scaling
- ✅ CDN pour assets statiques

### Future Improvements

- 📋 Database read replicas
- 📋 Redis caching layer
- 📋 Background jobs avec Supabase Edge Functions
- 📋 GraphQL pour requêtes complexes

---

## 🔧 Development Workflow

```
1. Feature branch → feature/nom
2. Development local (Vite HMR)
3. TypeScript typecheck
4. ESLint validation
5. Build test
6. Pull Request
7. Review & Merge
8. Deploy automatique
```

---

## 📚 Ressources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Gemini API](https://ai.google.dev/docs)

---

<div align="center">

**Architecture conçue pour la scalabilité, la performance et la maintenabilité** 🚀

</div>
