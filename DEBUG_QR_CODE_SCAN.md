# 🔍 Guide de Débogage - Reconnaissance QR Code

## Problème
La station de retrait ne reconnaît pas les QR codes des réservations.

## Modifications Effectuées

### 1. Ajout de Logs de Débogage Détaillés
Des `console.log` ont été ajoutés dans `PickupStation.tsx` pour tracer le processus complet :

```
📱 QR code scanné: [données brutes]
📦 Données parsées: [objet JSON]
🔍 ReservationId: [ID]
🔄 Récupération de la réservation depuis Supabase...
✅ Réservation récupérée: [données]
✅ Réservation valide, affichage de l'interface
```

### 2. Amélioration des Requêtes Supabase
Les requêtes ont été améliorées pour utiliser des foreign key constraints explicites :

**Avant :**
```typescript
.select('*, lots(*, profiles(business_name, business_address)), profiles(full_name)')
```

**Après :**
```typescript
.select(`
  *,
  lots!lot_id (
    *,
    profiles!merchant_id (
      business_name,
      business_address
    )
  ),
  profiles!user_id (
    full_name
  )
`)
```

### 3. Messages d'Erreur Améliorés
Les messages d'erreur sont maintenant plus spécifiques pour faciliter le diagnostic.

## Comment Tester

### Étape 1 : Ouvrir la Console du Navigateur
1. Sur la page de la station de retrait (`/pickup`)
2. Appuyez sur **F12** pour ouvrir les DevTools
3. Allez dans l'onglet **Console**

### Étape 2 : Scanner un QR Code
1. Cliquez sur "Scanner le QR Code"
2. Scannez un QR code de réservation valide
3. Observez les logs dans la console

### Étape 3 : Analyser les Logs

#### ✅ Cas de Succès
Si tout fonctionne, vous devriez voir :
```
📱 QR code scanné: {"reservationId":"abc123",...}
📦 Données parsées: {reservationId: "abc123", pin: "123456", ...}
📦 Réservation simple détectée
🔍 ReservationId: abc123
🔄 Récupération de la réservation depuis Supabase...
✅ Réservation récupérée: {...}
✅ Réservation valide, affichage de l'interface
```

#### ❌ Cas d'Échec Possible

**Scénario 1 : QR Code Invalide**
```
📱 QR code scanné: [données incorrectes]
❌ Erreur: Unexpected token...
```
→ **Solution** : Le QR code n'est pas au bon format JSON

**Scénario 2 : ReservationId Manquant**
```
📦 Données parsées: {pin: "123456", userId: "..."}
❌ QR code invalide - aucun reservationId trouvé
```
→ **Solution** : Le QR code ne contient pas de `reservationId`

**Scénario 3 : Réservation Introuvable**
```
🔍 ReservationId: abc123
🔄 Récupération de la réservation depuis Supabase...
❌ Erreur Supabase: {...}
```
→ **Solution** : La réservation n'existe pas dans la base ou problème de permissions

**Scénario 4 : Problème de Relations Supabase**
```
❌ Erreur Supabase: {message: "foreign key constraint not found"}
```
→ **Solution** : Les foreign keys ne sont pas configurées correctement

## Vérifications Supabase

### 1. Vérifier les Foreign Keys
Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier la structure de la table reservations
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='reservations';
```

**Résultat attendu :**
- `reservations.lot_id` → `lots.id`
- `reservations.user_id` → `profiles.id`
- `lots.merchant_id` → `profiles.id`

### 2. Tester la Requête Manuellement
```sql
SELECT 
  r.*,
  l.title as lot_title,
  p_user.full_name as user_name,
  p_merchant.business_name as merchant_name
FROM reservations r
LEFT JOIN lots l ON r.lot_id = l.id
LEFT JOIN profiles p_user ON r.user_id = p_user.id
LEFT JOIN profiles p_merchant ON l.merchant_id = p_merchant.id
WHERE r.id = 'ID_DE_TEST'
LIMIT 1;
```

### 3. Vérifier les Permissions RLS
```sql
-- Désactiver temporairement RLS pour tester
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

⚠️ **Attention** : Réactivez RLS en production !

## Solutions aux Problèmes Courants

### Problème 1 : "Réservation introuvable"
**Causes possibles :**
- L'ID de réservation n'existe pas
- RLS bloque l'accès
- Les foreign keys sont incorrectes

**Solutions :**
1. Vérifier que la réservation existe dans Supabase
2. Désactiver temporairement RLS pour tester
3. Vérifier les foreign keys

### Problème 2 : "QR code invalide"
**Causes possibles :**
- QR code corrompu
- Format JSON incorrect
- Champ `reservationId` manquant

**Solutions :**
1. Régénérer le QR code depuis l'interface client
2. Vérifier le format dans `QRCodeModal.tsx`

### Problème 3 : Les données ne s'affichent pas
**Causes possibles :**
- Les relations Supabase ne retournent pas les bonnes données
- Problème de typage TypeScript

**Solutions :**
1. Vérifier la console pour les erreurs
2. Vérifier que les types correspondent aux données retournées

## Format Attendu du QR Code

### Réservation Simple
```json
{
  "reservationId": "uuid-de-la-reservation",
  "pin": "123456",
  "userId": "uuid-de-l-utilisateur",
  "lotId": "uuid-du-lot",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

### Panier Groupé
```json
{
  "cartGroupId": "uuid-du-groupe",
  "pin": "123456",
  "userId": "uuid-de-l-utilisateur",
  "reservationIds": ["uuid1", "uuid2", "uuid3"],
  "timestamp": "2025-01-20T10:00:00.000Z",
  "type": "group"
}
```

## Prochaines Étapes

1. **Tester avec les logs** → Noter les messages d'erreur exacts
2. **Vérifier Supabase** → S'assurer que les données et relations existent
3. **Partager les logs** → Fournir les logs de console pour diagnostic
4. **Tester différents QR codes** → Simple vs Groupé

## Contact
Si le problème persiste après ces vérifications, partagez :
- Les logs de la console (copier/coller)
- Une capture d'écran du QR code
- L'ID de la réservation problématique

---

**Dernière mise à jour** : 20 janvier 2025

