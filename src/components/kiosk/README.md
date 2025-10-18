# 📱 Mode Kiosque - Composants React

## 📋 Vue d'ensemble

Ensemble de composants React pour le **mode kiosque** EcoPanier, destiné aux foyers d'accueil pour permettre aux bénéficiaires sans téléphone d'accéder aux paniers solidaires.

---

## 🏗️ Architecture

```
kiosk/
├── KioskMode.tsx           # Container principal
├── KioskLogin.tsx          # Connexion par QR code
├── KioskDashboard.tsx      # Dashboard avec navigation
├── KioskLotsList.tsx       # Liste et réservation des paniers
├── KioskReservations.tsx   # Liste des réservations
└── README.md               # Ce fichier
```

---

## 🧩 Composants

### `<KioskMode />`

**Container principal** qui gère :
- Mode plein écran automatique
- Timer de déconnexion (3 min par défaut)
- État d'authentification
- Barre supérieure avec timer et bouton déconnexion

**Props :** Aucune (route `/kiosk`)

**État :**
- `authenticatedProfile` : Profil du bénéficiaire connecté
- `lastActivity` : Timestamp de dernière activité
- `timeRemaining` : Temps restant avant déconnexion

**Fonctionnalités :**
- Détection d'inactivité (mouse, keyboard, touch)
- Déconnexion automatique
- Plein écran auto
- Désactivation clic droit

---

### `<KioskLogin />`

**Écran de connexion** par scan QR code.

**Props :**
```typescript
interface KioskLoginProps {
  onLogin: (profile: Profile) => void;
}
```

**Fonctionnalités :**
- Scanner QR code via caméra
- Validation du compte bénéficiaire
- Vérification du statut (verified)
- Gestion des erreurs

**États :**
- `scanning` : Scanner actif ou non
- `error` : Message d'erreur
- `loading` : Chargement en cours

---

### `<KioskDashboard />`

**Dashboard principal** après connexion.

**Props :**
```typescript
interface KioskDashboardProps {
  profile: Profile;
  onActivity: () => void; // Reset du timer
}
```

**Fonctionnalités :**
- Affichage infos bénéficiaire
- Compteur quotidien (X/2)
- Navigation par onglets (Paniers / Réservations)
- Vérification limite quotidienne

**Tabs :**
- `browse` : Liste des paniers disponibles
- `reservations` : Mes réservations

---

### `<KioskLotsList />`

**Liste des paniers** avec réservation.

**Props :**
```typescript
interface KioskLotsListProps {
  profile: Profile;
  dailyCount: number;
  onReservationMade: () => void;
  onActivity: () => void;
}
```

**Fonctionnalités :**
- Affichage des lots gratuits disponibles
- Réservation simplifiée (1 clic)
- Modal de confirmation
- Modal de succès avec **code PIN en gros**
- Gestion limite quotidienne

**Design :**
- Gros boutons (accessibilité)
- Textes très lisibles (text-2xl, text-3xl)
- Images des lots

---

### `<KioskReservations />`

**Liste des réservations** du bénéficiaire.

**Props :**
```typescript
interface KioskReservationsProps {
  profile: Profile;
  onActivity: () => void;
}
```

**Fonctionnalités :**
- Affichage des réservations (10 dernières)
- Modal avec **QR code agrandi** (300x300px)
- Code PIN en **très gros** (text-7xl)
- Informations de retrait

**Statuts :**
- `pending` : En attente de retrait
- `completed` : Récupéré
- `cancelled` : Annulé

---

## 🎨 Design & Accessibilité

### Tailles de texte

```typescript
// Titres principaux
className="text-5xl font-bold"

// Sous-titres
className="text-3xl font-bold"

// Textes courants
className="text-2xl"

// Code PIN
className="text-7xl font-mono font-bold"
```

### Couleurs

```typescript
// Actions principales
className="bg-gradient-to-r from-accent-600 to-pink-600"

// Succès
className="bg-success-100 text-success-800"

// Avertissements (timer)
className="bg-warning-100 text-warning-800"

// Neutre
className="bg-gray-200 text-gray-800"
```

### Boutons

- **Primaires** : Gradient accent/pink, gros (py-6), icônes 28-32px
- **Secondaires** : Gray, py-6, border-4
- **Tous** : rounded-2xl, font-bold, text-2xl

---

## 🔧 Paramètres configurables

### Timer de déconnexion

**Fichier :** `KioskMode.tsx`

```typescript
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // Millisecondes
```

**Valeurs suggérées :**
- 120000 (2 min) : Forte affluence
- 180000 (3 min) : Normal
- 300000 (5 min) : Faible affluence

### Taille du QR Code

**Fichier :** `KioskReservations.tsx`

```typescript
<QRCodeSVG
  value={...}
  size={300} // Modifier ici
  level="H"
/>
```

### Nombre de lots affichés

**Fichier :** `KioskLotsList.tsx`

```typescript
// Actuellement : tous les lots disponibles
// Pour limiter, ajouter .limit(N) à la requête Supabase
```

### Historique des réservations

**Fichier :** `KioskReservations.tsx`

```typescript
.limit(10) // Modifier pour afficher plus/moins
```

---

## 🔒 Sécurité

### Protections implémentées

1. **Déconnexion auto** : 3 min d'inactivité
2. **Mode plein écran** : Empêche sortie accidentelle
3. **Clic droit désactivé** : Empêche modifications
4. **Validation stricte** : Seuls bénéficiaires vérifiés
5. **Pas de stockage** : Aucune donnée persistante

### Vérifications

```typescript
// Vérification du rôle
.eq('role', 'beneficiary')

// Vérification du statut
if (!profile.verified) {
  setError('Compte non vérifié');
  return;
}

// Vérification limite quotidienne
if (dailyCount >= 2) {
  // Bloquer réservation
}
```

---

## 📊 Intégration Supabase

### Tables utilisées

1. **profiles** : Infos bénéficiaire
2. **lots** : Paniers disponibles
3. **reservations** : Réservations effectuées
4. **beneficiary_daily_limits** : Limite quotidienne

### Requêtes principales

```typescript
// Récupérer profil
supabase
  .from('profiles')
  .select('*')
  .eq('id', beneficiaryId)
  .eq('role', 'beneficiary')
  .maybeSingle()

// Récupérer lots gratuits
supabase
  .from('lots')
  .select('*, profiles(business_name, business_address)')
  .eq('status', 'available')
  .eq('discounted_price', 0)
  .gt('quantity_total', 0)

// Créer réservation
supabase
  .from('reservations')
  .insert({
    lot_id,
    user_id,
    quantity: 1,
    total_price: 0,
    pickup_pin: generatePIN(),
    status: 'pending'
  })

// Vérifier limite
supabase
  .from('beneficiary_daily_limits')
  .select('reservation_count')
  .eq('beneficiary_id', profileId)
  .eq('date', today)
```

---

## 🧪 Tests

### Test manuel

1. Ouvrir `/kiosk`
2. Scanner un QR code test
3. Vérifier connexion
4. Réserver un panier
5. Vérifier code PIN
6. Vérifier QR code de retrait
7. Attendre 3 min → déconnexion auto
8. Tester déconnexion manuelle

### Scénarios à tester

- [ ] Connexion avec compte vérifié
- [ ] Connexion avec compte non vérifié (erreur attendue)
- [ ] Réservation 1er panier
- [ ] Réservation 2ème panier
- [ ] Tentative 3ème panier (blocage attendu)
- [ ] Affichage QR code
- [ ] Déconnexion auto après 3 min
- [ ] Déconnexion manuelle
- [ ] Reset du timer après interaction

---

## 🐛 Dépannage développeur

### Erreur : Scanner ne s'affiche pas

**Cause :** Permissions caméra non accordées

**Solution :**
```typescript
// Vérifier dans le navigateur
navigator.mediaDevices.getUserMedia({ video: true })
```

### Erreur : "Module not found @yudiel/react-qr-scanner"

**Cause :** Package non installé

**Solution :**
```bash
npm install @yudiel/react-qr-scanner
```

### Erreur : Import incorrect

**Correct :**
```typescript
import { Scanner } from '@yudiel/react-qr-scanner';
```

**Incorrect :**
```typescript
import { QrScanner } from '@yudiel/react-qr-scanner'; // ❌
```

### Le timer ne se reset pas

**Vérifier que `onActivity()` est appelé** sur tous les événements importants :
- Clic sur boutons
- Changement d'onglet
- Ouverture de modals

---

## 📝 TODO / Améliorations futures

- [ ] Support multilingue (FR/EN/AR)
- [ ] Assistance vocale pour malvoyants
- [ ] Mode contraste élevé
- [ ] Option impression ticket
- [ ] Statistiques en temps réel
- [ ] Clavier virtuel pour code PIN manuel
- [ ] Tutorial interactif première utilisation
- [ ] Feedback haptique (vibrations)

---

## 📚 Documentation complète

Voir [MODE_KIOSQUE.md](../../../docs/MODE_KIOSQUE.md) pour :
- Guide de déploiement complet
- Formation du personnel
- Configuration avancée
- Maintenance
- Support

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Mainteneur** : Équipe EcoPanier

