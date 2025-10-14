# 🏛️ Espace Association

## Vue d'ensemble

L'espace association permet aux associations partenaires d'EcoPanier d'enregistrer et de gérer leurs bénéficiaires sur la plateforme.

## Fonctionnalités

### 1. Dashboard (`AssociationDashboard.tsx`)
Interface principale avec navigation par onglets enrichie :
- **7 onglets disponibles** :
  1. Vue d'ensemble (statistiques de base)
  2. Statistiques avancées (graphiques détaillés)
  3. Informations (gestion du profil association)
  4. Enregistrer (nouveau bénéficiaire)
  5. Bénéficiaires (liste complète)
  6. Activité (historique des réservations)
  7. Export (téléchargement CSV/JSON)
- **Navigation fluide** : Onglets avec icônes et labels clairs
- **Design cohérent** : Thème violet pour l'association
- **Responsive** : Optimisé mobile et desktop

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

### 6. Historique d'activité (`BeneficiaryActivityHistory.tsx`)
Suivi détaillé de l'utilisation de la plateforme par les bénéficiaires :
- **Vue à deux colonnes** :
  - Liste des bénéficiaires avec compteur de réservations
  - Détails des réservations du bénéficiaire sélectionné
- **Informations affichées** :
  - Liste de toutes les réservations (max 50 par bénéficiaire)
  - Statut de chaque réservation (badges colorés)
  - Détails du lot réservé (titre, catégorie, commerçant)
  - Dates de réservation et de retrait
  - Quantité réservée
- **Filtrage automatique** : Seulement les réservations de type donation
- **Interface intuitive** : Sélection simple par clic

### 7. Export de données (`ExportData.tsx`)
Fonctionnalité d'export pour rapports et conformité RGPD :
- **Formats disponibles** :
  - **CSV** : Compatible Excel, Google Sheets, LibreOffice (UTF-8 avec BOM)
  - **JSON** : Format structuré pour traitement informatique
- **Données exportées** :
  - ID bénéficiaire unique
  - Informations personnelles (nom, téléphone, adresse)
  - Date d'enregistrement et statut de vérification
  - Statistiques d'activité (nombre de réservations, dernière activité)
  - Notes de l'association
- **Statistiques en temps réel** :
  - Total de bénéficiaires
  - Nombre de vérifiés
  - Bénéficiaires actifs ce mois
- **Nom de fichier automatique** : Inclut le nom de l'association et la date

### 8. Statistiques avancées (`AdvancedStats.tsx`)
Analyse approfondie avec visualisations graphiques :
- **KPIs principaux** (cartes colorées) :
  - Total de bénéficiaires enregistrés
  - Total de réservations effectuées
  - Bénéficiaires actifs ce mois
  - Moyenne de réservations par bénéficiaire
- **Graphiques interactifs** (Recharts) :
  - **Courbe d'évolution** : Inscriptions et réservations sur 6 mois
  - **Graphique circulaire** : Répartition par catégorie de produits
  - **Graphique en barres** : Comparaison mensuelle inscriptions vs réservations
- **Période analysée** : 6 derniers mois glissants
- **Mise à jour automatique** : Données rechargées au montage du composant

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
- Statistiques avancées : `TrendingUp`
- Enregistrement : `UserPlus`
- Liste : `Users`
- Téléphone : `Phone`
- Adresse : `MapPin`
- Email : `Mail`
- Sauvegarder : `Save`
- Alerte : `AlertCircle`
- Export : `Download`
- Activité : `Clock`
- Package : `Package`
- Calendrier : `Calendar`
- Validation : `CheckCircle`
- Annulation : `XCircle`

## Sécurité

### Permissions
- Seules les associations peuvent accéder au dashboard association
- Une association ne peut voir que ses propres bénéficiaires
- La suppression d'un enregistrement ne supprime pas le compte bénéficiaire

### Validation
- Vérification du rôle côté client et serveur
- Protection CSRF via Supabase
- Validation des emails par Supabase Auth

## Fonctionnalités récemment implémentées ✅

1. ✅ **Statistiques avancées** : Graphiques d'évolution sur 6 mois, répartition par catégorie
2. ✅ **Export de données** : Export CSV et JSON de la liste des bénéficiaires
3. ✅ **Historique** : Suivi détaillé de l'activité des bénéficiaires (réservations)
4. ✅ **Gestion des informations** : Interface complète pour modifier les infos de l'association

## Évolutions futures possibles

1. **Upload de documents** : Permettre aux associations d'uploader des documents de vérification (justificatifs)
2. **Notifications en temps réel** : Alertes push quand un bénéficiaire utilise la plateforme
3. **Bulk import** : Import de plusieurs bénéficiaires via fichier CSV
4. **Messagerie interne** : Communication directe avec les bénéficiaires
5. **Rapports automatiques** : Génération de rapports mensuels/annuels en PDF
6. **Tableau de bord mobile** : Application mobile dédiée aux associations

## Conformité RGPD

Les associations doivent :
- Obtenir le consentement des bénéficiaires pour l'enregistrement
- Informer les bénéficiaires de l'utilisation de leurs données
- Respecter le droit à l'effacement (suppression des données)

---

**Auteur** : EcoPanier Team  
**Date de création** : Janvier 2025  
**Version** : 1.0.0

