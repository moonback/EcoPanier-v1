# Module Lot Management - Refactorisé

## 📁 Structure

```
lot-management/
├── types.ts                  # Types TypeScript partagés
├── useLotForm.ts            # Hook custom pour la logique du formulaire
├── LotCard.tsx              # Carte d'affichage d'un lot (grille)
├── LotFormModal.tsx         # Modal principal avec navigation
├── LotFormSteps.tsx         # Barre de progression des étapes
├── MakeFreeModal.tsx        # Modal de confirmation pour passer en gratuit
├── steps/
│   ├── AIAnalysisStep.tsx   # Étape 1: Analyse IA avec Gemini
│   ├── BasicInfoStep.tsx    # Étape 2: Informations de base
│   ├── PricingStep.tsx      # Étape 3: Prix et quantité
│   ├── ScheduleStep.tsx     # Étape 4: Horaires de retrait
│   └── OptionsStep.tsx      # Étape 5: Options et images
└── README.md                # Ce fichier
```

## 🎯 Composant Principal

**`LotManagement.tsx`** (252 lignes au lieu de 1629)

**Responsabilités :**
- Récupération et affichage des lots
- Gestion des actions CRUD (Create, Read, Update, Delete)
- Nettoyage automatique des lots épuisés (>24h)
- Orchestration des modals

## 📦 Composants Détaillés

### `LotCard.tsx`

**Affiche une carte de lot dans la grille.**

**Props :**
```typescript
interface LotCardProps {
  lot: Lot;
  onEdit: (lot: Lot) => void;
  onDelete: (id: string) => void;
  onMakeFree: (lot: Lot) => void;
}
```

**Fonctionnalités :**
- Affichage image, titre, prix
- Badges (catégorie, urgent, chaîne du froid, réduction)
- Stats (total, réservé, vendu, disponible)
- Boutons d'action (modifier, supprimer, passer en gratuit)

---

### `LotFormModal.tsx`

**Modal principal pour créer/éditer un lot.**

**Props :**
```typescript
interface LotFormModalProps {
  editingLot: Lot | null;
  merchantId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Fonctionnalités :**
- Navigation entre les étapes (5 en création, 4 en édition)
- Gestion du formulaire via `useLotForm`
- Validation à chaque étape
- Soumission et sauvegarde dans Supabase

---

### `LotFormSteps.tsx`

**Barre de progression visuelle des étapes.**

**Props :**
```typescript
interface LotFormStepsProps {
  currentStep: number;
  isEditMode: boolean;
}
```

**Affichage :**
- Icônes et titres des étapes
- États : complété, actif, inactif
- Lignes de connexion animées

---

### `MakeFreeModal.tsx`

**Modal de confirmation pour passer un lot en gratuit.**

**Props :**
```typescript
interface MakeFreeModalProps {
  lot: Lot;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Fonctionnalités :**
- Affichage des informations du lot
- Avertissements sur les conséquences
- Calcul de l'impact solidaire

---

## 📋 Étapes du Formulaire

### 1️⃣ `AIAnalysisStep.tsx` (création uniquement)

**Analyse IA optionnelle avec Gemini.**

- Upload d'image
- Analyse automatique (titre, description, catégorie, prix, etc.)
- Affichage du niveau de confiance
- Possibilité de passer l'étape

### 2️⃣ `BasicInfoStep.tsx`

**Informations de base du produit.**

- Titre (requis)
- Description (requis)
- Catégorie (requis)

### 3️⃣ `PricingStep.tsx`

**Prix et quantité.**

- Type de lot : Payant / Gratuit
- Prix original et prix réduit
- Quantité disponible
- Résumé (CA potentiel, économie client)

### 4️⃣ `ScheduleStep.tsx`

**Horaires de retrait.**

- Sélection du jour (aujourd'hui, demain, autre)
- Créneaux prédéfinis (matin, midi, après-midi, soir)
- Personnalisation horaire
- Aperçu du créneau

### 5️⃣ `OptionsStep.tsx`

**Options et images.**

- Chaîne du froid (checkbox)
- Produit urgent (checkbox)
- Upload d'images multiples
- Prévisualisation et suppression d'images

---

## 🔧 Hook Custom : `useLotForm`

**Gère toute la logique du formulaire.**

**État :**
```typescript
interface LotFormState {
  formData: LotFormData;
  setFormData: (data: LotFormData) => void;
  selectedDateOption: 'today' | 'tomorrow' | 'custom';
  customDate: string;
  startTime: string;
  endTime: string;
  analyzingImage: boolean;
  analysisConfidence: number | null;
}
```

**Fonctions utilitaires :**
- `resetForm()` : Réinitialise tout le formulaire
- `canProceedToNextStep(currentStep, isEditMode)` : Valide l'étape actuelle

**Synchronisation automatique :**
- Les horaires sont synchronisés avec `pickup_start` et `pickup_end` via `useEffect`

---

## 📄 Types Partagés : `types.ts`

**Types exportés :**
```typescript
- Lot (de database.types)
- LotInsert
- LotUpdate
- LotFormData
- DateOption
- LotFormState
- StepInfo
```

---

## ✅ Avantages de la Refactorisation

### 🎯 Maintenabilité

- **Composants < 300 lignes** : Plus facile à comprendre et modifier
- **Responsabilités claires** : Chaque composant a un rôle unique
- **Réutilisabilité** : Les étapes peuvent être réutilisées ailleurs

### 🧪 Testabilité

- **Logique isolée** : Le hook `useLotForm` peut être testé indépendamment
- **Composants purs** : Les étapes sont de simples composants de présentation
- **Props explicites** : Interfaces bien définies

### 🚀 Performance

- **Moins de re-renders** : Les composants ne se mettent à jour que si nécessaire
- **Code splitting** : Possibilité de lazy-load les étapes
- **Mémoire optimisée** : Chaque composant gère son propre état local

### 📚 Lisibilité

- **Architecture feature-based** : Tout le code lié aux lots est au même endroit
- **Nommage clair** : Pas d'ambiguïté sur le rôle de chaque fichier
- **Documentation inline** : Commentaires pertinents

---

## 🔄 Flux de Données

```
LotManagement
    │
    ├─► fetchLots() ──► Supabase ──► lots[]
    │
    ├─► LotCard (affichage)
    │      │
    │      ├─► onEdit() ──► setEditingLot() ──► showModal
    │      ├─► onDelete() ──► handleDelete() ──► fetchLots()
    │      └─► onMakeFree() ──► handleMakeFree() ──► showMakeFreeModal
    │
    ├─► LotFormModal
    │      │
    │      ├─► useLotForm (gestion état)
    │      │
    │      ├─► LotFormSteps (progression)
    │      │
    │      └─► Steps
    │             ├─► AIAnalysisStep
    │             ├─► BasicInfoStep
    │             ├─► PricingStep
    │             ├─► ScheduleStep
    │             └─► OptionsStep
    │
    └─► MakeFreeModal
           └─► confirmMakeFree() ──► Supabase ──► fetchLots()
```

---

## 🛠️ Développement

### Ajouter une nouvelle étape

1. Créer un nouveau fichier dans `steps/`
2. Suivre le pattern des étapes existantes
3. Accepter `formState` en props
4. Mettre à jour `LotFormSteps.tsx` et `LotFormModal.tsx`
5. Ajuster `canProceedToNextStep()` dans `useLotForm.ts`

### Ajouter un nouveau champ au formulaire

1. Mettre à jour `LotFormData` dans `types.ts`
2. Ajouter le champ initial dans `useLotForm.ts`
3. Créer l'input dans l'étape appropriée
4. Gérer la validation dans `canProceedToNextStep()`
5. Ajouter le champ dans `handleSubmit()` de `LotFormModal.tsx`

---

## 📝 Notes Importantes

- **TypeScript obligatoire** : Jamais d'`any`
- **Gestion d'erreurs** : Toujours catch les erreurs Supabase
- **Responsive** : Tous les composants sont mobile-first
- **Accessibilité** : Labels, aria-labels, et navigation clavier
- **Performance** : Images optimisées via `uploadImage()`

---

## 🐛 Debugging

Si vous rencontrez des problèmes :

1. **Vérifiez les props** : Utilisez React DevTools
2. **Inspectez l'état** : Ajoutez des `console.log` dans `useLotForm`
3. **Testez les étapes** : Testez chaque étape indépendamment
4. **Vérifiez Supabase** : Consultez les logs dans le dashboard Supabase

---

**Version** : 2.0.0  
**Date** : Janvier 2025  
**Auteur** : Refactorisation IA

