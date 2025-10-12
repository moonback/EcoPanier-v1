<p align="center">
  <img src="logo.png" alt="EcoPanier Logo" width="160" style="border-radius: 12px;" />
</p>



> **Combattez le gaspillage alimentaire tout en nourrissant l'espoir** - Une plateforme moderne qui connecte commerçants, clients, bénéficiaires et collecteurs pour réduire le gaspillage et promouvoir la solidarité.

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📖 À propos du projet

**EcoPanier** est une plateforme innovante de lutte contre le gaspillage alimentaire qui intègre un volet de solidarité sociale unique : **les paniers suspendus**. Inspirée du concept italien du "caffè sospeso", elle permet aux clients d'offrir des repas aux personnes en situation de précarité tout en sauvant des invendus alimentaires.

### 🎯 Mission

- **Réduire le gaspillage** : Sauver les invendus alimentaires avant qu'ils ne finissent à la poubelle
- **Promouvoir la solidarité** : Permettre aux clients d'offrir des paniers suspendus aux bénéficiaires
- **Soutenir les commerces locaux** : Valoriser les commerçants engagés dans la démarche
- **Faciliter la logistique** : Coordonner les collecteurs pour les livraisons solidaires

---

## ✨ Fonctionnalités principales (MVP)

### 👥 Multi-rôles

La plateforme gère **5 types d'utilisateurs** avec des fonctionnalités dédiées :

#### 🛍️ **Client**
- Navigation et recherche de lots à prix réduits
- Réservation de lots avec code PIN et QR code
- Don de paniers suspendus aux bénéficiaires
- Tableau de bord d'impact personnel (CO₂, repas sauvés)
- Historique des réservations et dons

#### 🏪 **Commerçant**
- Création et gestion des lots d'invendus
- Définition des prix réduits et horaires de retrait
- Statistiques de ventes et d'impact
- Station de retrait avec scanner QR code
- Gestion des retraits clients

#### 🤝 **Bénéficiaire**
- Accès aux lots gratuits et paniers suspendus
- Limite de 2 réservations par jour
- Système de vérification avec ID unique (YYYY-BEN-XXXXX)
- Retrait avec QR code et PIN
- Suivi de l'aide reçue

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

### 🎁 Paniers Suspendus

Fonctionnalité phare de solidarité :
- Les clients peuvent offrir un panier à un bénéficiaire
- Montant libre (dès 2€)
- Validation par le commerçant
- Récupération par les bénéficiaires vérifiés
- Suivi transparent des dons

### 📱 Station de Retrait

Interface publique pour validation des retraits :
- Scanner QR code intégré
- Vérification avec code PIN à 6 chiffres
- Utilisation sans authentification
- Optimisée pour tablettes/mobiles
- Logs automatiques des retraits

### 📊 Impact & Métriques

Suivi de l'impact environnemental et social :
- Repas sauvés
- CO₂ économisé (0.9 kg par repas)
- Argent économisé
- Dons effectués
- Personnes aidées

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
```

> **⚠️ Important** : Ne commitez JAMAIS le fichier `.env` ! Il est déjà dans `.gitignore`.

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

L'application sera accessible sur **http://localhost:5173**

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
│   │   │   ├── ImpactDashboard.tsx
│   │   │   ├── LotBrowser.tsx
│   │   │   └── ReservationsList.tsx
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
│   │   └── validationHelpers.ts
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx                # Point d'entrée
│   ├── index.css               # Styles globaux
│   └── vite-env.d.ts           # Types Vite
├── supabase/
│   └── migrations/             # Migrations SQL
│       ├── 20251011204650_create_food_waste_platform_schema.sql
│       ├── 20251012_platform_settings.sql
│       ├── 20251012_suspended_baskets.sql
│       └── 20251012_suspended_baskets_sample_data.sql
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

### Optionnelles (Futures)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_GOOGLE_MAPS_KEY` | Clé API Google Maps | `AIzaSy...` |
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe (paiements) | `pk_test_...` |
| `VITE_SENTRY_DSN` | DSN Sentry (monitoring erreurs) | `https://...` |

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

