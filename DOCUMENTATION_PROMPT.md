# 📚 Prompt de Génération de Documentation Complète - EcoPanier

## 🎯 Contexte du Projet

**Tu es un expert en documentation technique et en architecture logicielle spécialisé dans les applications React/TypeScript avec backend Supabase.**

Tu vas analyser **intégralement** l'application **EcoPanier** - une plateforme anti-gaspillage alimentaire avec solidarité sociale - et générer une documentation professionnelle, complète et à jour.

---

## 📋 Informations Clés du Projet

### Mission & Objectifs
- **Réduire le gaspillage alimentaire** : Sauver les invendus avant qu'ils finissent à la poubelle
- **Promouvoir la solidarité** : Les commerçants créent des lots gratuits exclusifs pour bénéficiaires
- **Soutenir les commerces locaux** : Valoriser les commerçants engagés
- **Faciliter la logistique** : Coordonner les collecteurs pour les livraisons solidaires

### Modèle Économique et Social (IMPORTANT - Mis à jour)

#### 🛍️ **Pour les Clients**
- Achètent des lots d'invendus avec **réductions jusqu'à -70%**
- Économisent de l'argent tout en sauvant des repas
- Suivent leur impact environnemental (CO₂, repas sauvés)

#### 🏪 **Pour les Commerçants**
- Valorisent leurs invendus au lieu de les jeter
- **Créent des lots gratuits exclusifs pour bénéficiaires** (solidarité)
- Utilisent l'IA (Gemini 2.0 Flash) pour créer des lots en 30 secondes
- Gèrent les retraits via une station QR code

#### ❤️ **Pour les Bénéficiaires**
- **Accèdent à 2 lots gratuits par jour maximum**
- Reçoivent des **lots gratuits créés par les commerçants** (pas de paniers suspendus)
- Retirent avec QR code en toute dignité
- ID unique format : YYYY-BEN-XXXXX

#### 🚚 **Pour les Collecteurs**
- Effectuent des livraisons solidaires
- Rémunération par mission
- Géolocalisation et navigation GPS

#### 👑 **Pour les Administrateurs**
- Dashboard global avec analytics
- Gestion des utilisateurs et paramètres
- Logs d'activité complets

---

## 🛠️ Stack Technique Détaillée

### Frontend
- **React 18.3.1** + **TypeScript 5.5.3** (STRICT mode, JAMAIS `any`)
- **Vite 5.4.2** (build tool ultra-rapide)
- **React Router DOM 7.9.4** (routing client-side)
- **Tailwind CSS 3.4.1** (utility-first, classes custom disponibles)
- **Zustand 5.0.8** (state management léger)
- **Framer Motion 12.23.24** (animations fluides)
- **Lucide React 0.344.0** (icônes modernes)
- **Recharts 3.2.1** (graphiques et visualisations)
- **date-fns 4.1.0** (manipulation de dates)

### Backend & Database
- **Supabase 2.57.4** (Backend as a Service)
  - PostgreSQL (base de données relationnelle)
  - Supabase Auth (authentification complète)
  - Row Level Security (RLS) sur tables sensibles
  - Storage (images de lots, logos commerçants)
  - Realtime (futur - notifications en temps réel)

### QR Code & Scanner
- **qrcode.react 4.2.0** (génération de QR codes)
- **@yudiel/react-qr-scanner 2.3.1** (scanner QR code)

### Intelligence Artificielle
- **@google/generative-ai 0.24.1** (Gemini 2.0 Flash)
  - Analyse automatique d'images de produits alimentaires
  - Extraction : titre, description, catégorie, prix, quantité
  - Score de confiance pour chaque analyse
  - Gain de temps : création de lot en < 30 secondes

### Cartographie (Futur)
- **Mapbox GL 2.15.0** + **react-map-gl 7.1.7**
  - Carte interactive des commerçants
  - Géolocalisation des utilisateurs
  - Navigation vers points de retrait

---

## 📁 Architecture du Projet

### Structure des Dossiers (Feature-Based)

```
src/
├── components/                  # Composants organisés par domaine métier
│   ├── admin/                  # Dashboard admin, analytics, logs, settings
│   ├── auth/                   # Authentification
│   ├── beneficiary/            # Interface bénéficiaire
│   ├── collector/              # Interface collecteur
│   ├── customer/               # Interface client + carte interactive
│   ├── merchant/               # Interface commerçant + IA Gemini
│   ├── landing/                # Page d'accueil publique (sections)
│   ├── pages/                  # Pages génériques (HowItWorks, HelpCenter)
│   ├── pickup/                 # Station de retrait (QR scanner)
│   └── shared/                 # Composants réutilisables
├── contexts/                   # React Context (SettingsContext)
├── hooks/                      # Hooks personnalisés (usePlatformSettings, useLots, etc.)
├── lib/                        # Configuration (supabase.ts, database.types.ts)
├── stores/                     # Zustand stores (authStore)
├── utils/                      # Fonctions utilitaires (helpers, geminiService, etc.)
├── data/                       # Données statiques (landingData.ts)
├── App.tsx                     # Routing principal
└── main.tsx                    # Point d'entrée
```

### Base de Données (Supabase PostgreSQL)

#### Tables Principales

1. **profiles** (Profils utilisateurs étendant auth.users)
   - `role`: customer | merchant | beneficiary | collector | admin
   - `beneficiary_id`: Format YYYY-BEN-XXXXX pour bénéficiaires
   - `verified`: booléen de vérification
   - `business_name`, `business_hours`, `business_logo_url` (pour commerçants)

2. **lots** (Lots d'invendus créés par commerçants)
   - `status`: available | reserved | sold_out | expired
   - `quantity_total`, `quantity_reserved`, `quantity_sold`
   - `original_price`, `discounted_price` (réductions jusqu'à -70%)
   - `is_free`: booléen pour lots gratuits bénéficiaires
   - `images`: array d'URLs d'images (Storage Supabase)
   - `pickup_start`, `pickup_end`: plages horaires de retrait

3. **reservations** (Réservations avec code PIN)
   - `pickup_pin`: Code à 6 chiffres pour retrait
   - `status`: pending | confirmed | completed | cancelled
   - Relation : user_id → profiles, lot_id → lots

4. **suspended_baskets** (DÉPRÉCIÉ - Remplacé par lots gratuits)
   - Anciennement pour paniers suspendus
   - Maintenant, les lots gratuits sont des lots normaux avec `is_free = true`

5. **missions** (Missions pour collecteurs)
   - `collector_id`, `merchant_id`
   - `status`: available | accepted | in_progress | completed | cancelled
   - `pickup_location`, `delivery_location` (géolocalisation)

6. **platform_settings** (Paramètres globaux avec RLS)
   - Configurations système (commission, limites, etc.)
   - Historique des modifications

7. **activity_logs** (Logs d'activité système)
   - Traçabilité complète des actions utilisateurs

#### Storage Buckets
- **lot-images** : Images des lots créés par commerçants
- **business-logos** : Logos des commerces

---

## 🎯 Tâches à Réaliser

### 1. Mettre à Jour `README.md`

**Objectif** : Créer un README professionnel, complet et à jour avec les dernières modifications.

**Sections à inclure** :
- [ ] **Badge et Logo** : Badges technos + logo EcoPanier
- [ ] **Pitch du projet** : 2-3 lignes claires et engageantes
- [ ] **Mission** : Objectifs clairs (gaspillage, solidarité, commerce local)
- [ ] **Fonctionnalités principales (MVP)** :
  - **Multi-rôles** (5 types d'utilisateurs avec détails)
  - **Lots gratuits** (2/jour max pour bénéficiaires, créés par commerçants)
  - **Réductions jusqu'à -70%** pour clients
  - **Analyse IA Gemini 2.0 Flash** (création de lots en 30s)
  - **Station de retrait** (QR code + PIN)
  - **Impact environnemental** (CO₂, repas sauvés)
  - **Carte interactive** (géolocalisation commerçants)
- [ ] **Stack technique complète** (voir section ci-dessus)
- [ ] **Prérequis** : Node.js, npm, Git, compte Supabase, clé Gemini (optionnel)
- [ ] **Installation** :
  1. Clone du dépôt
  2. Installation dépendances
  3. Configuration `.env` (Supabase + Gemini)
  4. Setup Supabase (migrations)
  5. Création utilisateur admin
- [ ] **Lancement du projet** :
  - `npm run dev` (port 3000)
  - `npm run build`
  - `npm run preview`
  - `npm run typecheck`
  - `npm run lint`
- [ ] **Structure du projet** : Arborescence complète et commentée
- [ ] **Variables d'environnement** : Tableau avec toutes les variables
- [ ] **Déploiement** : Instructions Netlify/Vercel
- [ ] **Contribution** : Workflow de contribution
- [ ] **Licence** : MIT
- [ ] **Contact & Support**
- [ ] **Ressources additionnelles** : Liens vers autres docs

---

### 2. Créer/Mettre à Jour `ARCHITECTURE.md`

**Objectif** : Expliquer l'architecture système de manière claire et visuelle.

**Sections à inclure** :
- [ ] **Vue d'ensemble** : Schéma ASCII de l'architecture globale
  ```
  [Client Browser] → [React App] → [Supabase] → [PostgreSQL]
                                 ↓
                            [Gemini AI]
  ```
- [ ] **Frontend Architecture** :
  - Pattern feature-based
  - Routing (React Router DOM)
  - State management (Zustand pour auth, Context pour settings)
  - Styling (Tailwind CSS + classes custom)
  - Animations (Framer Motion)
- [ ] **Backend Architecture** :
  - Supabase comme BaaS
  - PostgreSQL avec relations complexes
  - Row Level Security (RLS)
  - Storage pour images
  - Realtime (futur)
- [ ] **Authentification & Autorisation** :
  - Supabase Auth
  - 5 rôles utilisateurs avec permissions distinctes
  - Protection des routes par rôle
- [ ] **Gestion des Données** :
  - Relations entre tables
  - Triggers et fonctions SQL
  - Migrations versionnées
- [ ] **Intelligence Artificielle** :
  - Intégration Gemini 2.0 Flash
  - Processus d'analyse d'images
  - Gestion des erreurs et fallbacks
- [ ] **Sécurité** :
  - Variables d'environnement
  - RLS policies
  - Validation côté serveur
  - XSS/CSRF protection
- [ ] **Performance** :
  - Code splitting
  - Lazy loading
  - Optimisation images
  - Caching stratégies

---

### 3. Créer/Mettre à Jour `API_DOCS.md`

**Objectif** : Documenter toutes les interactions avec Supabase et Gemini AI.

**Sections à inclure** :
- [ ] **Introduction** : Supabase comme API backend
- [ ] **Authentification** :
  - `signUp()` : Inscription
  - `signIn()` : Connexion
  - `signOut()` : Déconnexion
  - `resetPassword()` : Réinitialisation
- [ ] **Profiles** :
  - `GET /profiles` : Liste des profils
  - `GET /profiles/:id` : Profil spécifique
  - `PUT /profiles/:id` : Mise à jour profil
  - Relations avec auth.users
- [ ] **Lots** :
  - `GET /lots` : Liste des lots (avec filtres)
  - `POST /lots` : Créer un lot (commerçant)
  - `PUT /lots/:id` : Modifier un lot
  - `DELETE /lots/:id` : Supprimer un lot
  - Filtres : status, category, is_free, merchant_id, price_range
- [ ] **Reservations** :
  - `POST /reservations` : Créer une réservation
  - `GET /reservations` : Liste des réservations
  - `PUT /reservations/:id` : Modifier statut
  - `DELETE /reservations/:id` : Annuler réservation
- [ ] **Missions** (Collecteurs) :
  - `GET /missions` : Missions disponibles
  - `POST /missions/:id/accept` : Accepter mission
  - `PUT /missions/:id/complete` : Terminer mission
- [ ] **Platform Settings** (Admin) :
  - `GET /platform_settings` : Récupérer paramètres
  - `PUT /platform_settings` : Modifier paramètres
- [ ] **Activity Logs** (Admin) :
  - `GET /activity_logs` : Historique d'activité
- [ ] **Storage** :
  - Upload d'images de lots
  - Upload de logos commerçants
  - URLs publiques et privées
- [ ] **Gemini AI API** :
  - Endpoint : `analyzeImageWithGemini(imageFile)`
  - Input : File (image)
  - Output : { title, description, category, originalPrice, discountedPrice, quantity, requiresColdChain, isUrgent, confidence }
  - Gestion des erreurs

---

### 4. Créer/Mettre à Jour `DB_SCHEMA.md`

**Objectif** : Documenter le schéma de base de données de manière lisible.

**Sections à inclure** :
- [ ] **Diagramme ERD** : Schéma ASCII des relations entre tables
- [ ] **Table `profiles`** :
  - Colonnes avec types et contraintes
  - Relations (1-N avec lots, reservations, missions)
  - Index
  - RLS policies (si applicable)
- [ ] **Table `lots`** :
  - Colonnes détaillées
  - Enum types (status, category)
  - Relations (N-1 avec profiles)
  - Triggers (mise à jour quantités)
- [ ] **Table `reservations`** :
  - Colonnes
  - Relations (N-1 avec profiles et lots)
  - Contraintes (unicité PIN)
- [ ] **Table `missions`** :
  - Colonnes
  - Relations
  - États possibles
- [ ] **Table `platform_settings`** :
  - Paramètres système
  - RLS activé
  - Historique avec `settings_history`
- [ ] **Table `activity_logs`** :
  - Logs d'audit
  - Structure JSON flexible
- [ ] **Storage Buckets** :
  - `lot-images` : Policies d'accès
  - `business-logos` : Policies d'accès
- [ ] **Migrations** :
  - Liste des migrations avec descriptions
  - Ordre d'exécution

---

### 5. Créer/Mettre à Jour `ROADMAP.md`

**Objectif** : Planifier les fonctionnalités futures de manière claire.

**Sections à inclure** :
- [ ] **Légende** :
  - ✅ Terminé
  - 🚧 En cours
  - 📋 Planifié
  - 💡 Idée future
- [ ] **MVP (Version 0.1) - ✅ TERMINÉ** :
  - Multi-rôles (5 utilisateurs)
  - Lots gratuits pour bénéficiaires (2/jour max)
  - Réductions jusqu'à -70%
  - QR code + PIN pour retraits
  - IA Gemini pour création de lots
  - Dashboard admin basique
- [ ] **Version 1.0 - 🚧 EN COURS** :
  - Carte interactive des commerçants
  - Filtres avancés de recherche
  - Notifications en temps réel (Supabase Realtime)
  - Système de notation commerçants
  - Statistiques d'impact détaillées
- [ ] **Version 1.1 - 📋 PLANIFIÉ** :
  - Application mobile (React Native)
  - Paiements Stripe/PayPal
  - Programme de fidélité clients
  - API publique pour partenaires
  - Multilangue (FR, EN, ES)
- [ ] **Version 2.0 - 💡 IDÉES** :
  - Marketplace de producteurs locaux
  - Système de parrainage
  - Gamification (badges, challenges)
  - Intégration comptabilité commerçants
  - Prédiction IA des invendus

---

### 6. Créer/Mettre à Jour `CONTRIBUTING.md`

**Objectif** : Faciliter les contributions au projet.

**Sections à inclure** :
- [ ] **Introduction** : Remerciements et bienvenue
- [ ] **Code de Conduite** : Respect et bienveillance
- [ ] **Comment contribuer** :
  - Signaler un bug (template d'issue)
  - Proposer une fonctionnalité (template)
  - Soumettre une Pull Request
- [ ] **Workflow Git** :
  1. Fork du projet
  2. Créer une branche (`feature/`, `fix/`, `docs/`)
  3. Commits conventionnels (`feat:`, `fix:`, `docs:`, etc.)
  4. Push et ouverture de PR
  5. Review et merge
- [ ] **Standards de Code** :
  - TypeScript strict (JAMAIS `any`)
  - Nommage : PascalCase (composants), camelCase (fonctions), UPPER_SNAKE_CASE (constantes)
  - ESLint + Prettier
  - Tests obligatoires (futur)
- [ ] **Structure d'un Composant React** :
  - Ordre : imports, types, composant, styles
  - Pattern de gestion d'erreurs Supabase
  - Ordre des classes Tailwind
- [ ] **Gestion des Erreurs** :
  - Toujours vérifier `error` de Supabase
  - Messages utilisateur-friendly
  - Logging en console pour debug
- [ ] **Documentation** :
  - JSDoc pour fonctions publiques
  - README à jour si nouvelle feature
  - Commentaires pour logique complexe
- [ ] **Tests** (Futur) :
  - Tests unitaires (Vitest)
  - Tests e2e (Playwright)
  - Coverage > 80%

---

## 🔍 Checklist de Vérification

Avant de finaliser la documentation, assure-toi que :

- [ ] **Cohérence terminologique** : "Lots gratuits" (pas "paniers suspendus"), "bénéficiaires" (pas "associations"), "-70%" (pas "-50%")
- [ ] **Chiffres à jour** : 2 lots/jour max, -70% max, 0.9kg CO₂/repas
- [ ] **Stack complète** : Toutes les dépendances listées (package.json)
- [ ] **Migrations documentées** : 7 migrations SQL répertoriées
- [ ] **Variables d'env** : VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
- [ ] **Exemples de code** : Snippets React/TypeScript corrects
- [ ] **Liens fonctionnels** : Tous les liens internes/externes valides
- [ ] **Markdown valide** : Syntaxe correcte, rendu propre
- [ ] **Pas de secrets** : Aucune clé API ou mot de passe exposé
- [ ] **Français correct** : Orthographe et grammaire irréprochables

---

## 📝 Format de Livraison

Pour chaque document, utilise ce format :

```markdown
# Titre du Document

> **Description courte** - Résumé en une ligne

---

## Section 1

Contenu...

### Sous-section 1.1

Détails...

---

## Section 2

...
```

**Style** :
- ✅ Markdown propre et lisible
- ✅ Titres hiérarchisés (H1 > H2 > H3)
- ✅ Listes à puces pour clarté
- ✅ Tableaux pour données structurées
- ✅ Code blocks avec langage spécifié (```typescript, ```sql, etc.)
- ✅ Emojis pour navigation visuelle (modération)
- ✅ Sections séparées par `---`

---

## 🚀 Instructions d'Exécution

**Étape 1** : Analyse complète de l'application
- Parcours tous les fichiers du projet
- Identifie les patterns, architectures, conventions
- Note les spécificités et innovations (IA Gemini, lots gratuits, etc.)

**Étape 2** : Génération des documents
- Commence par `README.md` (document principal)
- Puis génère dans l'ordre : `ARCHITECTURE.md`, `API_DOCS.md`, `DB_SCHEMA.md`, `ROADMAP.md`, `CONTRIBUTING.md`
- Assure la cohérence entre tous les documents

**Étape 3** : Vérification finale
- Vérifie tous les points de la checklist
- Corrige les incohérences
- Valide la syntaxe Markdown

**Étape 4** : Livraison
- Fournis chaque document séparément
- Prêt à être copié-collé et publié sur GitHub

---

## ✨ Attentes Qualité

Cette documentation doit être :
- **Professionnelle** : Niveau production, prête pour GitHub public
- **Complète** : Couvre 100% du projet (frontend, backend, DB, IA)
- **À jour** : Reflète les dernières modifications (lots gratuits, -70%, 2/jour)
- **Claire** : Accessible aux débutants comme aux experts
- **Maintenable** : Facile à mettre à jour à l'avenir
- **Visuellement agréable** : Utilise Markdown efficacement

---

**GO !** 🚀 Analyse l'application **EcoPanier** et génère une documentation complète et professionnelle.

