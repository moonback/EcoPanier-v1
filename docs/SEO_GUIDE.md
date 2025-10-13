# Guide SEO EcoPanier

## 🎯 Vue d'ensemble

Ce guide documente l'implémentation SEO complète d'EcoPanier, optimisée pour le référencement naturel et les performances.

## 📋 Éléments SEO implémentés

### 1. Métadonnées HTML (index.html)

#### Meta tags de base
- ✅ Titre optimisé avec mots-clés principaux
- ✅ Description meta (160 caractères max)
- ✅ Mots-clés ciblés
- ✅ Langue et géolocalisation (France)
- ✅ Robots directives

#### Open Graph (Facebook/LinkedIn)
- ✅ og:title, og:description, og:image
- ✅ og:url, og:type, og:site_name
- ✅ og:locale (fr_FR)
- ✅ Dimensions d'image optimisées (1200x630)

#### Twitter Cards
- ✅ twitter:card (summary_large_image)
- ✅ twitter:title, twitter:description
- ✅ twitter:image avec alt text

#### Performance
- ✅ Preconnect pour Google Fonts et Supabase
- ✅ DNS prefetch pour optimiser les requêtes
- ✅ Theme color pour mobile (#22c55e)

### 2. Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "EcoPanier",
  "description": "Plateforme solidaire anti-gaspillage alimentaire...",
  "applicationCategory": "FoodApplication",
  "provider": {
    "@type": "Organization",
    "name": "EcoPanier"
  }
}
```

### 3. Fichiers de configuration

#### manifest.json (PWA)
- ✅ Nom, description, icônes
- ✅ Theme color et background color
- ✅ Shortcuts pour navigation rapide
- ✅ Screenshots pour app stores

#### robots.txt
- ✅ Autorisation d'indexation pour pages publiques
- ✅ Blocage des pages privées (/dashboard, /api/)
- ✅ Sitemap référencement
- ✅ Crawl-delay optimisé

#### sitemap.xml
- ✅ Pages principales indexées
- ✅ Priorités et fréquences de mise à jour
- ✅ Dates de dernière modification

### 4. Composant SEOHead dynamique

Le composant `SEOHead` permet de personnaliser les métadonnées par page :

```tsx
<SEOHead
  title="Titre spécifique à la page"
  description="Description optimisée"
  keywords="mots-clés, pertinents, page"
  url="https://ecopanier.fr/page"
  type="website"
/>
```

**Pages avec SEO optimisé :**
- ✅ Page d'accueil (LandingPage)
- ✅ Comment ça marche (HowItWorks)
- ✅ Centre d'aide (HelpCenter)

### 5. Optimisations serveur

#### .htaccess (Apache)
- ✅ Compression GZIP
- ✅ Headers de cache optimisés
- ✅ Headers de sécurité
- ✅ Redirections HTTPS
- ✅ SPA routing

#### vercel.json (Vercel)
- ✅ Headers de sécurité
- ✅ Cache control pour assets
- ✅ Redirections www
- ✅ SPA rewrites

## 🎨 Couleur de thème SEO

La couleur de thème `#22c55e` (vert EcoPanier) est utilisée dans :
- Meta theme-color
- Manifest.json
- CSS personnalisé

## 📊 Mots-clés ciblés

### Mots-clés principaux
- anti-gaspillage alimentaire
- plateforme solidaire
- panier suspendu
- invendus alimentaires
- écologie alimentaire

### Mots-clés longue traîne
- "comment lutter contre le gaspillage alimentaire"
- "plateforme anti-gaspillage France"
- "acheter invendus prix réduit"
- "panier suspendu solidarité"

### Mots-clés locaux
- "anti-gaspillage [ville]"
- "commerces locaux [ville]"
- "solidarité alimentaire [ville]"

## 🚀 Optimisations Core Web Vitals

### Performance
- ✅ Preconnect pour ressources externes
- ✅ Cache headers optimisés
- ✅ Compression GZIP
- ✅ Images optimisées

### Accessibilité
- ✅ Langue HTML définie (fr)
- ✅ Alt text pour images
- ✅ Structure sémantique
- ✅ Focus visible

### Mobile
- ✅ Viewport responsive
- ✅ Touch-friendly
- ✅ PWA ready
- ✅ Theme color

## 📈 Monitoring SEO

### Outils recommandés
1. **Google Search Console** - Suivi des performances
2. **Google Analytics** - Trafic et comportement
3. **PageSpeed Insights** - Core Web Vitals
4. **Lighthouse** - Audit complet
5. **Screaming Frog** - Audit technique

### Métriques à surveiller
- Position des mots-clés ciblés
- Core Web Vitals (LCP, FID, CLS)
- Taux de rebond
- Pages vues par session
- Temps de chargement

## 🔧 Maintenance SEO

### Actions régulières
1. **Mise à jour du sitemap** (mensuel)
2. **Vérification des liens morts** (bimensuel)
3. **Audit des performances** (trimestriel)
4. **Analyse des mots-clés** (trimestriel)
5. **Optimisation du contenu** (continu)

### Nouvelles pages
Pour chaque nouvelle page, ajouter :
```tsx
import { SEOHead } from '../shared/SEOHead';

// Dans le composant
<SEOHead
  title="Titre optimisé - EcoPanier"
  description="Description unique 150-160 caractères"
  keywords="mots-clés, pertinents"
  url="https://ecopanier.fr/nouvelle-page"
/>
```

## 📝 Checklist SEO

### Avant publication
- [ ] Titre unique et optimisé (50-60 caractères)
- [ ] Description unique (150-160 caractères)
- [ ] Mots-clés pertinents
- [ ] URL canonique définie
- [ ] Images avec alt text
- [ ] Structure H1, H2, H3 cohérente
- [ ] Liens internes pertinents
- [ ] Temps de chargement < 3s

### Après publication
- [ ] Soumission sitemap Google Search Console
- [ ] Test des métadonnées (Open Graph, Twitter)
- [ ] Vérification mobile-friendly
- [ ] Audit Lighthouse
- [ ] Suivi des positions mots-clés

## 🌍 Internationalisation

Pour une expansion future :
- Utiliser `hreflang` pour versions multilingues
- Adapter les mots-clés par région
- Créer des sitemaps par langue
- Optimiser pour les moteurs locaux

## 📞 Support

Pour questions SEO :
- Documentation : ce fichier
- Outils : Google Search Console
- Tests : Lighthouse, PageSpeed Insights
- Monitoring : Google Analytics

---

**Dernière mise à jour :** Janvier 2025  
**Version :** 1.0.0
