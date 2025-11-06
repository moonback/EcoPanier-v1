# Page Landing Commerçants

## 📋 Description

Page landing dédiée aux commerçants pour présenter la plateforme ÉcoPanier et les encourager à rejoindre le mouvement anti-gaspillage.

## 🎯 Objectif

Convaincre les commerçants de s'inscrire sur la plateforme en mettant en avant :
- Les bénéfices économiques (récupération jusqu'à 30% du prix initial)
- L'impact environnemental (réduction du gaspillage)
- La solidarité sociale (programme d'aide alimentaire)
- La simplicité d'utilisation

## 📁 Structure

```
landing/
├── MerchantLanding.tsx          # Page principale
├── MerchantStickyCTA.tsx        # CTA flottant sticky
├── sections/
│   ├── MerchantHeroSection.tsx          # Hero avec IA et stats mises à jour
│   ├── MerchantWhySection.tsx           # Pourquoi rejoindre (4 raisons)
│   ├── MerchantBenefitsSection.tsx      # Avantages concrets (4 colonnes)
│   ├── MerchantHowItWorksSection.tsx    # 4 étapes 
│   ├── MerchantFeaturesSection.tsx      # Fonctionnalités principales (8 features)
│   ├── MerchantAdvancedFeaturesSection.tsx # Fonctionnalités avancées (6 features)
│   ├── MerchantTestimonialsSection.tsx  # Témoignages commerçants
│   ├── MerchantPricingSection.tsx       # Tarification (gratuit + 15%)
│   ├── MerchantFAQSection.tsx           # FAQ dédiée commerçants
│   ├── MerchantFinalCTASection.tsx      # CTA final avec stats
│   └── index.ts                         # Exports
└── index.ts                             # Export principal
```

## 🎨 Design

- **Couleur principale** : Secondary (violet) pour différencier du landing général
- **Gradient** : `from-secondary-900 via-secondary-800 to-secondary-900`
- **Animations** : Framer Motion pour tous les éléments
- **Responsive** : Mobile-first avec breakpoints Tailwind

## 📍 Routes

- URL : `/commercants`
- SEO optimisé avec meta tags dédiés
- Redirection automatique si déjà connecté en tant que commerçant

## 🔗 CTAs

Tous les CTA redirigent vers : `/auth?role=merchant`

## 📊 Sections clés

### 1. Hero Section
- Accroche forte : "Transformez vos invendus en revenus et en impact"
- Stats rapides : 0€ inscription, 2 min pour créer un lot, 30% valorisation
- 2 CTA : "Commencer gratuitement" + "Découvrir les avantages"

### 2. Why Section
- 4 raisons avec icônes et stats
- Triple impact : économique, écologique, social

### 3. Benefits Section
- 4 catégories : Gestion, Frais, Visibilité, Support
- Liste à puces avec checkmarks verts

### 4. How It Works
- 4 étapes illustrées avec icônes grandes
- Alternance gauche/droite des visuels
- Détails sous chaque étape

### 5. Features
- 8 fonctionnalités en grille 4 colonnes
- Hover effects avec gradients

### 6. Testimonials
- 3 témoignages réels de commerçants
- Stats intégrées (revenus, réduction gaspillage)

### 7. Pricing
- Badge "Offre de lancement"
- Commission 15% mise en avant
- Exemple concret de calcul
- Liste complète des fonctionnalités incluses

### 8. FAQ
- 8 questions fréquentes
- Accordéon interactif
- CTA "Contactez-nous" en fin

### 9. Final CTA
- Gradient violet avec pattern
- 3 bénéfices rapides
- Stats globales : 200+ commerçants, 10k+ repas, etc.

## 💡 Points clés

- **Valorisation économique** : Mise en avant du revenu récupéré
- **Simplicité** : Insister sur la rapidité (2 min pour créer un lot)
- **Gratuité** : Aucun frais d'inscription ni abonnement
- **Impact** : Triple bénéfice (économique, écologique, social)
- **Transparence** : Commission claire et exemple de calcul

## 🔄 Maintenance

Pour modifier le contenu :
1. Les textes sont directement dans les composants
2. Les stats sont hardcodées (à mettre à jour régulièrement)
3. Les témoignages utilisent les images du dossier `/public/testimonial/`

## 🎯 Conversion

Éléments optimisés pour la conversion :
- Sticky CTA apparaît après 800px de scroll
- CTA principal répété 3 fois (hero, pricing, final)
- Social proof : témoignages + stats
- Transparence : pricing visible, FAQ exhaustive
- Urgence : "Offre de lancement", "Gratuit à vie"

