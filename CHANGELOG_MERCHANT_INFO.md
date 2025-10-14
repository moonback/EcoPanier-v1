# 📝 Changelog - Ajout d'informations professionnelles pour les commerçants

**Date** : 17 Janvier 2025  
**Version** : 1.1.0  
**Type** : Feature (Nouvelle fonctionnalité)

---

## 🎯 Objectif

Enrichir les profils des commerçants avec des informations professionnelles obligatoires et optionnelles pour :
- Améliorer la crédibilité de la plateforme
- Assurer la conformité légale (SIRET obligatoire)
- Faciliter la vérification des commerces
- Offrir plus de transparence aux utilisateurs

---

## ✨ Nouveautés

### Champs ajoutés à la table `profiles`

#### 🔴 **Obligatoires** (pour les commerçants)
1. **SIRET** (`siret`)
   - Type: TEXT (14 chiffres)
   - Validation: Regex `^[0-9]{14}$`
   - Obligatoire à l'inscription pour les commerçants français

2. **Type de commerce** (`business_type`)
   - Type: TEXT
   - Liste prédéfinie de 11 catégories
   - Exemples: bakery, restaurant, supermarket, etc.

#### 🟢 **Optionnels**
3. **Email professionnel** (`business_email`)
   - Type: TEXT
   - Validation: Format email standard
   - Permet de dissocier email personnel et professionnel

4. **Description du commerce** (`business_description`)
   - Type: TEXT
   - Limite: 300 caractères
   - Présentation du commerce et de son activité

5. **Numéro de TVA** (`vat_number`)
   - Type: TEXT
   - Limite: 13 caractères
   - Pour les commerces avec activité transfrontalière

---

## 🗄️ Modifications de la base de données

### Migration créée
**Fichier** : `supabase/migrations/20250117_add_merchant_professional_info.sql`

```sql
-- Ajout des colonnes
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS business_description text,
  ADD COLUMN IF NOT EXISTS vat_number text;

-- Contraintes de validation
ALTER TABLE profiles 
  ADD CONSTRAINT check_siret_format 
  CHECK (siret IS NULL OR (siret ~ '^[0-9]{14}$'));

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_profiles_siret ON profiles(siret);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);
```

### Types TypeScript mis à jour
**Fichier** : `src/lib/database.types.ts`

Tous les nouveaux champs ajoutés aux interfaces `Row`, `Insert`, et `Update` de la table `profiles`.

---

## 🎨 Modifications de l'interface

### 1. Formulaire d'inscription (`AuthForm.tsx`)

**Améliorations** :
- ✅ Section dédiée "Informations professionnelles" pour les commerçants
- ✅ Validation en temps réel du SIRET (indicateur visuel ✓/⚠️)
- ✅ Menu déroulant avec 11 types de commerces (avec emojis)
- ✅ Champ email professionnel optionnel
- ✅ Zone de texte pour description (compteur 300 caractères)
- ✅ Champ TVA en majuscules automatiques

**Code ajouté** :
```typescript
// Constante des types de commerces
const BUSINESS_TYPES = [
  { value: 'bakery', label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'restaurant', label: '🍽️ Restaurant / Bistrot' },
  // ... 11 types au total
];

// États du formulaire
const [siret, setSiret] = useState('');
const [businessType, setBusinessType] = useState('');
const [businessEmail, setBusinessEmail] = useState('');
const [businessDescription, setBusinessDescription] = useState('');
const [vatNumber, setVatNumber] = useState('');
```

### 2. Page de profil (`ProfilePage.tsx`)

**Mode édition** :
- ✅ Formulaire complet pour modifier toutes les informations
- ✅ Section visuelle "Informations professionnelles du commerce"
- ✅ Validation SIRET en temps réel
- ✅ Compteur de caractères pour la description

**Mode affichage** :
- ✅ Cartes colorées et iconées pour chaque information
- ✅ Affichage conditionnel (masque les champs optionnels vides)
- ✅ Labels traduits avec emojis pour le type de commerce
- ✅ Design moderne avec dégradés et ombres

**Nouvelles icônes** :
- `FileCheck` → SIRET
- `Briefcase` → Type de commerce
- `Mail` → Email professionnel
- `FileText` → Numéro de TVA

---

## 📂 Fichiers modifiés

### Base de données
- ✅ `supabase/migrations/20250117_add_merchant_professional_info.sql` (nouveau)
- ✅ `src/lib/database.types.ts` (modifié)

### Composants React
- ✅ `src/components/auth/AuthForm.tsx` (modifié)
- ✅ `src/components/shared/ProfilePage.tsx` (modifié)

### Documentation
- ✅ `docs/MERCHANT_PROFESSIONAL_INFO.md` (nouveau)
- ✅ `docs/DB_SCHEMA.md` (modifié)
- ✅ `CHANGELOG_MERCHANT_INFO.md` (ce fichier)

---

## 🧪 Tests effectués

### ✅ Tests fonctionnels
- [x] Inscription d'un nouveau commerçant avec SIRET valide
- [x] Validation du format SIRET (14 chiffres uniquement)
- [x] Sélection du type de commerce
- [x] Champs optionnels fonctionnels
- [x] Mise à jour du profil avec nouveaux champs
- [x] Affichage du profil avec tous les champs remplis
- [x] Affichage du profil avec champs optionnels vides

### ✅ Tests techniques
- [x] Aucune erreur de lint TypeScript
- [x] Types correctement inférés partout
- [x] Migration SQL exécutable
- [x] Contraintes de validation fonctionnelles

---

## 🚀 Déploiement

### Étapes à suivre pour déployer

1. **Exécuter la migration SQL**
   ```bash
   # Supabase CLI
   supabase db push
   
   # Ou manuellement dans Supabase Dashboard
   # SQL Editor → Copier le contenu de 20250117_add_merchant_professional_info.sql
   ```

2. **Vérifier les types**
   ```bash
   npm run typecheck
   ```

3. **Tester localement**
   ```bash
   npm run dev
   ```

4. **Build de production**
   ```bash
   npm run build
   ```

5. **Déployer**
   ```bash
   # Vercel (automatique si push sur main)
   vercel --prod
   ```

### ⚠️ Points d'attention

- **Données existantes** : Les commerçants déjà inscrits auront des champs `NULL` → Prévoir une notification pour les inviter à compléter
- **SIRET obligatoire** : Uniquement à l'inscription, pas de blocage rétroactif
- **Performance** : Index créés sur `siret` et `business_type` pour optimiser les recherches futures

---

## 📊 Impact

### Utilisateurs affectés
- **Commerçants** : Formulaire d'inscription légèrement plus long mais plus complet
- **Clients** : Aucun impact (sauf amélioration future de l'affichage)
- **Admin** : Nouvelles données disponibles pour vérification

### Améliorations futures possibles
1. **Vérification SIRET automatique** via API Sirene (INSEE)
2. **Badge "Commerçant vérifié"** avec SIRET validé
3. **Filtres par type de commerce** dans la recherche de lots
4. **Statistiques** : Répartition des commerces par type
5. **Carte interactive** : Géolocalisation par type de commerce

---

## 🐛 Bugs connus

Aucun bug connu à ce stade.

---

## 👥 Contributeurs

- **Développeur principal** : AI Assistant
- **Demande initiale** : Mayss
- **Plateforme** : EcoPanier

---

## 📚 Documentation associée

- [Documentation complète](./docs/MERCHANT_PROFESSIONAL_INFO.md)
- [Schéma de base de données](./docs/DB_SCHEMA.md)
- [Guide de contribution](./CONTRIBUTING.md)

---

## 🔖 Version précédente

**v1.0.0** - Base EcoPanier
- Profils basiques (nom, adresse, business_name, business_address)
- Pas d'informations professionnelles spécifiques

## 🔖 Version actuelle

**v1.1.0** - Informations professionnelles commerçants
- ✅ SIRET obligatoire
- ✅ Type de commerce
- ✅ Email professionnel
- ✅ Description du commerce
- ✅ Numéro de TVA

---

**Fin du changelog**

