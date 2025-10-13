# 🗄️ Schéma de Base de Données - EcoPanier

> **Documentation du schéma PostgreSQL** - Structure complète de la base de données Supabase

---

## 📊 Vue d'Ensemble

EcoPanier utilise **PostgreSQL** via Supabase avec un schéma relationnel optimisé pour gérer :
- 5 types d'utilisateurs avec permissions distinctes
- Gestion complète des lots d'invendus
- Système de réservations avec QR code + PIN
- Missions pour collecteurs
- Tracking d'impact environnemental et social
- Logs d'activité et audit

---

## 🏗️ Diagramme ERD (Entity-Relationship)

```
                                   ┌─────────────────┐
                                   │   auth.users    │
                                   │   (Supabase)    │
                                   └────────┬────────┘
                                            │
                                            │ 1:1
                                            │
                      ┌─────────────────────▼─────────────────────┐
                      │             profiles                      │
                      │  ─────────────────────────────────────   │
                      │  id (PK) → auth.users.id                 │
                      │  role (customer|merchant|beneficiary|    │
                      │        collector|admin)                  │
                      │  full_name, phone, address               │
                      │  business_name, business_hours           │
                      │  beneficiary_id (YYYY-BEN-XXXXX)        │
                      │  verified, latitude, longitude           │
                      └──┬────────────────┬────────────────┬─────┘
                         │                │                │
                         │                │                │
                  1:N    │           1:N  │           1:N  │
                         │                │                │
        ┌────────────────▼──────┐  ┌──────▼─────────┐  ┌──▼────────────┐
        │      lots             │  │  reservations  │  │   missions    │
        │  ──────────────────  │  │  ────────────  │  │  ───────────  │
        │  id (PK)             │  │  id (PK)       │  │  id (PK)      │
        │  merchant_id (FK)    │  │  lot_id (FK)   │  │  merchant_id  │
        │  title, description  │  │  user_id (FK)  │  │  collector_id │
        │  category            │  │  quantity      │  │  pickup_addr  │
        │  original_price      │  │  total_price   │  │  delivery_addr│
        │  discounted_price    │  │  pickup_pin    │  │  status       │
        │  quantity_*          │  │  status        │  │  payment_amt  │
        │  is_free (BOOLEAN)   │  │  completed_at  │  │  proof_urls   │
        │  status              │  └────────────────┘  └───────────────┘
        │  images (TEXT[])     │
        │  pickup_start        │
        │  pickup_end          │
        └──────────────────────┘
                  │
                  │ 1:N
                  │
        ┌─────────▼──────────────┐
        │    reservations        │
        └────────────────────────┘

        ┌─────────────────────────┐       ┌──────────────────────┐
        │  platform_settings      │       │   activity_logs      │
        │  ─────────────────────  │       │  ──────────────────  │
        │  id (PK)                │       │  id (PK)             │
        │  key (UNIQUE)           │       │  user_id (FK)        │
        │  value (JSONB)          │       │  action_type         │
        │  updated_by (FK)        │       │  details (JSONB)     │
        │  [RLS ENABLED]          │       │  created_at          │
        └─────────────────────────┘       └──────────────────────┘
```

---

## 📋 Tables Détaillées

### 1. `profiles` - Profils Utilisateurs

Étend `auth.users` de Supabase avec des informations métier.

**Structure** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, FK → auth.users | ID utilisateur |
| `role` | TEXT | NOT NULL | customer \| merchant \| beneficiary \| collector \| admin |
| `full_name` | TEXT | NOT NULL | Nom complet |
| `email` | TEXT | | Email (depuis auth.users) |
| `phone` | TEXT | | Numéro de téléphone |
| `address` | TEXT | | Adresse postale |
| `business_name` | TEXT | | Nom du commerce (merchants) |
| `business_address` | TEXT | | Adresse du commerce |
| `business_hours` | JSONB | | Horaires d'ouverture (merchants) |
| `business_logo_url` | TEXT | | URL du logo (Storage) |
| `latitude` | NUMERIC(10,8) | | Latitude GPS |
| `longitude` | NUMERIC(11,8) | | Longitude GPS |
| `beneficiary_id` | TEXT | UNIQUE | Format: YYYY-BEN-XXXXX |
| `verified` | BOOLEAN | DEFAULT false | Statut de vérification |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date de création |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Dernière modification |

**Indexes** :
```sql
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(verified);
CREATE INDEX idx_profiles_location ON profiles USING GIST(ll_to_earth(latitude, longitude));
```

**Relations** :
- 1:N avec `lots` (un commerçant a plusieurs lots)
- 1:N avec `reservations` (un utilisateur a plusieurs réservations)
- 1:N avec `missions` (un collecteur/merchant a plusieurs missions)

**Exemple de données** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "merchant",
  "full_name": "Jean Dupont",
  "email": "jean@boulangerie.fr",
  "phone": "+33612345678",
  "business_name": "Boulangerie Dupont",
  "business_hours": {
    "monday": { "open": "07:00", "close": "19:00" },
    "tuesday": { "open": "07:00", "close": "19:00" },
    "wednesday": { "open": "07:00", "close": "19:00" }
  },
  "verified": true
}
```

---

### 2. `lots` - Lots d'Invendus

Produits alimentaires créés par les commerçants.

**Structure** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID du lot |
| `merchant_id` | UUID | FK → profiles, NOT NULL | ID du commerçant |
| `title` | TEXT | NOT NULL | Titre du lot |
| `description` | TEXT | | Description détaillée |
| `category` | TEXT | | Catégorie (fruits_legumes, boulangerie, etc.) |
| `original_price` | NUMERIC(10,2) | NOT NULL | Prix original |
| `discounted_price` | NUMERIC(10,2) | NOT NULL | Prix réduit (jusqu'à -70%) |
| `quantity_total` | INTEGER | NOT NULL, DEFAULT 1 | Quantité totale |
| `quantity_reserved` | INTEGER | DEFAULT 0 | Quantité réservée |
| `quantity_sold` | INTEGER | DEFAULT 0 | Quantité vendue |
| `is_free` | BOOLEAN | DEFAULT false | Lot gratuit pour bénéficiaires |
| `status` | TEXT | DEFAULT 'available' | available \| reserved \| sold_out \| expired |
| `images` | TEXT[] | | URLs des images (Storage) |
| `pickup_start` | TIMESTAMPTZ | NOT NULL | Début de la plage de retrait |
| `pickup_end` | TIMESTAMPTZ | NOT NULL | Fin de la plage de retrait |
| `requires_cold_chain` | BOOLEAN | DEFAULT false | Nécessite chaîne du froid |
| `is_urgent` | BOOLEAN | DEFAULT false | Lot urgent (DLC proche) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date de création |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Dernière modification |

**Enums** :

```sql
-- Categories
CREATE TYPE lot_category AS ENUM (
  'fruits_legumes',
  'boulangerie',
  'boucherie',
  'poissonnerie',
  'epicerie',
  'produits_laitiers',
  'plats_prepares',
  'autres'
);

-- Status
CREATE TYPE lot_status AS ENUM (
  'available',
  'reserved',
  'sold_out',
  'expired'
);
```

**Indexes** :
```sql
CREATE INDEX idx_lots_merchant ON lots(merchant_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_is_free ON lots(is_free);
CREATE INDEX idx_lots_category ON lots(category);
CREATE INDEX idx_lots_pickup ON lots(pickup_start, pickup_end);
```

**Triggers** :

```sql
-- Mise à jour automatique du statut quand quantity_sold = quantity_total
CREATE OR REPLACE FUNCTION update_lot_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_sold >= NEW.quantity_total THEN
    NEW.status := 'sold_out';
  ELSIF NEW.quantity_reserved > 0 THEN
    NEW.status := 'reserved';
  ELSE
    NEW.status := 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lot_status
  BEFORE UPDATE ON lots
  FOR EACH ROW
  EXECUTE FUNCTION update_lot_status();
```

**Exemple de données** :
```json
{
  "id": "lot-uuid-123",
  "merchant_id": "merchant-uuid-456",
  "title": "Panier de fruits et légumes",
  "description": "5kg de fruits et légumes frais de saison",
  "category": "fruits_legumes",
  "original_price": 25.00,
  "discounted_price": 10.00,
  "quantity_total": 10,
  "quantity_reserved": 3,
  "quantity_sold": 0,
  "is_free": false,
  "status": "available",
  "images": [
    "https://storage.supabase.co/lot-images/123.jpg"
  ],
  "pickup_start": "2024-01-20T17:00:00Z",
  "pickup_end": "2024-01-20T19:00:00Z",
  "requires_cold_chain": true,
  "is_urgent": false
}
```

---

### 3. `reservations` - Réservations

Réservations de lots par clients ou bénéficiaires.

**Structure** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID de la réservation |
| `lot_id` | UUID | FK → lots, NOT NULL | ID du lot |
| `user_id` | UUID | FK → profiles, NOT NULL | ID de l'utilisateur |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | Quantité réservée |
| `total_price` | NUMERIC(10,2) | NOT NULL | Prix total (0 si is_free) |
| `pickup_pin` | TEXT | NOT NULL, UNIQUE | Code PIN à 6 chiffres |
| `status` | TEXT | DEFAULT 'pending' | pending \| confirmed \| completed \| cancelled |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date de réservation |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Dernière modification |
| `completed_at` | TIMESTAMPTZ | | Date de retrait effectif |

**Indexes** :
```sql
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_lot ON reservations(lot_id);
CREATE INDEX idx_reservations_pin ON reservations(pickup_pin);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_created ON reservations(created_at);
```

**Contraintes** :

```sql
-- Vérifier que le PIN est un nombre à 6 chiffres
ALTER TABLE reservations
  ADD CONSTRAINT check_pin_format
  CHECK (pickup_pin ~ '^\d{6}$');

-- Assurer que total_price >= 0
ALTER TABLE reservations
  ADD CONSTRAINT check_positive_price
  CHECK (total_price >= 0);
```

**Triggers** :

```sql
-- Générer un PIN unique à 6 chiffres
CREATE OR REPLACE FUNCTION generate_pickup_pin()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pickup_pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_pin
  BEFORE INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.pickup_pin IS NULL)
  EXECUTE FUNCTION generate_pickup_pin();
```

**Exemple de données** :
```json
{
  "id": "reservation-uuid-789",
  "lot_id": "lot-uuid-123",
  "user_id": "user-uuid-456",
  "quantity": 2,
  "total_price": 20.00,
  "pickup_pin": "123456",
  "status": "pending",
  "created_at": "2024-01-15T10:00:00Z",
  "completed_at": null
}
```

---

### 4. `missions` - Missions Collecteurs

Missions de collecte et livraison.

**Structure** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID de la mission |
| `merchant_id` | UUID | FK → profiles, NOT NULL | ID du commerçant |
| `collector_id` | UUID | FK → profiles | ID du collecteur (null si non acceptée) |
| `title` | TEXT | NOT NULL | Titre de la mission |
| `description` | TEXT | | Description |
| `pickup_address` | TEXT | NOT NULL | Adresse de retrait |
| `delivery_address` | TEXT | NOT NULL | Adresse de livraison |
| `pickup_latitude` | NUMERIC(10,8) | | Latitude retrait |
| `pickup_longitude` | NUMERIC(11,8) | | Longitude retrait |
| `delivery_latitude` | NUMERIC(10,8) | | Latitude livraison |
| `delivery_longitude` | NUMERIC(11,8) | | Longitude livraison |
| `requires_cold_chain` | BOOLEAN | DEFAULT false | Nécessite chaîne du froid |
| `is_urgent` | BOOLEAN | DEFAULT false | Mission urgente |
| `payment_amount` | NUMERIC(10,2) | NOT NULL | Rémunération collecteur |
| `status` | TEXT | DEFAULT 'available' | available \| accepted \| in_progress \| completed \| cancelled |
| `proof_urls` | TEXT[] | | Photos/signatures de preuve |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date de création |
| `accepted_at` | TIMESTAMPTZ | | Date d'acceptation |
| `completed_at` | TIMESTAMPTZ | | Date de complétion |

**Indexes** :
```sql
CREATE INDEX idx_missions_merchant ON missions(merchant_id);
CREATE INDEX idx_missions_collector ON missions(collector_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_created ON missions(created_at);
```

---

### 5. `platform_settings` - Paramètres Système

Configuration globale de la plateforme (RLS activé).

**Structure** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | ID du paramètre |
| `key` | TEXT | UNIQUE, NOT NULL | Clé du paramètre |
| `value` | JSONB | NOT NULL | Valeur (format flexible) |
| `updated_by` | UUID | FK → profiles | ID de l'admin qui a modifié |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date de création |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Dernière modification |

**Row Level Security** :

```sql
-- Seulement les admins peuvent lire/modifier
CREATE POLICY "Admin only can read settings"
  ON platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

**Paramètres communs** :

```json
[
  {
    "key": "commission_rate",
    "value": { "rate": 0.15, "description": "Commission de 15% sur les ventes" }
  },
  {
    "key": "max_beneficiary_lots_per_day",
    "value": { "limit": 2, "description": "2 lots gratuits maximum par jour" }
  },
  {
    "key": "min_discount_percentage",
    "value": { "percentage": 0.30, "description": "Réduction minimale de 30%" }
  },
  {
    "key": "max_discount_percentage",
    "value": { "percentage": 0.70, "description": "Réduction maximale de 70%" }
  }
]
```

---

### 6. `settings_history` - Historique des Modifications

Trace les modifications de paramètres (audit).

**Structure** :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | PRIMARY KEY |
| `setting_key` | TEXT | Clé du paramètre modifié |
| `old_value` | JSONB | Ancienne valeur |
| `new_value` | JSONB | Nouvelle valeur |
| `changed_by` | UUID | FK → profiles (admin) |
| `changed_at` | TIMESTAMPTZ | Date de modification |

---

### 7. `activity_logs` - Journaux d'Activité

Logs de toutes les actions importantes.

**Structure** :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | FK → profiles |
| `action_type` | TEXT | Type d'action (lot_created, reservation_completed, etc.) |
| `details` | JSONB | Détails de l'action (format flexible) |
| `ip_address` | INET | Adresse IP |
| `user_agent` | TEXT | User agent |
| `created_at` | TIMESTAMPTZ | Date de l'action |

**Types d'actions** :
- `lot_created`, `lot_updated`, `lot_deleted`
- `reservation_created`, `reservation_completed`, `reservation_cancelled`
- `mission_accepted`, `mission_completed`
- `setting_updated`
- `user_verified`, `user_suspended`

**Exemple** :
```json
{
  "id": "log-uuid-123",
  "user_id": "user-uuid-456",
  "action_type": "lot_created",
  "details": {
    "lot_id": "lot-uuid-789",
    "title": "Pain invendu",
    "price": 10.00,
    "used_ai": true,
    "confidence": 0.92
  },
  "ip_address": "192.168.1.1",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## 💾 Storage Buckets

### 1. `lot-images` - Images des Lots

**Configuration** :
- Public: `true`
- Max file size: `5MB`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Policies** :
```sql
-- Tout le monde peut lire
CREATE POLICY "Public can read lot images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lot-images');

-- Seuls les merchants peuvent upload
CREATE POLICY "Merchants can upload lot images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lot-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'merchant'
    )
  );
```

---

### 2. `business-logos` - Logos des Commerces

**Configuration** :
- Public: `true`
- Max file size: `2MB`
- Allowed MIME types: `image/jpeg`, `image/png`

---

## 🔄 Migrations

Liste des migrations SQL appliquées :

| Fichier | Date | Description |
|---------|------|-------------|
| `20251011204650_create_food_waste_platform_schema.sql` | 11/10/2024 | Schéma initial complet |
| `20251012_platform_settings.sql` | 12/10/2024 | Ajout platform_settings + RLS |
| `20251012_suspended_baskets.sql` | 12/10/2024 | Table suspended_baskets (déprécié) |
| `20251012_suspended_baskets_sample_data.sql` | 12/10/2024 | Données de test |
| `20250113_add_business_hours.sql` | 13/01/2025 | Ajout business_hours (JSONB) |
| `20250114_add_lots_images_storage.sql` | 14/01/2025 | Bucket lot-images |
| `20250115_add_business_logo_storage.sql` | 15/01/2025 | Bucket business-logos |

---

## 🔒 Sécurité & RLS

### Tables avec RLS activé

- ✅ `platform_settings` : Admins seulement
- ⚠️ `profiles`, `lots`, `reservations`, `missions` : RLS désactivé pour le MVP (à activer en production)

### Policies à implémenter (Production)

```sql
-- Users peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Merchants peuvent lire/modifier leurs lots
CREATE POLICY "Merchants can manage own lots"
  ON lots FOR ALL
  USING (merchant_id = auth.uid());

-- Users peuvent lire/modifier leurs réservations
CREATE POLICY "Users can manage own reservations"
  ON reservations FOR ALL
  USING (user_id = auth.uid());
```

---

## 📊 Statistiques & Métriques

### Requêtes utiles

#### Lots disponibles près d'une localisation
```sql
SELECT l.*, p.business_name,
  earth_distance(
    ll_to_earth(p.latitude, p.longitude),
    ll_to_earth(48.8566, 2.3522) -- Paris
  ) AS distance_meters
FROM lots l
JOIN profiles p ON l.merchant_id = p.id
WHERE l.status = 'available'
ORDER BY distance_meters
LIMIT 20;
```

#### Bénéficiaire a-t-il atteint la limite de 2/jour ?
```sql
SELECT COUNT(*)
FROM reservations r
JOIN lots l ON r.lot_id = l.id
WHERE r.user_id = $1
  AND l.is_free = true
  AND DATE(r.created_at) = CURRENT_DATE;
```

#### Impact environnemental total
```sql
SELECT
  COUNT(*) AS total_reservations,
  SUM(quantity) AS meals_saved,
  SUM(quantity) * 0.9 AS kg_co2_saved
FROM reservations
WHERE status = 'completed';
```

---

## 🛠️ Maintenance

### Tâches régulières

#### Expirer les lots périmés (CRON)
```sql
UPDATE lots
SET status = 'expired'
WHERE status = 'available'
  AND pickup_end < NOW();
```

#### Nettoyer les anciennes images (Storage)
```sql
-- Supprimer les images des lots supprimés (> 30 jours)
DELETE FROM storage.objects
WHERE bucket_id = 'lot-images'
  AND created_at < NOW() - INTERVAL '30 days'
  AND id NOT IN (
    SELECT UNNEST(images) FROM lots
  );
```

---

<div align="center">

**Database Schema - EcoPanier** 🗄️  
PostgreSQL via Supabase - Version 1.0

</div>
