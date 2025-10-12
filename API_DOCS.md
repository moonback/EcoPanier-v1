# 📡 Documentation API - EcoPanier

> Référence complète de l'API Supabase utilisée par EcoPanier.

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Profiles](#profiles)
4. [Lots](#lots)
5. [Réservations](#réservations)
6. [Paniers Suspendus](#paniers-suspendus)
7. [Missions](#missions)
8. [Impact Metrics](#impact-metrics)
9. [Notifications](#notifications)
10. [Paramètres Plateforme](#paramètres-plateforme)
11. [Codes d'erreur](#codes-derreur)

---

## 🎯 Introduction

### Base URL

```
https://votre-projet.supabase.co/rest/v1
```

### Client Supabase

```typescript
import { supabase } from './lib/supabase';

// Toutes les requêtes passent par le client Supabase
const { data, error } = await supabase
  .from('table_name')
  .select();
```

### Headers requis

```typescript
{
  "apikey": "votre-anon-key",
  "Authorization": "Bearer {jwt-token}",
  "Content-Type": "application/json"
}
```

> **Note** : Le client Supabase gère automatiquement ces headers.

---

## 🔐 Authentification

### Sign Up (Inscription)

**Endpoint** : `POST /auth/v1/signup`

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

**Response**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600
  }
}
```

### Sign In (Connexion)

**Endpoint** : `POST /auth/v1/token?grant_type=password`

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**Response** : Identique à Sign Up

### Sign Out (Déconnexion)

```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Reset Password

```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'https://votre-app.com/reset-password' }
);
```

---

## 👤 Profiles

### Get Profile

**Requête**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Response**
```json
{
  "id": "uuid",
  "role": "customer",
  "full_name": "Jean Dupont",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris",
  "business_name": null,
  "business_address": null,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "beneficiary_id": null,
  "verified": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Create Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: userId, // UUID from auth.users
    role: 'customer',
    full_name: 'Jean Dupont',
    phone: '+33612345678',
    address: '123 Rue de Paris, 75001 Paris',
    verified: false
  })
  .select()
  .single();
```

### Update Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Jean Dupont',
    phone: '+33612345678',
    address: '123 Rue de Paris, 75001 Paris',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId)
  .select()
  .single();
```

### Get Users by Role

```typescript
// Obtenir tous les commerçants
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'merchant')
  .order('created_at', { ascending: false });
```

### Get Beneficiary by ID

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('beneficiary_id', '2025-BEN-00001')
  .single();
```

---

## 📦 Lots

### List Lots

**Tous les lots disponibles**
```typescript
const { data, error } = await supabase
  .from('lots')
  .select(`
    *,
    merchant:profiles!merchant_id(
      id,
      full_name,
      business_name,
      business_address
    )
  `)
  .eq('status', 'available')
  .order('created_at', { ascending: false });
```

**Response**
```json
[
  {
    "id": "uuid",
    "merchant_id": "uuid",
    "title": "Panier de légumes frais",
    "description": "Légumes de saison à sauver",
    "category": "Fruits & Légumes",
    "original_price": 15.00,
    "discounted_price": 5.00,
    "quantity_total": 10,
    "quantity_reserved": 3,
    "quantity_sold": 2,
    "pickup_start": "2025-01-15T17:00:00Z",
    "pickup_end": "2025-01-15T20:00:00Z",
    "requires_cold_chain": true,
    "is_urgent": false,
    "status": "available",
    "image_urls": ["url1", "url2"],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "merchant": {
      "id": "uuid",
      "full_name": "Marie Boulangerie",
      "business_name": "La Boulangerie du Coin",
      "business_address": "10 Avenue de la République"
    }
  }
]
```

### Get Lot by ID

```typescript
const { data, error } = await supabase
  .from('lots')
  .select(`
    *,
    merchant:profiles!merchant_id(full_name, business_name, phone, business_address)
  `)
  .eq('id', lotId)
  .single();
```

### Create Lot (Commerçant)

```typescript
const { data, error } = await supabase
  .from('lots')
  .insert({
    merchant_id: currentUser.id,
    title: 'Panier de légumes frais',
    description: 'Légumes de saison',
    category: 'Fruits & Légumes',
    original_price: 15.00,
    discounted_price: 5.00,
    quantity_total: 10,
    pickup_start: '2025-01-15T17:00:00Z',
    pickup_end: '2025-01-15T20:00:00Z',
    requires_cold_chain: true,
    is_urgent: false,
    status: 'available',
    image_urls: []
  })
  .select()
  .single();
```

### Update Lot

```typescript
const { data, error } = await supabase
  .from('lots')
  .update({
    title: 'Nouveau titre',
    discounted_price: 4.00,
    updated_at: new Date().toISOString()
  })
  .eq('id', lotId)
  .eq('merchant_id', currentUser.id) // Sécurité: seul le commerçant peut modifier
  .select()
  .single();
```

### Delete Lot

```typescript
const { error } = await supabase
  .from('lots')
  .delete()
  .eq('id', lotId)
  .eq('merchant_id', currentUser.id);
```

### Update Lot Status

```typescript
// Marquer comme vendu
const { data, error } = await supabase
  .from('lots')
  .update({ status: 'sold_out' })
  .eq('id', lotId);
```

### Filter Lots

```typescript
// Par catégorie
const { data } = await supabase
  .from('lots')
  .select('*')
  .eq('category', 'Boulangerie-Pâtisserie')
  .eq('status', 'available');

// Urgents seulement
const { data } = await supabase
  .from('lots')
  .select('*')
  .eq('is_urgent', true)
  .eq('status', 'available');

// Prix max
const { data } = await supabase
  .from('lots')
  .select('*')
  .lte('discounted_price', 5.00);

// Date de retrait
const { data } = await supabase
  .from('lots')
  .select('*')
  .gte('pickup_start', new Date().toISOString())
  .eq('status', 'available');
```

---

## 🎫 Réservations

### Create Reservation

```typescript
// Générer un PIN à 6 chiffres
const pin = Math.floor(100000 + Math.random() * 900000).toString();

const { data, error } = await supabase
  .from('reservations')
  .insert({
    lot_id: lotId,
    user_id: currentUser.id,
    quantity: 2,
    total_price: lot.discounted_price * 2,
    pickup_pin: pin,
    status: 'pending',
    is_donation: false
  })
  .select()
  .single();

// Mettre à jour la quantité réservée du lot
const { error: updateError } = await supabase
  .from('lots')
  .update({
    quantity_reserved: lot.quantity_reserved + 2
  })
  .eq('id', lotId);
```

### Get User Reservations

```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    lot:lots(
      *,
      merchant:profiles!merchant_id(full_name, business_name, phone, business_address)
    )
  `)
  .eq('user_id', currentUser.id)
  .order('created_at', { ascending: false });
```

**Response**
```json
[
  {
    "id": "uuid",
    "lot_id": "uuid",
    "user_id": "uuid",
    "quantity": 2,
    "total_price": 10.00,
    "pickup_pin": "123456",
    "status": "confirmed",
    "is_donation": false,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "completed_at": null,
    "lot": {
      "id": "uuid",
      "title": "Panier de légumes",
      "pickup_start": "2025-01-15T17:00:00Z",
      "pickup_end": "2025-01-15T20:00:00Z",
      "merchant": {
        "full_name": "Marie Boulangerie",
        "business_name": "La Boulangerie du Coin",
        "phone": "+33612345678",
        "business_address": "10 Avenue de la République"
      }
    }
  }
]
```

### Get Reservation by ID

```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    lot:lots(*),
    user:profiles(full_name, phone)
  `)
  .eq('id', reservationId)
  .single();
```

### Complete Reservation (Retrait)

```typescript
// 1. Valider le PIN
const { data: reservation, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('id', reservationId)
  .single();

if (inputPin !== reservation.pickup_pin) {
  throw new Error('PIN incorrect');
}

// 2. Marquer comme complété
const { data, error: updateError } = await supabase
  .from('reservations')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', reservationId)
  .select()
  .single();

// 3. Mettre à jour le lot
const { error: lotError } = await supabase
  .from('lots')
  .update({
    quantity_reserved: lot.quantity_reserved - reservation.quantity,
    quantity_sold: lot.quantity_sold + reservation.quantity
  })
  .eq('id', reservation.lot_id);
```

### Cancel Reservation

```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({ status: 'cancelled' })
  .eq('id', reservationId)
  .eq('user_id', currentUser.id);

// Libérer la quantité réservée
const { error: lotError } = await supabase
  .from('lots')
  .update({
    quantity_reserved: lot.quantity_reserved - reservation.quantity
  })
  .eq('id', reservation.lot_id);
```

### Get Merchant Reservations

```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    lot:lots!inner(merchant_id),
    user:profiles(full_name, phone)
  `)
  .eq('lot.merchant_id', currentUser.id)
  .order('created_at', { ascending: false });
```

---

## 🎁 Paniers Suspendus

### Create Suspended Basket (Don)

```typescript
const { data, error } = await supabase
  .from('suspended_baskets')
  .insert({
    donor_id: currentUser.id,
    merchant_id: selectedMerchantId,
    amount: 5.00,
    status: 'available',
    notes: 'Don pour aider les personnes en difficulté',
    expires_at: null // Ou date d'expiration
  })
  .select()
  .single();
```

### List Available Baskets (Bénéficiaire)

```typescript
const { data, error } = await supabase
  .from('suspended_baskets')
  .select(`
    *,
    donor:profiles!donor_id(full_name),
    merchant:profiles!merchant_id(full_name, business_name, business_address)
  `)
  .eq('status', 'available')
  .is('claimed_by', null)
  .order('created_at', { ascending: false });
```

**Response**
```json
[
  {
    "id": "uuid",
    "donor_id": "uuid",
    "merchant_id": "uuid",
    "reservation_id": null,
    "amount": 5.00,
    "claimed_by": null,
    "claimed_at": null,
    "status": "available",
    "notes": "Don pour aider",
    "expires_at": null,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "donor": {
      "full_name": "Jean Dupont"
    },
    "merchant": {
      "full_name": "Marie Boulangerie",
      "business_name": "La Boulangerie du Coin",
      "business_address": "10 Avenue de la République"
    }
  }
]
```

### Claim Basket (Récupérer)

```typescript
const { data, error } = await supabase
  .from('suspended_baskets')
  .update({
    claimed_by: currentUser.id,
    claimed_at: new Date().toISOString(),
    status: 'claimed'
  })
  .eq('id', basketId)
  .eq('status', 'available') // Sécurité: seuls les paniers disponibles
  .select()
  .single();
```

### Get My Donations (Donateur)

```typescript
const { data, error } = await supabase
  .from('suspended_baskets')
  .select(`
    *,
    merchant:profiles!merchant_id(business_name),
    beneficiary:profiles!claimed_by(full_name, beneficiary_id)
  `)
  .eq('donor_id', currentUser.id)
  .order('created_at', { ascending: false });
```

### Get My Claimed Baskets (Bénéficiaire)

```typescript
const { data, error } = await supabase
  .from('suspended_baskets')
  .select(`
    *,
    donor:profiles!donor_id(full_name),
    merchant:profiles!merchant_id(business_name, business_address)
  `)
  .eq('claimed_by', currentUser.id)
  .order('claimed_at', { ascending: false });
```

### Mark Basket as Expired

```typescript
// Exécuter périodiquement (cron job ou edge function)
const { data, error } = await supabase
  .from('suspended_baskets')
  .update({ status: 'expired' })
  .eq('status', 'available')
  .not('expires_at', 'is', null)
  .lt('expires_at', new Date().toISOString());
```

---

## 🚚 Missions

### List Available Missions

```typescript
const { data, error } = await supabase
  .from('missions')
  .select(`
    *,
    merchant:profiles!merchant_id(full_name, business_name, phone, business_address)
  `)
  .eq('status', 'available')
  .order('created_at', { ascending: false });
```

### Create Mission (Commerçant)

```typescript
const { data, error } = await supabase
  .from('missions')
  .insert({
    merchant_id: currentUser.id,
    title: 'Livraison association',
    description: 'Livrer 10 paniers à l\'association X',
    pickup_address: '10 Rue du Commerce, Paris',
    delivery_address: '50 Avenue de la Solidarité, Paris',
    pickup_latitude: 48.8566,
    pickup_longitude: 2.3522,
    delivery_latitude: 48.8606,
    delivery_longitude: 2.3376,
    requires_cold_chain: true,
    is_urgent: false,
    payment_amount: 15.00,
    status: 'available'
  })
  .select()
  .single();
```

### Accept Mission (Collecteur)

```typescript
const { data, error } = await supabase
  .from('missions')
  .update({
    collector_id: currentUser.id,
    status: 'accepted',
    accepted_at: new Date().toISOString()
  })
  .eq('id', missionId)
  .eq('status', 'available') // Sécurité
  .select()
  .single();
```

### Start Mission

```typescript
const { data, error } = await supabase
  .from('missions')
  .update({ status: 'in_progress' })
  .eq('id', missionId)
  .eq('collector_id', currentUser.id);
```

### Complete Mission

```typescript
const { data, error } = await supabase
  .from('missions')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    proof_urls: ['url-photo-1', 'url-signature']
  })
  .eq('id', missionId)
  .eq('collector_id', currentUser.id)
  .select()
  .single();
```

### Get My Missions (Collecteur)

```typescript
const { data, error } = await supabase
  .from('missions')
  .select(`
    *,
    merchant:profiles!merchant_id(full_name, business_name, phone)
  `)
  .eq('collector_id', currentUser.id)
  .in('status', ['accepted', 'in_progress', 'completed'])
  .order('accepted_at', { ascending: false });
```

---

## 📊 Impact Metrics

### Record Impact

```typescript
const { data, error } = await supabase
  .from('impact_metrics')
  .insert({
    user_id: currentUser.id,
    metric_type: 'meals_saved', // 'co2_saved', 'money_saved', 'donations_made'
    value: 2,
    date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  })
  .select()
  .single();
```

### Get User Impact

```typescript
const { data, error } = await supabase
  .from('impact_metrics')
  .select('*')
  .eq('user_id', currentUser.id)
  .order('date', { ascending: false });
```

### Aggregate User Impact

```typescript
// Calculer l'impact total par type
const { data, error } = await supabase
  .from('impact_metrics')
  .select('metric_type, value')
  .eq('user_id', currentUser.id);

// Agréger côté client
const impact = data.reduce((acc, metric) => {
  acc[metric.metric_type] = (acc[metric.metric_type] || 0) + metric.value;
  return acc;
}, {});

// Résultat:
// {
//   meals_saved: 45,
//   co2_saved: 40.5,
//   money_saved: 135,
//   donations_made: 20
// }
```

### Get Platform-wide Impact

```typescript
const { data, error } = await supabase
  .from('impact_metrics')
  .select('metric_type, value');

// Agréger tous les utilisateurs
const globalImpact = data.reduce((acc, metric) => {
  acc[metric.metric_type] = (acc[metric.metric_type] || 0) + metric.value;
  return acc;
}, {});
```

---

## 🔔 Notifications

### Create Notification

```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: targetUserId,
    title: 'Nouvelle réservation',
    message: 'Un client a réservé votre lot "Panier de légumes"',
    type: 'info', // 'success', 'warning', 'error'
    read: false
  })
  .select()
  .single();
```

### Get User Notifications

```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', currentUser.id)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Get Unread Count

```typescript
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', currentUser.id)
  .eq('read', false);
```

### Mark as Read

```typescript
// Une notification
const { data, error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId);

// Toutes les notifications
const { data, error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('user_id', currentUser.id)
  .eq('read', false);
```

### Delete Notification

```typescript
const { error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId)
  .eq('user_id', currentUser.id);
```

---

## ⚙️ Paramètres Plateforme

### Get All Settings (Admin)

```typescript
const { data, error } = await supabase
  .from('platform_settings')
  .select('*')
  .order('category', { ascending: true });
```

**Response**
```json
[
  {
    "id": "uuid",
    "key": "platform_name",
    "value": "EcoPanier",
    "description": "Nom de la plateforme",
    "category": "general",
    "updated_at": "2025-01-01T00:00:00Z",
    "updated_by": "admin-uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Setting by Key

```typescript
const { data, error } = await supabase
  .from('platform_settings')
  .select('*')
  .eq('key', 'min_lot_price')
  .single();
```

### Update Setting (Admin)

```typescript
const { data, error } = await supabase
  .from('platform_settings')
  .update({
    value: 3, // Nouvelle valeur (JSONB)
    updated_by: currentUser.id
  })
  .eq('key', 'min_lot_price')
  .select()
  .single();
```

### Get Settings History

```typescript
const { data, error } = await supabase
  .from('platform_settings_history')
  .select(`
    *,
    changed_by_profile:profiles!changed_by(full_name, role)
  `)
  .eq('setting_key', 'merchant_commission')
  .order('changed_at', { ascending: false });
```

---

## ⚠️ Codes d'erreur

### Erreurs d'authentification

| Code | Message | Description |
|------|---------|-------------|
| `400` | Invalid login credentials | Email ou mot de passe incorrect |
| `422` | User already registered | Email déjà utilisé |
| `401` | Invalid token | Session expirée |

### Erreurs de base de données

| Code | Message | Description |
|------|---------|-------------|
| `23505` | duplicate key value violates unique constraint | Violation de contrainte unique |
| `23503` | foreign key violation | Référence invalide |
| `23514` | check constraint violation | Violation de contrainte de vérification |
| `42P01` | relation does not exist | Table inexistante |

### Gestion des erreurs

```typescript
try {
  const { data, error } = await supabase
    .from('lots')
    .select();
  
  if (error) throw error;
  
  return data;
} catch (error: any) {
  console.error('Error:', error.message);
  
  if (error.code === '23505') {
    throw new Error('Cet élément existe déjà');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Aucun résultat trouvé');
  }
  
  throw new Error('Une erreur est survenue');
}
```

---

## 🔍 Filtres et recherche avancée

### Opérateurs disponibles

```typescript
// Égalité
.eq('column', value)

// Non égalité
.neq('column', value)

// Plus grand que
.gt('column', value)
.gte('column', value)

// Plus petit que
.lt('column', value)
.lte('column', value)

// LIKE (contient)
.like('column', '%search%')
.ilike('column', '%search%') // Case insensitive

// IN (dans une liste)
.in('column', [value1, value2])

// IS NULL
.is('column', null)

// NOT NULL
.not('column', 'is', null)

// Plage
.range(0, 9) // 10 premiers résultats

// Limite
.limit(10)

// Tri
.order('column', { ascending: false })
```

### Exemples de recherche

```typescript
// Recherche de lots par titre
const { data } = await supabase
  .from('lots')
  .select('*')
  .ilike('title', '%légumes%')
  .eq('status', 'available');

// Lots dans une plage de prix
const { data } = await supabase
  .from('lots')
  .select('*')
  .gte('discounted_price', 2)
  .lte('discounted_price', 10);

// Réservations d'un utilisateur pour aujourd'hui
const today = new Date().toISOString().split('T')[0];
const { data } = await supabase
  .from('reservations')
  .select('*')
  .eq('user_id', currentUser.id)
  .gte('created_at', `${today}T00:00:00`)
  .lte('created_at', `${today}T23:59:59`);
```

---

## 📚 Ressources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgREST API](https://postgrest.org/en/stable/api.html)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/functions.html)

---

<div align="center">

**API conçue pour la simplicité, la performance et la sécurité**

[⬅️ Retour au README](./README.md)

</div>

