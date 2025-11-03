# ♿ Accessibilité Mode Kiosque - Améliorations pour Mal-Voyants

**Date** : Janvier 2025  
**Version** : 1.0.0  
**Statut** : ✅ Implémenté

---

## 📋 Vue d'ensemble

Le mode kiosque a été entièrement optimisé pour les personnes mal-voyantes et les utilisateurs nécessitant des ajustements d'accessibilité. Toutes les fonctionnalités respectent les normes WCAG 2.1 niveau AA.

---

## ✨ Fonctionnalités d'accessibilité

### 1. **Contexte d'Accessibilité** (`AccessibilityContext`)

Un contexte React dédié gère tous les paramètres d'accessibilité :

- ✅ **Mode grand texte** : Augmente automatiquement toutes les tailles de police
- ✅ **Contraste élevé** : Mode haute visibilité avec bordures épaisses et contrastes maximisés
- ✅ **Taille de police personnalisée** : Réglage fin de 80% à 200%
- ✅ **Annonces vocales** : Support des lecteurs d'écran via `aria-live`

**Fichier** : `src/contexts/AccessibilityContext.tsx`

---

### 2. **Panneau de Paramètres d'Accessibilité**

Un panneau dédié accessible depuis la barre supérieure ou via le raccourci `Alt + S` :

- ✅ **Interrupteurs visuels** pour activer/désactiver les options
- ✅ **Réglage fin de la taille de police** avec boutons +/-
- ✅ **Instructions claires** pour chaque option
- ✅ **Raccourcis clavier** documentés
- ✅ **Persistance** : Les préférences sont sauvegardées dans `localStorage`

**Fichier** : `src/components/kiosk/KioskAccessibilitySettings.tsx`

---

### 3. **Attributs ARIA Complets**

Tous les composants incluent maintenant :

- ✅ **`aria-label`** : Labels descriptifs pour tous les boutons et éléments interactifs
- ✅ **`aria-live`** : Annonces dynamiques pour les lecteurs d'écran
- ✅ **`role`** : Rôles sémantiques appropriés (tab, tabpanel, timer, alert, etc.)
- ✅ **`aria-hidden="true"`** : Icônes décoratives cachées des lecteurs d'écran
- ✅ **`aria-pressed`** : État des boutons (onglets)
- ✅ **`aria-busy`** : Indication des états de chargement

**Exemples** :
```tsx
<button
  aria-label="Réserver le panier {lot.title}"
  aria-busy={reserving}
>
  Réserver
</button>

<div role="timer" aria-live="polite" aria-label="Temps restant : {time}">
  {formatTime(timeRemaining)}
</div>
```

---

### 4. **Navigation au Clavier**

Tous les éléments sont accessibles au clavier :

- ✅ **Tab** : Navigation entre les éléments
- ✅ **Espace/Entrée** : Activation des boutons
- ✅ **Focus visible** : Ring de focus de 4px avec couleur contrastée
- ✅ **Focus amélioré en mode contraste élevé** : Ring rouge plus épais (4px)

**Raccourcis clavier** :
- `Alt + S` : Ouvrir les paramètres d'accessibilité
- `Ctrl/Cmd + +` : Augmenter la taille de police (jusqu'à 200%)
- `Ctrl/Cmd + -` : Diminuer la taille de police (jusqu'à 80%)

---

### 5. **Tailles de Texte Optimisées**

#### Mode Grand Texte Activé

**Tailles par défaut** → **Mode grand texte** :
- Titres principaux : `text-2xl` → `text-3xl`
- Sous-titres : `text-base` → `text-xl`
- Textes courants : `text-xs` → `text-sm`
- Boutons : `text-xs` → `text-sm`
- Messages : `text-sm` → `text-base`

#### Code PIN Ultra-Lisible

Le code PIN s'adapte dynamiquement :
- **Taille par défaut** : 72px
- **Mode grand texte** : 80px
- **Avec zoom personnalisé** : Jusqu'à 160px (200% de 80px)
- **Police** : Monospace bold pour une meilleure lisibilité
- **Espacement** : `tracking-wider` pour séparer les chiffres

**Exemple** :
```tsx
<p
  style={{
    fontSize: `${(largeText ? 80 : 72) * (fontSize > 1 ? fontSize : 1)}px`,
    lineHeight: '1.2'
  }}
  aria-label={`Code PIN : ${pin}`}
  aria-live="polite"
>
  {pin}
</p>
```

---

### 6. **Mode Contraste Élevé**

Quand activé, le mode contraste élevé applique :

- ✅ **Fond blanc pur** : `rgb(255, 255, 255)` pour tous les fonds
- ✅ **Texte noir** : `rgb(0, 0, 0)` avec poids `600+`
- ✅ **Bordures épaisses** : 2px minimum en noir
- ✅ **Boutons** : Bordures 2px + poids `700`
- ✅ **Focus visible** : Ring rouge 4px
- ✅ **Couleurs principales** : Bleu (`rgb(0, 0, 255)`) et Rouge (`rgb(255, 0, 0)`)

**Fichier CSS** : `src/index.css` (classes `.high-contrast`)

---

### 7. **Annonces Vocales (Screen Reader)**

Toutes les actions importantes sont annoncées vocalement :

- ✅ **Connexion réussie** : "Connexion réussie. Bienvenue {nom}"
- ✅ **Réservation** : "Réservation réussie ! Votre code PIN est {pin}. Notez-le bien"
- ✅ **Erreurs** : Messages d'erreur annoncés en priorité assertive
- ✅ **Timer critique** : "Attention : {temps} restantes avant déconnexion"
- ✅ **Changements d'onglets** : "Onglet {nom} sélectionné"
- ✅ **Paramètres** : "Paramètres d'accessibilité ouverts"

**Implementation** :
```tsx
const { announce } = useAccessibility();

announce('Message pour le lecteur d\'écran', 'assertive'); // Priorité haute
announce('Message informatif', 'polite'); // Priorité normale
```

---

### 8. **Indicateurs Visuels Améliorés**

- ✅ **États de focus** : Ring bleu 4px (rouge en mode contraste)
- ✅ **États de chargement** : Spinner avec `aria-label`
- ✅ **Messages d'erreur** : Encadrés avec `role="alert"` et `aria-live="assertive"`
- ✅ **Messages de succès** : Encadrés avec `role="status"` et `aria-live="polite"`
- ✅ **Timer** : Indicateur de temps avec `role="timer"` et `aria-live="polite"`

---

## 📁 Fichiers Modifiés

### Nouveaux Fichiers

1. ✅ `src/contexts/AccessibilityContext.tsx` - Contexte d'accessibilité
2. ✅ `src/components/kiosk/KioskAccessibilitySettings.tsx` - Panneau de paramètres
3. ✅ `docs/KIOSK_ACCESSIBILITY.md` - Documentation (ce fichier)

### Fichiers Améliorés

1. ✅ `src/components/kiosk/KioskMode.tsx`
   - Intégration du contexte d'accessibilité
   - Raccourcis clavier (Alt+S, Ctrl+/Cmd+ +/-, etc.)
   - Annonces vocales
   - Attributs ARIA

2. ✅ `src/components/kiosk/KioskLogin.tsx`
   - Attributs ARIA complets
   - Annonces vocales pour erreurs et succès
   - Focus visible amélioré

3. ✅ `src/components/kiosk/KioskDashboard.tsx`
   - Navigation par onglets accessible (role="tab")
   - Tailles de texte adaptatives
   - Annonces vocales pour changements d'onglets

4. ✅ `src/components/kiosk/KioskLotsList.tsx`
   - Code PIN ultra-lisible (jusqu'à 160px)
   - Tailles de texte adaptatives
   - Annonces vocales pour réservations

5. ✅ `src/index.css`
   - Classes `.high-contrast` pour le mode contraste élevé
   - Classes `.sr-only` pour les lecteurs d'écran
   - Focus visible amélioré

---

## 🎯 Conformité WCAG 2.1

### Niveau AA ✅

| Critère | Status | Implémentation |
|---------|--------|----------------|
| **1.4.3 Contraste minimum** | ✅ | Mode contraste élevé + ratios >= 4.5:1 |
| **1.4.4 Redimensionnement du texte** | ✅ | Zoom jusqu'à 200% sans perte de fonctionnalité |
| **2.1.1 Clavier** | ✅ | Tous les éléments accessibles au clavier |
| **2.4.7 Focus visible** | ✅ | Ring de focus 4px visible |
| **3.2.4 Identification cohérente** | ✅ | Labels et noms cohérents |
| **4.1.2 Nom, rôle, valeur** | ✅ | Attributs ARIA complets |

---

## 🧪 Tests d'Accessibilité

### Lecteurs d'écran testés

- ✅ **NVDA** (Windows)
- ✅ **JAWS** (Windows)
- ✅ **VoiceOver** (macOS/iOS)
- ✅ **TalkBack** (Android)

### Navigation au clavier

- ✅ Tab : Navigation entre tous les éléments
- ✅ Espace/Entrée : Activation des boutons
- ✅ Échap : Fermeture des modals
- ✅ Alt+S : Ouverture des paramètres d'accessibilité

### Test de zoom

- ✅ **100%** : Affichage normal
- ✅ **150%** : Mode grand texte activé
- ✅ **200%** : Zoom maximum avec scroll si nécessaire

---

## 📱 Utilisation

### Pour les utilisateurs

1. **Ouvrir les paramètres** : Cliquer sur le bouton "Accessibilité" en haut ou appuyer sur `Alt + S`
2. **Activer le grand texte** : Basculer l'interrupteur "Texte agrandi"
3. **Activer le contraste élevé** : Basculer l'interrupteur "Contraste élevé"
4. **Ajuster la taille** : Utiliser les boutons +/- ou les raccourcis `Ctrl/Cmd + +/-`
5. **Réinitialiser** : Cliquer sur "Réinitialiser" si nécessaire

### Pour les développeurs

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function MyComponent() {
  const { announce, largeText, highContrast, fontSize } = useAccessibility();
  
  return (
    <div className={highContrast ? 'high-contrast' : ''}>
      <p className={largeText ? 'text-xl' : 'text-base'}>
        Texte adaptatif
      </p>
      <button onClick={() => announce('Action effectuée')}>
        Action
      </button>
    </div>
  );
}
```

---

## 🚀 Améliorations Futures

- [ ] Support de la navigation vocale (commandes vocales)
- [ ] Mode daltonisme (filtres de couleur)
- [ ] Réduction de l'animation (`prefers-reduced-motion`)
- [ ] Mode sombre avec contraste élevé
- [ ] Taille minimale des zones tactiles (44x44px)

---

## 📞 Support

Pour toute question ou problème d'accessibilité :
1. Vérifier les paramètres d'accessibilité dans le mode kiosque
2. Tester avec un lecteur d'écran
3. Vérifier la conformité WCAG avec un outil de test (axe DevTools, WAVE, etc.)

---

**Créé** : Janvier 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready

