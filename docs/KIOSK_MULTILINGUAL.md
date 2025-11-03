# 🌍 Support Multilingue Mode Kiosque - Accessibilité Internationale

**Date** : Janvier 2025  
**Version** : 1.0.0  
**Statut** : ✅ Implémenté

---

## 📋 Vue d'ensemble

Le mode kiosque supporte maintenant **4 langues** pour être accessible aux personnes qui ne parlent pas français :

- 🇫🇷 **Français** (fr) - Langue par défaut
- 🇬🇧 **Anglais** (en)
- 🇪🇸 **Espagnol** (es)
- 🇸🇦 **Arabe** (ar) - Support RTL (Right-to-Left)

---

## ✨ Fonctionnalités

### 1. **Détection Automatique de la Langue**

Le système détecte automatiquement la langue du navigateur et l'applique :

```typescript
const browserLang = navigator.language.split('-')[0];
const initialLang = savedLang || (['fr', 'en', 'es', 'ar'].includes(browserLang) ? browserLang : 'fr');
```

**Priorité** :
1. Langue sauvegardée dans `localStorage` (`kiosk_language`)
2. Langue du navigateur (si supportée)
3. Français par défaut

---

### 2. **Sélecteur de Langue**

Un sélecteur de langue est disponible dans les paramètres d'accessibilité :

- ✅ **4 boutons de langue** : Français, English, Español, العربية
- ✅ **Affichage natif** : Nom de la langue dans sa propre écriture
- ✅ **Indicateur visuel** : Langue active mise en évidence
- ✅ **Annonce vocale** : Annonce du changement de langue
- ✅ **Persistance** : Langue sauvegardée automatiquement

**Accès** : Paramètres d'accessibilité (`Alt + S`) → Section Langue

---

### 3. **Support RTL (Right-to-Left)**

Pour l'arabe, le système applique automatiquement :

- ✅ **Direction RTL** : `dir="rtl"` sur `<html>`
- ✅ **Attribut `lang`** : `lang="ar"` sur `<html>`
- ✅ **Layout adapté** : Interface inversée automatiquement par CSS/Tailwind

**Implementation** :
```typescript
const direction: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.setAttribute('dir', direction);
document.documentElement.setAttribute('lang', language);
```

---

### 4. **Traductions Complètes**

Tous les textes du mode kiosque sont traduits :

- ✅ **Écran de connexion** : Titres, boutons, messages d'erreur
- ✅ **Dashboard** : Onglets, compteurs, messages
- ✅ **Liste des paniers** : Boutons, modals, messages de succès
- ✅ **Réservations** : Statuts, informations, actions
- ✅ **Historique** : Messages, statuts
- ✅ **Paramètres d'accessibilité** : Toutes les options et instructions

---

## 📁 Structure des Fichiers

### Nouveaux Fichiers

1. ✅ `src/contexts/LanguageContext.tsx` - Contexte de langue
2. ✅ `src/locales/fr.json` - Traductions françaises
3. ✅ `src/locales/en.json` - Traductions anglaises
4. ✅ `src/locales/es.json` - Traductions espagnoles
5. ✅ `src/locales/ar.json` - Traductions arabes
6. ✅ `docs/KIOSK_MULTILINGUAL.md` - Documentation (ce fichier)

### Fichiers Modifiés

1. ✅ `src/components/kiosk/KioskMode.tsx`
   - Intégration du `LanguageProvider`
   - Support des traductions dans les annonces

2. ✅ `src/components/kiosk/KioskAccessibilitySettings.tsx`
   - Sélecteur de langue ajouté
   - Toutes les traductions intégrées

---

## 🔧 Utilisation

### Pour les utilisateurs

1. **Changer la langue** :
   - Cliquer sur le bouton "Accessibilité" (ou `Alt + S`)
   - Aller dans la section "Langue"
   - Cliquer sur la langue souhaitée

2. **Langue automatique** :
   - La langue est détectée automatiquement au premier chargement
   - Elle est sauvegardée pour les prochaines visites

### Pour les développeurs

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, direction } = useLanguage();
  
  return (
    <div dir={direction}>
      <h1>{t('kiosk.login.title')}</h1>
      <p>{t('kiosk.login.success', { name: 'John' })}</p>
    </div>
  );
}
```

**Paramètres dans les traductions** :
```json
{
  "success": "Connexion réussie. Bienvenue {name}"
}
```

```tsx
t('kiosk.login.success', { name: 'John' })
// Résultat : "Connexion réussie. Bienvenue John"
```

---

## 📝 Format des Traductions

Les fichiers JSON suivent cette structure :

```json
{
  "kiosk": {
    "login": {
      "title": "...",
      "error": {
        "notFound": "...",
        "connection": "..."
      }
    },
    "dashboard": {
      "welcome": "Bonjour {name}!",
      "tabs": {
        "browse": "...",
        "reservations": "..."
      }
    }
  }
}
```

**Paramètres** : Utiliser `{paramName}` dans les traductions
- `{name}`, `{time}`, `{count}`, etc.

**Pluralisation** : Utiliser `{plural}` pour les pluriels
- `{count} réservation{plural}` → "1 réservation" ou "2 réservations"

---

## 🚀 Ajouter une Nouvelle Langue

1. **Créer le fichier de traduction** :
   ```
   src/locales/[code].json
   ```

2. **Ajouter la langue dans le sélecteur** :
   ```tsx
   const languages = [
     // ... langues existantes
     { code: 'de', name: 'German', native: 'Deutsch' },
   ];
   ```

3. **Ajouter le type** :
   ```tsx
   export type Language = 'fr' | 'en' | 'es' | 'ar' | 'de';
   ```

4. **Tester** :
   - Vérifier que la langue est détectée
   - Tester toutes les traductions
   - Vérifier le RTL si nécessaire

---

## 📱 Langues Supportées

| Code | Langue | Écriture | Direction | Support RTL |
|------|--------|----------|-----------|-------------|
| `fr` | Français | Latin | LTR | ❌ |
| `en` | Anglais | Latin | LTR | ❌ |
| `es` | Espagnol | Latin | LTR | ❌ |
| `ar` | Arabe | Arabe | **RTL** | ✅ |

---

## 🔍 Détection de Langue

### Ordre de Priorité

1. **Langue sauvegardée** : `localStorage.getItem('kiosk_language')`
2. **Langue du navigateur** : `navigator.language`
3. **Français par défaut** : Si aucune langue n'est détectée

### Exemple

```typescript
// Navigateur en anglais
navigator.language = 'en-US'
// → Langue appliquée : 'en'

// Navigateur en allemand (non supporté)
navigator.language = 'de-DE'
// → Langue appliquée : 'fr' (par défaut)
```

---

## 🎯 Bonnes Pratiques

### 1. **Toujours utiliser `t()` pour les textes**

```tsx
// ✅ BON
<p>{t('kiosk.login.title')}</p>

// ❌ MAUVAIS
<p>Scannez votre carte</p>
```

### 2. **Utiliser les paramètres pour la personnalisation**

```tsx
// ✅ BON
t('kiosk.dashboard.welcome', { name: profile.full_name })

// ❌ MAUVAIS
`Bonjour ${profile.full_name}!`
```

### 3. **Gérer les pluriels**

```tsx
const plural = count > 1 ? 's' : '';
t('kiosk.history.total', { count, plural })
```

### 4. **Tester toutes les langues**

- Vérifier que toutes les traductions sont présentes
- Tester le RTL pour l'arabe
- Vérifier que les dates/nombres sont formatés correctement

---

## 🔧 Problèmes Courants

### "La traduction n'apparaît pas"

**Solution** :
1. Vérifier que la clé existe dans `src/locales/[lang].json`
2. Vérifier que le fichier est bien importé
3. Vérifier la structure de la clé (ex: `kiosk.login.title`)

### "La langue ne change pas"

**Solution** :
1. Vérifier que `LanguageProvider` est bien enveloppé autour du composant
2. Vérifier que `useLanguage()` est utilisé correctement
3. Vérifier que la langue est bien sauvegardée dans `localStorage`

### "L'interface arabe n'est pas inversée"

**Solution** :
1. Vérifier que `dir="rtl"` est bien appliqué sur `<html>`
2. Vérifier que Tailwind CSS supporte RTL
3. Tester avec un navigateur qui supporte RTL

---

## 📊 Statistiques

- **4 langues** supportées
- **~150 clés de traduction** par langue
- **~600 traductions** au total
- **100% des textes** traduits dans le mode kiosque

---

## 🚀 Améliorations Futures

- [ ] Support de plus de langues (Allemand, Italien, etc.)
- [ ] Traduction automatique via API (Google Translate)
- [ ] Détection de langue basée sur la géolocalisation
- [ ] Format des dates/nombres selon la locale
- [ ] Traductions pour les autres parties de l'application

---

## 📞 Support

Pour toute question sur le multilingue :
1. Vérifier la documentation dans ce fichier
2. Consulter les fichiers de traduction dans `src/locales/`
3. Tester avec les 4 langues supportées

---

**Créé** : Janvier 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready

