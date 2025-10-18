# 📊 Diagrammes et Flux - Interface Bénéficiaire

**Date** : Janvier 2025  
**Format** : Mermaid Diagrams  
**Objectif** : Visualiser les parcours utilisateurs et l'architecture

---

## 🔄 Flux Utilisateur Principal

### 1. Parcours Complet d'un Bénéficiaire

```mermaid
graph TD
    A[🏠 Page d'accueil] --> B[📝 Inscription]
    B --> C{Compte créé}
    C --> D[⏳ État: En attente de vérification]
    D --> E{Vérification par admin}
    E -->|Validé ✅| F[🎉 Compte activé]
    E -->|Rejeté ❌| G[📧 Email de rejet]
    G --> H[Correction des informations]
    H --> E
    
    F --> I[🏠 Dashboard Bénéficiaire]
    I --> J[📋 4 onglets disponibles]
    
    J --> K1[🎁 Paniers Gratuits]
    J --> K2[📦 Mes Paniers]
    J --> K3[📱 QR Code]
    J --> K4[👤 Profil]
    
    K1 --> L[🔍 Recherche/Filtres]
    L --> M[📦 Sélection d'un lot]
    M --> N{Vérification quota}
    N -->|Quota OK ✅| O[Choix quantité]
    N -->|Limite atteinte ❌| P[Message limite]
    
    O --> Q[Confirmation réservation]
    Q --> R[🎫 Génération code PIN]
    R --> S[📧 Email confirmation]
    
    K2 --> T[Liste des réservations]
    T --> U{Statut}
    U -->|Pending| V[📱 Afficher QR Code]
    U -->|Completed| W[✅ Récupéré]
    U -->|Cancelled| X[❌ Annulé]
    U -->|Expired| Y[⏱️ Expiré]
    
    V --> Z[🏪 Retrait chez commerçant]
    Z --> AA{Validation retrait}
    AA -->|PIN correct| AB[Status → Completed]
    AA -->|PIN incorrect| AC[Réessayer]
    
    AB --> AD[📧 Email post-retrait]
    AD --> AE[⭐ Demande d'évaluation]
    
    style A fill:#e3f2fd
    style F fill:#c8e6c9
    style G fill:#ffcdd2
    style AB fill:#c8e6c9
    style P fill:#fff3e0
```

---

## 🔐 Flux de Vérification des Comptes

### 2. Processus de Vérification (Actuel vs Amélioré)

```mermaid
sequenceDiagram
    participant B as Bénéficiaire
    participant S as Système
    participant A as Admin
    participant E as Service Email
    
    Note over B,E: ACTUELLEMENT (❌ Manque étapes admin)
    
    B->>S: Inscription
    S->>B: Compte créé (verified=false)
    B->>S: Connexion
    S->>B: Écran "En attente"
    
    Note over A: ❌ PAS D'INTERFACE<br/>Modification manuelle en DB
    
    Note over B,E: FUTUR AMÉLIORÉ (✅)
    
    B->>S: Inscription
    S->>B: Compte créé
    S->>E: Email "Demande enregistrée"
    S->>A: Notification nouvelle demande
    
    A->>S: Consulter dossier
    S->>A: Affichage détails + justificatifs
    
    alt Validation
        A->>S: Valider (avec note)
        S->>B: Update verified=true
        S->>E: Email "Compte validé"
        E->>B: 📧 Bienvenue !
        B->>S: Accès dashboard complet
    else Rejet
        A->>S: Rejeter (avec raison)
        S->>E: Email "Informations manquantes"
        E->>B: 📧 Explication + actions à faire
        B->>S: Compléter informations
    end
    
    A->>S: Log action (audit)
```

---

## 📦 Flux de Réservation

### 3. Processus de Réservation (Détaillé)

```mermaid
flowchart TD
    A[Bénéficiaire voit un lot] --> B{Quota disponible ?}
    
    B -->|Non - Limite atteinte| C[❌ Message: Limite quotidienne]
    C --> D[Afficher quota: X/2]
    D --> E[Suggestion: Revenir demain]
    
    B -->|Oui - Quota OK| F[Clic sur Réserver]
    F --> G[Modal: Choix de quantité]
    G --> H{Stock disponible ?}
    
    H -->|Non| I[❌ Message: Stock insuffisant]
    I --> J[Proposer autre lot similaire]
    
    H -->|Oui| K[Validation quantité]
    K --> L[Génération code PIN]
    L --> M{PIN unique ?}
    
    M -->|Non - Doublon| L
    M -->|Oui| N[Transaction DB]
    
    N --> O[1. Insert reservation]
    O --> P[2. Update lot.quantity_reserved]
    P --> Q[3. Update/Insert daily_limits]
    Q --> R[4. Log action audit]
    
    R --> S{Transaction OK ?}
    
    S -->|Erreur| T[❌ Rollback]
    T --> U[Message erreur utilisateur]
    
    S -->|Succès| V[✅ Modal confirmation]
    V --> W[Affichage du PIN]
    W --> X[📧 Envoi email confirmation]
    X --> Y[Refresh liste lots]
    Y --> Z[Refresh compteur quota]
    
    style C fill:#ffcdd2
    style I fill:#ffcdd2
    style T fill:#ffcdd2
    style V fill:#c8e6c9
    style W fill:#c8e6c9
```

---

## 🏪 Flux de Retrait

### 4. Retrait chez le Commerçant

```mermaid
sequenceDiagram
    participant B as Bénéficiaire
    participant QR as QR Code
    participant C as Commerçant
    participant S as Station de retrait
    participant DB as Base de données
    participant E as Service Email
    
    Note over B,E: Option A : Avec QR Code
    
    B->>B: Ouvre "Mes Paniers"
    B->>B: Clic "Voir QR Code"
    B->>QR: Affichage QR Code<br/>{reservationId, pin, userId}
    B->>C: Se présente au magasin
    C->>S: Scan QR Code
    S->>DB: Récupère réservation
    DB->>S: Détails réservation
    S->>S: Vérification statut = pending
    S->>C: Affichage détails lot + quantité
    C->>S: Confirmation retrait
    S->>DB: Update status = completed
    S->>C: ✅ Retrait validé
    S->>E: Trigger email post-retrait
    E->>B: 📧 Confirmation + demande feedback
    
    Note over B,E: Option B : Avec PIN uniquement
    
    B->>C: Communique PIN (6 chiffres)
    C->>S: Entre PIN manuellement
    S->>DB: Recherche reservation par PIN
    DB->>S: Détails réservation
    S->>C: Affichage détails
    C->>S: Validation
    S->>DB: Update status = completed
    S->>E: Trigger email
    E->>B: 📧 Confirmation
```

---

## ⏰ Flux de Gestion des Expirations

### 5. Auto-expiration des Réservations Non Retirées

```mermaid
flowchart LR
    A[Cron Job<br/>Toutes les heures] --> B[SELECT reservations<br/>WHERE status=pending<br/>AND pickup_end < NOW]
    
    B --> C{Réservations<br/>expirées ?}
    
    C -->|Non| D[Rien à faire]
    D --> A
    
    C -->|Oui| E[Pour chaque réservation]
    
    E --> F[1. Update status=expired]
    F --> G[2. Décrementer lot.quantity_reserved]
    G --> H[3. Insert no_show_log]
    H --> I[4. Libérer quota quotidien]
    
    I --> J{Bénéficiaire<br/>no-show répété ?}
    
    J -->|Non| K[Fin]
    
    J -->|Oui - > 3 en 30j| L[⚠️ Avertissement]
    L --> M[Email warning]
    
    J -->|Oui - > 5 en 30j| N[🚫 Suspension temporaire]
    N --> O[Update profile.suspended=true]
    O --> P[Email suspension]
    
    K --> A
    M --> A
    P --> A
    
    style N fill:#ffcdd2
    style L fill:#fff3e0
```

---

## 📊 Architecture de la Base de Données

### 6. Schéma Relationnel Simplifié

```mermaid
erDiagram
    PROFILES ||--o{ RESERVATIONS : "fait"
    PROFILES ||--o{ BENEFICIARY_DAILY_LIMITS : "a"
    PROFILES ||--o{ NO_SHOW_LOG : "a"
    PROFILES ||--o{ BENEFICIARY_REVIEWS : "écrit"
    
    LOTS ||--o{ RESERVATIONS : "contient"
    LOTS ||--o{ BENEFICIARY_REVIEWS : "évalué par"
    PROFILES ||--o{ LOTS : "crée (commerçant)"
    
    RESERVATIONS ||--o| BENEFICIARY_REVIEWS : "évalué"
    RESERVATIONS ||--o{ NO_SHOW_LOG : "génère si no-show"
    
    PROFILES {
        uuid id PK
        text role "beneficiary|merchant|customer|admin"
        boolean verified "true si validé"
        text beneficiary_id "YYYY-BEN-XXXXX"
        text address
        decimal latitude
        decimal longitude
        int household_size "nombre personnes foyer"
        boolean has_young_children
        int daily_quota_points
    }
    
    LOTS {
        uuid id PK
        uuid merchant_id FK
        text title
        text category
        int quantity_total
        int quantity_reserved
        int quantity_sold
        decimal discounted_price "0 = gratuit"
        int points_cost "pour système points"
        timestamp pickup_start
        timestamp pickup_end
        text status "available|expired"
    }
    
    RESERVATIONS {
        uuid id PK
        uuid lot_id FK
        uuid user_id FK
        int quantity
        decimal total_price "0 pour bénéficiaires"
        text pickup_pin "6 chiffres"
        text status "pending|completed|cancelled|expired"
        boolean is_donation
        timestamp created_at
        timestamp completed_at
    }
    
    BENEFICIARY_DAILY_LIMITS {
        uuid id PK
        uuid beneficiary_id FK
        date date "YYYY-MM-DD"
        int reservation_count
        int points_used "si système points"
    }
    
    NO_SHOW_LOG {
        uuid id PK
        uuid beneficiary_id FK
        uuid reservation_id FK
        timestamp created_at
    }
    
    BENEFICIARY_REVIEWS {
        uuid id PK
        uuid reservation_id FK
        uuid beneficiary_id FK
        uuid merchant_id FK
        int overall_rating "1-5 étoiles"
        int quality_rating
        int service_rating
        text comment
        boolean is_issue
        text issue_type
        timestamp created_at
    }
```

---

## 🔄 Flux de Quota Adaptatif

### 7. Système de Quota Intelligent (Futur)

```mermaid
graph TB
    A[Profil bénéficiaire] --> B{Système de quota ?}
    
    B -->|Classique<br/>Nombre de paniers| C[Calcul quota paniers]
    B -->|Points| D[Calcul quota points]
    
    C --> E[Base: 2 paniers]
    E --> F{Composition foyer ?}
    F -->|1 personne| G[Quota: 2]
    F -->|2 personnes| H[Quota: 3]
    F -->|3 personnes| I[Quota: 4]
    F -->|4+ personnes| J[Quota: 5]
    
    G --> K{Enfants ?}
    H --> K
    I --> K
    J --> K
    
    K -->|Oui| L[+1 panier bonus]
    K -->|Non| M[Quota final]
    L --> M
    
    D --> N[Base: 10 points]
    N --> O{Composition foyer ?}
    O -->|1 personne| P[10 points]
    O -->|2 personnes| Q[12 points]
    O -->|3 personnes| R[14 points]
    O -->|4+ personnes| S[16 points]
    
    P --> T{Enfants ?}
    Q --> T
    R --> T
    S --> T
    
    T -->|Oui| U[+3 points bonus]
    T -->|Non| V[Quota final points]
    U --> V
    
    M --> W[Affichage dashboard]
    V --> W
    
    W --> X{Heure de la journée ?}
    X -->|< 19h| Y[Quota normal]
    X -->|>= 19h| Z[🌙 Quota flexible<br/>ou illimité]
    
    style Z fill:#c8e6c9
    style L fill:#c8e6c9
    style U fill:#c8e6c9
```

---

## 🌍 Flux de Géolocalisation

### 8. Recherche par Proximité (Futur)

```mermaid
flowchart TD
    A[Bénéficiaire accède<br/>à Paniers Gratuits] --> B{Adresse<br/>renseignée ?}
    
    B -->|Non| C[Formulaire adresse]
    C --> D[Autocomplete API]
    D --> E[Sélection adresse]
    E --> F[Géocodage<br/>latitude, longitude]
    F --> G[Save dans profile]
    
    B -->|Oui| H[Récupération lat/lon]
    G --> H
    
    H --> I[Requête lots disponibles]
    I --> J[Pour chaque lot:<br/>Calcul distance]
    
    J --> K[Formule Haversine<br/>distance en km]
    K --> L[Tri par distance<br/>ascendant]
    
    L --> M{Filtre distance ?}
    M -->|Non| N[Afficher tous]
    M -->|Oui - X km| O[Filtrer distance <= X]
    
    N --> P[Grille de lots]
    O --> P
    
    P --> Q[Affichage badge<br/>distance sur chaque lot]
    Q --> R{Vue choisie ?}
    
    R -->|Liste| S[Cartes en grille]
    R -->|Carte| T[Affichage Mapbox]
    
    T --> U[Marqueur bénéficiaire<br/>bleu]
    U --> V[Marqueurs lots<br/>verts]
    V --> W[Clic marqueur<br/>→ Popup détails]
    
    style C fill:#fff3e0
    style T fill:#e1f5fe
    style W fill:#e1f5fe
```

---

## 📧 Flux d'Emailing Automatisé

### 9. Système de Notifications Email (Futur)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant DB as Database
    participant T as Trigger/Function
    participant Q as Queue Email
    participant E as Service Email<br/>(Resend)
    participant B as Bénéficiaire
    
    Note over U,B: 1. Email de confirmation de réservation
    
    U->>DB: INSERT reservation
    DB->>T: Trigger after_insert
    T->>Q: Enqueue email_reservation_confirmation
    Q->>E: Call API avec template
    E->>B: 📧 Email avec PIN + QR Code
    
    Note over U,B: 2. Email de validation de compte
    
    U->>DB: UPDATE profile SET verified=true
    DB->>T: Trigger after_update
    T->>Q: Enqueue email_account_verified
    Q->>E: Call API avec template
    E->>B: 📧 Bienvenue + instructions
    
    Note over U,B: 3. Email de rappel avant retrait
    
    Note right of T: Cron job 2h avant pickup_start
    T->>DB: SELECT reservations<br/>pickup_start IN [NOW+2h, NOW+2h30m]<br/>status=pending
    DB->>T: Liste réservations
    loop Pour chaque réservation
        T->>Q: Enqueue email_pickup_reminder
        Q->>E: Call API
        E->>B: 📧 Rappel + itinéraire
    end
    
    Note over U,B: 4. Email post-retrait
    
    U->>DB: UPDATE reservation SET status=completed
    DB->>T: Trigger after_update
    T->>Q: Enqueue email_pickup_confirmation
    Q->>E: Call API avec lien feedback
    E->>B: 📧 Remerciement + demande avis
```

---

## 🎯 Architecture des Composants React

### 10. Organisation des Composants Bénéficiaire

```mermaid
graph TD
    A[App.tsx] --> B[BeneficiaryDashboard]
    
    B --> C[DashboardHeader]
    B --> D[QuotaBar]
    B --> E[Navigation Tabs]
    B --> F[Content Area]
    
    F --> G{Active Tab}
    
    G -->|browse| H[FreeLotsList]
    G -->|reservations| I[BeneficiaryReservations]
    G -->|qrcode| J[QRCodeDisplay]
    G -->|profile| K[ProfilePage]
    
    H --> L[FilterModal]
    H --> M[LotCard]
    H --> N[ReservationModal]
    H --> O[ConfirmationModal]
    
    M --> P[Distance Badge]
    M --> Q[Category Badge]
    M --> R[Merchant Info]
    
    I --> S[ReservationCard]
    I --> T[QRCodeModal]
    I --> U[CancelReservationModal]
    
    S --> V[Status Badge]
    S --> W[PIN Display]
    S --> X[Merchant Info]
    
    K --> Y[HouseholdConfiguration]
    K --> Z[AddressAutocomplete]
    K --> AA[PreferencesForm]
    K --> AB[ImpactDashboard]
    
    AB --> AC[Stats Cards]
    AB --> AD[Charts]
    AB --> AE[History Table]
    
    style B fill:#e3f2fd
    style H fill:#fff3e0
    style I fill:#f3e5f5
    style AB fill:#e8f5e9
```

---

## 🔒 Flux de Sécurité et Validation

### 11. Vérifications de Sécurité lors de la Réservation

```mermaid
flowchart TD
    A[Demande de réservation] --> B{Utilisateur<br/>authentifié ?}
    B -->|Non| C[❌ Redirect to login]
    
    B -->|Oui| D{Role = beneficiary ?}
    D -->|Non| E[❌ Access denied]
    
    D -->|Oui| F{Compte verified ?}
    F -->|Non| G[❌ Compte en attente]
    
    F -->|Oui| H{Quota disponible ?}
    H -->|Non| I[❌ Limite quotidienne]
    
    H -->|Oui| J{Stock disponible ?<br/>WITH lock FOR UPDATE}
    J -->|Non| K[❌ Stock insuffisant]
    
    J -->|Oui| L{PIN unique ?}
    L -->|Non - Retry| M[Générer nouveau PIN]
    M --> L
    
    L -->|Oui| N[Transaction atomique]
    N --> O[1. Insert reservation]
    O --> P[2. Update lot stock]
    P --> Q[3. Update quota]
    Q --> R[4. Log audit]
    
    R --> S{All steps OK ?}
    S -->|Non| T[ROLLBACK]
    T --> U[❌ Erreur transaction]
    
    S -->|Oui| V[COMMIT]
    V --> W[✅ Réservation créée]
    
    W --> X[Return reservation_id + PIN]
    
    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style T fill:#ffcdd2
    style U fill:#ffcdd2
    style W fill:#c8e6c9
    style X fill:#c8e6c9
```

---

## 📈 Tableau de Bord d'Impact Personnel

### 12. Calcul et Affichage des Statistiques (Futur)

```mermaid
flowchart LR
    A[Bénéficiaire] --> B[Onglet Impact]
    
    B --> C[Requête SQL:<br/>Agrégations]
    
    C --> D[COUNT reservations<br/>WHERE status=completed]
    C --> E[SUM quantity<br/>= Repas sauvés]
    C --> F[Calcul CO₂:<br/>quantity × 0.9 kg]
    C --> G[SUM original_price<br/>= Valeur économisée]
    
    D --> H[📦 Total paniers]
    E --> I[🍽️ Repas sauvés]
    F --> J[🌍 CO₂ économisé]
    G --> K[💰 Valeur économisée]
    
    H --> L[Cards statistiques]
    I --> L
    J --> L
    K --> L
    
    L --> M[Affichage Dashboard]
    
    C --> N[GROUP BY month<br/>ORDER BY month]
    N --> O[Graphique Recharts:<br/>Évolution mensuelle]
    
    O --> M
    
    C --> P[GROUP BY category]
    P --> Q[Graphique:<br/>Répartition catégories]
    
    Q --> M
    
    M --> R[Bouton Partage]
    R --> S[Génération image<br/>avec stats]
    S --> T[Partage réseaux sociaux]
    
    style M fill:#e8f5e9
    style L fill:#e3f2fd
```

---

## 🔄 Workflow Admin de Vérification

### 13. Interface Admin - Vérification Bénéficiaires (Futur)

```mermaid
stateDiagram-v2
    [*] --> Inscription
    
    Inscription --> EnAttente : Compte créé<br/>verified=false
    
    EnAttente --> SousRevue : Admin consulte dossier
    
    SousRevue --> ValidationOK : Admin valide<br/>avec note
    SousRevue --> DemandeInfos : Infos manquantes<br/>ou incomplètes
    SousRevue --> Rejet : Non éligible
    
    ValidationOK --> Actif : verified=true<br/>Email envoyé
    
    DemandeInfos --> EnAttente : Bénéficiaire complète
    
    Rejet --> Cloture : Email rejet envoyé<br/>Compte bloqué
    
    Actif --> Suspendu : Abus détectés<br/>No-show répétés
    
    Suspendu --> Actif : Fin suspension<br/>après X jours
    
    Actif --> [*] : Bénéficiaire utilise<br/>la plateforme
    
    Cloture --> [*]
    
    note right of Actif
        Le bénéficiaire peut:
        - Réserver des paniers
        - Consulter son historique
        - Voir son impact
    end note
    
    note right of EnAttente
        Temps max: 24h
        Notification admin si > 24h
    end note
```

---

## 🎮 Gamification et Engagement (Futur)

### 14. Système de Badges et Récompenses

```mermaid
flowchart TD
    A[Action bénéficiaire] --> B{Type d'action ?}
    
    B -->|Réservation complétée| C[+1 Panier]
    B -->|Évaluation donnée| D[+1 Review]
    B -->|Sans no-show 30j| E[+1 Badge fidélité]
    
    C --> F{Seuils atteints ?}
    D --> F
    E --> F
    
    F -->|5 paniers| G[🥉 Badge Bronze]
    F -->|25 paniers| H[🥈 Badge Argent]
    F -->|100 paniers| I[🥇 Badge Or]
    F -->|365 paniers| J[💎 Badge Diamant]
    
    F -->|10 reviews| K[⭐ Badge Contributeur]
    F -->|30j sans no-show| L[🎯 Badge Fiable]
    
    G --> M[Notification in-app]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Affichage sur profil]
    N --> O[Partage réseaux sociaux]
    
    F -->|Seuils non atteints| P[Continuer]
    P --> A
    
    style G fill:#cd7f32
    style H fill:#c0c0c0
    style I fill:#ffd700
    style J fill:#b9f2ff
    style M fill:#c8e6c9
```

---

## 📱 Progressive Web App (PWA) - Futur

### 15. Architecture PWA et Notifications Push

```mermaid
graph TB
    A[Web App EcoPanier] --> B{Service Worker}
    
    B --> C[Cache Strategy]
    B --> D[Background Sync]
    B --> E[Push Notifications]
    
    C --> F[Cache First:<br/>Assets statiques]
    C --> G[Network First:<br/>Données dynamiques]
    C --> H[Stale While Revalidate:<br/>Images lots]
    
    D --> I[Offline Queue]
    I --> J[Sync quand online]
    
    E --> K[Permission demandée]
    K --> L{Acceptée ?}
    L -->|Oui| M[Enregistrement token]
    M --> N[Backend stockage]
    
    L -->|Non| O[Notifications désactivées]
    
    N --> P[Trigger événements]
    P --> Q[Nouveau lot proche]
    P --> R[Rappel retrait]
    P --> S[Quota réinitialisé]
    
    Q --> T[Push API]
    R --> T
    S --> T
    
    T --> U[Notification système]
    U --> V[Clic notification]
    V --> W[Ouverture app]
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style U fill:#c8e6c9
```

---

## 🔍 Conclusion

Ces diagrammes illustrent :

1. **Parcours utilisateurs** : De l'inscription au retrait
2. **Flux de données** : Réservations, quotas, notifications
3. **Architecture technique** : DB, composants, services
4. **Améliorations futures** : Géolocalisation, gamification, PWA

**Utilisation recommandée** :
- Présentation aux équipes techniques
- Documentation des processus
- Onboarding nouveaux développeurs
- Support à la prise de décision

---

**Tous les diagrammes sont au format Mermaid** et s'affichent automatiquement dans :
- GitHub README/Docs
- GitLab Markdown
- VS Code avec extension Mermaid
- Notion, Confluence, etc.


