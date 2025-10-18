# 📱 Mode Kiosque EcoPanier - Documentation Complète

## 📋 Vue d'ensemble

Le **Mode Kiosque** est une interface dédiée aux foyers d'accueil et centres sociaux pour permettre aux bénéficiaires **sans téléphone** (particulièrement les personnes SDF) d'accéder aux paniers solidaires via une tablette sécurisée.

### 🎯 Objectif

Offrir un accès inclusif et accessible aux paniers solidaires gratuits pour les personnes en situation de précarité qui n'ont pas de smartphone personnel.

---

## 🚀 Fonctionnalités principales

### 1. **Connexion par QR Code**
- Scanner la carte bénéficiaire via la caméra de la tablette
- Authentification automatique sans mot de passe
- Vérification du statut du compte (vérifié/non vérifié)

### 2. **Interface Simplifiée**
- Gros boutons et textes lisibles (accessibilité)
- Navigation intuitive à 2 onglets :
  - 📦 Paniers Disponibles
  - 🎁 Mes Réservations
- Design épuré et concentré sur l'essentiel

### 3. **Sécurité et Limitations**
- **Mode plein écran automatique** (empêche la sortie accidentelle)
- **Déconnexion automatique après 3 minutes d'inactivité**
- Timer visible en permanence
- Bouton de déconnexion manuel accessible
- Respect de la limite de 2 paniers par jour

### 4. **Réservation Simplifiée**
- Sélection directe du panier (1 clic)
- Confirmation simple
- Affichage immédiat du code PIN en très gros caractères
- Possibilité de revoir le code PIN et le QR code

### 5. **Affichage QR Code et PIN**
- QR code de retrait agrandi (300x300px)
- Code PIN en très gros caractères (7xl)
- Informations de retrait claires

---

## 🏗️ Architecture Technique

### Structure des fichiers

```
src/components/kiosk/
├── KioskMode.tsx           # Container principal + timer + plein écran
├── KioskLogin.tsx          # Écran de connexion par QR code
├── KioskDashboard.tsx      # Dashboard avec navigation et stats
├── KioskLotsList.tsx       # Liste des paniers avec réservation
└── KioskReservations.tsx   # Liste des réservations avec QR codes
```

### Technologies utilisées

- **React 18.3.1** + **TypeScript 5.5.3**
- **@yudiel/react-qr-scanner** : Scanner QR code
- **qrcode.react** : Génération QR code
- **Supabase** : Base de données et auth
- **Tailwind CSS** : Styling avec classes XL/2XL/3XL pour accessibilité

---

## 🔧 Installation et Configuration

### 1. Prérequis

Les dépendances sont déjà installées dans le projet :

```json
{
  "@yudiel/react-qr-scanner": "^2.0.8",
  "qrcode.react": "^4.1.0"
}
```

### 2. Accès à la route

Le mode kiosque est accessible via :

```
https://votre-domaine.com/kiosk
```

### 3. Configuration de la tablette

#### Hardware recommandé
- Tablette Android/iPad (10 pouces minimum)
- Caméra frontale ou arrière fonctionnelle
- Connexion Internet stable (Wi-Fi)

#### Configuration logicielle

**Android :**
1. Installer un navigateur moderne (Chrome, Firefox)
2. Configurer le mode kiosque natif :
   - Paramètres → Utilisateurs → Ajouter un utilisateur restreint
   - Autoriser uniquement le navigateur
   - Épingler l'onglet `/kiosk`

3. Activer le mode plein écran :
   - Le site le fait automatiquement
   - Alternativement : utiliser une app de kiosque comme **Fully Kiosk Browser**

**iOS/iPad :**
1. Activer le mode **Accès guidé** :
   - Réglages → Accessibilité → Accès guidé
   - Activer + définir un code
2. Dans Safari, ouvrir `/kiosk`
3. Triple-clic bouton latéral → Démarrer l'accès guidé

#### Permissions nécessaires
- ✅ Accès à la caméra (obligatoire pour scanner QR)
- ✅ Plein écran
- ❌ Pas besoin de localisation, notifications, etc.

---

## 👤 Flux utilisateur complet

### Étape 1 : Arrivée au foyer

```
Bénéficiaire arrive au foyer
    ↓
Personnel du foyer oriente vers la tablette
    ↓
Écran de connexion "Scannez votre carte"
```

### Étape 2 : Connexion

```
Clic sur "Scanner ma carte"
    ↓
Caméra s'active
    ↓
Bénéficiaire présente sa carte avec QR code
    ↓
Scan automatique + connexion
```

### Étape 3 : Tableau de bord

```
Affichage dashboard avec :
- Nom du bénéficiaire
- ID bénéficiaire
- Compteur quotidien (X/2)
- 2 onglets : Paniers / Réservations
```

### Étape 4 : Réserver un panier

```
Parcourir les paniers disponibles
    ↓
Clic sur un panier
    ↓
Modal de confirmation
    ↓
Confirmer
    ↓
Modal de succès avec CODE PIN en GROS
    ↓
Noter le code PIN
```

### Étape 5 : Voir ses réservations

```
Onglet "Mes Réservations"
    ↓
Clic sur "Voir le QR Code"
    ↓
Modal avec :
  - QR Code agrandi
  - Code PIN en très gros
  - Infos de retrait
```

### Étape 6 : Déconnexion

**Automatique :**
- Après 3 minutes d'inactivité
- Retour automatique à l'écran de connexion

**Manuelle :**
- Clic sur bouton "Déconnexion" en haut à droite

---

## ⚙️ Paramètres et Personnalisation

### Timer de déconnexion

Modifiable dans `KioskMode.tsx` :

```typescript
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes (en millisecondes)
```

**Valeurs recommandées :**
- 2 minutes : Forte affluence
- 3 minutes : Normal (défaut)
- 5 minutes : Faible affluence

### Limite quotidienne

Respecte la valeur définie dans les paramètres de la plateforme (table `platform_settings`).

Par défaut : **2 paniers par jour** (`maxDailyBeneficiaryReservations`)

### Taille des textes

Actuellement configuré pour accessibilité maximale :
- Titres : `text-3xl` à `text-5xl`
- Textes : `text-lg` à `text-2xl`
- Code PIN : `text-7xl` (très gros)
- QR Code : `300x300px`

---

## 🔒 Sécurité

### Fonctionnalités de sécurité

1. **Isolation de session**
   - Chaque connexion est isolée
   - Pas d'accès aux autres comptes
   - Déconnexion automatique

2. **Pas de stockage local**
   - Aucune donnée persistante sur la tablette
   - Pas de cookies utilisateur
   - Pas de cache sensible

3. **Mode kiosque OS**
   - Empêche l'accès aux autres applications
   - Empêche la sortie du navigateur
   - Désactive le clic droit (dans le code)

4. **Vérification des comptes**
   - Seuls les bénéficiaires vérifiés peuvent se connecter
   - Rôle strict : `beneficiary` uniquement

5. **Protection contre les abus**
   - Limite de 2 réservations/jour respectée
   - Timer de déconnexion empêche monopolisation

### Recommandations de sécurité

✅ **À FAIRE :**
- Placer la tablette dans un lieu surveillé
- Former le personnel du foyer à l'utilisation
- Vérifier régulièrement le bon fonctionnement
- Nettoyer l'écran régulièrement (hygiène)

❌ **À ÉVITER :**
- Laisser la tablette sans surveillance complète
- Donner le code PIN du mode kiosque OS aux bénéficiaires
- Utiliser un compte admin sur la tablette

---

## 🎨 Personnalisation visuelle

### Couleurs du thème

Le mode kiosque utilise les couleurs principales :
- **Accent (Rose)** : Actions principales, gradients
- **Success (Vert)** : Confirmations
- **Warning (Orange)** : Alertes (timer < 1 min)
- **Gray** : Neutre, arrière-plans

### Adapter les textes

Tous les textes sont modifiables dans les composants :

**Exemples :**
```tsx
// KioskLogin.tsx - Titre d'accueil
<h1 className="text-5xl font-bold text-gray-900 mb-4">
  Bienvenue au Kiosque EcoPanier
</h1>

// KioskDashboard.tsx - Message d'accueil
<h2 className="text-3xl font-bold text-gray-900 mb-1">
  Bonjour {profile.full_name?.split(' ')[0] || 'Bénéficiaire'} ! 👋
</h2>
```

---

## 📊 Statistiques et Suivi

### Données collectées (via Supabase)

Le mode kiosque enregistre automatiquement :
- Nombre de connexions par jour
- Réservations effectuées
- Lots consultés
- Limite quotidienne respectée

### Rapports disponibles

Via le dashboard admin (`/dashboard` en tant qu'admin) :

1. **Activité des bénéficiaires**
   - Nombre de connexions kiosque vs mobile
   - Taux d'utilisation du kiosque

2. **Performance des foyers**
   - Quels foyers utilisent le plus le kiosque
   - Pics d'utilisation (heures/jours)

3. **Réservations**
   - Paniers réservés via kiosque
   - Taux de récupération

---

## 🐛 Dépannage

### Problème : La caméra ne s'active pas

**Causes possibles :**
- Permission caméra non accordée
- Navigateur non compatible
- Caméra utilisée par une autre application

**Solutions :**
1. Vérifier les permissions du navigateur :
   - Chrome : Paramètres → Confidentialité → Paramètres du site → Caméra
   - Safari : Réglages → Safari → Caméra
2. Redémarrer le navigateur
3. Redémarrer la tablette
4. Tester avec un autre navigateur

### Problème : Le scan ne fonctionne pas

**Causes possibles :**
- QR code endommagé ou illisible
- Mauvais éclairage
- Caméra de mauvaise qualité

**Solutions :**
1. Améliorer l'éclairage de la zone de scan
2. Rapprocher/éloigner la carte
3. Nettoyer la caméra
4. Réimprimer la carte du bénéficiaire

### Problème : Déconnexion trop rapide

**Solution :**
Augmenter le timer dans `KioskMode.tsx` :

```typescript
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes au lieu de 3
```

### Problème : Impossible de sortir du mode plein écran

**Solutions :**
- **PC/Mac** : Touche `F11` ou `Échap`
- **Android** : Geste de navigation système
- **iPad** : Triple-clic bouton latéral (si Accès guidé activé)

### Problème : "Compte non vérifié"

**Cause :** Le compte du bénéficiaire n'a pas été validé par un admin.

**Solution :**
1. Se connecter au dashboard admin
2. Aller dans "Gestion des utilisateurs"
3. Trouver le bénéficiaire
4. Activer le statut "Vérifié"

---

## 📝 Guide de formation du personnel

### Formation initiale (15 min)

**Objectifs :**
- Comprendre le fonctionnement du kiosque
- Savoir guider un bénéficiaire
- Gérer les problèmes courants

**Programme :**

1. **Présentation** (3 min)
   - Qu'est-ce que le mode kiosque ?
   - Pourquoi c'est important ?

2. **Démonstration** (5 min)
   - Connexion avec un compte test
   - Parcourir les paniers
   - Faire une réservation
   - Voir le code PIN
   - Se déconnecter

3. **Cas pratiques** (5 min)
   - Aider un bénéficiaire à scanner sa carte
   - Expliquer comment noter le code PIN
   - Gérer une erreur de scan

4. **Questions/Réponses** (2 min)

### Checklist quotidienne

À faire chaque matin :

- [ ] Vérifier que la tablette est chargée
- [ ] Tester la connexion Internet
- [ ] Ouvrir le mode kiosque (`/kiosk`)
- [ ] Faire un test de scan avec une carte
- [ ] Nettoyer l'écran et la caméra
- [ ] Vérifier la position de la tablette (accessible, visible)

### Script d'accueil pour les bénéficiaires

```
Bonjour ! Bienvenue au kiosque EcoPanier.

Vous allez pouvoir réserver gratuitement des paniers alimentaires.

C'est très simple :
1. Cliquez sur "Scanner ma carte"
2. Présentez votre carte bénéficiaire devant la caméra
3. Choisissez vos paniers (maximum 2 par jour)
4. Notez bien le code PIN qui s'affiche
5. Allez chercher vos paniers chez le commerçant avec ce code

Je reste à côté si vous avez besoin d'aide !
```

---

## 🔄 Mises à jour et Maintenance

### Vérifier les mises à jour

Le mode kiosque est mis à jour automatiquement avec le reste de l'application EcoPanier.

**Pour forcer une mise à jour :**
1. Fermer complètement le navigateur
2. Vider le cache :
   - Chrome : Ctrl+Maj+Suppr
   - Safari : Réglages → Safari → Effacer historique
3. Rouvrir `/kiosk`

### Maintenance préventive

**Hebdomadaire :**
- Vérifier les logs d'erreurs (dashboard admin)
- Nettoyer physiquement la tablette
- Tester le scan QR code

**Mensuelle :**
- Vérifier les mises à jour du navigateur
- Tester tous les scénarios (réservation, QR, déconnexion)
- Former le nouveau personnel si besoin

---

## 📞 Support

### En cas de problème technique

1. **Vérifier cette documentation** (section Dépannage)
2. **Contacter l'équipe technique EcoPanier**
   - Email : support@ecopanier.fr
   - Tél : [À définir]
3. **Créer un ticket** sur le système de support

### Informations à fournir

Lors d'un signalement de bug :
- Type de tablette (modèle, OS, version)
- Navigateur utilisé (nom, version)
- Description précise du problème
- Étapes pour reproduire
- Captures d'écran si possible

---

## 🚦 Checklist de déploiement

Avant de mettre le kiosque en production dans un foyer :

### Technique
- [ ] Tablette configurée en mode kiosque OS
- [ ] Connexion Internet stable testée
- [ ] Caméra fonctionnelle
- [ ] Permission caméra accordée au navigateur
- [ ] URL `/kiosk` en favori/page d'accueil
- [ ] Mode plein écran activé
- [ ] Test de scan QR réussi

### Organisationnel
- [ ] Personnel formé (au moins 2 personnes)
- [ ] Cartes bénéficiaires imprimées et distribuées
- [ ] Emplacement défini (visible, accessible, surveillé)
- [ ] Support visuel affiché (affiche explicative)
- [ ] Contact technique noté

### Documentation
- [ ] Guide utilisateur imprimé disponible
- [ ] Script d'accueil affiché
- [ ] Numéros de support accessibles

---

## 🎓 Bonnes pratiques

### Pour le personnel

✅ **À FAIRE :**
- Rester bienveillant et patient
- Guider sans faire à la place (autonomisation)
- Encourager les bénéficiaires
- Signaler les bugs rapidement
- Garder la tablette propre

❌ **À ÉVITER :**
- Juger ou stigmatiser
- Précipiter les utilisateurs
- Laisser des sessions ouvertes
- Modifier les paramètres sans autorisation

### Pour les bénéficiaires

**Messages à transmettre :**
- "Prenez votre temps, il n'y a pas de limite"
- "N'hésitez pas à demander de l'aide"
- "Votre code PIN est confidentiel, ne le partagez pas"
- "Vous pouvez revenir consulter vos réservations à tout moment"

---

## 📈 Évolutions futures

### Fonctionnalités en cours de développement

- 🌍 **Multilingue** : Support FR/EN/AR pour accessibilité
- 🎤 **Assistance vocale** : Instructions audio pour malvoyants
- ♿ **Accessibilité renforcée** : Contraste élevé, texte ajustable
- 📊 **Statistiques temps réel** : Dashboard dédié pour le personnel
- 🖨️ **Impression ticket** : Option d'imprimer le code PIN

### Suggestions bienvenues

Vous avez des idées d'amélioration ? Contactez l'équipe EcoPanier !

---

## 📄 Annexes

### Exemple de QR Code bénéficiaire

Le QR code sur la carte bénéficiaire contient simplement :
```
{userId}
```

Format : UUID v4 (ex: `a1b2c3d4-e5f6-7890-1234-567890abcdef`)

### Exemple de QR Code de retrait

Le QR code généré pour le retrait contient :
```json
{
  "reservationId": "uuid-v4",
  "pin": "123456",
  "userId": "uuid-v4"
}
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe EcoPanier  
**Licence** : Usage interne uniquement

---

## 🙏 Remerciements

Le mode kiosque a été conçu avec la contribution de :
- Foyers d'accueil partenaires
- Associations d'aide aux SDF
- Bénéficiaires testeurs
- Équipe technique EcoPanier

**Ensemble, rendons l'aide alimentaire accessible à tous ! 💚**

