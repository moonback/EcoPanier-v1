# 🎁 Conversion Automatique des Lots Expirés en Lots Gratuits

> **Fonctionnalité anti-gaspillage** : Les lots non vendus après les heures de retrait deviennent automatiquement gratuits pour les bénéficiaires le lendemain.

---

## 📋 Vue d'Ensemble

### Problème résolu
Les commerçants créent des lots d'invendus, mais parfois ces lots ne sont pas tous vendus avant la fin de la période de retrait. Au lieu de les jeter, ces produits sont automatiquement convertis en lots gratuits pour les bénéficiaires.

### Solution
Un système automatique qui :
1. ✅ Détecte les lots dont l'heure de retrait (`pickup_end`) est passée
2. 🔄 Les convertit en lots gratuits (`is_free = true`, `discounted_price = 0`)
3. 📅 Les reprogramme pour le lendemain aux heures d'ouverture du commerce
4. 📢 Notifie les commerçants et rend les lots visibles aux bénéficiaires

---

## 🗄️ Modifications de la Base de Données

### Nouvelle colonne `is_free`

```sql
-- Migration: 20250120_add_is_free_to_lots.sql
ALTER TABLE lots ADD COLUMN is_free boolean DEFAULT false;

-- Index pour optimiser les requêtes
CREATE INDEX idx_lots_is_free ON lots(is_free) WHERE is_free = true;
CREATE INDEX idx_lots_free_available ON lots(is_free, status, pickup_start) 
WHERE is_free = true AND status = 'available';
```

### Fonctions PostgreSQL

#### `convert_expired_lots_to_free()`

Fonction principale qui gère la conversion des lots expirés :

```sql
-- Retourne une table avec les informations des lots convertis
SELECT * FROM convert_expired_lots_to_free();
```

**Résultat** :
```
| lot_id | lot_title | original_status | quantity_remaining |
|--------|-----------|-----------------|-------------------|
| uuid   | Pain...   | available       | 5                 |
```

**Ce que fait cette fonction** :

1. **Sélectionne les lots éligibles** :
   - `pickup_end < NOW()` (heure de retrait passée)
   - `status IN ('available', 'reserved')`
   - `is_free = false` (pas déjà gratuit)
   - `quantity_total - quantity_sold > 0` (il reste du stock)

2. **Annule les réservations pending** :
   - Les réservations non retirées sont annulées

3. **Calcule les nouvelles dates** :
   - Par défaut : 8h-20h le lendemain
   - Si `business_hours` est défini : utilise les horaires du commerce

4. **Met à jour le lot** :
   ```sql
   UPDATE lots SET
     is_free = true,
     discounted_price = 0,
     status = 'available',
     quantity_total = remaining_quantity,
     quantity_reserved = 0,
     quantity_sold = 0,
     pickup_start = next_day_start,
     pickup_end = next_day_end,
     is_urgent = true,
     updated_at = NOW()
   ```

5. **Crée des notifications** :
   - Notifie chaque commerçant concerné

#### `auto_convert_expired_lots()`

Version simplifiée qui retourne juste le nombre de lots convertis :

```sql
SELECT auto_convert_expired_lots(); -- Retourne: integer
```

---

## 💻 Utilisation Frontend

### Service TypeScript

```typescript
import { 
  convertExpiredLotsToFree, 
  getExpiringLots, 
  getFreeLots 
} from '@/utils/expiredLotsService';

// Convertir manuellement les lots expirés
const result = await convertExpiredLotsToFree();
console.log(`${result.count} lots convertis`);

// Obtenir les lots qui expirent bientôt (2h)
const expiring = await getExpiringLots();

// Obtenir tous les lots gratuits disponibles
const freeLots = await getFreeLots();
```

### Interface Admin

**Route** : Dashboard Admin → Gestion → Lots Expirés

**Composant** : `ExpiredLotsManager.tsx`

**Fonctionnalités** :
- 📊 Statistiques sur les lots convertis (7 derniers jours)
- 🔄 Bouton de conversion manuelle
- ⏰ Liste des lots qui expirent dans les 2 prochaines heures
- ✅ Historique des lots récemment convertis

---

## 🔧 Automatisation avec CRON

### Option 1 : Supabase Edge Function + CRON

**Créer une Edge Function** :

```typescript
// supabase/functions/convert-expired-lots/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  // Vérifier l'authentification (secret key)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Appeler la fonction PostgreSQL
    const { data, error } = await supabase.rpc('auto_convert_expired_lots');

    if (error) throw error;

    console.log(`✅ ${data} lots convertis en gratuit`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Configurer le CRON** :

```bash
# Déployer la fonction
supabase functions deploy convert-expired-lots

# Créer un CRON job (toutes les heures)
# Via Supabase Dashboard > Edge Functions > Schedules
# Ou via API externe (cron-job.org, EasyCron, etc.)
```

**CRON Expression** : `0 * * * *` (toutes les heures à l'heure pile)

### Option 2 : PostgreSQL pg_cron (si activé)

```sql
-- Installer l'extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer un job qui s'exécute toutes les heures
SELECT cron.schedule(
  'convert-expired-lots',   -- Nom du job
  '0 * * * *',              -- Chaque heure à l'heure pile
  $$SELECT auto_convert_expired_lots();$$
);

-- Vérifier les jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'convert-expired-lots')
ORDER BY start_time DESC 
LIMIT 10;
```

### Option 3 : Service externe (GitHub Actions)

```yaml
# .github/workflows/convert-expired-lots.yml
name: Convert Expired Lots

on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
  workflow_dispatch:  # Permet l'exécution manuelle

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-project.supabase.co/functions/v1/convert-expired-lots
```

---

## 🎯 Flux de Conversion

```
┌─────────────────────────────────────────────────┐
│  1. Lot créé par commerçant                     │
│     - pickup_end: 2025-01-20 19:00             │
│     - discounted_price: 5€                      │
│     - is_free: false                            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  2. Heure de retrait passée                     │
│     - NOW: 2025-01-20 19:30                     │
│     - Lot non vendu (quantity_remaining > 0)    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  3. CRON Job s'exécute (toutes les heures)      │
│     - Détecte le lot éligible                   │
│     - Appelle convert_expired_lots_to_free()   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  4. Conversion du lot                           │
│     ✓ is_free = true                            │
│     ✓ discounted_price = 0€                     │
│     ✓ status = 'available'                      │
│     ✓ pickup_start = 2025-01-21 08:00          │
│     ✓ pickup_end = 2025-01-21 20:00            │
│     ✓ is_urgent = true                          │
│     ✓ quantity_reserved = 0                     │
│     ✓ quantity_sold = 0                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  5. Notifications & Disponibilité               │
│     - Commerçant notifié                        │
│     - Lot visible pour bénéficiaires            │
│     - Affiché dans "Paniers solidaires"         │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Requêtes Utiles

### Trouver tous les lots gratuits actifs

```sql
SELECT 
  l.*,
  p.business_name,
  p.business_address
FROM lots l
JOIN profiles p ON l.merchant_id = p.id
WHERE l.is_free = true
  AND l.status = 'available'
  AND l.pickup_end >= NOW()
  AND (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0
ORDER BY l.pickup_start ASC;
```

### Statistiques de conversion

```sql
-- Lots convertis dans les 7 derniers jours
SELECT 
  COUNT(*) as total_converted,
  SUM(quantity_total) as total_meals_saved,
  COUNT(DISTINCT merchant_id) as merchants_impacted
FROM lots
WHERE is_free = true
  AND created_at >= NOW() - INTERVAL '7 days';
```

### Lots qui expirent bientôt (2h)

```sql
SELECT 
  l.id,
  l.title,
  l.pickup_end,
  l.quantity_total - l.quantity_sold as remaining,
  p.business_name
FROM lots l
JOIN profiles p ON l.merchant_id = p.id
WHERE l.status IN ('available', 'reserved')
  AND l.is_free = false
  AND l.pickup_end BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
  AND (l.quantity_total - l.quantity_sold) > 0
ORDER BY l.pickup_end ASC;
```

---

## 📱 Expérience Utilisateur

### Pour les Commerçants

**Notification reçue** :
```
🎁 Lots convertis en gratuit

3 lot(s) non vendu(s) ont été automatiquement convertis 
en lots gratuits pour demain.

Ces lots sont maintenant disponibles pour les bénéficiaires 
et contribuent à réduire le gaspillage alimentaire.
```

**Dans le dashboard** :
- Les lots convertis n'apparaissent plus dans "Mes lots actifs"
- Ils sont visibles dans une section "Lots solidaires donnés"
- Les statistiques d'impact sont mises à jour

### Pour les Bénéficiaires

**Dans "Paniers solidaires"** :
- Badge "🎁 NOUVEAU AUJOURD'HUI" pour les lots récemment convertis
- Badge "🔥 URGENT" car `is_urgent = true`
- Prix affiché : **GRATUIT**
- Limite : 2 réservations par jour

**Processus de réservation** :
1. Sélectionner le lot gratuit
2. Choisir la quantité (max: stock disponible)
3. Confirmer la réservation (total_price = 0€)
4. Recevoir un QR Code + PIN pour le retrait
5. Se rendre au commerce pendant les horaires de retrait

---

## 🧪 Tests

### Test manuel

```sql
-- 1. Créer un lot de test qui a expiré il y a 1h
INSERT INTO lots (
  merchant_id, title, description, category,
  original_price, discounted_price,
  quantity_total, quantity_reserved, quantity_sold,
  pickup_start, pickup_end,
  status, is_free
) VALUES (
  'merchant-uuid',
  'Test Pain Expiré',
  'Lot de test pour conversion',
  'boulangerie',
  10.00, 5.00,
  10, 0, 3,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '1 hour',
  'available', false
);

-- 2. Exécuter la conversion
SELECT * FROM convert_expired_lots_to_free();

-- 3. Vérifier que le lot a été converti
SELECT 
  id, title, is_free, discounted_price, 
  status, pickup_start, pickup_end,
  quantity_total, quantity_reserved, quantity_sold
FROM lots
WHERE title = 'Test Pain Expiré';

-- Résultat attendu:
-- is_free = true
-- discounted_price = 0
-- status = 'available'
-- pickup_start = demain 8h (ou horaires du commerce)
-- pickup_end = demain 20h
-- quantity_total = 7 (10 - 3 vendus)
-- quantity_reserved = 0
-- quantity_sold = 0
```

### Test d'intégration frontend

1. Se connecter en tant qu'admin
2. Aller dans "Gestion > Lots Expirés"
3. Cliquer sur "Convertir maintenant"
4. Vérifier les statistiques
5. Se connecter en tant que bénéficiaire
6. Vérifier que les lots gratuits apparaissent dans "Paniers solidaires"

---

## ⚙️ Configuration

### Variables d'environnement

```env
# Pour Edge Function CRON
CRON_SECRET=your-secret-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Paramètres plateforme

Dans `platform_settings` :

```json
{
  "key": "auto_convert_expired_lots",
  "value": {
    "enabled": true,
    "default_pickup_hours": {
      "start": "08:00",
      "end": "20:00"
    },
    "notification_enabled": true
  }
}
```

---

## 📊 Impact & Métriques

### KPIs à suivre

- **Taux de conversion** : `lots_convertis / lots_expirés`
- **Repas sauvés** : `SUM(quantity_total)` des lots gratuits
- **Taux de retrait** : lots gratuits retirés vs créés
- **Impact CO₂** : `repas_sauvés * 0.9 kg`

### Dashboard analytics

```typescript
// Graphique : Évolution des lots convertis
const conversionData = await supabase
  .from('lots')
  .select('created_at, quantity_total')
  .eq('is_free', true)
  .gte('created_at', startDate)
  .order('created_at');

// Répartition par catégorie
const categoryData = await supabase
  .from('lots')
  .select('category, quantity_total.sum()')
  .eq('is_free', true)
  .group('category');
```

---

## 🚨 Troubleshooting

### Les lots ne se convertissent pas

**Vérifications** :

1. **CRON Job actif ?**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'convert-expired-lots';
   ```

2. **Fonction existe ?**
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'convert_expired_lots_to_free';
   ```

3. **Lots éligibles ?**
   ```sql
   SELECT COUNT(*) FROM lots
   WHERE pickup_end < NOW()
     AND status IN ('available', 'reserved')
     AND is_free = false
     AND (quantity_total - quantity_sold) > 0;
   ```

### Erreurs courantes

**Erreur** : `column "is_free" does not exist`
**Solution** : Exécuter la migration `20250120_add_is_free_to_lots.sql`

**Erreur** : `function convert_expired_lots_to_free() does not exist`
**Solution** : Créer la fonction via la migration SQL

**Erreur** : Notification non envoyée
**Solution** : Vérifier que la table `notifications` existe et est accessible

---

## 📝 Prochaines Améliorations

- [ ] **IA prédictive** : Prédire les lots qui ne seront probablement pas vendus
- [ ] **Alertes SMS** : Notifier les bénéficiaires proches des nouveaux lots gratuits
- [ ] **Scoring prioritaire** : Donner la priorité aux bénéficiaires les plus dans le besoin
- [ ] **Partenariats associations** : Réserver automatiquement des lots pour les associations
- [ ] **Système de feedback** : Permettre aux bénéficiaires de noter la qualité des lots

---

## 📚 Références

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [CRON Expression Generator](https://crontab.guru/)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : EcoPanier Tech Team


