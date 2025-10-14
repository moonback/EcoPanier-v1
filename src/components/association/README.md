# 🏛️ Espace Association

## Vue d'ensemble

L'espace association permet aux associations partenaires d'EcoPanier d'enregistrer et de gérer leurs bénéficiaires sur la plateforme.

## Fonctionnalités

### 1. Dashboard (`AssociationDashboard.tsx`)
- Interface principale avec navigation par onglets
- Accès aux statistiques, informations, enregistrement et liste des bénéficiaires
- Design cohérent avec le reste de l'application

### 2. Statistiques (`AssociationStats.tsx`)
- **Total de bénéficiaires** : Nombre total de bénéficiaires enregistrés
- **Bénéficiaires vérifiés** : Nombre de bénéficiaires dont l'identité a été vérifiée
- **En attente de vérification** : Bénéficiaires non encore vérifiés
- **Inscriptions ce mois** : Nombre d'enregistrements du mois en cours

### 3. Informations de l'association (`AssociationInfo.tsx`)
Gestion complète des informations de l'association :
- **Informations de l'association** :
  - Nom de l'association (obligatoire)
  - Adresse de l'association (obligatoire)
  - Téléphone (optionnel)
- **Informations du responsable** :
  - Nom complet du responsable (obligatoire)
  - Email (lecture seule, géré par l'authentification)
  - Adresse personnelle du responsable (optionnel)
- **Fonctionnalités** :
  - Formulaire de modification en temps réel
  - Messages de confirmation et d'erreur
  - Bouton de réinitialisation
  - Validation côté client et serveur
  - Mise à jour automatique du profil dans le store

### 4. Enregistrement de bénéficiaires (`BeneficiaryRegistration.tsx`)
Formulaire complet pour créer un nouveau compte bénéficiaire :
- **Informations personnelles** :
  - Nom complet (obligatoire)
  - Email (obligatoire)
  - Mot de passe (obligatoire, min. 6 caractères)
  - Téléphone (optionnel)
  - Adresse (optionnelle)
- **Informations complémentaires** :
  - Notes sur le bénéficiaire (optionnel)
  - Case à cocher pour marquer comme vérifié

**Processus d'enregistrement** :
1. Création du compte utilisateur via Supabase Auth
2. Génération d'un ID bénéficiaire unique (format: `YYYY-BEN-XXXXX`)
3. Création du profil bénéficiaire
4. Enregistrement de la liaison association-bénéficiaire
5. Email de confirmation envoyé au bénéficiaire

### 5. Gestion des bénéficiaires (`RegisteredBeneficiaries.tsx`)
Liste complète des bénéficiaires enregistrés avec :
- **Affichage** :
  - Carte pour chaque bénéficiaire
  - Badge de statut (Vérifié / En attente)
  - Coordonnées (téléphone, adresse)
  - Notes de l'association
  - Date d'enregistrement
- **Actions** :
  - Basculer le statut de vérification
  - Supprimer l'enregistrement (avec confirmation)

## Base de données

### Table `association_beneficiary_registrations`
Stocke les relations entre associations et bénéficiaires :

```sql
- id: UUID (PK)
- association_id: UUID (FK → profiles)
- beneficiary_id: UUID (FK → profiles)
- registration_date: TIMESTAMPTZ
- notes: TEXT (optionnel)
- verification_document_url: TEXT (optionnel)
- is_verified: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Contraintes** :
- Une association ne peut enregistrer un bénéficiaire qu'une seule fois
- Les suppressions en cascade sont activées

## Routing

L'accès au dashboard association se fait via le rôle `'association'` :
- Sélection du rôle lors de l'inscription
- Routing automatique vers `AssociationDashboard` après connexion

## Authentification

### Inscription d'une association
Lors de l'inscription avec le rôle `association` :
- Champs obligatoires :
  - Email
  - Mot de passe
  - Nom complet
  - Nom de l'association
  - Adresse de l'association
- Champs optionnels :
  - Téléphone
  - Adresse personnelle

### Enregistrement d'un bénéficiaire
L'association peut créer des comptes bénéficiaires qui :
- Reçoivent un email de confirmation
- Obtiennent automatiquement un ID bénéficiaire unique
- Sont liés à l'association dans la base de données
- Peuvent se connecter et utiliser la plateforme

## Design

### Couleurs
- **Principal** : Violet (`purple-600`)
- **Badges vérifiés** : Vert success (`success-600`)
- **Badges en attente** : Orange warning (`warning-600`)

### Icônes
- Association : `FileText` (🏛️)
- Informations : `Building2` (🏢)
- Utilisateur : `User`
- Statistiques : `BarChart3`
- Enregistrement : `UserPlus`
- Liste : `Users`
- Téléphone : `Phone`
- Adresse : `MapPin`
- Email : `Mail`
- Sauvegarder : `Save`
- Alerte : `AlertCircle`

## Sécurité

### Permissions
- Seules les associations peuvent accéder au dashboard association
- Une association ne peut voir que ses propres bénéficiaires
- La suppression d'un enregistrement ne supprime pas le compte bénéficiaire

### Validation
- Vérification du rôle côté client et serveur
- Protection CSRF via Supabase
- Validation des emails par Supabase Auth

## Évolutions futures possibles

1. **Upload de documents** : Permettre aux associations d'uploader des documents de vérification
2. **Statistiques avancées** : Graphiques d'évolution, taux de vérification, etc.
3. **Export de données** : Export CSV/PDF de la liste des bénéficiaires
4. **Notifications** : Alertes quand un bénéficiaire utilise la plateforme
5. **Historique** : Suivi de l'activité des bénéficiaires enregistrés
6. **Bulk import** : Import de plusieurs bénéficiaires via CSV

## Conformité RGPD

Les associations doivent :
- Obtenir le consentement des bénéficiaires pour l'enregistrement
- Informer les bénéficiaires de l'utilisation de leurs données
- Respecter le droit à l'effacement (suppression des données)

---

**Auteur** : EcoPanier Team  
**Date de création** : Janvier 2025  
**Version** : 1.0.0

