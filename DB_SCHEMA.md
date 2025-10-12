# 🗄️ Schéma de Base de Données - EcoPanier

> Documentation complète du schéma PostgreSQL utilisé par EcoPanier via Supabase.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Diagramme relationnel](#diagramme-relationnel)
3. [Tables principales](#tables-principales)
4. [Relations](#relations)
5. [Indexes](#indexes)
6. [Triggers & Functions](#triggers--functions)
7. [Row Level Security](#row-level-security)
8. [Vues](#vues)
9. [Migrations](#migrations)

---

## 🎯 Vue d'ensemble

La base de données EcoPanier est construite sur **PostgreSQL 15** et hébergée sur **Supabase**. Elle contient **11 tables principales** et plusieurs vues, triggers et fonctions pour automatiser les opérations.

### Statistiques

| Élément | Quantité |
|---------|----------|
| **Tables** | 11 |
| **Vues** | 2 |
| **Indexes** | 25+ |
| **Triggers** | 3 |
| **Functions** | 4 |
| **RLS Policies** | 8 |

### Principes de conception

- ✅ **Normalisation** : 3ème forme normale (3NF)
- ✅ **Intégrité référentielle** : Contraintes de clés étrangères
- ✅ **Contraintes de validation** : CHECK constraints
- ✅ **Timestamps** : Tous les enregistrements ont created_at/updated_at
- ✅ **UUIDs** : Identifiants universels pour sécurité
- ✅ **JSONB** : Flexibilité pour données semi-structurées

---

## 📊 Diagramme relationnel

```
┌──────────────┐
│ auth.users   │ (Supabase Auth)
└──────┬───────┘
       │ 1
       │
       │ 1
┌──────▼───────────────────────────────────────────────────────┐
│                    profiles (Users)                           │
│ ─────────────────────────────────────────────────────────── │
│ id (PK, FK → auth.users)                                     │
│ role (customer|merchant|beneficiary|collector|admin)         │
│ full_name, phone, address                                    │
│ business_name, business_address (merchants)                  │
│ latitude, longitude (géolocalisation)                        │
│ beneficiary_id (format: YYYY-BEN-XXXXX)                      │
│ verified (boolean)                                           │
└──────┬───────────────────────────────────┬──────────────────┘
       │ 1                                  │ 1
       │                                    │
       │ N                                  │ N
┌──────▼──────────┐               ┌────────▼─────────────────┐
│      lots       │               │     missions             │
│ ────────────── │               │ ──────────────────────── │
│ id (PK)         │               │ id (PK)                  │
│ merchant_id (FK)│◄──────────────┤ merchant_id (FK)         │
│ title           │               │ collector_id (FK)        │
│ description     │               │ title, description       │
│ category        │               │ pickup_address           │
│ prices          │               │ delivery_address         │
│ quantities      │               │ coordinates              │
│ pickup times    │               │ payment_amount           │
│ status          │               │ status                   │
└──────┬──────────┘               │ proof_urls               │
       │ 1                         └──────────────────────────┘
       │
       │ N
┌──────▼────────────────────┐
│    reservations           │
│ ───────────────────────── │
│ id (PK)                   │
│ lot_id (FK → lots)        │
│ user_id (FK → profiles)   │
│ quantity                  │
│ total_price               │
│ pickup_pin (6 digits)     │
│ status                    │
│ is_donation               │
└───────────────────────────┘

┌──────────────────────────────┐
│    suspended_baskets         │
│ ──────────────────────────── │
│ id (PK)                      │
│ donor_id (FK → profiles)     │
│ merchant_id (FK → profiles)  │
│ reservation_id (FK, opt)     │
│ amount                       │
│ claimed_by (FK, nullable)    │
│ claimed_at                   │
│ status                       │
│ expires_at                   │
└──────────────────────────────┘

┌──────────────────────────────┐    ┌──────────────────────────┐
│    impact_metrics            │    │    notifications         │
│ ──────────────────────────── │    │ ──────────────────────── │
│ id (PK)                      │    │ id (PK)                  │
│ user_id (FK → profiles)      │    │ user_id (FK → profiles)  │
│ metric_type                  │    │ title, message           │
│ value                        │    │ type                     │
│ date                         │    │ read                     │
└──────────────────────────────┘    └──────────────────────────┘

┌────────────────────────────────────────┐
│    beneficiary_daily_limits            │
│ ────────────────────────────────────── │
│ id (PK)                                │
│ beneficiary_id (FK → profiles)         │
│ date                                   │
│ reservation_count                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    platform_settings                   │
│ ────────────────────────────────────── │
│ id (PK)                                │
│ key (unique)                           │
│ value (JSONB)                          │
│ description, category                  │
│ updated_by (FK → profiles)             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    platform_settings_history           │
│ ────────────────────────────────────── │
│ id (PK)                                │
│ setting_key                            │
│ old_value, new_value (JSONB)           │
│ changed_by (FK → profiles)             │
│ changed_at, ip_address, user_agent     │
└────────────────────────────────────────┘
```

---

## 📚 Tables principales

### 1. `profiles` - Profils utilisateurs

**Description** : Étend `auth.users` de Supabase avec des informations métier.

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('customer', 'merchant', 'beneficiary', 'collector', 'admin')),
  full_name text NOT NULL,
  phone text,
  address text,
  business_name text,
  business_address text,
  latitude numeric,
  longitude numeric,
  beneficiary_id text UNIQUE,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Colonnes** :

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | uuid | Identifiant unique | PK, FK → auth.users |
| `role` | text | Rôle utilisateur | CHECK IN (5 rôles) |
| `full_name` | text | Nom complet | NOT NULL |
| `phone` | text | Téléphone | - |
| `address` | text | Adresse postale | - |
| `business_name` | text | Nom commerce (merchants) | - |
| `business_address` | text | Adresse commerce | - |
| `latitude` | numeric | Latitude (GPS) | - |
| `longitude` | numeric | Longitude (GPS) | - |
| `beneficiary_id` | text | ID bénéficiaire (format: YYYY-BEN-XXXXX) | UNIQUE |
| `verified` | boolean | Statut de vérification | DEFAULT false |
| `created_at` | timestamptz | Date de création | DEFAULT now() |
| `updated_at` | timestamptz | Dernière mise à jour | DEFAULT now() |

**Indexes** :
```sql
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_beneficiary_id ON profiles(beneficiary_id);
```

**Rôles possibles** :
- `customer` : Client standard
- `merchant` : Commerçant vendant des lots
- `beneficiary` : Bénéficiaire d'aide alimentaire
- `collector` : Collecteur/Livreur
- `admin` : Administrateur plateforme

---

### 2. `lots` - Lots d'invendus

**Description** : Lots d'aliments à prix réduits créés par les commerçants.

```sql
CREATE TABLE lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  original_price numeric NOT NULL CHECK (original_price >= 0),
  discounted_price numeric NOT NULL CHECK (discounted_price >= 0),
  quantity_total integer NOT NULL CHECK (quantity_total >= 0),
  quantity_reserved integer DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_sold integer DEFAULT 0 CHECK (quantity_sold >= 0),
  pickup_start timestamptz NOT NULL,
  pickup_end timestamptz NOT NULL,
  requires_cold_chain boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold_out', 'expired')),
  image_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Colonnes principales** :

| Colonne | Type | Description |
|---------|------|-------------|
| `merchant_id` | uuid | Commerçant propriétaire du lot |
| `title` | text | Titre du lot |
| `category` | text | Catégorie (ex: Boulangerie, Fruits & Légumes) |
| `original_price` | numeric | Prix original de détail |
| `discounted_price` | numeric | Prix réduit proposé |
| `quantity_total` | integer | Quantité totale disponible |
| `quantity_reserved` | integer | Quantité actuellement réservée |
| `quantity_sold` | integer | Quantité vendue/retirée |
| `pickup_start` | timestamptz | Début fenêtre de retrait |
| `pickup_end` | timestamptz | Fin fenêtre de retrait |
| `requires_cold_chain` | boolean | Nécessite chaîne du froid |
| `is_urgent` | boolean | Lot urgent (fin de journée) |
| `status` | text | Statut du lot |
| `image_urls` | text[] | URLs des images |

**Statuts possibles** :
- `available` : Disponible à la réservation
- `reserved` : Partiellement réservé
- `sold_out` : Épuisé
- `expired` : Expiré (fenêtre de retrait passée)

**Indexes** :
```sql
CREATE INDEX idx_lots_merchant_id ON lots(merchant_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_created_at ON lots(created_at DESC);
```

**Catégories courantes** :
- Boulangerie-Pâtisserie
- Fruits & Légumes
- Viande & Poisson
- Produits laitiers
- Épicerie
- Plats préparés
- Boissons

---

### 3. `reservations` - Réservations de lots

**Description** : Réservations effectuées par clients ou bénéficiaires.

```sql
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  pickup_pin text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_donation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

**Colonnes principales** :

| Colonne | Type | Description |
|---------|------|-------------|
| `lot_id` | uuid | Lot réservé |
| `user_id` | uuid | Utilisateur réservant |
| `quantity` | integer | Quantité réservée |
| `total_price` | numeric | Prix total (quantité × prix unitaire) |
| `pickup_pin` | text | Code PIN à 6 chiffres pour retrait |
| `status` | text | Statut de la réservation |
| `is_donation` | boolean | Si c'est un don (panier suspendu) |
| `completed_at` | timestamptz | Date/heure de retrait effectif |

**Statuts** :
- `pending` : En attente de confirmation
- `confirmed` : Confirmée
- `completed` : Retirée
- `cancelled` : Annulée

**Indexes** :
```sql
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_lot_id ON reservations(lot_id);
```

---

### 4. `suspended_baskets` - Paniers suspendus (Dons)

**Description** : Système de solidarité permettant aux clients d'offrir des paniers aux bénéficiaires.

```sql
CREATE TABLE suspended_baskets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES profiles(id),
  merchant_id uuid NOT NULL REFERENCES profiles(id),
  reservation_id uuid REFERENCES reservations(id),
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  claimed_by uuid REFERENCES profiles(id),
  claimed_at timestamptz,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'claimed', 'expired')),
  notes text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Colonnes principales** :

| Colonne | Type | Description |
|---------|------|-------------|
| `donor_id` | uuid | Client ayant fait le don |
| `merchant_id` | uuid | Commerçant chez qui le panier peut être récupéré |
| `reservation_id` | uuid | Réservation liée (optionnel) |
| `amount` | decimal | Montant du don en euros |
| `claimed_by` | uuid | Bénéficiaire ayant récupéré (nullable) |
| `claimed_at` | timestamptz | Date de récupération |
| `status` | text | Statut du panier suspendu |
| `notes` | text | Message du donateur (optionnel) |
| `expires_at` | timestamptz | Date d'expiration (optionnel) |

**Statuts** :
- `available` : Disponible pour bénéficiaires
- `reserved` : Réservé (futur)
- `claimed` : Récupéré
- `expired` : Expiré

**Indexes** :
```sql
CREATE INDEX idx_suspended_baskets_donor ON suspended_baskets(donor_id);
CREATE INDEX idx_suspended_baskets_merchant ON suspended_baskets(merchant_id);
CREATE INDEX idx_suspended_baskets_claimed_by ON suspended_baskets(claimed_by);
CREATE INDEX idx_suspended_baskets_status ON suspended_baskets(status);
```

---

### 5. `missions` - Missions de collecte

**Description** : Missions de livraison/collecte pour les collecteurs.

```sql
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  pickup_address text NOT NULL,
  delivery_address text NOT NULL,
  pickup_latitude numeric,
  pickup_longitude numeric,
  delivery_latitude numeric,
  delivery_longitude numeric,
  requires_cold_chain boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  payment_amount numeric NOT NULL CHECK (payment_amount >= 0),
  status text DEFAULT 'available' CHECK (status IN ('available', 'accepted', 'in_progress', 'completed', 'cancelled')),
  proof_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz
);
```

**Colonnes principales** :

| Colonne | Type | Description |
|---------|------|-------------|
| `merchant_id` | uuid | Commerçant créant la mission |
| `collector_id` | uuid | Collecteur acceptant (nullable avant acceptation) |
| `pickup_address` | text | Adresse de collecte |
| `delivery_address` | text | Adresse de livraison |
| `pickup_latitude/longitude` | numeric | Coordonnées GPS collecte |
| `delivery_latitude/longitude` | numeric | Coordonnées GPS livraison |
| `payment_amount` | numeric | Montant versé au collecteur |
| `status` | text | Statut de la mission |
| `proof_urls` | text[] | Photos/signatures de preuve |

**Statuts** :
- `available` : Disponible pour acceptation
- `accepted` : Acceptée par un collecteur
- `in_progress` : En cours d'exécution
- `completed` : Terminée
- `cancelled` : Annulée

---

### 6. `impact_metrics` - Métriques d'impact

**Description** : Suivi de l'impact environnemental et social.

```sql
CREATE TABLE impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('meals_saved', 'co2_saved', 'money_saved', 'donations_made')),
  value numeric NOT NULL CHECK (value >= 0),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
```

**Types de métriques** :
- `meals_saved` : Nombre de repas sauvés
- `co2_saved` : CO₂ économisé en kg (0.9 kg par repas)
- `money_saved` : Argent économisé en €
- `donations_made` : Montant des dons en €

**Index** :
```sql
CREATE INDEX idx_impact_metrics_user_date ON impact_metrics(user_id, date);
```

---

### 7. `notifications` - Notifications utilisateurs

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**Types** :
- `info` : Information générale
- `success` : Action réussie
- `warning` : Avertissement
- `error` : Erreur

---

### 8. `beneficiary_daily_limits` - Limites bénéficiaires

**Description** : Suivi des réservations journalières des bénéficiaires (limite: 2/jour).

```sql
CREATE TABLE beneficiary_daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  reservation_count integer DEFAULT 0 CHECK (reservation_count >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(beneficiary_id, date)
);
```

---

### 9. `platform_settings` - Paramètres système

**Description** : Configuration centralisée de la plateforme.

```sql
CREATE TABLE platform_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
```

**Catégories** :
- `general` : Paramètres généraux (nom, contact)
- `lots` : Configuration des lots (prix min/max)
- `commission` : Taux de commission
- `beneficiary` : Paramètres bénéficiaires
- `notification` : Configuration notifications
- `security` : Paramètres de sécurité

**Exemples de settings** :
```sql
INSERT INTO platform_settings (key, value, category) VALUES
  ('platform_name', '"EcoPanier"', 'general'),
  ('min_lot_price', '2', 'lots'),
  ('merchant_commission', '15', 'commission'),
  ('max_daily_beneficiary_reservations', '2', 'beneficiary');
```

---

### 10. `platform_settings_history` - Historique des paramètres

**Description** : Log de toutes les modifications des paramètres système.

```sql
CREATE TABLE platform_settings_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);
```

---

## 🔗 Relations

### Relations principales

```
profiles (1) ──────< (N) lots
profiles (1) ──────< (N) reservations
profiles (1) ──────< (N) missions (as merchant)
profiles (1) ──────< (N) missions (as collector)
profiles (1) ──────< (N) suspended_baskets (as donor)
profiles (1) ──────< (N) suspended_baskets (as claimer)
profiles (1) ──────< (N) impact_metrics
profiles (1) ──────< (N) notifications

lots (1) ──────< (N) reservations

auth.users (1) ─── (1) profiles
```

### Clés étrangères avec CASCADE

```sql
-- Suppression en cascade
ON DELETE CASCADE:
  - profiles.id → lots.merchant_id
  - profiles.id → reservations.user_id
  - lots.id → reservations.lot_id
  - profiles.id → missions.merchant_id
  - profiles.id → impact_metrics.user_id
  - profiles.id → notifications.user_id

-- Set NULL sur suppression
ON DELETE SET NULL:
  - profiles.id → missions.collector_id
```

---

## 📇 Indexes

### Indexes de performance

```sql
-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_beneficiary_id ON profiles(beneficiary_id);

-- Lots
CREATE INDEX idx_lots_merchant_id ON lots(merchant_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_created_at ON lots(created_at DESC);

-- Reservations
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_lot_id ON reservations(lot_id);

-- Missions
CREATE INDEX idx_missions_collector_id ON missions(collector_id);
CREATE INDEX idx_missions_merchant_id ON missions(merchant_id);
CREATE INDEX idx_missions_status ON missions(status);

-- Suspended Baskets
CREATE INDEX idx_suspended_baskets_donor ON suspended_baskets(donor_id);
CREATE INDEX idx_suspended_baskets_merchant ON suspended_baskets(merchant_id);
CREATE INDEX idx_suspended_baskets_claimed_by ON suspended_baskets(claimed_by);
CREATE INDEX idx_suspended_baskets_status ON suspended_baskets(status);
CREATE INDEX idx_suspended_baskets_created_at ON suspended_baskets(created_at DESC);

-- Beneficiary Limits
CREATE INDEX idx_beneficiary_limits_date ON beneficiary_daily_limits(beneficiary_id, date);

-- Impact Metrics
CREATE INDEX idx_impact_metrics_user_date ON impact_metrics(user_id, date);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);

-- Platform Settings
CREATE INDEX idx_platform_settings_key ON platform_settings(key);
CREATE INDEX idx_platform_settings_category ON platform_settings(category);

-- Settings History
CREATE INDEX idx_settings_history_key ON platform_settings_history(setting_key);
CREATE INDEX idx_settings_history_changed_at ON platform_settings_history(changed_at DESC);
```

---

## ⚙️ Triggers & Functions

### 1. Auto-update `updated_at`

```sql
-- Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (exemples)
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Log platform_settings changes

```sql
CREATE OR REPLACE FUNCTION log_platform_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO platform_settings_history (setting_key, old_value, new_value, changed_by)
    VALUES (NEW.key, OLD.value, NEW.value, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_platform_settings_change
  AFTER UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_platform_settings_change();
```

### 3. Mark expired suspended baskets

```sql
CREATE OR REPLACE FUNCTION mark_expired_suspended_baskets()
RETURNS void AS $$
BEGIN
  UPDATE suspended_baskets
  SET status = 'expired'
  WHERE status = 'available'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- À exécuter via un cron job
```

---

## 🔒 Row Level Security (RLS)

### Tables avec RLS activé

#### `platform_settings`

```sql
-- Lecture : Admins uniquement
CREATE POLICY "Admins can read settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Modification : Admins uniquement
CREATE POLICY "Admins can update settings"
  ON platform_settings FOR UPDATE
  TO authenticated
  USING (...) WITH CHECK (...);
```

#### `suspended_baskets`

```sql
-- Lecture : Donateurs, bénéficiaires, commerçants concernés, admins
CREATE POLICY "Users can view their suspended baskets"
  ON suspended_baskets FOR SELECT
  TO authenticated
  USING (
    donor_id = auth.uid() 
    OR claimed_by = auth.uid()
    OR merchant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'beneficiary')
    )
  );

-- Création : Clients et admins
CREATE POLICY "Authenticated users can create suspended baskets"
  ON suspended_baskets FOR INSERT
  TO authenticated
  WITH CHECK (
    donor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('customer', 'admin')
    )
  );

-- Récupération : Bénéficiaires et admins
CREATE POLICY "Beneficiaries can claim baskets"
  ON suspended_baskets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('beneficiary', 'admin')
    )
  );
```

### Tables sans RLS (Simplicité MVP)

```sql
-- Désactivé pour simplicité dans le MVP
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

> **Note** : En production, il est recommandé d'activer RLS sur toutes les tables sensibles.

---

## 👁️ Vues

### 1. `platform_settings_view`

Vue enrichie avec informations de l'utilisateur ayant modifié.

```sql
CREATE OR REPLACE VIEW platform_settings_view AS
SELECT 
  ps.key,
  ps.value,
  ps.description,
  ps.category,
  ps.updated_at,
  ps.created_at,
  p.full_name as updated_by_name,
  p.role as updated_by_role
FROM platform_settings ps
LEFT JOIN profiles p ON ps.updated_by = p.id;
```

### 2. `suspended_baskets_view`

Vue enrichie avec toutes les informations des utilisateurs liés.

```sql
CREATE OR REPLACE VIEW suspended_baskets_view AS
SELECT 
  sb.id,
  sb.amount,
  sb.status,
  sb.created_at,
  sb.claimed_at,
  sb.expires_at,
  sb.notes,
  
  donor.id as donor_id,
  donor.full_name as donor_name,
  donor.phone as donor_phone,
  
  merchant.id as merchant_id,
  merchant.full_name as merchant_name,
  merchant.business_name as merchant_business_name,
  merchant.business_address as merchant_address,
  
  beneficiary.id as beneficiary_id,
  beneficiary.full_name as beneficiary_name,
  beneficiary.beneficiary_id as beneficiary_code
  
FROM suspended_baskets sb
LEFT JOIN profiles donor ON sb.donor_id = donor.id
LEFT JOIN profiles merchant ON sb.merchant_id = merchant.id
LEFT JOIN profiles beneficiary ON sb.claimed_by = beneficiary.id;
```

---

## 🔄 Migrations

### Ordre d'exécution

```
1. 20251011204650_create_food_waste_platform_schema.sql
   → Crée toutes les tables de base

2. 20251012_platform_settings.sql
   → Ajoute les tables de paramètres système

3. 20251012_suspended_baskets.sql
   → Ajoute la table des paniers suspendus

4. 20251012_suspended_baskets_sample_data.sql (optionnel)
   → Données de test
```

### Appliquer les migrations

```bash
# Via Supabase CLI
supabase db push

# Ou via le dashboard Supabase
# SQL Editor → Coller le contenu → Run
```

---

## 📊 Exemples de requêtes

### Requête complexe : Lots disponibles avec commerçant

```sql
SELECT 
  l.*,
  p.full_name AS merchant_name,
  p.business_name,
  p.business_address,
  p.phone AS merchant_phone,
  (l.quantity_total - l.quantity_reserved - l.quantity_sold) AS quantity_available
FROM lots l
INNER JOIN profiles p ON l.merchant_id = p.id
WHERE l.status = 'available'
  AND l.pickup_end > NOW()
  AND (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0
ORDER BY l.is_urgent DESC, l.created_at DESC;
```

### Requête : Impact total d'un utilisateur

```sql
SELECT 
  metric_type,
  SUM(value) AS total_value
FROM impact_metrics
WHERE user_id = 'user-uuid'
GROUP BY metric_type;
```

### Requête : Paniers suspendus disponibles près d'un lieu

```sql
SELECT 
  sb.*,
  m.business_name,
  m.business_address,
  m.latitude,
  m.longitude,
  -- Calcul de distance (formule haversine simplifiée)
  earth_distance(
    ll_to_earth(m.latitude, m.longitude),
    ll_to_earth(48.8566, 2.3522) -- Coordonnées utilisateur
  ) / 1000 AS distance_km
FROM suspended_baskets sb
INNER JOIN profiles m ON sb.merchant_id = m.id
WHERE sb.status = 'available'
  AND sb.claimed_by IS NULL
ORDER BY distance_km ASC
LIMIT 20;
```

---

## 📚 Ressources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

<div align="center">

**Base de données conçue pour la performance, l'intégrité et la scalabilité**

[⬅️ Retour au README](./README.md)

</div>

