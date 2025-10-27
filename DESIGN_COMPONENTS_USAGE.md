# 📚 Guide d'Utilisation - Nouveaux Composants & Animations

Bienvenue ! Ce guide vous montre comment utiliser les nouveaux composants et animations pour améliorer le design de votre app.

---

## 🎯 Table des Matières

1. [EmptyState](#emptystate)
2. [FormField](#formfield)
3. [DashboardSection](#dashboardsection)
4. [Animations CSS](#animations-css)
5. [Micro-Interactions](#micro-interactions)
6. [Exemples Pratiques](#exemples-pratiques)
7. [Best Practices](#best-practices)

---

## 1️⃣ EmptyState

### Description
Composant pour afficher les écrans sans données avec une icône, titre, description et action.

### Props
```typescript
interface EmptyStateProps {
  icon: LucideIcon;           // Icône lucide-react
  title: string;              // Titre principal
  description: string;        // Description
  action?: {                  // Action CTA (optionnel)
    label: string;
    onClick: () => void;
  };
  illustration?: string;      // URL image (non utilisée pour MVP)
}
```

### Exemple 1 : Aucune réservation
```tsx
import { ShoppingCart } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);

  return reservations.length === 0 ? (
    <EmptyState
      icon={ShoppingCart}
      title="Aucune réservation"
      description="Vous n'avez pas encore réservé de lots. Découvrez les offres disponibles et faites votre première réservation !"
      action={{
        label: '🔍 Découvrir les lots',
        onClick: () => navigate('/lots')
      }}
    />
  ) : (
    <ReservationsList data={reservations} />
  );
};
```

### Exemple 2 : Aucun lot créé (Commerçant)
```tsx
import { Package } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

{lots.length === 0 && (
  <EmptyState
    icon={Package}
    title="Aucun lot créé"
    description="Commencez à sauver vos invendus en créant votre premier lot. C'est simple et rapide !"
    action={{
      label: '✨ Créer mon premier lot',
      onClick: () => setShowCreateForm(true)
    }}
  />
)}
```

### Exemple 3 : Aucun collecteur assigné
```tsx
import { Truck } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

{collectors.length === 0 && (
  <EmptyState
    icon={Truck}
    title="Pas de collecteur"
    description="Aucun collecteur n'est assigné pour cette zone. Contactez le support pour en ajouter un."
  />
)}
```

### Icônes Lucide Populaires
- `ShoppingCart` - Panier vide
- `Package` - Lots/produits
- `Truck` - Livraison/collecteurs
- `Heart` - Favoris
- `Users` - Personnes
- `Calendar` - Dates
- `FileText` - Documents
- `AlertCircle` - Alertes

---

## 2️⃣ FormField

### Description
Wrapper pour champs de formulaire avec label, gestion d'erreurs et hints.

### Props
```typescript
interface FormFieldProps {
  label: string;              // Label du champ
  error?: string;             // Message d'erreur
  required?: boolean;         // Marquer comme requis
  hint?: string;              // Conseil/aide
  children: React.ReactNode;  // Champ d'input (input, select, textarea, etc.)
}
```

### Exemple 1 : Email avec validation
```tsx
import { FormField } from '@/components/shared/FormField';

<FormField
  label="Email"
  required
  error={errors.email}
  hint="Utilisé pour les confirmations et notifications"
>
  <input
    type="email"
    className="input"
    placeholder="votre@email.com"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  />
</FormField>
```

### Exemple 2 : Sélecteur de catégorie
```tsx
<FormField
  label="Catégorie de produit"
  required
  hint="Choisissez la catégorie principale"
>
  <select
    className="input"
    value={formData.category}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  >
    <option value="">-- Sélectionner --</option>
    <option value="fruits">🍎 Fruits</option>
    <option value="legumes">🥕 Légumes</option>
    <option value="dairy">🥛 Laiterie</option>
    <option value="meat">🍖 Viande</option>
  </select>
</FormField>
```

### Exemple 3 : Textarea avec limite de caractères
```tsx
<FormField
  label="Description"
  required
  error={errors.description}
  hint="Décrivez votre lot en 200 caractères maximum"
>
  <textarea
    className="input"
    rows={4}
    placeholder="Décrivez les produits..."
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    maxLength={200}
  />
</FormField>
```

### Exemple 4 : Sans erreur mais avec hint
```tsx
<FormField
  label="Quantité"
  required
  hint="Nombre d'items disponibles"
>
  <input
    type="number"
    className="input"
    min="1"
    placeholder="Nombre d'articles"
    value={formData.quantity}
    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
  />
</FormField>
```

### Validation Complète
```tsx
const [formData, setFormData] = useState({
  email: '',
  category: '',
  description: '',
  quantity: 0
});

const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.email.includes('@')) {
    newErrors.email = 'Email invalide';
  }
  if (!formData.category) {
    newErrors.category = 'Catégorie requise';
  }
  if (formData.description.length < 10) {
    newErrors.description = 'Description trop courte (min 10 caractères)';
  }
  if (formData.quantity < 1) {
    newErrors.quantity = 'Quantité doit être >= 1';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // Submit logic
};
```

---

## 3️⃣ DashboardSection

### Description
Composant structurant les sections du dashboard avec header, icône et action optionnelle.

### Props
```typescript
interface DashboardSectionProps {
  title: string;                          // Titre principal
  subtitle?: string;                      // Sous-titre descriptif
  icon?: React.ReactNode;                 // Icône lucide
  action?: {                              // Bouton d'action (optionnel)
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;              // Contenu
}
```

### Exemple 1 : Section avec statistiques
```tsx
import { DashboardSection } from '@/components/shared/DashboardSection';
import { TrendingUp } from 'lucide-react';

<DashboardSection
  title="Vue d'ensemble"
  subtitle="Vos statistiques en temps réel"
  icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard label="Lots créés" value="12" icon="📦" />
    <StatCard label="Repas sauvés" value="245" icon="🍽️" />
    <StatCard label="Impact CO₂" value="220kg" icon="🌍" />
  </div>
</DashboardSection>
```

### Exemple 2 : Section avec liste et action
```tsx
import { ShoppingBag, Plus } from 'lucide-react';

<DashboardSection
  title="Mes Lots"
  subtitle="Gérez vos invendus"
  icon={<ShoppingBag className="w-6 h-6 text-primary-600" />}
  action={{
    label: '+ Créer un lot',
    onClick: () => setShowForm(true)
  }}
>
  {lots.length === 0 ? (
    <EmptyState
      icon={ShoppingBag}
      title="Aucun lot"
      description="Commencez à sauver des invendus"
      action={{
        label: 'Créer un lot',
        onClick: () => setShowForm(true)
      }}
    />
  ) : (
    <div className="space-y-3">
      {lots.map(lot => (
        <LotItem key={lot.id} lot={lot} />
      ))}
    </div>
  )}
</DashboardSection>
```

### Exemple 3 : Section sans icône, sans action
```tsx
<DashboardSection
  title="Mes Favoris"
>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {favoris.map(item => (
      <FavoriteCard key={item.id} item={item} />
    ))}
  </div>
</DashboardSection>
```

### Exemple 4 : Sections multiples (Dashboard complet)
```tsx
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  MapPin 
} from 'lucide-react';

export const MerchantDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Bienvenue !</h1>
        <p className="text-neutral-600">Suivez vos ventes et impact</p>
      </div>

      {/* Stats */}
      <DashboardSection
        title="Vue d'ensemble"
        icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
      >
        {/* Stats cards */}
      </DashboardSection>

      {/* Lots */}
      <DashboardSection
        title="Mes Lots"
        icon={<ShoppingBag className="w-6 h-6 text-primary-600" />}
        action={{
          label: '+ Créer',
          onClick: () => setShowForm(true)
        }}
      >
        {/* Lots list */}
      </DashboardSection>

      {/* Collecteurs */}
      <DashboardSection
        title="Mes Collecteurs"
        icon={<Users className="w-6 h-6 text-primary-600" />}
      >
        {/* Collecteurs list */}
      </DashboardSection>

      {/* Zones de service */}
      <DashboardSection
        title="Zones de Service"
        icon={<MapPin className="w-6 h-6 text-primary-600" />}
      >
        {/* Zones map */}
      </DashboardSection>
    </div>
  );
};
```

---

## 4️⃣ Animations CSS

### Classes Disponibles

#### A. Fade & Scale
```tsx
// Fade in avec scale
<div className="fade-scale-in">
  Apparition fluide
</div>

// Check animation (validation)
<div className="check-animation">
  ✓
</div>
```

#### B. Hover Effects
```tsx
// Scale on hover
<button className="scale-up-on-hover">
  Hover me!
</button>

// Glow on hover
<div className="glow-on-hover">
  Glow effect
</div>
```

#### C. Alerts & Urgence
```tsx
// Pulse soft pour alertes
<div className="pulse-soft-alert border border-accent-500 p-4 rounded-lg">
  ⚠️ Alerte importante
</div>

// Urgency glow
<div className="urgency-glow bg-accent-100 p-4 rounded-lg">
  Urgent !
</div>
```

#### D. CTA & Interactive
```tsx
// Bounce CTA
<button className="bounce-cta">
  Click me!
</button>

// Slide down (dropdowns)
<div className="slide-down">
  Menu item
</div>
```

#### E. States
```tsx
// Transition smooth
<div className="transition-smooth">
  Smooth transition
</div>

// Disabled state
<div className="loading-disabled">
  Disabled content
</div>

// Highlight flash
<div className="highlight-flash">
  New notification!
</div>
```

### Combinaisons Utiles

```tsx
// Card avec animations
<div className="card scale-up-on-hover glow-on-hover">
  Hover me!
</div>

// Bouton avec animations
<button className="btn-primary scale-up-on-hover bounce-cta">
  Action
</button>

// Alerte avec animations
<div className="pulse-soft-alert urgency-glow">
  Important alert!
</div>
```

---

## 5️⃣ Micro-Interactions

### Active States
```tsx
// Les boutons scale down quand cliqués
<button className="btn-primary">
  {/* Automatiquement scale-95 on :active */}
</button>

// Les cartes interactives scale down légèrement
<div className="card-interactive">
  {/* Automatiquement scale-98 on :active */}
</div>
```

### Toast Notifications
```tsx
// Entrée
<div className="toast-enter">
  Message
</div>

// Sortie
<div className="toast-exit">
  Message
</div>
```

### Loading States
```tsx
// Formulaire pendant le chargement
<form className="loading-disabled">
  {/* Inputs grisés et non cliquables */}
</form>
```

---

## 6️⃣ Exemples Pratiques

### Cas 1 : Formulaire Complète
```tsx
import { FormField } from '@/components/shared/FormField';
import { useState } from 'react';

export const CreateLotForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    quantity: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // API call
      await createLot(formData);
    } catch (error) {
      setErrors({ submit: 'Erreur lors de la création' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={isSubmitting ? 'loading-disabled' : ''}>
      <FormField
        label="Titre du lot"
        required
        error={errors.title}
        hint="Ex: Fruits de saison"
      >
        <input
          type="text"
          className="input"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </FormField>

      <FormField
        label="Catégorie"
        required
        error={errors.category}
      >
        <select
          className="input"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">-- Sélectionner --</option>
          <option value="fruits">Fruits</option>
          <option value="vegetables">Légumes</option>
        </select>
      </FormField>

      <FormField
        label="Description"
        required
        error={errors.description}
      >
        <textarea
          className="input"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </FormField>

      <FormField
        label="Prix"
        required
        hint="Prix de vente"
      >
        <input
          type="number"
          className="input"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
        />
      </FormField>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Création...' : 'Créer le lot'}
      </button>

      {errors.submit && (
        <div className="pulse-soft-alert border border-accent-500 p-4 mt-4 rounded-lg">
          {errors.submit}
        </div>
      )}
    </form>
  );
};
```

### Cas 2 : Dashboard avec Sections
```tsx
import { DashboardSection } from '@/components/shared/DashboardSection';
import { EmptyState } from '@/components/shared/EmptyState';
import { ShoppingBag, TrendingUp, Truck, AlertCircle } from 'lucide-react';

export const CustomerDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Bienvenue !</h1>
        <p className="text-neutral-600">Trouvez des bons plans près de vous</p>
      </div>

      {/* Reservations */}
      <DashboardSection
        title="Mes Réservations"
        icon={<ShoppingBag className="w-6 h-6 text-primary-600" />}
      >
        {reservations.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Aucune réservation"
            description="Explorez les lots disponibles"
            action={{
              label: 'Découvrir les lots',
              onClick: () => window.location.href = '/lots'
            }}
          />
        ) : (
          <div className="space-y-3">
            {reservations.map(r => (
              <ReservationCard key={r.id} data={r} />
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Favoris */}
      <DashboardSection
        title="Mes Favoris"
        subtitle={`${favoris.length} items`}
        icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
      >
        {favoris.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Pas de favoris"
            description="Ajoutez des lots à vos favoris"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoris.map(f => (
              <FavoriteCard key={f.id} data={f} />
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Alerts */}
      {alerts.length > 0 && (
        <DashboardSection
          title="Alertes"
          icon={<AlertCircle className="w-6 h-6 text-warning-600" />}
        >
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="pulse-soft-alert border border-warning-500 p-4 rounded-lg">
                {alert.message}
              </div>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  );
};
```

---

## 7️⃣ Best Practices

### ✅ À Faire

1. **Utilisez les composants pour la cohérence**
```tsx
// BON - Utilise FormField
<FormField label="Email" required>
  <input className="input" type="email" />
</FormField>

// MAUVAIS - Styling manuel
<div>
  <label>Email</label>
  <input style={{ border: '1px solid gray' }} type="email" />
</div>
```

2. **Combinez les animations de manière cohérente**
```tsx
// BON - Animations complémentaires
<div className="card scale-up-on-hover glow-on-hover">
  {{/* Content */}}
</div>

// MAUVAIS - Animations trop nombreuses
<div className="card scale-up-on-hover glow-on-hover bounce-cta fade-scale-in">
  {{/* Too much */}}
</div>
```

3. **Utilisez EmptyState pour les écrans sans données**
```tsx
// BON
{items.length === 0 && (
  <EmptyState
    icon={Package}
    title="Aucun item"
    description="Créez votre premier item"
    action={{ label: 'Créer', onClick: handleCreate }}
  />
)}

// MAUVAIS
{items.length === 0 && <div>Pas de données</div>}
```

4. **Hiérarchisez les erreurs avec FormField**
```tsx
// BON - Erreur claire
<FormField
  label="Email"
  error={errors.email}
  required
>
  <input className="input" type="email" />
</FormField>

// MAUVAIS - Erreur confuse
<input className="input border-red-500" type="email" />
{errors.email && <p>{errors.email}</p>}
```

### ❌ À Éviter

1. **Ne pas utiliser les animations sur du contenu non interactif**
```tsx
// MAUVAIS
<p className="bounce-cta">Texte statique</p>

// BON
<button className="bounce-cta">Click me</button>
```

2. **Ne pas combiner trop d'animations**
```tsx
// MAUVAIS - Distrayant
<div className="fade-scale-in bounce-cta pulse-soft-alert urgency-glow">
  Too much!
</div>

// BON - Simple et clair
<div className="fade-scale-in">
  Simple animation
</div>
```

3. **Ne pas forcer les animations sur mobile**
```tsx
// Les animations respectent automatiquement prefers-reduced-motion
// Pas besoin de code spécial
```

---

## 📊 Tableau Récapitulatif

| Composant | Utilisation | Exemple |
|-----------|-------------|---------|
| `EmptyState` | Écran sans données | Aucune réservation |
| `FormField` | Champs avec validation | Formulaires |
| `DashboardSection` | Section du dashboard | Mes lots, Mes collecteurs |
| `.fade-scale-in` | Entrée d'élément | Modals, notifications |
| `.scale-up-on-hover` | Interaction hover | Cartes, boutons |
| `.pulse-soft-alert` | Alertes urgentes | Messages d'erreur |
| `.bounce-cta` | Call-to-action | Boutons primaires |

---

## 🚀 Prochaines Étapes

Maintenant que vous comprenez les composants, vous pouvez :

1. ✅ Remplacer les formulaires basiques par FormField
2. ✅ Ajouter EmptyState aux pages vides
3. ✅ Restructurer les dashboards avec DashboardSection
4. ✅ Appliquer les animations pour l'engagement

---

**Créé:** Octobre 2025  
**Version:** v1.0  
**Prêt à utiliser:** ✅ Oui
