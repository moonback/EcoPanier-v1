# 🤝 Guide de Contribution - EcoPanier

> Merci de vouloir contribuer à EcoPanier ! Ce guide vous aidera à commencer.

---

## 📋 Table des matières

1. [Code de conduite](#code-de-conduite)
2. [Comment contribuer](#comment-contribuer)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Standards de code](#standards-de-code)
5. [Workflow Git](#workflow-git)
6. [Pull Requests](#pull-requests)
7. [Signalement de bugs](#signalement-de-bugs)
8. [Proposer des fonctionnalités](#proposer-des-fonctionnalités)
9. [Communauté](#communauté)

---

## 📜 Code de conduite

### Notre engagement

En tant que contributeurs et mainteneurs de ce projet, nous nous engageons à créer un environnement ouvert et accueillant pour tous, indépendamment de :

- L'âge, la taille, le handicap
- L'ethnicité, l'identité et l'expression de genre
- Le niveau d'expérience, l'éducation, le statut socio-économique
- La nationalité, l'apparence personnelle, la race
- La religion, l'identité et l'orientation sexuelle

### Nos standards

**Comportements encouragés** ✅ :
- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur ce qui est meilleur pour la communauté
- Faire preuve d'empathie envers les autres membres

**Comportements inacceptables** ❌ :
- Langage ou images à connotation sexuelle
- Trolling, commentaires insultants ou désobligeants
- Harcèlement public ou privé
- Publication d'informations privées sans permission
- Conduite inappropriée dans un cadre professionnel

### Application

Les comportements inacceptables peuvent être signalés à **conduct@ecopanier.fr**. Toutes les plaintes seront examinées et traitées de manière confidentielle.

---

## 🚀 Comment contribuer

Il existe de nombreuses façons de contribuer à EcoPanier !

### 🐛 Signaler des bugs

Si vous trouvez un bug :

1. **Vérifiez** que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/votre-username/ecopanier/issues)
2. **Créez une nouvelle issue** en utilisant le template "Bug Report"
3. **Décrivez le bug** de manière détaillée (étapes pour reproduire, comportement attendu vs actuel, screenshots)
4. **Ajoutez des labels** appropriés (bug, critical, etc.)

### ✨ Proposer des fonctionnalités

Pour proposer une nouvelle fonctionnalité :

1. **Vérifiez la [Roadmap](./ROADMAP.md)** - peut-être déjà planifiée !
2. **Ouvrez une Discussion** dans [GitHub Discussions](https://github.com/votre-username/ecopanier/discussions)
3. **Créez une Feature Request** si validée par la communauté
4. **Attendez les retours** des mainteneurs avant de commencer le développement

### 💻 Contribuer au code

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez une branche** pour votre fonctionnalité
4. **Développez** en suivant nos standards
5. **Testez** vos changements
6. **Commitez** avec des messages clairs
7. **Poussez** vers votre fork
8. **Ouvrez une Pull Request**

### 📖 Améliorer la documentation

La documentation est toujours perfectible :

- Corriger des fautes d'orthographe/grammaire
- Clarifier des sections confuses
- Ajouter des exemples
- Traduire dans d'autres langues
- Améliorer les commentaires dans le code

### 🧪 Écrire des tests

Nous avons besoin de plus de tests ! Vous pouvez :

- Ajouter des tests unitaires manquants
- Améliorer la couverture de tests
- Créer des tests d'intégration
- Écrire des tests end-to-end

---

## 🛠️ Configuration de l'environnement

### Prérequis

```bash
node -v  # >= 18.0.0
npm -v   # >= 9.0.0
git --version  # >= 2.0.0
```

### Installation

```bash
# 1. Fork le projet sur GitHub
# 2. Clone ton fork
git clone https://github.com/TON-USERNAME/ecopanier.git
cd ecopanier

# 3. Ajoute le remote upstream
git remote add upstream https://github.com/votre-username/ecopanier.git

# 4. Installe les dépendances
npm install

# 5. Copie le fichier d'environnement
cp .env.example .env

# 6. Configure tes variables d'environnement
# Édite .env avec tes clés Supabase

# 7. Lance le serveur de dev
npm run dev
```

### Configuration Supabase (Développement)

Pour développer, vous avez deux options :

#### Option A : Utiliser le projet Supabase de développement partagé

Demandez l'accès au projet de dev :
- Email : **dev@ecopanier.fr**
- Les credentials vous seront envoyées

#### Option B : Créer votre propre projet Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Exécutez les migrations dans `supabase/migrations/`
4. Mettez à jour votre `.env` avec vos credentials

---

## 📏 Standards de code

### TypeScript

```typescript
// ✅ GOOD
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}

// ❌ BAD
function getUser(id: any) {
  // No types, unclear function name
}
```

### Conventions de nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| **Composants** | PascalCase | `UserProfile.tsx` |
| **Hooks** | camelCase + use prefix | `useAuthStore.ts` |
| **Fonctions** | camelCase | `fetchUserData()` |
| **Variables** | camelCase | `const userData = ...` |
| **Constantes** | UPPER_SNAKE_CASE | `const MAX_RETRY = 3` |
| **Interfaces/Types** | PascalCase | `interface UserData {}` |
| **Fichiers** | kebab-case ou PascalCase | `user-profile.ts` ou `UserProfile.tsx` |

### Structure des composants

```typescript
// UserCard.tsx
import { useState, useEffect } from 'react';
import type { User } from '../types';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  // 1. État local
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. Hooks personnalisés
  const { updateUser } = useUserStore();
  
  // 3. Effets
  useEffect(() => {
    // Side effects
  }, [user]);
  
  // 4. Handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(user);
  };
  
  // 5. Early returns
  if (!user) return null;
  
  // 6. Render
  return (
    <div className="card">
      <h2>{user.fullName}</h2>
      <button onClick={handleEdit}>Éditer</button>
    </div>
  );
}
```

### CSS avec Tailwind

```tsx
// ✅ GOOD - Classes organisées logiquement
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <img className="w-12 h-12 rounded-full" src={avatar} alt="Avatar" />
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
    <p className="text-sm text-gray-600">{role}</p>
  </div>
</div>

// ❌ BAD - Classes désorganisées et difficiles à lire
<div className="shadow-md flex bg-white transition-shadow rounded-lg p-4 gap-4 items-center hover:shadow-lg">
  {/* ... */}
</div>
```

### Organisation des imports

```typescript
// 1. React et bibliothèques externes
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// 2. Stores et contextes
import { useAuthStore } from '@/stores/authStore';
import { useSettings } from '@/contexts/SettingsContext';

// 3. Composants
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

// 4. Hooks personnalisés
import { useDebounce } from '@/hooks/useDebounce';

// 5. Utilitaires et helpers
import { formatPrice } from '@/utils/helpers';
import { validateEmail } from '@/utils/validation';

// 6. Types
import type { User, Profile } from '@/lib/database.types';

// 7. Assets et styles
import './UserProfile.css';
```

### Gestion d'erreurs

```typescript
// ✅ GOOD
try {
  const { data, error } = await supabase
    .from('lots')
    .select();
  
  if (error) throw error;
  
  return data;
} catch (error) {
  console.error('Erreur lors de la récupération des lots:', error);
  
  // Gestion spécifique selon le type d'erreur
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      throw new Error('Problème de connexion. Vérifiez votre internet.');
    }
    throw new Error('Une erreur est survenue. Veuillez réessayer.');
  }
  
  throw error;
}

// ❌ BAD
try {
  const data = await supabase.from('lots').select();
  return data;
} catch (e) {
  console.log(e); // Pas assez d'info, message générique
}
```

### Commentaires

```typescript
// ✅ GOOD - Commentaires utiles
/**
 * Calcule le montant total des économies réalisées
 * @param reservations - Liste des réservations complétées
 * @returns Montant total économisé en euros
 */
function calculateSavings(reservations: Reservation[]): number {
  return reservations.reduce((total, res) => {
    // On calcule l'économie par rapport au prix original
    const saving = (res.lot.original_price - res.lot.discounted_price) * res.quantity;
    return total + saving;
  }, 0);
}

// ❌ BAD - Commentaires inutiles
// Cette fonction additionne deux nombres
function add(a: number, b: number): number {
  return a + b; // Retourne la somme
}
```

---

## 🔀 Workflow Git

### Branches

Nous utilisons le modèle de branches suivant :

```
main (production)
  ├── develop (développement principal)
  │   ├── feature/nom-fonctionnalite
  │   ├── fix/nom-bug
  │   ├── refactor/nom-refactoring
  │   └── docs/nom-documentation
```

### Nommage des branches

```bash
# Nouvelle fonctionnalité
feature/add-user-notifications
feature/payment-stripe-integration

# Correction de bug
fix/login-error-handling
fix/lot-quantity-update

# Refactoring
refactor/auth-store-cleanup
refactor/improve-lot-filters

# Documentation
docs/update-api-documentation
docs/add-contributing-guide
```

### Messages de commit

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Tâches de maintenance

**Exemples** :

```bash
# ✅ GOOD
feat(auth): add two-factor authentication
fix(lots): correct quantity update on reservation
docs(readme): update installation instructions
refactor(components): simplify UserCard component
test(reservations): add unit tests for PIN validation

# ❌ BAD
update stuff
fixed bug
wip
asdfasdf
```

### Workflow complet

```bash
# 1. Synchronise avec upstream
git checkout develop
git pull upstream develop

# 2. Crée une branche depuis develop
git checkout -b feature/ma-nouvelle-fonctionnalite

# 3. Développe et commite régulièrement
git add .
git commit -m "feat(lots): add search filter by category"

# 4. Push vers ton fork
git push origin feature/ma-nouvelle-fonctionnalite

# 5. Ouvre une Pull Request sur GitHub
# depuis ton fork vers upstream/develop
```

---

## 🔄 Pull Requests

### Avant de soumettre

- [ ] Le code compile sans erreurs (`npm run build`)
- [ ] Le linter passe (`npm run lint`)
- [ ] Le typecheck passe (`npm run typecheck`)
- [ ] Les tests passent (quand implémentés)
- [ ] Le code suit nos standards
- [ ] La documentation est à jour
- [ ] Les commits sont propres et bien nommés

### Template de Pull Request

Utilisez le template suivant :

```markdown
## 📝 Description

Décrivez brièvement ce que fait cette PR.

## 🎯 Type de changement

- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] 🎨 Style/UI
- [ ] ♻️ Refactoring
- [ ] ⚡ Performance
- [ ] ✅ Tests

## 🔗 Issue liée

Fixes #123 (si applicable)

## 📸 Screenshots

Si changements UI, ajoutez des captures d'écran.

## ✅ Checklist

- [ ] Code suit les standards du projet
- [ ] Auto-review effectuée
- [ ] Commentaires ajoutés si nécessaire
- [ ] Documentation mise à jour
- [ ] Pas de warnings dans la console
- [ ] Tests ajoutés/mis à jour
- [ ] Changements testés localement

## 🧪 Comment tester

Décrivez les étapes pour tester vos changements.

1. Aller sur...
2. Cliquer sur...
3. Vérifier que...
```

### Review Process

1. **Soumission** : Vous ouvrez la PR
2. **CI/CD** : Les checks automatiques s'exécutent
3. **Review** : Un mainteneur review votre code
4. **Feedback** : Modifications potentielles demandées
5. **Approbation** : PR approuvée par 1+ mainteneurs
6. **Merge** : PR mergée dans `develop`

### Délai de review

- **Pull Requests simples** (docs, fixes mineurs) : 1-2 jours
- **Pull Requests moyennes** (nouvelles features) : 3-5 jours
- **Pull Requests complexes** (refactoring majeur) : 1-2 semaines

---

## 🐛 Signalement de bugs

### Template de Bug Report

```markdown
## 🐛 Description du bug

Décrivez clairement et précisément le bug.

## 🔍 Étapes pour reproduire

1. Aller sur '...'
2. Cliquer sur '....'
3. Scroller jusqu'à '....'
4. Voir l'erreur

## ✅ Comportement attendu

Décrivez ce qui devrait se passer.

## ❌ Comportement actuel

Décrivez ce qui se passe actuellement.

## 📸 Screenshots

Si applicable, ajoutez des captures d'écran.

## 🖥️ Environnement

- **OS**: [ex: Windows 10, macOS 13, Ubuntu 22.04]
- **Navigateur**: [ex: Chrome 120, Firefox 121]
- **Version**: [ex: v1.0.0]

## 📋 Contexte additionnel

Toute autre information utile sur le problème.

## 🔗 Logs

Collez les logs de la console si disponibles.
```

---

## 💡 Proposer des fonctionnalités

### Template de Feature Request

```markdown
## 🎯 Description de la fonctionnalité

Décrivez clairement la fonctionnalité souhaitée.

## 🤔 Problème résolu

Quel problème cette fonctionnalité résout-elle ?

## 💡 Solution proposée

Décrivez comment vous imaginez la solution.

## 🔄 Alternatives considérées

Y a-t-il d'autres façons de résoudre le problème ?

## 📸 Mockups/Wireframes

Si applicable, ajoutez des maquettes visuelles.

## 📊 Impact estimé

- **Utilisateurs concernés**: [ex: Tous, Commerçants uniquement]
- **Priorité**: [Basse / Moyenne / Haute]
- **Complexité**: [Simple / Moyenne / Complexe]

## 🔗 Ressources

Liens vers des ressources ou exemples similaires.
```

---

## 👥 Communauté

### Canaux de communication

- **GitHub Issues** : Bugs et feature requests
- **GitHub Discussions** : Questions et discussions générales
- **Discord/Slack** : Chat en temps réel (lien à venir)
- **Email** : contact@ecopanier.fr

### Obtenir de l'aide

**Vous avez une question ?**

1. Consultez d'abord la [documentation](./README.md)
2. Cherchez dans les [Issues fermées](https://github.com/votre-username/ecopanier/issues?q=is%3Aissue+is%3Aclosed)
3. Posez votre question dans [Discussions](https://github.com/votre-username/ecopanier/discussions)
4. Rejoignez notre Discord pour du support communautaire

### Devenir mainteneur

Les contributeurs réguliers et de qualité peuvent devenir mainteneurs. Critères :

- 10+ PRs mergées de qualité
- Engagement actif dans les reviews
- Respect du code de conduite
- Compréhension approfondie du projet

Contactez-nous à **maintainers@ecopanier.fr** si intéressé !

---

## 🎓 Ressources pour débutants

### Nouveau sur Git/GitHub ?

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Forking Projects](https://guides.github.com/activities/forking/)

### Nouveau sur React/TypeScript ?

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Nouveau sur Supabase ?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase YouTube Channel](https://www.youtube.com/@supabase)

---

## 🏆 Hall of Fame

Merci à tous nos contributeurs !

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Sera automatiquement rempli -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Voulez-vous apparaître ici ? [Contribuez dès maintenant !](#comment-contribuer)

---

## 📝 Licence

En contribuant à EcoPanier, vous acceptez que vos contributions soient licenciées sous la [Licence MIT](./LICENSE).

---

<div align="center">

**Merci de contribuer à rendre le monde meilleur, un repas sauvé à la fois ! 🌱**

[⬅️ Retour au README](./README.md) • [📋 Voir les Issues](https://github.com/votre-username/ecopanier/issues) • [💬 Discussions](https://github.com/votre-username/ecopanier/discussions)

</div>

