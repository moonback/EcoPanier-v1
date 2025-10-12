# Icônes PWA EcoPanier

Ce dossier contient les icônes nécessaires pour la Progressive Web App (PWA).

## Tailles requises

Les icônes suivantes sont nécessaires :

- `icon-72x72.png` - iOS, Android
- `icon-96x96.png` - iOS, Android
- `icon-128x128.png` - Chrome Web Store
- `icon-144x144.png` - Windows Metro
- `icon-152x152.png` - iOS
- `icon-192x192.png` - Android (recommandé)
- `icon-384x384.png` - Android
- `icon-512x512.png` - Android (splash screen)

## Génération automatique

Pour générer automatiquement toutes les icônes à partir du logo :

```bash
npm install -D sharp
node scripts/generate-icons.js
```

## Génération manuelle

Si vous préférez générer les icônes manuellement :

1. Utilisez un outil en ligne comme [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Téléchargez le fichier `/public/logo.png`
3. Générez toutes les tailles requises
4. Placez les fichiers générés dans ce dossier

## Recommandations

- Format : PNG avec transparence
- Contenu : Logo centré avec padding de 10-20%
- Fond : Transparent ou blanc
- Design : Simple et reconnaissable à petite taille
- Maskable : Le logo doit être dans la zone de sécurité (80% central)

