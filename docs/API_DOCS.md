# 📡 Documentation API - EcoPanier

> **Référence complète des API** - Guide complet des endpoints Supabase et Gemini AI

---

## 📋 Table des Matières

- [Introduction](#introduction)
- [Authentification](#authentification)
- [Profiles](#profiles)
- [Lots](#lots)
- [Reservations](#reservations)
- [Missions](#missions)
- [Platform Settings](#platform-settings)
- [Activity Logs](#activity-logs)
- [Storage](#storage)
- [Gemini AI](#gemini-ai)
- [Codes d'erreur](#codes-derreur)

---

## Introduction

EcoPanier utilise **Supabase** comme backend principal, qui expose une API REST auto-générée basée sur le schéma PostgreSQL.

### Base URL

```
https://votre-projet.supabase.co/rest/v1/
```

### Authentication

Toutes les requêtes (sauf publiques) nécessitent un header d'authentification :

```http
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

### Response Format

```json
{
  "data": [...],
  "error": null,
  "count": 10,
  "status": 200,
  "statusText": "OK"
}
```

---

## Authentification

### Sign Up (Inscription)

Créer un nouveau compte utilisateur.

**Endpoint** : `POST /auth/v1/signup`

**Request Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** :
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refreshToken...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Code Example** :
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!'
});
```

---

### Sign In (Connexion)

Authentifier un utilisateur existant.

**Endpoint** : `POST /auth/v1/token?grant_type=password`

**Request Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** : Identique à Sign Up

**Code Example** :
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
});
```

---

### Sign Out (Déconnexion)

Invalider le token de session.

**Code Example** :
```typescript
const { error } = await supabase.auth.signOut();
```

---

### Reset Password

Envoyer un email de réinitialisation.

**Code Example** :
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'https://app.ecopanier.fr/reset-password' }
);
```

---

## Profiles

### Get All Profiles

Récupérer la liste des profils utilisateurs.

**Endpoint** : `GET /profiles`

**Query Parameters** :
- `role` : Filtrer par rôle (customer, merchant, beneficiary, collector, admin)
- `verified` : Filtrer par statut de vérification (true/false)
- `limit` : Nombre de résultats (default: 10)
- `offset` : Pagination

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'merchant')
  .eq('verified', true)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response** :
```json
[
  {
    "id": "uuid",
    "role": "merchant",
    "full_name": "Jean Dupont",
    "email": "jean@boulangerie.fr",
    "phone": "+33612345678",
    "verified": true,
    "business_name": "Boulangerie Dupont",
    "business_hours": {
      "monday": { "open": "07:00", "close": "19:00" },
      "tuesday": { "open": "07:00", "close": "19:00" }
    },
    "business_logo_url": "https://storage.supabase.co/...",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Profile by ID

Récupérer un profil spécifique.

**Endpoint** : `GET /profiles?id=eq.{id}`

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

---

### Update Profile

Mettre à jour un profil utilisateur.

**Endpoint** : `PATCH /profiles?id=eq.{id}`

**Request Body** :
```json
{
  "full_name": "Jean Dupont",
  "phone": "+33612345678",
  "business_name": "Boulangerie Dupont"
}
```

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Jean Dupont',
    phone: '+33612345678'
  })
  .eq('id', userId);
```

---

## Lots

### Get All Lots

Récupérer la liste des lots disponibles.

**Endpoint** : `GET /lots`

**Query Parameters** :
- `status` : available, reserved, sold_out, expired
- `category` : fruits_legumes, boulangerie, boucherie, etc.
- `is_free` : true/false (lots gratuits bénéficiaires)
- `merchant_id` : Filtrer par commerçant
- `min_price`, `max_price` : Fourchette de prix

**Code Example** :
```typescript
// Lots disponibles avec infos commerçant
const { data, error } = await supabase
  .from('lots')
  .select(`
    *,
    merchant:profiles!merchant_id(
      full_name,
      business_name,
      business_logo_url,
      phone
    )
  `)
  .eq('status', 'available')
  .gte('discounted_price', 5)
  .lte('discounted_price', 20)
  .order('created_at', { ascending: false });
```

**Response** :
```json
[
  {
    "id": "uuid",
    "merchant_id": "uuid",
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
      "https://storage.supabase.co/lot-images/..."
    ],
    "pickup_start": "2024-01-20T17:00:00Z",
    "pickup_end": "2024-01-20T19:00:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "merchant": {
      "full_name": "Jean Dupont",
      "business_name": "Boulangerie Dupont",
      "business_logo_url": "https://...",
      "phone": "+33612345678"
    }
  }
]
```

---

### Get Free Lots (Bénéficiaires)

Récupérer uniquement les lots gratuits.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('lots')
  .select(`
    *,
    merchant:profiles!merchant_id(business_name, phone)
  `)
  .eq('is_free', true)
  .eq('status', 'available')
  .gt('quantity_total', 0);
```

---

### Create Lot (Commerçant)

Créer un nouveau lot d'invendus.

**Endpoint** : `POST /lots`

**Request Body** :
```json
{
  "merchant_id": "uuid",
  "title": "Pain invendu du jour",
  "description": "10 baguettes + 5 croissants",
  "category": "boulangerie",
  "original_price": 30.00,
  "discounted_price": 10.00,
  "quantity_total": 3,
  "is_free": false,
  "images": ["https://..."],
  "pickup_start": "2024-01-20T18:00:00Z",
  "pickup_end": "2024-01-20T20:00:00Z"
}
```

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('lots')
  .insert({
    merchant_id: merchantId,
    title: 'Pain invendu du jour',
    description: '10 baguettes + 5 croissants',
    category: 'boulangerie',
    original_price: 30.00,
    discounted_price: 10.00,
    quantity_total: 3,
    is_free: false,
    images: imageUrls,
    pickup_start: '2024-01-20T18:00:00Z',
    pickup_end: '2024-01-20T20:00:00Z'
  })
  .select()
  .single();
```

---

### Update Lot

Modifier un lot existant.

**Endpoint** : `PATCH /lots?id=eq.{id}`

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('lots')
  .update({
    discounted_price: 8.00,
    quantity_total: 5
  })
  .eq('id', lotId)
  .eq('merchant_id', merchantId); // Sécurité : seul le merchant peut modifier
```

---

### Delete Lot

Supprimer un lot (soft delete via status).

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('lots')
  .update({ status: 'expired' })
  .eq('id', lotId)
  .eq('merchant_id', merchantId);
```

---

## Reservations

### Get User Reservations

Récupérer les réservations d'un utilisateur.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    lot:lots(
      title,
      description,
      images,
      pickup_start,
      pickup_end,
      merchant:profiles!merchant_id(
        business_name,
        phone,
        business_logo_url
      )
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Response** :
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "lot_id": "uuid",
    "quantity": 1,
    "total_price": 10.00,
    "pickup_pin": "123456",
    "status": "pending",
    "completed_at": null,
    "created_at": "2024-01-15T10:00:00Z",
    "lot": {
      "title": "Panier de fruits",
      "description": "...",
      "images": ["https://..."],
      "pickup_start": "2024-01-20T17:00:00Z",
      "pickup_end": "2024-01-20T19:00:00Z",
      "merchant": {
        "business_name": "Boulangerie Dupont",
        "phone": "+33612345678",
        "business_logo_url": "https://..."
      }
    }
  }
]
```

---

### Create Reservation

Créer une nouvelle réservation.

**Request Body** :
```json
{
  "user_id": "uuid",
  "lot_id": "uuid",
  "quantity": 2,
  "total_price": 20.00
}
```

**Code Example** :
```typescript
// Génération du PIN à 6 chiffres
const generatePIN = () => Math.floor(100000 + Math.random() * 900000).toString();

const { data, error } = await supabase
  .from('reservations')
  .insert({
    user_id: userId,
    lot_id: lotId,
    quantity: 2,
    total_price: 20.00,
    pickup_pin: generatePIN(),
    status: 'pending'
  })
  .select()
  .single();

// Mettre à jour la quantité du lot
await supabase
  .from('lots')
  .update({
    quantity_reserved: lot.quantity_reserved + 2
  })
  .eq('id', lotId);
```

---

### Check Beneficiary Daily Limit

Vérifier si un bénéficiaire a atteint sa limite de 2 lots/jour.

**Code Example** :
```typescript
const today = new Date().toISOString().split('T')[0];

const { data, error } = await supabase
  .from('reservations')
  .select('id')
  .eq('user_id', beneficiaryId)
  .gte('created_at', `${today}T00:00:00Z`)
  .lte('created_at', `${today}T23:59:59Z`);

const hasReachedLimit = data.length >= 2;
```

---

### Complete Reservation (Station de retrait)

Marquer une réservation comme complétée après scan QR + PIN.

**Code Example** :
```typescript
// 1. Vérifier le PIN
const { data: reservation, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('id', reservationId)
  .eq('pickup_pin', inputPin)
  .single();

if (!reservation) {
  throw new Error('Code PIN incorrect');
}

// 2. Marquer comme complété
await supabase
  .from('reservations')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', reservationId);

// 3. Mettre à jour le lot
await supabase
  .from('lots')
  .update({
    quantity_sold: lot.quantity_sold + reservation.quantity,
    quantity_reserved: lot.quantity_reserved - reservation.quantity
  })
  .eq('id', reservation.lot_id);
```

---

### Cancel Reservation

Annuler une réservation.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({ status: 'cancelled' })
  .eq('id', reservationId)
  .eq('user_id', userId); // Sécurité
```

---

## Missions

### Get Available Missions (Collecteurs)

Récupérer les missions disponibles.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('missions')
  .select(`
    *,
    merchant:profiles!merchant_id(
      business_name,
      phone,
      address
    )
  `)
  .eq('status', 'available')
  .order('created_at', { ascending: false });
```

---

### Accept Mission

Accepter une mission de collecte.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('missions')
  .update({
    collector_id: collectorId,
    status: 'accepted'
  })
  .eq('id', missionId)
  .is('collector_id', null); // Sécurité : mission non déjà prise
```

---

### Complete Mission

Marquer une mission comme terminée.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('missions')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', missionId)
  .eq('collector_id', collectorId); // Sécurité
```

---

## Platform Settings

### Get All Settings (Admin)

Récupérer tous les paramètres de la plateforme.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('platform_settings')
  .select('*')
  .order('key');
```

**Response** :
```json
[
  {
    "id": "uuid",
    "key": "commission_rate",
    "value": { "rate": 0.15, "description": "15% commission" },
    "updated_by": "admin-uuid",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": "uuid",
    "key": "max_beneficiary_lots_per_day",
    "value": { "limit": 2 },
    "updated_by": "admin-uuid",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### Update Setting (Admin)

Modifier un paramètre système.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('platform_settings')
  .update({
    value: { rate: 0.12 },
    updated_by: adminId,
    updated_at: new Date().toISOString()
  })
  .eq('key', 'commission_rate');

// Log l'historique
await supabase.from('settings_history').insert({
  setting_key: 'commission_rate',
  old_value: { rate: 0.15 },
  new_value: { rate: 0.12 },
  changed_by: adminId
});
```

---

## Activity Logs

### Get Activity Logs (Admin)

Récupérer l'historique d'activité.

**Code Example** :
```typescript
const { data, error } = await supabase
  .from('activity_logs')
  .select(`
    *,
    user:profiles(full_name, email, role)
  `)
  .order('created_at', { ascending: false })
  .limit(100);
```

**Response** :
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "action_type": "lot_created",
    "details": {
      "lot_id": "uuid",
      "title": "Pain invendu",
      "price": 10.00
    },
    "created_at": "2024-01-15T10:00:00Z",
    "user": {
      "full_name": "Jean Dupont",
      "email": "jean@boulangerie.fr",
      "role": "merchant"
    }
  }
]
```

---

### Create Activity Log

Logger une action utilisateur.

**Code Example** :
```typescript
await supabase.from('activity_logs').insert({
  user_id: userId,
  action_type: 'lot_created',
  details: {
    lot_id: newLot.id,
    title: newLot.title,
    price: newLot.discounted_price
  }
});
```

---

## Storage

### Upload Lot Image

Uploader une image de lot.

**Code Example** :
```typescript
const uploadLotImage = async (file: File) => {
  // 1. Upload vers Storage
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('lot-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // 2. Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('lot-images')
    .getPublicUrl(fileName);

  return publicUrl;
};
```

---

### Upload Business Logo

Uploader un logo de commerce.

**Code Example** :
```typescript
const uploadBusinessLogo = async (file: File, merchantId: string) => {
  const fileName = `${merchantId}-logo.${file.name.split('.').pop()}`;
  
  // Remplacer l'ancien logo si existe
  const { data, error } = await supabase.storage
    .from('business-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Écrase si existe
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('business-logos')
    .getPublicUrl(fileName);

  // Mettre à jour le profil
  await supabase
    .from('profiles')
    .update({ business_logo_url: publicUrl })
    .eq('id', merchantId);

  return publicUrl;
};
```

---

### Delete Image

Supprimer une image du Storage.

**Code Example** :
```typescript
const deleteImage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from('lot-images')
    .remove([imagePath]);

  if (error) throw error;
};
```

---

## Gemini AI

### Analyze Image with Gemini 2.0 Flash

Analyser une image de produit alimentaire avec l'IA.

**Function** : `analyzeImageWithGemini(imageFile: File)`

**Input** :
```typescript
interface ImageFile extends File {
  type: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number; // Max 5MB recommandé
}
```

**Output** :
```typescript
interface AnalysisResult {
  success: boolean;
  data?: {
    title: string;
    description: string;
    category: string;
    originalPrice: number;
    discountedPrice: number;
    quantity: number;
    requiresColdChain: boolean;
    isUrgent: boolean;
    confidence: number; // 0-1
  };
  error?: string;
}
```

**Example Response** :
```json
{
  "success": true,
  "data": {
    "title": "Lot de tomates fraîches",
    "description": "Tomates rondes bien mûres, idéales pour salades et sauces. Calibre moyen. Origine France.",
    "category": "fruits_legumes",
    "originalPrice": 12.50,
    "discountedPrice": 6.00,
    "quantity": 2,
    "requiresColdChain": true,
    "isUrgent": false,
    "confidence": 0.92
  }
}
```

**Code Example** :
```typescript
import { analyzeImageWithGemini } from '@/utils/geminiService';

const handleImageUpload = async (file: File) => {
  try {
    setLoading(true);
    const result = await analyzeImageWithGemini(file);
    
    if (result.success && result.data) {
      // Auto-fill form
      setFormData({
        title: result.data.title,
        description: result.data.description,
        category: result.data.category,
        original_price: result.data.originalPrice,
        discounted_price: result.data.discountedPrice,
        quantity_total: result.data.quantity
      });
      
      toast.success(`Analysé avec ${(result.data.confidence * 100).toFixed(0)}% de confiance`);
    }
  } catch (error) {
    console.error('Erreur analyse IA:', error);
    toast.error('Impossible d\'analyser l\'image');
  } finally {
    setLoading(false);
  }
};
```

**Rate Limits** :
- **Free tier** : 60 requêtes/minute
- **Paid tier** : 1000 requêtes/minute

**Error Handling** :
```typescript
if (!VITE_GEMINI_API_KEY) {
  return {
    success: false,
    error: 'Clé API Gemini non configurée'
  };
}

// Retry avec exponential backoff
const MAX_RETRIES = 3;
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    const result = await callGeminiAPI();
    return result;
  } catch (error) {
    if (i === MAX_RETRIES - 1) throw error;
    await sleep(Math.pow(2, i) * 1000);
  }
}
```

---

## Codes d'Erreur

### Supabase Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `PGRST116` | Row not found | Vérifier l'ID ou les filtres |
| `23505` | Unique constraint violation | Valeur dupliquée (email, PIN, etc.) |
| `23503` | Foreign key violation | L'entité référencée n'existe pas |
| `42501` | Insufficient privilege | Problème RLS ou permissions |
| `42P01` | Undefined table | Table n'existe pas (migration?) |

### Gemini AI Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `403` | API key invalid | Vérifier VITE_GEMINI_API_KEY |
| `429` | Rate limit exceeded | Attendre ou upgrader quota |
| `400` | Invalid request | Vérifier format image |
| `500` | Server error | Retry avec backoff |

---

## Best Practices

### 1. Toujours gérer les erreurs

```typescript
// ✅ BON
try {
  const { data, error } = await supabase.from('lots').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Erreur:', error);
  throw new Error('Message utilisateur-friendly');
}

// ❌ MAUVAIS
const { data } = await supabase.from('lots').select();
return data; // Ignore les erreurs !
```

---

### 2. Utiliser les relations (JOIN)

```typescript
// ✅ BON - Une requête avec JOIN
const { data } = await supabase
  .from('reservations')
  .select('*, lot:lots(*), user:profiles(*)');

// ❌ MAUVAIS - N+1 queries
const reservations = await supabase.from('reservations').select();
for (const r of reservations) {
  const lot = await supabase.from('lots').select().eq('id', r.lot_id);
}
```

---

### 3. Pagination pour grandes listes

```typescript
const PAGE_SIZE = 20;

const { data, count } = await supabase
  .from('lots')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

---

### 4. Indexes pour performance

Assurez-vous que les colonnes fréquemment filtrées ont des index :

```sql
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_merchant ON lots(merchant_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
```

---

## Exemples Complets

### Workflow complet : Créer un lot avec IA

```typescript
const createLotWithAI = async (imageFile: File) => {
  // 1. Analyser l'image avec Gemini
  const analysis = await analyzeImageWithGemini(imageFile);
  
  if (!analysis.success) {
    throw new Error('Analyse IA échouée');
  }
  
  // 2. Upload l'image vers Storage
  const imageUrl = await uploadLotImage(imageFile);
  
  // 3. Créer le lot avec données IA
  const { data: lot, error } = await supabase
    .from('lots')
    .insert({
      merchant_id: merchantId,
      ...analysis.data,
      images: [imageUrl],
      status: 'available'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // 4. Logger l'action
  await supabase.from('activity_logs').insert({
    user_id: merchantId,
    action_type: 'lot_created',
    details: {
      lot_id: lot.id,
      title: lot.title,
      used_ai: true,
      confidence: analysis.data.confidence
    }
  });
  
  return lot;
};
```

---

<div align="center">

**API Documentation - EcoPanier** 🚀  
Version 1.0 - Dernière mise à jour : Janvier 2025

</div>
