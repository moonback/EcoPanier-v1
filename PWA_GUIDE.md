# 📱 Guide PWA - EcoPanier

Ce guide explique comment utiliser et tester les fonctionnalités Progressive Web App (PWA) d'EcoPanier.

## 🎯 Qu'est-ce qu'une PWA ?

Une Progressive Web App (PWA) est une application web qui offre une expérience similaire à une application native :

- ✅ **Installation** : Peut être installée sur l'écran d'accueil
- ✅ **Hors ligne** : Fonctionne même sans connexion internet
- ✅ **Rapide** : Chargement instantané grâce au cache
- ✅ **Notifications** : Peut envoyer des notifications push (futur)
- ✅ **Mise à jour** : Se met à jour automatiquement

## 📦 Fonctionnalités PWA implémentées

### 1. Installation sur appareil

L'application peut être installée comme une app native sur :
- 📱 **Android** : Chrome, Edge, Samsung Internet
- 🍎 **iOS** : Safari (à partir d'iOS 16.4)
- 💻 **Desktop** : Chrome, Edge, Opera

### 2. Mode hors ligne

- Cache intelligent des ressources statiques
- Cache des données API (24h pour Supabase)
- Page offline dédiée avec instructions
- Indicateur de connexion en temps réel

### 3. Cache stratégique

**Network First** (Supabase API) :
- Essaye d'abord le réseau
- Utilise le cache si hors ligne
- Cache valide 24h

**Cache First** (Images, polices) :
- Charge depuis le cache
- Met à jour en arrière-plan
- Cache valide 30 jours

### 4. Mises à jour automatiques

- Détection automatique des nouvelles versions
- Prompt utilisateur élégant
- Rechargement en un clic

## 🚀 Installation

### Pré-requis

```bash
npm install
```

### Générer les icônes

```bash
npm run generate-icons
```

Cela créera automatiquement toutes les icônes nécessaires dans `public/icons/`.

### Build de production

```bash
npm run build
```

Le service worker sera généré automatiquement dans `dist/`.

## 🧪 Test en développement

### 1. Lancer le serveur de dev

```bash
npm run pwa:dev
```

Le serveur sera accessible sur votre réseau local (ex: `http://192.168.1.x:5173`)

### 2. Tester sur mobile

1. Connectez votre appareil au même réseau WiFi
2. Ouvrez l'URL affichée dans le terminal
3. Sur Android/Chrome : Menu → "Installer l'application"
4. Sur iOS/Safari : Bouton partage → "Sur l'écran d'accueil"

### 3. Tester le mode offline

**Dans Chrome DevTools** :
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet "Application"
3. Section "Service Workers" → Cocher "Offline"

**Sur mobile** :
1. Activer le mode avion
2. Ouvrir l'application
3. Vérifier que les pages en cache sont accessibles

## 🔍 Vérification PWA

### Chrome DevTools - Lighthouse

1. Ouvrir DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionner "Progressive Web App"
4. Cliquer "Analyze page load"

**Score attendu : 90-100**

### Checklist PWA

✅ **Manifest** :
- [x] Fichier `manifest.json` présent
- [x] Icônes de toutes tailles (72px à 512px)
- [x] Nom, description, couleurs définis
- [x] `display: standalone`

✅ **Service Worker** :
- [x] Service worker enregistré
- [x] Cache des ressources statiques
- [x] Stratégies de cache configurées
- [x] Gestion des mises à jour

✅ **Meta tags** :
- [x] `theme-color`
- [x] `viewport`
- [x] Apple touch icons
- [x] Open Graph / Twitter cards

✅ **HTTPS** :
- [x] Fonctionne uniquement en HTTPS (production)
- [x] Localhost/127.0.0.1 autorisé en dev

✅ **UX** :
- [x] Prompt d'installation
- [x] Indicateur de connexion
- [x] Page offline
- [x] Prompt de mise à jour

## 📁 Structure des fichiers PWA

```
project-root/
├── public/
│   ├── icons/                    # Icônes PWA (72px à 512px)
│   ├── manifest.json             # Manifest PWA
│   ├── robots.txt                # SEO
│   └── browserconfig.xml         # Configuration Microsoft
├── src/
│   └── components/
│       └── shared/
│           ├── PWAInstallPrompt.tsx   # Prompt d'installation
│           ├── OnlineStatus.tsx        # Indicateur de connexion
│           └── OfflinePage.tsx         # Page hors ligne
├── scripts/
│   └── generate-icons.js         # Génération d'icônes
└── vite.config.ts                # Config Vite + PWA
```

## ⚙️ Configuration

### Vite Plugin PWA

Le plugin est configuré dans `vite.config.ts` :

```typescript
VitePWA({
  registerType: 'prompt',          // Demande avant mise à jour
  includeAssets: [...],            // Assets à pré-cacher
  manifest: { ... },               // Manifest PWA
  workbox: {
    globPatterns: [...],           # Fichiers à cacher
    runtimeCaching: [...]          # Stratégies de cache
  }
})
```

### Personnalisation du manifest

Éditez `public/manifest.json` :

```json
{
  "name": "Votre nom d'app",
  "short_name": "Nom court",
  "theme_color": "#couleur",
  "background_color": "#couleur",
  ...
}
```

### Modifier les stratégies de cache

Dans `vite.config.ts`, section `workbox.runtimeCaching` :

```typescript
{
  urlPattern: /votre-pattern/,
  handler: 'NetworkFirst',  // ou CacheFirst, StaleWhileRevalidate
  options: {
    cacheName: 'nom-du-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24  // 24h
    }
  }
}
```

## 🎨 Icônes

### Tailles requises

| Taille | Usage |
|--------|-------|
| 72x72 | iOS, Android |
| 96x96 | Shortcuts |
| 128x128 | Chrome Web Store |
| 144x144 | Windows Metro |
| 152x152 | iOS |
| 192x192 | Android (standard) |
| 384x384 | Android |
| 512x512 | Android splash screen |

### Recommandations design

- **Format** : PNG avec transparence
- **Contenu** : Logo centré avec padding 10-20%
- **Fond** : Transparent ou couleur unie
- **Maskable** : Zone de sécurité 80% (cercle central)
- **Simplicité** : Reconnaissable à petite taille

### Génération automatique

```bash
npm run generate-icons
```

Ou en ligne : [RealFaviconGenerator](https://realfavicongenerator.net/)

## 📊 Métriques et monitoring

### Chrome DevTools

**Application** :
- Service Workers : État, cache
- Storage : Cache Storage, IndexedDB
- Manifest : Validation

**Network** :
- Filter "Service Worker" : Voir les requêtes cachées
- Offline mode : Tester hors ligne

**Lighthouse** :
- Score PWA
- Recommandations d'optimisation

### Console logs

Le service worker log automatiquement :
- ✅ Enregistrement réussi
- 🔄 Mise à jour disponible
- ❌ Erreurs d'enregistrement

## 🚨 Dépannage

### L'application ne se met pas à jour

1. Désenregistrer le service worker :
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```
2. Vider le cache : DevTools → Application → Clear storage
3. Recharger la page (Ctrl+Shift+R)

### Le prompt d'installation n'apparaît pas

**Vérifications** :
- HTTPS actif (ou localhost)
- Manifest valide
- Service worker enregistré
- Icônes présentes (au moins 192x192 et 512x512)
- Pas déjà installée
- Navigateur compatible

### Le mode offline ne fonctionne pas

1. Vérifier que le service worker est actif (DevTools → Application)
2. Vérifier le cache (DevTools → Application → Cache Storage)
3. S'assurer d'avoir visité les pages en mode online d'abord
4. Consulter les logs console pour les erreurs

### Erreur "Module not found: virtual:pwa-register"

```bash
npm install -D vite-plugin-pwa workbox-window
```

Puis redémarrer le serveur.

## 🔐 Sécurité

### HTTPS obligatoire

Les service workers nécessitent HTTPS, sauf :
- `localhost`
- `127.0.0.1`
- `::1`

En production, assurez-vous d'avoir un certificat SSL valide.

### Permissions

La PWA demande les permissions suivantes :
- **Notifications** : Pour les alertes (futur)
- **Géolocalisation** : Pour trouver les commerçants proches (futur)
- **Caméra** : Pour scanner les QR codes

## 📱 Spécificités par plateforme

### Android

- **Installation** : Prompt natif automatique
- **Splash screen** : Généré depuis icône 512x512
- **Barre d'adresse** : Cachée en mode standalone
- **Badge** : Supporté (futur)

### iOS

- **Installation** : Manuel via bouton partage
- **Splash screen** : Couleur de fond uniquement
- **Barre de statut** : Style configurable
- **Limitations** : Pas de notifications push (pour l'instant)

### Desktop

- **Installation** : Icône dans barre d'adresse
- **Fenêtre** : Fenêtre d'app dédiée
- **Raccourci** : Menu démarrer / Applications
- **Badge** : Supporté sur Windows/macOS

## 🔮 Fonctionnalités futures

- [ ] **Push notifications** : Alertes pour nouveaux lots, missions
- [ ] **Background sync** : Synchronisation des actions hors ligne
- [ ] **Share API** : Partager des lots avec amis
- [ ] **Badge API** : Compteur de notifications non lues
- [ ] **Shortcuts dynamiques** : Raccourcis contextuels
- [ ] **Install prompt personnalisé** : Modal custom design
- [ ] **App Store** : Soumission Chrome Web Store / Microsoft Store

## 📚 Ressources

- [Documentation PWA - web.dev](https://web.dev/progressive-web-apps/)
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [Can I Use - Service Worker](https://caniuse.com/serviceworkers)

## 🤝 Support

Pour toute question ou problème :

1. Consulter ce guide
2. Vérifier les logs console et service worker
3. Tester avec Lighthouse
4. Consulter la documentation Vite PWA

---

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2024  
**Maintenu par** : Équipe EcoPanier

