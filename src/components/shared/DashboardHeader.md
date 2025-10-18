# DashboardHeader - Composant Réutilisable

## 📋 Description

`DashboardHeader` est un composant header réutilisable pour tous les dashboards de l'application EcoPanier. Il gère l'affichage du logo, titre, sous-titre, actions personnalisées et le bouton de déconnexion.

## 🎯 Cas d'utilisation

- **CustomerDashboard** : Header simple avec logo EcoPanier
- **MerchantDashboard** : Header avec logo du commerce + bouton "Station Retrait"
- **BeneficiaryDashboard** : Header avec message personnalisé pour bénéficiaires
- **CollectorDashboard** : Header avec actions spécifiques aux collecteurs
- **AdminDashboard** : N'utilise pas ce header (structure différente avec sidebar)

## 🔧 Props

```typescript
interface DashboardHeaderProps {
  /** Titre principal (ex: nom de l'utilisateur, commerce) */
  title?: string;
  
  /** Sous-titre ou message de bienvenue */
  subtitle?: string;
  
  /** URL ou élément JSX pour le logo */
  logo?: string | ReactNode;
  
  /** Alt text pour le logo si c'est une image */
  logoAlt?: string;
  
  /** Emoji ou icône par défaut si pas de logo */
  defaultIcon?: string;
  
  /** Boutons d'action additionnels à afficher */
  actions?: ActionButton[];
  
  /** Afficher le bouton de déconnexion (par défaut: true) */
  showLogout?: boolean;
  
  /** Classes CSS additionnelles */
  className?: string;
}

interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  mobileLabel?: string;
}
```

## 📖 Exemples d'utilisation

### 1. CustomerDashboard (Simple)

```tsx
import { DashboardHeader } from '../shared/DashboardHeader';
import EcoPanierLogo from '/public/logo.png';

<DashboardHeader
  logo={<img src={EcoPanierLogo} alt="EcoPanier Logo" className="h-10 w-auto" />}
  title={`Bonjour ${profile?.full_name || 'Client'} !`}
  subtitle="Prêt à sauver des paniers aujourd'hui ?"
  defaultIcon="🛒"
/>
```

### 2. MerchantDashboard (Avec actions personnalisées)

```tsx
import { DashboardHeader } from '../shared/DashboardHeader';
import { Scan } from 'lucide-react';

<DashboardHeader
  logo={
    profile?.business_logo_url ? (
      <img
        src={profile.business_logo_url}
        alt={profile.business_name || 'Logo du commerce'}
        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-md"
      />
    ) : undefined
  }
  title={profile?.business_name || profile?.full_name || 'Commerçant'}
  subtitle="Valorisez vos invendus, réduisez le gaspillage ! 💚"
  defaultIcon="🏪"
  actions={[
    {
      label: 'Station Retrait',
      icon: Scan,
      onClick: () => window.open('/pickup', '_blank'),
      variant: 'secondary',
      mobileLabel: 'Station',
    },
  ]}
/>
```

### 3. BeneficiaryDashboard

```tsx
<DashboardHeader
  title={`Bonjour ${profile?.full_name} !`}
  subtitle={`ID: ${profile?.beneficiary_id || 'Non défini'}`}
  defaultIcon="🤝"
/>
```

### 4. CollectorDashboard (Multiples actions)

```tsx
import { Map, Truck } from 'lucide-react';

<DashboardHeader
  title={`${profile?.full_name || 'Collecteur'}`}
  subtitle="Vos missions solidaires vous attendent ! 🚴‍♂️"
  defaultIcon="🚚"
  actions={[
    {
      label: 'Carte des missions',
      icon: Map,
      onClick: () => setActiveTab('map'),
      variant: 'primary',
      mobileLabel: 'Carte',
    },
    {
      label: 'Mes missions',
      icon: Truck,
      onClick: () => setActiveTab('missions'),
      variant: 'secondary',
      mobileLabel: 'Missions',
    },
  ]}
/>
```

### 5. Avec logo en URL simple

```tsx
<DashboardHeader
  logo="/path/to/logo.png"
  logoAlt="Logo de mon commerce"
  title="Mon Commerce"
  subtitle="Tableau de bord"
/>
```

### 6. Sans bouton de déconnexion

```tsx
<DashboardHeader
  title="Titre de ma page"
  subtitle="Sous-titre"
  showLogout={false}
/>
```

## 🎨 Variantes de boutons d'action

### Primary (par défaut)
- Fond dégradé bleu (primary)
- Texte blanc
- Utiliser pour les actions principales

### Secondary
- Fond dégradé violet (secondary)
- Texte blanc
- Utiliser pour les actions secondaires importantes

### Danger
- Bordure rouge
- Texte rouge
- Fond transparent avec hover rouge clair
- Utiliser pour les actions destructives

## 📱 Responsive

Le composant est entièrement responsive :

- **Mobile** : 
  - Logo réduit à 12x12 (h-12 w-12)
  - Labels des boutons masqués (sauf sur sm:)
  - Titre et sous-titre tronqués si trop longs
  
- **Tablette/Desktop** :
  - Logo en taille normale
  - Tous les labels visibles
  - Espacement augmenté

## 🔄 Comportement par défaut

Si aucune prop n'est fournie :

- **Titre** : "Bonjour [Nom du profil] !" (depuis authStore)
- **Sous-titre** : "Bienvenue sur votre tableau de bord"
- **Logo** : Icône avec emoji defaultIcon (défaut: 👤)
- **Déconnexion** : Visible et fonctionnel

## ✅ Bonnes pratiques

1. **Toujours fournir un titre pertinent** pour chaque rôle
2. **Utiliser des emojis dans les sous-titres** pour rendre l'interface plus chaleureuse
3. **Limiter les actions à 2-3 maximum** pour éviter la surcharge
4. **Utiliser des labels courts** pour les actions (mobile-first)
5. **Fournir un mobileLabel** si le label principal est trop long

## 🚫 À éviter

- ❌ Trop d'actions (> 3) → Rend le header surchargé
- ❌ Labels trop longs → Problèmes de responsive
- ❌ Logo trop grand → Utiliser les classes h-10/h-12 maximum
- ❌ Oublier de gérer le cas `profile undefined`

## 🔮 Évolutions futures

- [ ] Support du mode sombre
- [ ] Notifications intégrées (badge de notifications)
- [ ] Dropdown pour le profil utilisateur
- [ ] Barre de progression globale (optionnelle)
- [ ] Support des avatars utilisateur

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025

