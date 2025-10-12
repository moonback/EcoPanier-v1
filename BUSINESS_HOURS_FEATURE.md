# 🕐 Fonctionnalité : Horaires d'Ouverture des Commerçants

## 📋 Description

Cette fonctionnalité permet d'afficher les horaires d'ouverture du magasin dans le profil du commerçant, visible par tous les clients utilisant la carte interactive.

## 🗄️ Base de données

### Migration SQL

La migration `20250113_add_business_hours.sql` ajoute un champ `business_hours` de type JSONB à la table `profiles`.

**Pour appliquer la migration** :
```bash
# Si vous utilisez Supabase CLI
supabase db push

# Ou exécutez directement le fichier SQL dans Supabase Studio
```

### Structure des données

Le champ `business_hours` est un objet JSON avec cette structure :

```json
{
  "monday": {
    "open": "08:00",
    "close": "20:00",
    "closed": false
  },
  "tuesday": {
    "open": "08:00",
    "close": "20:00",
    "closed": false
  },
  "wednesday": {
    "open": "08:00",
    "close": "20:00",
    "closed": false
  },
  "thursday": {
    "open": "08:00",
    "close": "20:00",
    "closed": false
  },
  "friday": {
    "open": "08:00",
    "close": "20:00",
    "closed": false
  },
  "saturday": {
    "open": "09:00",
    "close": "19:00",
    "closed": false
  },
  "sunday": {
    "open": null,
    "close": null,
    "closed": true
  }
}
```

## 🎨 Interface utilisateur

### Affichage pour les clients

Les horaires s'affichent dans `MerchantLotsView` avec :
- **Jour courant mis en évidence** : fond bleu primaire
- **Jours fermés** : texte grisé avec "Fermé"
- **Layout responsive** : 
  - Mobile : 2 colonnes
  - Tablette : 4 colonnes  
  - Desktop : 7 colonnes (1 par jour)

### Exemple visuel

```
┌─────────────────────────────────────────────────┐
│ 🕐 Horaires d'ouverture                         │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ Lun  │ Mar• │ Mer  │ Jeu  │ Ven  │ Sam  │ Dim  │
│ 08:00│ 08:00│ 08:00│ 08:00│ 08:00│ 09:00│Fermé │
│ 20:00│ 20:00│ 20:00│ 20:00│ 20:00│ 19:00│      │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
   (• = aujourd'hui)
```

## 💻 Utilisation dans le code

### Types TypeScript

```typescript
// Depuis database.types.ts
type BusinessHours = Record<string, {
  open: string | null;
  close: string | null;
  closed: boolean;
}> | null;

interface Profile {
  // ... autres champs
  business_hours: BusinessHours;
}
```

### Fonction helper

La fonction `formatBusinessHours` dans `MerchantLotsView.tsx` :
- Transforme les données JSON en format d'affichage
- Détecte automatiquement le jour actuel
- Gère les jours fermés
- Traduit les noms de jours en français

## 📝 Pour les commerçants

### Ajouter/Modifier les horaires

Les commerçants peuvent définir leurs horaires via :

1. **Interface admin** (à implémenter) :
   ```typescript
   // Formulaire de profil commerçant
   <BusinessHoursEditor 
     value={profile.business_hours}
     onChange={handleHoursChange}
   />
   ```

2. **Directement en base de données** :
   ```sql
   UPDATE profiles 
   SET business_hours = '{
     "monday": {"open": "08:00", "close": "20:00", "closed": false},
     "tuesday": {"open": "08:00", "close": "20:00", "closed": false},
     "wednesday": {"open": "08:00", "close": "20:00", "closed": false},
     "thursday": {"open": "08:00", "close": "20:00", "closed": false},
     "friday": {"open": "08:00", "close": "20:00", "closed": false},
     "saturday": {"open": "09:00", "close": "19:00", "closed": false},
     "sunday": {"open": null, "close": null, "closed": true}
   }'::jsonb
   WHERE id = 'merchant-id-here'
   AND role = 'merchant';
   ```

## 🔄 Format des heures

- **Format accepté** : `HH:MM` (24h)
- **Exemples valides** : `08:00`, `12:30`, `23:59`
- **Jours fermés** : `closed: true` + `open: null` + `close: null`

## ✅ Validation

### Côté client (à implémenter)

```typescript
function validateBusinessHours(hours: string): boolean {
  const pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return pattern.test(hours);
}
```

### Côté serveur (optionnel)

Ajouter une contrainte CHECK en SQL :
```sql
ALTER TABLE profiles
ADD CONSTRAINT valid_business_hours_format
CHECK (
  business_hours IS NULL OR
  jsonb_typeof(business_hours) = 'object'
);
```

## 🎯 Améliorations futures

### Phase 1 (Court terme)
- [ ] Composant `BusinessHoursEditor` pour l'édition
- [ ] Validation des horaires lors de la saisie
- [ ] Indicateur "Ouvert maintenant" / "Fermé"

### Phase 2 (Moyen terme)
- [ ] Horaires exceptionnels (jours fériés)
- [ ] Pauses déjeuner
- [ ] Horaires variables par saison

### Phase 3 (Long terme)
- [ ] Synchronisation avec Google Business
- [ ] Notifications de changement d'horaires
- [ ] Historique des modifications

## 📊 Impact

### Avantages pour les utilisateurs
✅ Savent quand le magasin est ouvert  
✅ Évitent les déplacements inutiles  
✅ Planifient leurs retraits efficacement  

### Avantages pour les commerçants
✅ Moins d'appels pour demander les horaires  
✅ Meilleure expérience client  
✅ Information toujours à jour  

## 🐛 Dépannage

### Les horaires ne s'affichent pas

1. **Vérifier que la migration est appliquée** :
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name = 'business_hours';
   ```

2. **Vérifier que le commerçant a des horaires** :
   ```sql
   SELECT business_hours 
   FROM profiles 
   WHERE id = 'merchant-id' 
   AND role = 'merchant';
   ```

3. **Vérifier le format JSON** :
   ```sql
   SELECT 
     id, 
     business_name,
     jsonb_typeof(business_hours) as type,
     business_hours
   FROM profiles 
   WHERE role = 'merchant';
   ```

### Format incorrect

Si les horaires ne s'affichent pas correctement, vérifiez :
- Les clés des jours (monday, tuesday, etc.)
- Le format HH:MM pour open et close
- Le type boolean pour closed

## 📞 Support

Pour toute question ou bug :
1. Vérifier la console navigateur pour les erreurs
2. Vérifier les logs Supabase
3. Consulter `ARCHITECTURE.md` pour la structure globale

---

**Date de création** : 13 janvier 2025  
**Version** : 1.0.0  
**Auteur** : Équipe EcoPanier

