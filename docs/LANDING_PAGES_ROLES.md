# Pages Landing par Rôle - Documentation

## 📋 Vue d'ensemble

Trois pages landing ont été créées pour cibler différents publics de la plateforme ÉcoPanier :

1. **Landing générale** (`/`) - Pour les clients et bénéficiaires
2. **Landing commerçants** (`/commercants`) - Pour les commerçants et artisans
3. **Landing associations** (`/associations`) - Pour les associations solidaires

## 🎯 Objectifs

Chaque page landing a un objectif spécifique :

### Landing Générale (existante)
- **Public** : Grand public (clients, bénéficiaires)
- **Objectif** : Expliquer le concept anti-gaspillage et solidaire
- **CTA** : "Trouver mon premier panier"
- **Route** : `/`

### Landing Commerçants (nouvelle)
- **Public** : Commerçants, artisans, restaurateurs
- **Objectif** : Convaincre de valoriser leurs invendus
- **CTA** : "Commencer gratuitement"
- **Route** : `/commercants`

### Landing Associations (nouvelle)
- **Public** : Associations d'aide alimentaire
- **Objectif** : Présenter l'outil de gestion des bénéficiaires
- **CTA** : "Rejoindre la plateforme"
- **Route** : `/associations`

## 📁 Structure des fichiers

```
src/components/
├── landing/                          # Landing générale (existante)
│   ├── LandingPage.tsx
│   ├── StickyCTA.tsx
│   └── sections/
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       └── ...
│
├── merchant/
│   ├── landing/                      # Landing commerçants (nouvelle)
│   │   ├── MerchantLanding.tsx
│   │   ├── MerchantStickyCTA.tsx
│   │   ├── sections/
│   │   │   ├── MerchantHeroSection.tsx
│   │   │   ├── MerchantWhySection.tsx
│   │   │   ├── MerchantBenefitsSection.tsx
│   │   │   ├── MerchantHowItWorksSection.tsx
│   │   │   ├── MerchantFeaturesSection.tsx
│   │   │   ├── MerchantTestimonialsSection.tsx
│   │   │   ├── MerchantPricingSection.tsx
│   │   │   ├── MerchantFAQSection.tsx
│   │   │   ├── MerchantFinalCTASection.tsx
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── README.md
│   └── [autres composants merchant]
│
└── association/
    ├── landing/                      # Landing associations (nouvelle)
    │   ├── AssociationLanding.tsx
    │   ├── AssociationStickyCTA.tsx
    │   ├── sections/
    │   │   ├── AssociationHeroSection.tsx
    │   │   ├── AssociationWhySection.tsx
    │   │   ├── AssociationBenefitsSection.tsx
    │   │   ├── AssociationHowItWorksSection.tsx
    │   │   ├── AssociationFeaturesSection.tsx
    │   │   ├── AssociationTestimonialsSection.tsx
    │   │   ├── AssociationFAQSection.tsx
    │   │   ├── AssociationFinalCTASection.tsx
    │   │   └── index.ts
    │   ├── index.ts
    │   └── README.md
    └── [autres composants association]
```

## 🎨 Identité visuelle par rôle

### Couleurs principales

| Rôle | Couleur | Gradient Hero |
|------|---------|---------------|
| Général | Primary (Bleu) | `from-black to-black` avec image |
| Commerçants | Secondary (Violet) | `from-secondary-900 to-secondary-900` |
| Associations | Purple (Violet-pourpre) | `from-purple-900 to-purple-900` |

### Emojis identifiants

- 🛒 Clients
- 🏪 Commerçants
- 🏛️ Associations
- 🤝 Bénéficiaires
- 🚴 Collecteurs

## 🧩 Sections communes

Toutes les pages landing partagent une structure similaire :

1. **Hero Section** - Accroche principale avec CTA
2. **Why Section** - Pourquoi rejoindre (4 raisons)
3. **Benefits Section** - Avantages concrets (4 colonnes)
4. **How It Works** - 4 étapes illustrées
5. **Features Section** - Fonctionnalités (8 en grille)
6. **Testimonials** - 3 témoignages réels
7. **FAQ Section** - Questions fréquentes (accordéon)
8. **Final CTA** - Appel à l'action final avec stats

### Sections spécifiques

**Commerçants uniquement** :
- `MerchantPricingSection` - Tarification (gratuit + 15% commission)

## 🔗 Routing

Les routes ont été ajoutées dans `src/App.tsx` :

```tsx
<Route path="/" element={<LandingPage />} />
<Route path="/commercants" element={<MerchantLanding />} />
<Route path="/associations" element={<AssociationLanding />} />
```

### Redirections automatiques

Chaque page redirige automatiquement vers le dashboard si l'utilisateur est déjà connecté avec le bon rôle :

```tsx
useEffect(() => {
  if (initialized && user && profile?.role === 'merchant') {
    navigate('/dashboard');
  }
}, [initialized, user, profile, navigate]);
```

## 📱 Composants réutilisables

### StickyCTA

Chaque landing a son propre `StickyCTA` qui :
- Apparaît après 800px de scroll
- Affiche un CTA avec emoji et message adapté
- Redirige vers `/auth?role=[merchant|association]`
- Se cache automatiquement si l'utilisateur est déjà connecté

### AnimatePresence & Framer Motion

Toutes les sections utilisent Framer Motion pour :
- Animations d'apparition au scroll (`whileInView`)
- Effets hover sur les cartes
- Transitions fluides

## 🎯 Call-to-Actions

### Commerçants

Textes des CTA principaux :
- Hero : "Commencer gratuitement"
- Sticky : "Valorisez vos invendus dès aujourd'hui"
- Pricing : "Commencer gratuitement"
- Final : "Commencer gratuitement"

Destination : `/auth?role=merchant`

### Associations

Textes des CTA principaux :
- Hero : "Rejoindre la plateforme"
- Sticky : "Simplifiez la gestion de vos bénéficiaires"
- Final : "Rejoindre la plateforme"

Destination : `/auth?role=association`

## 📊 Statistiques affichées

### Landing Commerçants

**Hero** :
- 0€ - Coût d'inscription
- 2 min - Pour créer un lot
- 30% - Valorisation moyenne

**Final CTA** :
- 200+ Commerçants partenaires
- 10k+ Repas sauvés
- 15T CO₂ évité
- 4.8/5 Satisfaction

### Landing Associations

**Hero** :
- 100% - Gratuit
- 5 min - Inscription bénéficiaire
- 5000+ - Bénéficiaires aidés

**Final CTA** :
- 50+ Associations partenaires
- 5k+ Bénéficiaires aidés
- 100k+ Lots distribués
- 4.9/5 Satisfaction

## 🔧 Personnalisation

### Modifier les contenus

1. **Textes** : Directement dans les composants `.tsx`
2. **Stats** : Hardcodées dans les composants (à mettre à jour régulièrement)
3. **Images** : Références vers `/public/testimonial/`

### Ajouter une section

1. Créer le composant dans `sections/`
2. L'importer dans la page principale
3. L'ajouter dans l'ordre souhaité
4. Mettre à jour `sections/index.ts`

## 📈 SEO

Chaque page a ses propres meta tags via le composant `SEOHead` :

**Commerçants** :
- Title : "Commerçants - Valorisez vos invendus | ÉcoPanier"
- Keywords : commerçants anti-gaspillage, valorisation invendus, etc.
- URL : https://ecopanier.fr/commercants

**Associations** :
- Title : "Associations - Gestion de l'aide alimentaire | ÉcoPanier"
- Keywords : aide alimentaire, association solidaire, etc.
- URL : https://ecopanier.fr/associations

## 🚀 Intégration avec le reste du site

### Header & Footer

Toutes les pages utilisent les composants partagés :
- `<Header transparent />` - Header avec fond transparent
- `<Footer />` - Footer standard

### Navigation

Liens suggérés à ajouter dans la navigation principale :

```tsx
// Dans Header.tsx
<Link to="/commercants">Commerçants</Link>
<Link to="/associations">Associations</Link>
```

## 🎓 Bonnes pratiques

### TypeScript

✅ Tous les composants sont typés
✅ Aucun `any` n'est utilisé
✅ Props typées avec interfaces

### Responsive

✅ Mobile-first avec Tailwind
✅ Breakpoints : `sm`, `md`, `lg`
✅ Images adaptatives
✅ Grilles responsive

### Performance

✅ Lazy load des sections avec `whileInView`
✅ Animations optimisées (transform, opacity uniquement)
✅ Images optimisées
✅ Pas de re-renders inutiles

## 🧪 Tests manuels

### Checklist avant mise en production

- [ ] La page s'affiche correctement sur mobile
- [ ] La page s'affiche correctement sur desktop
- [ ] Le sticky CTA apparaît après scroll
- [ ] Les animations se déclenchent au scroll
- [ ] Les CTA redirigent vers `/auth?role=[role]`
- [ ] La redirection automatique fonctionne si déjà connecté
- [ ] Les images se chargent correctement
- [ ] La FAQ s'ouvre et se ferme correctement
- [ ] Les hover effects fonctionnent sur desktop
- [ ] Les meta tags SEO sont corrects

## 📝 Améliorations futures possibles

### Court terme
- [ ] Ajouter des vidéos témoignages
- [ ] Intégrer un calculateur de revenus pour commerçants
- [ ] Ajouter des études de cas détaillées
- [ ] Créer un slider d'images pour les fonctionnalités

### Moyen terme
- [ ] A/B testing des CTA
- [ ] Analytics par section (scroll tracking)
- [ ] Formulaire de pré-inscription
- [ ] Chat en direct pour questions

### Long terme
- [ ] Version multilingue
- [ ] Personnalisation selon la géolocalisation
- [ ] Intégration CRM pour leads
- [ ] Webinars d'onboarding intégrés

## 🐛 Dépannage

### Le sticky CTA ne s'affiche pas
→ Vérifier que `window.scrollY > 800` est atteint

### Les animations ne se déclenchent pas
→ Vérifier que `framer-motion` est installé
→ Vérifier que `viewport={{ once: true }}` est présent

### Erreur de routing
→ Vérifier que les routes sont bien ajoutées dans `App.tsx`
→ Vérifier l'import des composants

### Images manquantes
→ Vérifier que les images existent dans `/public/testimonial/`
→ Vérifier les chemins relatifs

## 📞 Support

Pour toute question sur ces pages landing :
- Consulter les README dans chaque dossier `landing/`
- Vérifier la documentation des composants individuels
- Contacter l'équipe de développement

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0  
**Auteur** : ÉcoPanier Dev Team

