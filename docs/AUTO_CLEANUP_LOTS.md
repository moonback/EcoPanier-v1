# 🧹 Nettoyage automatique des lots non récupérés

## 📋 Résumé exécutif

**Fonctionnalité** : Suppression automatique des lots non retirés 24 heures après la date de remise (`pickup_end`).

**Objectif** : Maintenir la base de données propre en supprimant automatiquement les lots qui n'ont pas été récupérés après leur date de péremption.

---

## 🎯 Principe de fonctionnement

### Quand un lot est supprimé automatiquement ?

Un lot est supprimé automatiquement si **TOUTES** ces conditions sont réunies :

1. ✅ `pickup_end` est passé de **plus de 24h**
2. ✅ Le statut du lot est `available` ou `reserved`
3. ✅ Il existe des réservations non complétées (`status` != `completed` ou `cancelled`)

### Qu'est-ce qui est fait lors du nettoyage ?

1. **Annulation des réservations** : Toutes les réservations non complétées sont annulées (`status` → `cancelled`)
2. **Suppression des images** : Les images associées au lot sont supprimées de Supabase Storage
3. **Suppression du lot** : Le lot est définitivement supprimé de la base de données

---

## 🔧 Implémentation technique

### Fichiers créés/modifiés

#### 1. Fonction de nettoyage
**Fichier** : `src/utils/expiredLotsService.ts`
**Fonction** : `cleanupUnclaimedLots()`

```typescript
export async function cleanupUnclaimedLots(): Promise<{
  success: boolean;
  deletedLots: number;
  cancelledReservations: number;
  error?: string;
}>
```

#### 2. Hook automatique
**Fichier** : `src/hooks/useAutoCleanup.ts`
**Hook** : `useAutoCleanup(options)`

Utilisation :
```typescript
useAutoCleanup({
  enabled: true,
  interval: 60 * 60 * 1000, // 1 heure
  onCleanup: (result) => {
    console.log(`Lots supprimés : ${result.deletedLots}`);
  }
});
```

#### 3. Intégration dans l'app
**Fichier** : `src/App.tsx`

Le nettoyage s'exécute automatiquement toutes les heures dans le composant `DashboardRouter`.

#### 4. Interface admin
**Fichier** : `src/components/admin/ExpiredLotsManager.tsx`

Bouton de nettoyage manuel ajouté pour permettre à l'admin de forcer le nettoyage.

---

## ⚙️ Configuration

### Intervalle de nettoyage par défaut

- **Fréquence** : Toutes les **1 heure**
- **Délai de suppression** : 24 heures après `pickup_end`

### Personnalisation

Vous pouvez changer l'intervalle dans `src/App.tsx` :

```typescript
useAutoCleanup({
  enabled: true,
  interval: 30 * 60 * 1000, // 30 minutes au lieu d'1 heure
  onCleanup: (result) => {
    if (result.deletedLots > 0) {
      console.log(`Nettoyage : ${result.deletedLots} lots supprimés`);
    }
  }
});
```

---

## 🎨 Interface Admin

### Bouton de nettoyage manuel

Dans le dashboard admin (`/dashboard`), onglet **"🎁 Lots Expirés"** :

1. Cliquer sur **"🧹 Nettoyer les lots non récupérés"**
2. Le système effectue le nettoyage immédiatement
3. Un message de confirmation s'affiche avec le nombre de lots supprimés

### Statistiques affichées

Le composant affiche :
- Nombre de lots supprimés
- Nombre de réservations annulées

---

## 🔍 Exemples de scénarios

### Scénario 1 : Lot non récupéré

**Date de création** : 10 janvier, 10h00
**pickup_end** : 10 janvier, 18h00
**Réservations** : 2 réservations en attente (`pending`)

**Date de nettoyage** : 11 janvier, 18h01 (24h après pickup_end)

**Résultat** :
- ✅ 2 réservations annulées (`status` → `cancelled`)
- ✅ Lot supprimé
- ✅ Images supprimées

### Scénario 2 : Lot partiellement récupéré

**Date de création** : 10 janvier, 10h00
**pickup_end** : 10 janvier, 18h00
**Réservations** : 
- 1 réservation complétée (`completed`)
- 1 réservation en attente (`pending`)

**Date de nettoyage** : 11 janvier, 18h01

**Résultat** :
- ✅ 1 réservation annulée (`pending` → `cancelled`)
- ✅ La réservation complétée reste inchangée
- ✅ Lot supprimé (car il reste des réservations non complétées)

### Scénario 3 : Lot complètement récupéré

**Date de création** : 10 janvier, 10h00
**pickup_end** : 10 janvier, 18h00
**Réservations** : Toutes les réservations sont `completed`

**Date de nettoyage** : 11 janvier, 18h01

**Résultat** :
- ❌ Lot **non** supprimé (car toutes les réservations sont complétées)

> **Note** : Si toutes les réservations sont `completed`, le lot est considéré comme récupéré et n'est PAS supprimé.

---

## 🚨 Règles importantes

### ⚠️ Points d'attention

1. **Suppression définitive** : Les lots supprimés ne peuvent PAS être restaurés
2. **Images** : Les images sont supprimées de Supabase Storage
3. **Réservations** : Les réservations non complétées sont annulées
4. **Historique** : Les métriques d'impact (`impact_metrics`) sont conservées

### ✅ Ce qui est préservé

- ✅ Historique des métriques (`impact_metrics`)
- ✅ Réservations complétées (`status = 'completed'`)
- ✅ Statistiques d'impact global

### ❌ Ce qui est supprimé

- ❌ Le lot lui-même
- ❌ Les images associées
- ❌ Les réservations non complétées

---

## 📊 Logs et monitoring

### Logs console

```
🧹 Nettoyage automatique: 5 lot(s) supprimé(s), 12 réservation(s) annulée(s)
✅ Lot "Panier de fruits" supprimé (non récupéré 24h après pickup_end)
```

### Monitoring dans l'interface admin

Dans l'onglet **"🎁 Lots Expirés"**, vous pouvez voir :
- Le résultat du dernier nettoyage
- Les statistiques des lots gratuits

---

## 🧪 Tests

### Test manuel

1. Créer un lot avec `pickup_end` dans le passé (il y a plus de 24h)
2. Créer des réservations `pending` pour ce lot
3. Attendre l'exécution automatique (ou utiliser le bouton admin)
4. Vérifier que :
   - Le lot est supprimé
   - Les réservations sont annulées
   - Les images sont supprimées

### Test en développement

```typescript
// Dans une console navigateur ou test unitaire
import { cleanupUnclaimedLots } from './utils/expiredLotsService';

const result = await cleanupUnclaimedLots();
console.log(result);
// { success: true, deletedLots: 2, cancelledReservations: 5 }
```

---

## 🔄 Prochaines améliorations

### Fonctionnalités futures possibles

1. **Notification préventive** : Avertir les utilisateurs 2h avant l'expiration
2. **Prolongation automatique** : Option pour prolonger de 24h
3. **Historique des suppressions** : Table `deleted_lots_history`
4. **Configuration par commerçant** : Délai personnalisable
5. **Rapport hebdomadaire** : Rapport automatique des suppressions

---

## 📝 Notes techniques

### Pourquoi 24 heures ?

- Donne une marge aux utilisateurs pour récupérer
- Évite le gaspillage des produits restants
- Nettoie automatiquement la base de données

### Pourquoi supprimer les images ?

- Évite d'utiliser inutilement l'espace de stockage Supabase
- Réduit les coûts de storage
- Maintient la base propre

### Performance

- Le nettoyage s'exécute **en arrière-plan**
- Ne bloque pas l'interface utilisateur
- Traite plusieurs lots simultanément

---

## ✅ Checklist de déploiement

- [x] Fonction `cleanupUnclaimedLots()` créée
- [x] Hook `useAutoCleanup` créé
- [x] Intégré dans `App.tsx`
- [x] Bouton manuel dans l'interface admin
- [x] Tests effectués localement
- [ ] Déployé en production
- [ ] Monitoring activé
- [ ] Notification aux commerçants (optionnel)

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Équipe EcoPanier

