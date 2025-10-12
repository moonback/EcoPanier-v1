# 🏗️ Architecture - EcoPanier

> Documentation technique de l'architecture système de la plateforme EcoPanier.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Globale](#architecture-globale)
3. [Frontend (Client)](#frontend-client)
4. [Backend (Supabase)](#backend-supabase)
5. [Base de données](#base-de-données)
6. [Flux de données](#flux-de-données)
7. [Sécurité](#sécurité)
8. [Performance](#performance)
9. [Scalabilité](#scalabilité)

---

## 🎯 Vue d'ensemble

EcoPanier est une **application web full-stack** construite selon une architecture moderne **JAMstack** :

- **Frontend** : React SPA (Single Page Application)
- **Backend** : Supabase (BaaS - Backend as a Service)
- **Database** : PostgreSQL (hébergé par Supabase)
- **Auth** : Supabase Auth
- **Storage** : Supabase Storage (futur)
- **Realtime** : Supabase Realtime (futur)

### Philosophie architecturale

- ✅ **Serverless** : Pas de serveur à gérer
- ✅ **API-first** : Tout passe par des API REST/GraphQL
- ✅ **Type-safe** : TypeScript de bout en bout
- ✅ **Component-based** : Architecture en composants réutilisables
- ✅ **State management** : Zustand pour l'état global, Context API pour l'état local
- ✅ **Security-first** : RLS (Row Level Security) au niveau base de données

---

## 🌐 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                              │
│  (Clients, Commerçants, Bénéficiaires, Collecteurs, Admins)     │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CDN / HOSTING                                 │
│              (Netlify / Vercel / Firebase)                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               FRONTEND (React SPA)                       │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │   │
│  │  │   React     │  │  TypeScript  │  │  Tailwind CSS │  │   │
│  │  │   Router    │  │    Zustand   │  │   Lucide      │  │   │
│  │  └─────────────┘  └──────────────┘  └───────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ REST API / GraphQL
             │ WebSocket (Realtime)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (BaaS)                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Database   │  │   Storage    │          │
│  │   Service    │  │  (Postgres)  │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Realtime   │  │     Edge     │  │     API      │          │
│  │   Service    │  │  Functions   │  │   Gateway    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
             │
             │ SQL / RLS Policies
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL DATABASE                             │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐     │
│  │ Profiles│  │   Lots   │  │ Reservations│  │ Missions │     │
│  └─────────┘  └──────────┘  └─────────────┘  └──────────┘     │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ Suspended       │  │   Impact    │  │  Platform    │       │
│  │ Baskets         │  │   Metrics   │  │  Settings    │       │
│  └─────────────────┘  └─────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend (Client)

### Stack technique

```typescript
// Technologies principales
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.5.3",
  "bundler": "Vite 5.4.2",
  "routing": "React Router DOM 7.9.4",
  "styling": "Tailwind CSS 3.4.1",
  "state": "Zustand 5.0.8",
  "icons": "Lucide React",
  "charts": "Recharts 3.2.1"
}
```

### Architecture des composants

```
src/
├── components/              # Composants par feature
│   ├── admin/              # Domain: Administration
│   ├── auth/               # Domain: Authentification
│   ├── beneficiary/        # Domain: Bénéficiaires
│   ├── collector/          # Domain: Collecteurs
│   ├── customer/           # Domain: Clients
│   ├── merchant/           # Domain: Commerçants
│   ├── landing/            # Domain: Pages publiques
│   ├── pages/              # Domain: Pages génériques
│   ├── pickup/             # Domain: Station de retrait
│   └── shared/             # Composants partagés/réutilisables
```

### Pattern : Feature-based architecture

Chaque domaine métier a ses propres composants isolés :

```
customer/
├── CustomerDashboard.tsx    # Page principale
├── ImpactDashboard.tsx      # Feature: Impact personnel
├── LotBrowser.tsx           # Feature: Navigation lots
└── ReservationsList.tsx     # Feature: Liste réservations
```

### État global (State Management)

#### Zustand Stores

```typescript
// authStore.ts - Authentification globale
{
  user: User | null,
  profile: Profile | null,
  loading: boolean,
  signIn: (email, password) => Promise<void>,
  signUp: (...) => Promise<void>,
  signOut: () => Promise<void>
}
```

#### Context API

```typescript
// SettingsContext.tsx - Paramètres plateforme
{
  settings: PlatformSettings,
  loading: boolean,
  error: string | null,
  refreshSettings: () => Promise<void>
}
```

### Routing

```typescript
// App.tsx
Routes:
  / → LandingPage (public)
  /how-it-works → HowItWorks (public)
  /help → HelpCenter (public)
  /pickup → PickupStation (public)
  /dashboard → DashboardRouter (protected)
  /login → DashboardRouter (protected)
```

#### Route Protection

```typescript
// Protection basée sur le rôle
function DashboardRouter() {
  const { user, profile } = useAuthStore();
  
  if (!user) return <AuthForm />;
  if (!profile) return <ProfileSetup />;
  
  switch (profile.role) {
    case 'customer': return <CustomerDashboard />;
    case 'merchant': return <MerchantDashboard />;
    case 'beneficiary': return <BeneficiaryDashboard />;
    case 'collector': return <CollectorDashboard />;
    case 'admin': return <AdminDashboard />;
  }
}
```

### Patterns de composants

#### Composant type

```typescript
// Pattern standard d'un composant
interface ComponentProps {
  // Props typées
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks d'état
  const [state, setState] = useState();
  
  // 2. Hooks de contexte/store
  const { data } = useStore();
  
  // 3. Hooks d'effet
  useEffect(() => {
    // Side effects
  }, [deps]);
  
  // 4. Handlers
  const handleAction = () => {
    // Logic
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🔧 Backend (Supabase)

### Services utilisés

#### 1. **Supabase Auth**

```typescript
// Authentication flows
- Email/Password signup
- Email/Password login
- Session management
- Password reset
- Email verification (optionnel)
```

**Implémentation** : `src/stores/authStore.ts`

#### 2. **Supabase Database**

```typescript
// PostgreSQL via Supabase Client
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

**Client** : `src/lib/supabase.ts`

#### 3. **Row Level Security (RLS)**

Sécurité au niveau de la base de données :

```sql
-- Exemple: Seuls les admins peuvent voir les paramètres
CREATE POLICY "Admins can read settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

#### 4. **Supabase Storage** (Futur)

Pour stocker :
- Photos de profil
- Images de lots
- Preuves de livraison
- Documents admin

#### 5. **Supabase Realtime** (Futur)

Notifications en temps réel :
- Nouvelles réservations
- Mises à jour de lots
- Messages
- Notifications

---

## 🗄️ Base de données

### Modèle relationnel

```
┌─────────────┐
│   Profiles  │
│ (Users)     │
└──────┬──────┘
       │ 1
       │
       │ N
   ┌───┴────┬─────────┬──────────┬──────────┐
   │        │         │          │          │
   ▼        ▼         ▼          ▼          ▼
┌──────┐ ┌────┐ ┌───────────┐ ┌────────┐ ┌──────────┐
│ Lots │ │Msns│ │Reserva-   │ │Impact  │ │Suspended │
│      │ │    │ │tions      │ │Metrics │ │Baskets   │
└──────┘ └────┘ └───────────┘ └────────┘ └──────────┘
```

### Tables principales

#### **profiles**
```sql
- id (uuid, PK, FK → auth.users)
- role (enum: customer, merchant, beneficiary, collector, admin)
- full_name (text)
- phone (text)
- address (text)
- business_name (text) -- pour merchants
- business_address (text)
- latitude, longitude (numeric) -- géolocalisation
- beneficiary_id (text) -- format: 2025-BEN-00001
- verified (boolean)
- created_at, updated_at (timestamptz)
```

#### **lots**
```sql
- id (uuid, PK)
- merchant_id (uuid, FK → profiles)
- title, description, category (text)
- original_price, discounted_price (numeric)
- quantity_total, quantity_reserved, quantity_sold (integer)
- pickup_start, pickup_end (timestamptz)
- requires_cold_chain, is_urgent (boolean)
- status (enum: available, reserved, sold_out, expired)
- image_urls (text[])
- created_at, updated_at (timestamptz)
```

#### **reservations**
```sql
- id (uuid, PK)
- lot_id (uuid, FK → lots)
- user_id (uuid, FK → profiles)
- quantity (integer)
- total_price (numeric)
- pickup_pin (text) -- code à 6 chiffres
- status (enum: pending, confirmed, completed, cancelled)
- is_donation (boolean) -- panier suspendu
- created_at, updated_at, completed_at (timestamptz)
```

#### **suspended_baskets**
```sql
- id (uuid, PK)
- donor_id (uuid, FK → profiles)
- merchant_id (uuid, FK → profiles)
- reservation_id (uuid, FK → reservations, nullable)
- amount (decimal)
- claimed_by (uuid, FK → profiles, nullable)
- claimed_at (timestamptz, nullable)
- status (enum: available, reserved, claimed, expired)
- notes (text)
- expires_at (timestamptz)
- created_at, updated_at (timestamptz)
```

#### **missions**
```sql
- id (uuid, PK)
- merchant_id (uuid, FK → profiles)
- collector_id (uuid, FK → profiles, nullable)
- title, description (text)
- pickup_address, delivery_address (text)
- pickup_latitude, pickup_longitude (numeric)
- delivery_latitude, delivery_longitude (numeric)
- requires_cold_chain, is_urgent (boolean)
- payment_amount (numeric)
- status (enum: available, accepted, in_progress, completed, cancelled)
- proof_urls (text[])
- created_at, accepted_at, completed_at (timestamptz)
```

#### **platform_settings**
```sql
- id (uuid, PK)
- key (text, unique) -- ex: "min_lot_price"
- value (jsonb) -- valeur dynamique
- description (text)
- category (text) -- general, lots, commission, beneficiary, etc.
- updated_at (timestamptz)
- updated_by (uuid, FK → profiles)
- created_at (timestamptz)
```

#### **platform_settings_history**
```sql
- id (uuid, PK)
- setting_key (text)
- old_value (jsonb)
- new_value (jsonb)
- changed_by (uuid, FK → profiles)
- changed_at (timestamptz)
- ip_address (inet)
- user_agent (text)
```

### Indexes

```sql
-- Performance optimizations
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_beneficiary_id ON profiles(beneficiary_id);
CREATE INDEX idx_lots_merchant_id ON lots(merchant_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_created_at ON lots(created_at DESC);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_lot_id ON reservations(lot_id);
CREATE INDEX idx_missions_collector_id ON missions(collector_id);
CREATE INDEX idx_suspended_baskets_status ON suspended_baskets(status);
```

---

## 🔄 Flux de données

### 1. Flux d'authentification

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. signUp(email, password, profile)
     ▼
┌─────────────────┐
│  authStore.ts   │
└────┬────────────┘
     │
     │ 2. supabase.auth.signUp()
     ▼
┌─────────────────┐
│  Supabase Auth  │
└────┬────────────┘
     │
     │ 3. Create user in auth.users
     ▼
┌─────────────────┐
│  PostgreSQL     │
│  auth.users     │
└────┬────────────┘
     │
     │ 4. Insert profile in public.profiles
     ▼
┌─────────────────┐
│  public.        │
│  profiles       │
└────┬────────────┘
     │
     │ 5. Return session + profile
     ▼
┌─────────────────┐
│  authStore      │
│  (user, profile)│
└────┬────────────┘
     │
     │ 6. Update UI
     ▼
┌──────────┐
│  Client  │
│  (logged)│
└──────────┘
```

### 2. Flux de réservation

```
Client
  │
  │ 1. Browse lots (LotBrowser)
  ▼
supabase
  .from('lots')
  .select()
  .eq('status', 'available')
  │
  │ 2. Select lot + quantity
  ▼
Create reservation
  │
  │ 3. Generate PIN (6 digits)
  │ 4. Insert reservation
  │ 5. Update lot.quantity_reserved
  ▼
supabase
  .from('reservations')
  .insert({
    lot_id,
    user_id,
    quantity,
    total_price,
    pickup_pin
  })
  │
  │ 6. Generate QR Code
  ▼
QRCodeDisplay
  {
    reservationId,
    pin,
    userId,
    lotId,
    timestamp
  }
```

### 3. Flux de retrait (Pickup)

```
PickupStation (public)
  │
  │ 1. Scan QR Code
  ▼
QRScanner
  │
  │ 2. Parse QR data
  ▼
{
  reservationId,
  pin,
  userId,
  lotId
}
  │
  │ 3. Fetch reservation
  ▼
supabase
  .from('reservations')
  .select('*, lot:lots(*), user:profiles(*)')
  .eq('id', reservationId)
  .single()
  │
  │ 4. Display info + ask PIN
  ▼
PIN Input
  │
  │ 5. Validate PIN
  ▼
if (inputPin === reservation.pickup_pin)
  │
  │ 6. Mark as completed
  ▼
supabase
  .from('reservations')
  .update({
    status: 'completed',
    completed_at: now()
  })
  │
  │ 7. Update lot quantities
  ▼
supabase
  .from('lots')
  .update({
    quantity_reserved: quantity_reserved - qty,
    quantity_sold: quantity_sold + qty
  })
```

### 4. Flux de don (Panier suspendu)

```
Client Dashboard
  │
  │ 1. Click "Offrir un panier"
  ▼
Modal: Select merchant + amount
  │
  │ 2. Submit donation
  ▼
supabase
  .from('suspended_baskets')
  .insert({
    donor_id: currentUser.id,
    merchant_id: selectedMerchant,
    amount: donationAmount,
    status: 'available'
  })
  │
  │ 3. Update impact_metrics
  ▼
supabase
  .from('impact_metrics')
  .insert({
    user_id: currentUser.id,
    metric_type: 'donations_made',
    value: donationAmount
  })
  │
  │ 4. Notification
  ▼
Beneficiaries can claim
```

---

## 🔐 Sécurité

### Authentification

```typescript
// Supabase Auth avec JWT
- Session stockée dans localStorage (supabase-auth-token)
- Auto-refresh du JWT
- Gestion de l'expiration
- Logout propre
```

### Autorisations (RLS)

#### Stratégie de sécurité

```sql
-- Désactivé pour tables de base (pour simplicité MVP)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;

-- Activé pour tables sensibles
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspended_baskets ENABLE ROW LEVEL SECURITY;
```

#### Policies actives

**platform_settings** :
```sql
-- Seuls les admins lisent
CREATE POLICY "Admins can read settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins modifient
CREATE POLICY "Admins can update settings"
  ON platform_settings FOR UPDATE
  TO authenticated
  USING (...) WITH CHECK (...);
```

**suspended_baskets** :
```sql
-- Clients créent des dons
CREATE POLICY "Authenticated users can create suspended baskets"
  ON suspended_baskets FOR INSERT
  TO authenticated
  WITH CHECK (
    donor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('customer', 'admin')
    )
  );

-- Bénéficiaires récupèrent
CREATE POLICY "Beneficiaries can claim baskets"
  ON suspended_baskets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('beneficiary', 'admin')
    )
  );
```

### Protection Frontend

```typescript
// Route protection
if (!user) return <Navigate to="/login" />;

// Role-based rendering
{profile.role === 'admin' && <AdminPanel />}

// Function-level checks
function canEditLot(lot: Lot, userId: string) {
  return lot.merchant_id === userId;
}
```

### Bonnes pratiques

- ✅ **Jamais de secrets dans le frontend** (use env vars)
- ✅ **Validation côté serveur** (via RLS policies)
- ✅ **Sanitisation des entrées** (SQL injection prevention via Supabase)
- ✅ **HTTPS obligatoire** (enforced by Supabase & hosting)
- ✅ **CORS configuré** (Supabase settings)

---

## ⚡ Performance

### Frontend Optimizations

#### 1. Code Splitting

```typescript
// Lazy loading des routes
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

#### 2. Memoization

```typescript
// Éviter les re-renders inutiles
const MemoizedComponent = React.memo(ExpensiveComponent);

// Hooks de mémoisation
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

#### 3. Optimistic UI

```typescript
// Mise à jour optimiste avant confirmation serveur
setState(newValue); // Update immédiate
await supabase.update(...); // Confirmation async
// Si erreur, rollback
```

### Database Optimizations

#### 1. Indexes stratégiques

```sql
-- Index sur colonnes fréquemment requêtées
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_created_at ON lots(created_at DESC);
```

#### 2. Requêtes optimisées

```typescript
// ❌ Bad: Multiple queries
const lots = await supabase.from('lots').select();
for (const lot of lots) {
  const merchant = await supabase.from('profiles').select().eq('id', lot.merchant_id);
}

// ✅ Good: Single query with join
const lots = await supabase
  .from('lots')
  .select('*, merchant:profiles(full_name, business_name)');
```

#### 3. Pagination

```typescript
// Limiter les résultats
const { data } = await supabase
  .from('lots')
  .select()
  .range(0, 19) // 20 premiers résultats
  .order('created_at', { ascending: false });
```

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
        }
      }
    }
  }
});
```

---

## 📈 Scalabilité

### Stratégies de croissance

#### 1. Database Scaling

**Supabase** gère automatiquement :
- Connection pooling
- Read replicas (plans supérieurs)
- Auto-scaling

#### 2. Caching Strategy (Futur)

```typescript
// React Query pour cache client-side
const { data } = useQuery('lots', fetchLots, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

#### 3. CDN pour assets

- Images servies via CDN (Cloudinary, Supabase Storage)
- Build statique sur CDN (Netlify, Vercel)

#### 4. Monitoring (Futur)

```typescript
// Sentry pour error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

## 🚀 Évolutions futures

### Architecture V2

```
Frontend:
- [ ] Migration vers Next.js (SSR/SSG)
- [ ] React Query pour cache & sync
- [ ] Service Worker pour offline
- [ ] PWA support

Backend:
- [ ] Supabase Edge Functions (serverless)
- [ ] Webhooks pour intégrations externes
- [ ] Stripe pour paiements
- [ ] SendGrid pour emails

Database:
- [ ] Triggers pour automatisations
- [ ] Vues matérialisées pour analytics
- [ ] Partitioning pour historiques
- [ ] Full-text search (pg_search)

Monitoring:
- [ ] Sentry (errors)
- [ ] LogRocket (session replay)
- [ ] Mixpanel (analytics)
- [ ] Datadog (APM)
```

---

## 📚 Ressources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

<div align="center">

**Architecture conçue pour la performance, la sécurité et la scalabilité**

[⬅️ Retour au README](./README.md)

</div>

