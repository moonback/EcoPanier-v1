<p align="center">
  <img src="/public/logo.png" alt="EcoPanier Logo" width="160" style="border-radius: 12px;" />
</p>



> **Combattez le gaspillage alimentaire tout en nourrissant l'espoir** - Une plateforme moderne qui connecte commerçants, clients, bénéficiaires, associations et collecteurs pour réduire le gaspillage et promouvoir la solidarité.

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📖 À propos du projet

**EcoPanier** est une plateforme innovante de lutte contre le gaspillage alimentaire qui intègre un volet de solidarité sociale unique : **les lots gratuits pour bénéficiaires**. Les commerçants valorisent leurs invendus en créant des lots à prix réduits (jusqu'à -70%) pour les clients, et des lots 100% gratuits exclusifs pour les personnes en situation de précarité.

### 🎬 Vidéo de présentation

<video controls width="100%" poster="/public/logo.png">
  <source src="/public/EcoPanier.mp4" type="video/mp4" />
  Votre navigateur ne supporte pas la lecture vidéo intégrée. Vous pouvez
  télécharger la vidéo en cliquant sur ce lien :
  <a href="/public/EcoPanier.mp4">EcoPanier – Du Déchet à l'Espoir</a>.
</video>

### 🎯 Mission

- **Réduire le gaspillage** : Sauver les invendus alimentaires avant qu'ils ne finissent à la poubelle
- **Promouvoir la solidarité** : Les commerçants créent des lots gratuits exclusifs pour les bénéficiaires (2 lots/jour max)
- **Soutenir les commerces locaux** : Valoriser les commerçants engagés dans la démarche anti-gaspillage
- **Accompagner les associations** : Faciliter l'enregistrement et le suivi des bénéficiaires par les associations partenaires
- **Faciliter la logistique** : Coordonner les collecteurs pour les livraisons solidaires

---

## ✨ Fonctionnalités principales (MVP)

### 👥 Multi-rôles

La plateforme gère **6 types d'utilisateurs** avec des fonctionnalités dédiées :

#### 🛍️ **Client**
- Navigation et recherche de lots à prix réduits (jusqu'à -70%)
- Réservation de lots avec code PIN et QR code
- **💳 Système de portefeuille intégré** : Recharge, paiement et suivi des transactions
- Carte interactive pour localiser les commerçants
- Tableau de bord d'impact personnel (CO₂, repas sauvés, argent économisé)
- Historique des réservations

#### 🏪 **Commerçant**
- Création et gestion des lots d'invendus
- **🤖 Analyse IA des images (Gemini 2.0 Flash)** : Remplissage automatique du formulaire à partir d'une photo
- Définition des prix réduits et horaires de retrait
- Statistiques de ventes et d'impact
- Station de retrait avec scanner QR code
- Gestion des retraits clients
- **💳 Portefeuille commerçant** : Réception automatique des paiements après confirmation client
- **🏦 Demandes de virement** : Retrait des fonds vers compte bancaire (min 100€, commission 8%)
- **🔐 Gestion des comptes bancaires** : Enregistrement et gestion de plusieurs comptes

#### 🤝 **Bénéficiaire**
- Accès exclusif aux lots gratuits créés par les commerçants
- **Limite de 2 lots gratuits par jour maximum**
- Système de vérification avec ID unique (YYYY-BEN-XXXXX)
- Retrait avec QR code et PIN en toute dignité
- Suivi de l'aide reçue (repas sauvés, valeur)
- **📱 Mode Kiosque** : Accès via tablette dans les foyers pour bénéficiaires sans téléphone

#### 🏛️ **Association**
- Enregistrement et gestion des bénéficiaires partenaires
- Dashboard avec 7 onglets dédiés (statistiques, enregistrement, export, etc.)
- Création de comptes bénéficiaires avec ID unique auto-généré
- Statistiques avancées avec graphiques d'évolution sur 6 mois
- Historique détaillé de l'activité des bénéficiaires (réservations)
- Export de données (CSV/JSON) pour rapports et conformité RGPD
- Gestion des informations de l'association (nom, adresse, responsable)
- Suivi en temps réel (total enregistrés, vérifiés, actifs du mois)

#### 🚚 **Collecteur**
- Liste des missions de collecte disponibles
- Acceptation et suivi de missions
- Navigation GPS vers points de collecte/livraison
- Preuve de livraison (photos/signatures)
- Paiement par mission

#### 👑 **Administrateur**
- Tableau de bord global avec statistiques
- Gestion des utilisateurs (vérification, suspension)
- Analytics avancées et rapports
- Journal d'activité (logs) complet
- Configuration de la plateforme
- Gestion des paniers suspendus
- Historique des paramètres système

### 🎁 Lots Gratuits pour Bénéficiaires

Fonctionnalité phare de solidarité :
- Les commerçants créent des lots 100% gratuits exclusifs pour bénéficiaires
- **2 lots gratuits maximum par jour** par bénéficiaire
- Validation avec ID bénéficiaire unique (YYYY-BEN-XXXXX)
- Récupération identique aux autres clients (QR code + PIN)
- Aucune distinction visuelle pour préserver la dignité
- Suivi transparent de l'aide distribuée

### 📱 Mode Kiosque (Nouveau !)

**Accessibilité pour tous** - Interface dédiée pour les foyers d'accueil :
- 🏠 **Accès via tablette** pour bénéficiaires sans téléphone (SDF, précarité)
- 🔐 **Connexion par QR Code** : Scan de la carte bénéficiaire
- 🎯 **Interface simplifiée** : Gros boutons, textes très lisibles
- ⏱️ **Sécurité renforcée** : Déconnexion auto après 3 min d'inactivité
- 🔒 **Mode plein écran** : Empêche sortie accidentelle de l'application
- 📊 **Même fonctionnalités** : Réservation, QR code, code PIN agrandi
- 🤝 **Dignité préservée** : Expérience identique aux autres utilisateurs

**Route dédiée :** `/kiosk` - [Documentation complète](./docs/MODE_KIOSQUE.md)

### 🏛️ Espace Association

Interface dédiée aux associations partenaires pour gérer leurs bénéficiaires :

#### Dashboard avec 7 onglets
1. **Vue d'ensemble** : KPIs en temps réel (total, vérifiés, en attente, inscriptions du mois)
2. **Statistiques avancées** : Graphiques d'évolution sur 6 mois (inscriptions, réservations, catégories)
3. **Informations** : Gestion du profil association (nom, adresse, responsable)
4. **Enregistrer** : Formulaire de création de comptes bénéficiaires
5. **Bénéficiaires** : Liste complète avec gestion (vérification, suppression)
6. **Activité** : Historique détaillé des réservations par bénéficiaire
7. **Export** : Téléchargement CSV/JSON pour rapports

#### Fonctionnalités clés
- **Enregistrement simplifié** : Création de comptes bénéficiaires en quelques clics
- **ID unique auto-généré** : Format YYYY-BEN-XXXXX attribué automatiquement
- **Suivi de l'activité** : Visualisation des réservations de chaque bénéficiaire
- **Statistiques visuelles** : Graphiques interactifs (évolution, répartition par catégorie)
- **Export de données** : Conformité RGPD avec export CSV/JSON
- **Gestion des vérifications** : Basculer le statut de vérification des bénéficiaires

### 📱 Station de Retrait

Interface publique pour validation des retraits :
- Scanner QR code intégré
- Vérification avec code PIN à 6 chiffres
- Utilisation sans authentification
- Optimisée pour tablettes/mobiles
- Logs automatiques des retraits

### 💳 Système de Portefeuille

**Gestion financière intégrée** pour les clients et commerçants :

#### 👤 Pour les Clients
- **💵 Recharge de portefeuille** : Montants prédéfinis (10€, 20€, 50€, 100€, 200€) ou personnalisés
- **💳 Paiement via portefeuille** : Option de paiement lors de la réservation de lots
- **📊 Statistiques détaillées** :
  - Total rechargé et nombre de recharges
  - Total dépensé et nombre de paiements
  - Total remboursé et nombre de remboursements
  - Nombre total de transactions et moyenne
- **📜 Historique complet** : Toutes les transactions avec filtres (recharges, paiements, remboursements)
- **🔔 Notifications automatiques** : Alertes pour chaque transaction importante
- **⚠️ Alerte solde faible** : Notification si le solde est inférieur à 10€
- **📄 Pagination** : Navigation dans l'historique (20 transactions par page)

#### 🏪 Pour les Commerçants
- **💰 Réception automatique** : Paiement dans le portefeuille lors de la confirmation de réception par le client
- **📊 Statistiques de revenus** : Suivi des paiements reçus et historique complet
- **💸 Demandes de virement** : Retrait des fonds vers compte bancaire (minimum 100€)
- **💼 Gestion des comptes bancaires** : Enregistrement de plusieurs comptes avec compte par défaut
- **🔒 Sécurité renforcée** : Confirmation par mot de passe pour actions sensibles (modification compte, virement)
- **🔐 Masquage IBAN** : Protection des données bancaires (affichage partiel)
- **📈 Commission** : 8% de commission sur les virements (montant net = montant demandé - commission)

#### Avantages
- ⚡ **Paiement rapide** : Plus besoin de saisir les informations de carte à chaque achat
- 🔒 **Sécurisé** : Transactions tracées et historisées, confirmation par mot de passe
- 📈 **Suivi transparent** : Visualisation claire des dépenses et revenus
- 💰 **Gestion du budget** : Contrôle total sur les dépenses et revenus
- 🏦 **Retrait facile** : Virement bancaire simple avec gestion des comptes

#### Utilisation Client
1. **Recharger** : Onglet "Portefeuille" → "Recharger mon portefeuille"
2. **Payer** : Lors de la réservation, cocher "Payer avec mon portefeuille"
3. **Consulter** : Voir le solde dans le header et l'historique dans l'onglet dédié

#### Utilisation Commerçant
1. **Recevoir** : Les paiements arrivent automatiquement après confirmation client
2. **Gérer les comptes** : Onglet "Portefeuille" → "Comptes" pour enregistrer vos IBAN
3. **Demander un virement** : Onglet "Portefeuille" → "Demander un virement" (min 100€)

### 📊 Impact & Métriques

Suivi de l'impact environnemental et social :
- Repas sauvés
- CO₂ économisé (0.9 kg par repas)
- Argent économisé
- Dons effectués
- Personnes aidées

### 🤖 Analyse IA avec Gemini 2.0 Flash (Nouveau !)

**Innovation majeure** : Les commerçants peuvent maintenant créer des lots en quelques secondes grâce à l'intelligence artificielle !

#### Comment ça marche ?

1. **📸 Prenez une photo** de votre produit alimentaire
2. **🤖 L'IA analyse** l'image automatiquement (Gemini 2.0 Flash)
3. **✨ Les champs se remplissent** : titre, description, catégorie, prix, quantité...
4. **✅ Vérifiez et validez** - Ajustez si nécessaire et enregistrez !

#### Ce qui est détecté automatiquement :

- ✅ **Titre du produit** : Nom court et descriptif
- ✅ **Description détaillée** : Composition, état, conservation
- ✅ **Catégorie** : Classification intelligente (Fruits & Légumes, Boulangerie, etc.)
- ✅ **Prix estimés** : Prix original et prix anti-gaspi (30-70% de réduction)
- ✅ **Quantité** : Nombre d'unités détectées
- ✅ **Chaîne du froid** : Détection automatique si réfrigération nécessaire
- ✅ **Urgence** : Identification des produits très périssables

#### Avantages

- ⚡ **Gain de temps** : Création d'un lot en < 30 secondes
- 🎯 **Précision** : Score de confiance affiché pour chaque analyse
- 🚀 **Simple** : Un clic, une photo, c'est prêt !
- 💡 **Intelligent** : Suggestions de prix cohérentes avec le marché

👉 **Documentation complète** : [GEMINI_SETUP.md](./GEMINI_SETUP.md)

---

## 🛠️ Stack technique

### Frontend
- **React 18.3.1** - Framework UI moderne
- **TypeScript 5.5.3** - Typage statique
- **Vite 5.4.2** - Build tool ultra-rapide
- **React Router DOM 7.9.4** - Routing côté client
- **Tailwind CSS 3.4.1** - Framework CSS utility-first
- **Zustand 5.0.8** - État global léger
- **Lucide React** - Bibliothèque d'icônes moderne
- **date-fns 4.1.0** - Manipulation de dates

### Backend & Database
- **Supabase 2.57.4** - BaaS (Backend as a Service)
  - PostgreSQL - Base de données relationnelle
  - Row Level Security (RLS) - Sécurité au niveau ligne
  - Auth intégrée - Authentification complète
  - Storage - Stockage de fichiers
  - Realtime - Websockets (futur)

### QR Code & Scanner
- **qrcode.react 4.2.0** - Génération de QR codes
- **@yudiel/react-qr-scanner 2.3.1** - Scanner QR code

### Charts & Analytics
- **Recharts 3.2.1** - Graphiques et visualisations

### Intelligence Artificielle
- **@google/generative-ai** - API Gemini 2.0 Flash pour l'analyse d'images
  - Analyse automatique de produits alimentaires
  - Extraction intelligente d'informations (titre, prix, catégorie...)
  - Score de confiance pour chaque analyse

### Dev Tools
- **ESLint 9.9.1** - Linter JavaScript/TypeScript
- **PostCSS 8.4.35** - Transformations CSS
- **Autoprefixer 10.4.18** - Préfixes CSS automatiques

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.0.0 (recommandé : 20.x LTS)
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0
- **Git** >= 2.0.0
- **Compte Supabase** (gratuit : https://supabase.com)

### Optionnel
- **Supabase CLI** pour les migrations locales : https://supabase.com/docs/guides/cli

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/ecopanier.git
cd ecopanier
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Remplissez les variables d'environnement :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-publique

# Gemini AI Configuration (optionnel, pour l'analyse d'images)
VITE_GEMINI_API_KEY=votre-cle-gemini-api
```

> **⚠️ Important** : Ne commitez JAMAIS le fichier `.env` ! Il est déjà dans `.gitignore`.
> 
> **✨ Nouveau** : La clé Gemini AI est **optionnelle** mais recommandée pour activer l'analyse automatique d'images. Obtenez-la gratuitement sur [Google AI Studio](https://ai.google.dev/). Voir [GEMINI_SETUP.md](./GEMINI_SETUP.md) pour plus de détails.

### 4. Configuration de Supabase

#### A. Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme (anon key)

#### B. Exécuter les migrations

##### Option 1 : Via le Dashboard Supabase (Recommandé pour débutants)

1. Ouvrez le SQL Editor dans votre projet Supabase
2. Copiez le contenu de `supabase/migrations/20251011204650_create_food_waste_platform_schema.sql`
3. Exécutez la requête
4. Répétez pour les autres migrations dans l'ordre :
   - `20251012_platform_settings.sql`
   - `20251012_suspended_baskets.sql`
   - `20251012_suspended_baskets_sample_data.sql` (optionnel, données de test)
   - `20250116_add_association_role.sql` (rôle association)
   - `20250116_add_association_beneficiary_registrations.sql` (enregistrements bénéficiaires)
   - `20250120_add_is_free_to_lots.sql` (champ is_free pour lots gratuits)
   - `20250120_fix_free_lots_is_free_flag.sql` (correction données existantes)
   - `20250121_create_wallet_system.sql` (système de portefeuille pour clients)

##### Option 2 : Via Supabase CLI (Recommandé pour développeurs)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push
```

### 5. Créer un utilisateur admin

Après avoir exécuté les migrations, créez un compte admin :

1. Allez dans `Authentication` > `Users` dans le dashboard Supabase
2. Créez un nouvel utilisateur
3. Dans le SQL Editor, exécutez :

```sql
INSERT INTO profiles (id, role, full_name, phone, verified)
VALUES (
  'uuid-de-l-utilisateur-créé',
  'admin',
  'Administrateur Principal',
  '+33612345678',
  true
);
```

---

## 🎮 Lancement du projet

### Mode développement

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur **http://localhost:3000**

### Build pour production

```bash
npm run build
# ou
yarn build
```

Les fichiers optimisés seront dans le dossier `dist/`

### Prévisualiser le build

```bash
npm run preview
# ou
yarn preview
```

### Vérification TypeScript

```bash
npm run typecheck
# ou
yarn typecheck
```

### Linting

```bash
npm run lint
# ou
yarn lint
```

---

## 📁 Structure du projet

```
ecopanier/
├── public/                      # Fichiers statiques publics
├── src/
│   ├── components/              # Composants React
│   │   ├── admin/              # Composants administrateur
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   ├── AdvancedAnalytics.tsx
│   │   │   ├── ActivityLogs.tsx
│   │   │   ├── PlatformSettings.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ReportsGenerator.tsx
│   │   │   ├── SuspendedBaskets.tsx
│   │   │   └── SettingsHistory.tsx
│   │   ├── auth/               # Authentification
│   │   │   └── AuthForm.tsx
│   │   ├── association/        # Composants association
│   │   │   ├── AssociationDashboard.tsx
│   │   │   ├── AssociationStats.tsx
│   │   │   ├── AdvancedStats.tsx
│   │   │   ├── AssociationInfo.tsx
│   │   │   ├── BeneficiaryRegistration.tsx
│   │   │   ├── RegisteredBeneficiaries.tsx
│   │   │   ├── BeneficiaryActivityHistory.tsx
│   │   │   ├── ExportData.tsx
│   │   │   └── README.md
│   │   ├── beneficiary/        # Composants bénéficiaire
│   │   │   ├── BeneficiaryDashboard.tsx
│   │   │   ├── BeneficiaryReservations.tsx
│   │   │   └── FreeLotsList.tsx
│   │   ├── collector/          # Composants collecteur
│   │   │   ├── CollectorDashboard.tsx
│   │   │   ├── MissionsList.tsx
│   │   │   └── MyMissions.tsx
│   │   ├── customer/           # Composants client
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── CustomerHeader.tsx
│   │   │   ├── CustomerProfilePage.tsx
│   │   │   ├── ImpactDashboard.tsx
│   │   │   ├── LotBrowser.tsx
│   │   │   ├── ReservationsList.tsx
│   │   │   ├── WalletPage.tsx
│   │   │   └── components/
│   │   │       ├── RechargeModal.tsx
│   │   │       └── ReservationModal.tsx
│   │   ├── merchant/           # Composants commerçant
│   │   │   ├── MerchantDashboard.tsx
│   │   │   ├── LotManagement.tsx
│   │   │   └── SalesStats.tsx
│   │   ├── landing/            # Page d'accueil publique
│   │   │   └── LandingPage.tsx
│   │   ├── pages/              # Pages diverses
│   │   │   ├── HowItWorks.tsx
│   │   │   └── HelpCenter.tsx
│   │   ├── pickup/             # Station de retrait
│   │   │   ├── PickupStation.tsx
│   │   │   ├── PickupStationDemo.tsx
│   │   │   └── PickupHelp.tsx
│   │   └── shared/             # Composants partagés
│   │       ├── ErrorBoundary.tsx
│   │       ├── Footer.tsx
│   │       ├── Header.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── PlatformInfo.tsx
│   │       ├── ProfilePage.tsx
│   │       ├── QRCodeDisplay.tsx
│   │       └── QRScanner.tsx
│   ├── contexts/               # Contextes React
│   │   └── SettingsContext.tsx
│   ├── hooks/                  # Hooks personnalisés
│   │   └── usePlatformSettings.ts
│   ├── lib/                    # Bibliothèques et utilitaires
│   │   ├── database.types.ts   # Types générés Supabase
│   │   └── supabase.ts         # Client Supabase
│   ├── stores/                 # État global Zustand
│   │   └── authStore.ts        # Store authentification
│   ├── utils/                  # Fonctions utilitaires
│   │   ├── helpers.ts
│   │   ├── settingsService.ts
│   │   ├── validationHelpers.ts
│   │   └── walletService.ts    # Service de gestion du portefeuille
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx                # Point d'entrée
│   ├── index.css               # Styles globaux
│   └── vite-env.d.ts           # Types Vite
├── supabase/
│   └── migrations/             # Migrations SQL
│       ├── 20251011204650_create_food_waste_platform_schema.sql
│       ├── 20251012_platform_settings.sql
│       ├── 20251012_suspended_baskets.sql
│       ├── 20251012_suspended_baskets_sample_data.sql
│       ├── 20250116_add_association_role.sql
│       ├── 20250116_add_association_beneficiary_registrations.sql
│       ├── 20250120_add_is_free_to_lots.sql
│       ├── 20250120_fix_free_lots_is_free_flag.sql
│       └── 20250121_create_wallet_system.sql
├── .env.example                # Exemple de configuration
├── .gitignore                  # Fichiers ignorés par Git
├── eslint.config.js            # Configuration ESLint
├── index.html                  # HTML principal
├── package.json                # Dépendances npm
├── postcss.config.js           # Configuration PostCSS
├── tailwind.config.js          # Configuration Tailwind
├── tsconfig.json               # Configuration TypeScript
├── vite.config.ts              # Configuration Vite
└── README.md                   # Ce fichier
```

---

## 🔐 Variables d'environnement

### Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme publique Supabase | `eyJhbGci...` |

### Optionnelles

| Variable | Description | Exemple | Statut |
|----------|-------------|---------|--------|
| `VITE_GEMINI_API_KEY` | Clé API Gemini AI (analyse d'images) | `AIzaSy...` | **Recommandé** |
| `VITE_MAPBOX_TOKEN` | Token Mapbox (carte interactive) | `pk.eyJ1...` | Futur |
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe (paiements) | `pk_test_...` | Futur |
| `VITE_SENTRY_DSN` | DSN Sentry (monitoring erreurs) | `https://...` | Futur |

---

## 🧪 Tests

> **Note** : Les tests sont en cours d'implémentation.

```bash
# Tests unitaires (à venir)
npm run test

# Tests e2e (à venir)
npm run test:e2e

# Couverture de code (à venir)
npm run test:coverage
```

---

## 🌍 Déploiement

### Netlify (Recommandé)

1. Connectez votre dépôt GitHub
2. Configuration :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
3. Ajoutez les variables d'environnement dans les settings
4. Déployez !

### Vercel

1. Importez votre projet
2. Vercel détecte automatiquement Vite
3. Ajoutez les variables d'environnement
4. Déployez !

### Configuration Build

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🆕 Mises à Jour Récentes

### 💳 Système de Portefeuille Complet (Janvier 2025)

**Fonctionnalité majeure** : Gestion financière intégrée pour clients et commerçants !

#### Phase 1 : Portefeuille Client (21 Janvier 2025)
- ✅ **Recharge de portefeuille** : Montants prédéfinis ou personnalisés
- ✅ **Paiement via portefeuille** : Option lors de la réservation de lots
- ✅ **Statistiques complètes** : Total rechargé, dépensé, remboursé
- ✅ **Historique filtré** : Transactions par type avec pagination
- ✅ **Notifications automatiques** : Alertes pour chaque transaction
- ✅ **Alerte solde faible** : Notification si solde < 10€
- ✅ **Affichage dans le header** : Solde visible en temps réel
- ✅ Migration : `20250121_create_wallet_system.sql`

#### Phase 2 : Portefeuille Commerçant (22-24 Janvier 2025)
- ✅ **Réception automatique** : Paiement dans le portefeuille après confirmation client
- ✅ **Statistiques de revenus** : Suivi des paiements reçus
- ✅ **Demandes de virement** : Retrait vers compte bancaire (minimum 100€)
- ✅ **Commission 8%** : Calcul automatique de la commission sur virements
- ✅ **Gestion des comptes bancaires** : Enregistrement multiple avec compte par défaut
- ✅ **Confirmation par mot de passe** : Sécurité pour actions sensibles (modification compte, virement)
- ✅ **Masquage IBAN** : Protection des données bancaires (affichage partiel)
- ✅ Migrations : 
  - `20250122_extend_wallet_to_merchants.sql`
  - `20250123_add_withdrawal_requests.sql`
  - `20250124_add_merchant_bank_accounts.sql`

#### Base de données
- ✅ Tables `wallets` et `wallet_transactions` créées
- ✅ Tables `withdrawal_requests` et `merchant_bank_accounts` créées
- ✅ Trigger automatique : création de wallet pour clients et commerçants
- ✅ Champ `customer_confirmed` ajouté à `reservations` pour déclencher le paiement

#### Interface utilisateur
- ✅ Page dédiée "Portefeuille" dans les dashboards client et commerçant
- ✅ Modal de recharge avec montants rapides (clients)
- ✅ Modal de demande de virement (commerçants)
- ✅ Modal de gestion des comptes bancaires (commerçants)
- ✅ Modal de confirmation par mot de passe (actions sensibles)
- ✅ Intégration dans le processus de réservation et confirmation
- ✅ Design moderne avec statistiques visuelles

### 🔧 Correction Critique : Lots Gratuits (20 Janvier 2025)

**Problème résolu** : Les bénéficiaires ne voyaient pas tous les lots gratuits disponibles.

**Solution** : 
- ✅ Correction des filtres de requête dans `FreeLotsList.tsx` et `KioskLotsList.tsx`
- ✅ Automatisation du flag `is_free` lors de la création de lots
- ✅ Migration SQL pour corriger les données existantes
- ✅ **Résultat** : +30-40% de lots visibles, cohérence totale web/kiosque

📄 **[Voir le changelog complet](./CHANGELOG_FIX_FREE_LOTS.md)** pour tous les détails techniques.

---

## 📚 Documentation Complète

### Documentation Utilisateur Bénéficiaire

Une documentation détaillée sur le fonctionnement de l'interface bénéficiaire est disponible dans le dossier `docs/` :

📖 **[INDEX DE LA DOCUMENTATION BÉNÉFICIAIRE](./docs/BENEFICIAIRE_INDEX.md)**

#### Documents disponibles :

1. **[Analyse Fonctionnelle Complète](./docs/BENEFICIAIRE_FONCTIONNEMENT_ANALYSE.md)** (70+ pages)
   - Explication détaillée de chaque phase du parcours bénéficiaire
   - Identification des forces et faiblesses du système actuel
   - Analyse UX, technique et impact social
   - Points d'amélioration et recommandations

2. **[Roadmap d'Améliorations](./docs/BENEFICIAIRE_AMELIORATIONS_ROADMAP.md)** (60+ pages)
   - User stories détaillées (US-BEN-001 à US-BEN-XXX)
   - Priorisation par sprints (P0 Critique → P3 Futur)
   - Code d'implémentation (SQL, React, TypeScript)
   - Estimations de complexité et durée

3. **[Synthèse Exécutive](./docs/BENEFICIAIRE_SYNTHESE_EXECUTIVE.md)** (15 pages)
   - Résumé pour décideurs (lecture : 5-10 min)
   - Top 5 des problèmes critiques
   - Plan d'action et budget (~100k € sur 11 semaines)
   - KPIs et métriques de succès

4. **[Diagrammes et Flux](./docs/BENEFICIAIRE_DIAGRAMMES_FLUX.md)** (15 diagrammes Mermaid)
   - Parcours utilisateurs visualisés
   - Architecture DB et composants React
   - Flux de sécurité et transactions
   - Roadmap future (PWA, gamification, etc.)

5. 🆕 **[Mode Kiosque Tablette](./docs/BENEFICIAIRE_MODE_KIOSQUE_TABLETTE.md)** (40+ pages) - **🔴 CRITIQUE**
   - **Solution pour bénéficiaires SDF sans téléphone**
   - Tablettes partagées dans foyers/associations (Restos du Cœur, CHRS, etc.)
   - Cartes physiques avec QR code (pas de mot de passe requis)
   - Mode kiosque sécurisé avec auto-déconnexion
   - Budget : ~15-24k € initial, ~700-1,4k €/mois
   - **Impact : +30-50% de bénéficiaires accessibles**

#### 🚀 Quick Start Documentation

**Pour la direction** : Lire la [Synthèse Executive](./docs/BENEFICIAIRE_SYNTHESE_EXECUTIVE.md) (5 min) + 🆕 [Mode Kiosque](./docs/BENEFICIAIRE_MODE_KIOSQUE_TABLETTE.md) (20 min) **🔴 CRITIQUE**  
**Pour les développeurs** : Consulter la [Roadmap](./docs/BENEFICIAIRE_AMELIORATIONS_ROADMAP.md) et les [Diagrammes](./docs/BENEFICIAIRE_DIAGRAMMES_FLUX.md)  
**Pour les designers** : Lire l'[Analyse](./docs/BENEFICIAIRE_FONCTIONNEMENT_ANALYSE.md) sections UX

> ⚠️ **IMPORTANT** : Le document sur le **Mode Kiosque** est **critique** car il adresse l'exclusion de 30-50% des bénéficiaires potentiels (personnes sans téléphone, SDF). À lire en priorité pour garantir une inclusion réelle.

### Autres Documentations

- **[Architecture Globale](./docs/ARCHITECTURE.md)** - Vue d'ensemble de l'architecture
- **[Schéma de Base de Données](./docs/DB_SCHEMA.md)** - Documentation des tables et relations
- **[API Documentation](./docs/API_DOCS.md)** - Endpoints et intégrations
- **[Guide de Déploiement](./docs/GUIDE_DEPLOIEMENT_OPTIMISATIONS.md)** - Instructions de déploiement
- **[Roadmap Générale](./docs/ROADMAP.md)** - Vision produit à long terme
- **[SEO Guide](./docs/SEO_GUIDE.md)** - Optimisations SEO
- **[Guide Associations](./docs/ASSOCIATION_FEATURE.md)** - Fonctionnalités pour associations
- **[Guide Collecteurs](./docs/COLLECTEURS_IMPLEMENTATION.md)** - Système de collecteurs

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

### Workflow de contribution

1. **Fork** le projet
2. Créez une **branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add: Amazing feature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### Standards de code

- ✅ TypeScript strict activé
- ✅ ESLint pour le linting
- ✅ Prettier pour le formatage (recommandé)
- ✅ Convention de nommage :
  - **Composants** : PascalCase (`MyComponent.tsx`)
  - **Hooks** : camelCase avec préfixe `use` (`useMyHook.ts`)
  - **Utilitaires** : camelCase (`myUtil.ts`)
  - **Constantes** : UPPER_SNAKE_CASE (`MY_CONSTANT`)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 👥 Équipe & Contact

### Mainteneur principal
- **Nom** : [Votre nom]
- **Email** : contact@ecopanier.fr
- **GitHub** : [@votre-username](https://github.com/votre-username)

### Support
- **Documentation** : [Voir les docs](./docs/)
- **Issues** : [GitHub Issues](https://github.com/votre-username/ecopanier/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/ecopanier/discussions)

---

## 🙏 Remerciements

- **Supabase** pour l'infrastructure backend
- **Vercel** pour Vite et le tooling moderne
- **Tailwind Labs** pour Tailwind CSS
- **Lucide** pour les icônes magnifiques
- Tous les **contributeurs** et **utilisateurs**

---

## 📚 Ressources additionnelles

- [Documentation d'architecture](./ARCHITECTURE.md) - Architecture système détaillée
- [Documentation API](./API_DOCS.md) - Référence complète de l'API
- [Schéma de la base de données](./DB_SCHEMA.md) - Structure de la base de données
- [Documentation Espace Association](./docs/ASSOCIATION_FEATURE.md) - Guide complet de l'espace association
- [Roadmap](./ROADMAP.md) - Fonctionnalités à venir
- [Guide de contribution](./CONTRIBUTING.md) - Comment contribuer

---

## 📈 Statistiques du projet

![GitHub stars](https://img.shields.io/github/stars/votre-username/ecopanier?style=social)
![GitHub forks](https://img.shields.io/github/forks/votre-username/ecopanier?style=social)
![GitHub issues](https://img.shields.io/github/issues/votre-username/ecopanier)
![GitHub pull requests](https://img.shields.io/github/issues-pr/votre-username/ecopanier)

---

<div align="center">

**Développé avec ❤️ pour combattre le gaspillage et nourrir l'espoir**

[Site Web](https://ecopanier.fr) • [Documentation](./docs/) • [Signaler un Bug](https://github.com/votre-username/ecopanier/issues) • [Demander une Fonctionnalité](https://github.com/votre-username/ecopanier/issues)

</div>

