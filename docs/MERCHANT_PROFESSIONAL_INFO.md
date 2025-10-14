# Informations professionnelles des commerçants

## 📋 Vue d'ensemble

Cette fonctionnalité ajoute des champs professionnels supplémentaires pour les commerçants lors de l'inscription et dans leur profil. Ces informations permettent une meilleure identification des commerces et renforcent la crédibilité de la plateforme.

## ✨ Nouveaux champs ajoutés

### Champs obligatoires
1. **SIRET** (`siret`)
   - Numéro d'identification unique de l'établissement (14 chiffres)
   - Format: `12345678901234`
   - Validation: Exactement 14 chiffres numériques
   - Obligatoire pour tous les commerçants français

2. **Type de commerce** (`business_type`)
   - Catégorisation du commerce
   - Options disponibles:
     - 🥖 Boulangerie / Pâtisserie
     - 🍽️ Restaurant / Bistrot
     - 🛒 Supermarché / Épicerie
     - 🥩 Boucherie / Charcuterie
     - 🥬 Fruits & Légumes / Primeur
     - 🏪 Épicerie fine / Traiteur
     - ☕ Café / Salon de thé
     - 🍔 Fast-food / Snack
     - 🐟 Poissonnerie
     - 🧀 Fromagerie / Crèmerie
     - 🏬 Autre commerce alimentaire

### Champs optionnels
3. **Email professionnel** (`business_email`)
   - Email de contact du commerce
   - Peut être différent de l'email personnel du compte
   - Format: `contact@moncommerce.fr`

4. **Description du commerce** (`business_description`)
   - Description détaillée de l'activité
   - Maximum 300 caractères
   - Exemple: "Boulangerie artisanale depuis 1985, spécialisée dans le pain bio..."

5. **Numéro de TVA intracommunautaire** (`vat_number`)
   - Pour les commerces avec activité transfrontalière
   - Format: `FR12345678901`
   - Maximum 13 caractères

## 🗄️ Structure de la base de données

### Migration SQL

Fichier: `supabase/migrations/20250117_add_merchant_professional_info.sql`

```sql
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

ALTER TABLE profiles 
  ADD CONSTRAINT check_business_email_format 
  CHECK (business_email IS NULL OR business_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_siret ON profiles(siret);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);
```

### Types TypeScript

Fichier: `src/lib/database.types.ts`

Les nouveaux champs ont été ajoutés à l'interface `profiles` :

```typescript
interface Profile {
  // ... champs existants
  siret: string | null;
  business_type: string | null;
  business_email: string | null;
  business_description: string | null;
  vat_number: string | null;
}
```

## 📝 Modifications de l'interface

### 1. Formulaire d'inscription (`AuthForm.tsx`)

**Nouveaux champs pour les commerçants:**
- SIRET avec validation en temps réel (14 chiffres)
- Type de commerce (sélection obligatoire)
- Email professionnel (optionnel)
- Description du commerce (optionnel, 300 caractères max)
- Numéro de TVA (optionnel)

**Validation SIRET en temps réel:**
```typescript
onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '');
  setSiret(value.slice(0, 14));
}}
```

### 2. Page de profil (`ProfilePage.tsx`)

**Mode édition:**
- Formulaire complet avec tous les nouveaux champs
- Validation visuelle du SIRET (✓ ou ⚠️)
- Compteur de caractères pour la description
- Conversion automatique en majuscules pour le numéro de TVA

**Mode affichage:**
- Cartes colorées et iconées pour chaque information
- Affichage conditionnel (masque les champs vides optionnels)
- Label traduit pour le type de commerce (avec emoji)
- Section dédiée "Informations professionnelles"

## 🎨 Design

### Icônes utilisées
- `FileCheck` : SIRET
- `Briefcase` : Type de commerce
- `Mail` : Email professionnel
- `FileText` : Numéro de TVA
- `Building` : Nom du commerce

### Codes couleur
- **SIRET** : Warning (orange/jaune)
- **Type de commerce** : Primary (bleu)
- **Email professionnel** : Accent (rouge)
- **Numéro de TVA** : Purple (violet)
- **Commerce** : Secondary (violet/bleu)

## 🔍 Cas d'usage

### 1. Inscription d'un nouveau commerçant

1. Le commerçant sélectionne le rôle "Commerçant"
2. Il remplit les informations de base (nom, email, etc.)
3. Il accède aux champs professionnels :
   - **SIRET** : Obligatoire - Validation visuelle immédiate
   - **Type de commerce** : Obligatoire - Liste déroulante
   - **Email pro** : Optionnel
   - **Description** : Optionnel - Compteur de caractères
   - **TVA** : Optionnel

### 2. Mise à jour du profil

1. Le commerçant accède à son profil
2. Il clique sur "Modifier"
3. Il peut mettre à jour toutes ses informations professionnelles
4. Les validations s'appliquent en temps réel
5. Enregistrement dans la base de données

### 3. Affichage public (futur)

Ces informations pourront être utilisées pour :
- Afficher le type de commerce sur les cartes de lots
- Filtrer les commerces par type
- Vérifier la légitimité des commerçants (SIRET)
- Contacter directement les commerces (email pro)
- Améliorer le SEO avec des données structurées

## 🔐 Sécurité et conformité

### RGPD
- Les données professionnelles sont distinctes des données personnelles
- L'email professionnel est optionnel
- Les commerçants contrôlent leurs informations

### Validation
- SIRET : Regex `^[0-9]{14}$` (exactement 14 chiffres)
- Email : Regex standard pour validation d'email
- Tous les champs sont sanitizés par Supabase

### Protection
- Row Level Security (RLS) peut être activé si nécessaire
- Seul le propriétaire peut modifier ses informations
- Les données sont stockées de manière sécurisée dans Supabase

## 📊 Avantages

### Pour les commerçants
- ✅ Profil professionnel complet
- ✅ Crédibilité renforcée
- ✅ Meilleure visibilité
- ✅ Contact facilité avec les clients

### Pour la plateforme
- ✅ Vérification d'identité facilitée
- ✅ Conformité légale (SIRET obligatoire)
- ✅ Statistiques par type de commerce
- ✅ Filtrage et recherche améliorés
- ✅ Professionnalisation de l'image

### Pour les utilisateurs
- ✅ Transparence accrue
- ✅ Confiance renforcée
- ✅ Informations de contact claires
- ✅ Connaissance du type de commerce

## 🚀 Migration des données existantes

Pour les commerçants déjà inscrits :

1. **Migration automatique** : Les colonnes sont ajoutées avec `NULL` par défaut
2. **Invitation à compléter** : Email de notification pour compléter leur profil
3. **Message dans le dashboard** : Banner invitant à ajouter le SIRET
4. **Pas de blocage** : Les commerçants peuvent continuer à utiliser la plateforme

## 🔮 Évolutions futures possibles

1. **Vérification automatique du SIRET**
   - API Sirene (INSEE) pour valider automatiquement
   - Pré-remplissage des données depuis l'API

2. **Badges de vérification**
   - Badge "SIRET vérifié" ✓
   - Badge "Commerce certifié" 🏆

3. **Statistiques par type de commerce**
   - Dashboards admin avec répartition par type
   - Insights sur les performances par catégorie

4. **Recherche et filtres**
   - Filtrer les lots par type de commerce
   - Rechercher un commerce par SIRET

5. **Intégrations**
   - Export des données pour comptabilité
   - Facturation automatique avec TVA

## 📚 Documentation technique

### Fichiers modifiés

1. **Migration SQL**
   - `supabase/migrations/20250117_add_merchant_professional_info.sql`

2. **Types TypeScript**
   - `src/lib/database.types.ts`

3. **Formulaires**
   - `src/components/auth/AuthForm.tsx`
   - `src/components/shared/ProfilePage.tsx`

### Tests recommandés

- [ ] Inscription d'un nouveau commerçant avec SIRET valide
- [ ] Inscription avec SIRET invalide (< ou > 14 chiffres)
- [ ] Mise à jour du profil d'un commerçant existant
- [ ] Affichage du profil avec tous les champs remplis
- [ ] Affichage du profil avec champs optionnels vides
- [ ] Validation de l'email professionnel
- [ ] Limite de caractères pour la description (300)

## 📞 Support

Pour toute question ou problème :
- Vérifier que la migration SQL a bien été exécutée
- Vérifier que les types TypeScript sont à jour
- Consulter les logs de la console pour les erreurs
- Tester en mode développement avant déploiement

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Équipe EcoPanier

