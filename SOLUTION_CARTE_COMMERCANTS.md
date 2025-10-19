# 🗺️ Solution : Affichage des commerçants sur la carte

## 🔍 Problème diagnostiqué

Les commerçants n'apparaissaient pas sur la carte interactive pour la raison suivante :
- **Coordonnées GPS manquantes** : Les champs `latitude` et `longitude` étaient `null` dans la base de données
- Le code de la carte filtre les commerçants sans coordonnées GPS

```typescript
// Ligne 44 dans useMerchantsData.ts
if (!merchant || !merchant.latitude || !merchant.longitude) return;
```

---

## ✅ Solutions implémentées

### 1. **Géocodage automatique lors de l'inscription** 🆕

Les nouveaux commerçants et associations sont **automatiquement géocodés** lors de leur inscription.

**Fichier modifié** : `src/components/auth/AuthForm.tsx`

**Fonctionnement** :
- Lors de l'inscription d'un commerçant/association
- L'adresse du commerce est géocodée via l'API Mapbox
- Les coordonnées GPS sont enregistrées directement dans le profil
- Si le géocodage échoue, l'inscription continue (pas bloquant)

**Feedback utilisateur** :
- Message de chargement : "Géolocalisation en cours..."
- Animation du spinner pendant le géocodage
- Logs dans la console pour debugging

---

### 2. **Bouton de géolocalisation pour les commerçants existants** 🆕

Un nouveau composant permet aux commerçants de se géocoder eux-mêmes depuis leur profil.

**Nouveaux fichiers** :
- `src/components/merchant/GeocodeButton.tsx` (composant réutilisable)
- Intégré dans `src/components/shared/ProfilePage.tsx`

**Fonctionnalités** :
- ✅ **Détection automatique** : Le bouton affiche si le commerce est déjà géolocalisé ou non
- ✅ **Feedback visuel** :
  - 🔵 Bouton bleu : "Activer la géolocalisation" (si pas géocodé)
  - 🟢 Bouton vert : "Mettre à jour la position" (si déjà géocodé)
- ✅ **Messages d'alerte** :
  - ⚠️ Alerte ambre si pas géocodé : "Votre commerce n'apparaîtra pas sur la carte"
  - ℹ️ Info bleue si géocodé : Position actuelle avec coordonnées
- ✅ **Statut en temps réel** : Succès/Erreur après l'action

**Emplacement** : 
- Dashboard Commerçant → Onglet "Profil" → Section "Géolocalisation"

---

## 🛠️ Service de géocodage

Le service existant `src/utils/geocodingService.ts` est utilisé pour :
- Convertir une adresse en coordonnées GPS (latitude, longitude)
- Utilise l'API Mapbox Geocoding
- Gestion des erreurs et rate limiting

**Prérequis** :
```env
VITE_MAPBOX_ACCESS_TOKEN=votre_token_mapbox
```

Sans ce token, la carte affichera un message demandant de le configurer.

---

## 📋 Guide pour les commerçants

### Pour les **nouveaux commerçants** :
1. **S'inscrire** via le formulaire (onglet "Inscription")
2. Remplir les informations du commerce **avec une adresse complète**
3. ✅ La géolocalisation est **automatique** !
4. Le commerce apparaît immédiatement sur la carte

### Pour les **commerçants existants** :
1. Se connecter au dashboard
2. Aller dans **"Profil"** (onglet avec icône 👤)
3. Scroller jusqu'à la section **"Géolocalisation"**
4. Cliquer sur **"Activer la géolocalisation"**
5. ✅ Le commerce est maintenant visible sur la carte !

---

## 🔧 Pour les administrateurs

Si vous avez de nombreux commerçants existants sans coordonnées :

### Option A : Géocodage en masse (Admin Dashboard)
1. Aller sur le **Dashboard Admin**
2. Section **"Géocodage des commerçants"**
3. Le composant `GeocodeMerchants.tsx` permet de géocoder tous les commerçants en un clic

### Option B : Géocodage individuel
Chaque commerçant peut se géocoder lui-même depuis son profil.

---

## 🧪 Tests

### Vérifier qu'un commerçant est géolocalisé :
```sql
SELECT 
  id, 
  business_name, 
  business_address, 
  latitude, 
  longitude 
FROM profiles 
WHERE role = 'merchant';
```

Les commerçants avec `latitude IS NOT NULL` et `longitude IS NOT NULL` apparaîtront sur la carte.

### Tester la carte :
1. Aller sur **Dashboard Client** → **Carte** 
2. Les commerçants géolocalisés avec des lots disponibles doivent apparaître comme des marqueurs
3. Cliquer sur un marqueur affiche les informations du commerce
4. Cliquer une 2ème fois affiche ses lots

---

## 📊 Statistiques

Le hook `useMerchantsData` :
- Charge uniquement les commerçants **avec coordonnées GPS**
- Filtre par catégorie, distance max, et urgence
- Calcule automatiquement la distance depuis la position de l'utilisateur
- Trie par distance croissante

---

## 🚀 Améliorations futures possibles

1. **Géocodage en arrière-plan** : 
   - Trigger Supabase pour géocoder automatiquement lors de la création/modification d'un profil

2. **Carte de sélection** :
   - Permettre aux commerçants de placer leur position manuellement sur une carte

3. **Vérification d'adresse** :
   - Validation en temps réel de l'adresse lors de la saisie
   - Suggestions d'adresses via autocomplete

4. **Cache des géocodages** :
   - Stocker les résultats de géocodage pour éviter les appels API répétés

---

## 📝 Notes techniques

### API Mapbox Geocoding
- **Rate limit** : 600 requêtes/minute (gratuit)
- **Précision** : Limité à la France (`country=FR`)
- **Fallback** : Si le géocodage échoue, l'inscription/mise à jour continue

### Structure de la base de données
```sql
-- Table profiles
latitude NUMERIC(10,8) -- Précision ~1cm
longitude NUMERIC(11,8) -- Précision ~1cm
```

### Performance
- Le géocodage ajoute ~200-500ms lors de l'inscription
- Non bloquant : l'utilisateur voit un feedback pendant le traitement
- Pas d'impact sur les utilisateurs non-commerçants

---

## 🐛 Dépannage

### Problème : Le commerçant n'apparaît toujours pas
1. Vérifier que `latitude` et `longitude` ne sont pas `null`
2. Vérifier que le commerçant a des **lots disponibles** avec `discounted_price > 0`
3. Vérifier que les lots ont `status = 'available'`
4. Vérifier que la date `pickup_end` est dans le futur

### Problème : Erreur de géocodage
1. Vérifier que `VITE_MAPBOX_ACCESS_TOKEN` est configuré dans `.env`
2. Vérifier que l'adresse est complète et en France
3. Consulter les logs de la console pour plus de détails

### Problème : La carte est vide
1. Vérifier que le token Mapbox est valide
2. Vérifier que des commerçants géolocalisés existent dans la base
3. Vérifier que ces commerçants ont des lots disponibles

---

**Date de mise en place** : Janvier 2025  
**Fichiers modifiés** : 3 fichiers  
**Nouveaux fichiers** : 2 fichiers  
**Impact** : Aucun breaking change, 100% rétrocompatible

