# 🔧 Configuration des Variables d'Environnement - EcoPanier

## 📋 Variables requises

### 1. Créer le fichier `.env`

À la racine du projet, créez un fichier nommé **`.env`** (sans extension) :

```bash
# Dans le terminal, à la racine du projet
touch .env
```

### 2. Ajouter les variables

Copiez et collez le contenu suivant dans votre fichier `.env` :

```env
# ===================================
# CONFIGURATION ECOPANIER
# ===================================

# Supabase Configuration (OBLIGATOIRE)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-publique

# Mapbox Configuration (REQUIS pour la carte interactive)
# Obtenez votre token gratuit sur: https://account.mapbox.com/access-tokens/
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiVOTRE_USERNAME_MAPBOX

# Gemini AI Configuration (OPTIONNEL, pour l'analyse d'images)
# Obtenez votre clé sur: https://ai.google.dev/
VITE_GEMINI_API_KEY=votre-cle-gemini-api
```

---

## 🔑 Obtenir les clés API

### Supabase (Obligatoire)

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter / Créer un compte
3. Créer un nouveau projet
4. Aller dans **Settings** → **API**
5. Copier :
   - **URL** : `VITE_SUPABASE_URL`
   - **anon public** : `VITE_SUPABASE_ANON_KEY`

### Mapbox (Requis pour la carte)

1. Aller sur [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)
2. Créer un compte gratuit
3. Aller dans [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copier le **Default public token** (commence par `pk.`)
5. Ou créer un nouveau token avec les scopes :
   - ✅ `styles:read`
   - ✅ `fonts:read`
   - ✅ `geocoding:read`

**Plan gratuit** : 50,000 chargements de carte + 100,000 géocodages par mois

### Gemini AI (Optionnel)

1. Aller sur [https://ai.google.dev/](https://ai.google.dev/)
2. Cliquer sur **Get API Key**
3. Créer une clé API
4. Copier la clé

**Plan gratuit** : 60 requêtes par minute

---

## ✅ Vérifier la configuration

### Test 1 : Supabase

```typescript
// Dans la console du navigateur (F12)
console.log(import.meta.env.VITE_SUPABASE_URL);
// Devrait afficher votre URL Supabase
```

### Test 2 : Mapbox

```typescript
// Dans la console du navigateur
console.log(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
// Devrait afficher votre token Mapbox (commence par pk.)
```

### Test 3 : Gemini (si configuré)

```typescript
// Dans la console
console.log(import.meta.env.VITE_GEMINI_API_KEY);
// Devrait afficher votre clé Gemini
```

---

## 🚨 Important

### ⚠️ Sécurité

1. **JAMAIS** commiter le fichier `.env` sur Git
2. Le fichier `.env` est déjà dans `.gitignore`
3. Ne partagez jamais vos clés API publiquement
4. Utilisez des clés différentes pour dev/prod

### 🔄 Redémarrage nécessaire

Après avoir modifié le fichier `.env`, **redémarrez le serveur de développement** :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

---

## 🐛 Dépannage

### Problème : Variables non chargées

**Symptômes** :
```
undefined
ou
Configuration requise
```

**Solutions** :

1. **Vérifier le nom du fichier** : Doit être exactement `.env` (avec le point)
2. **Vérifier l'emplacement** : Doit être à la **racine** du projet
3. **Vérifier le préfixe** : Toutes les variables doivent commencer par `VITE_`
4. **Redémarrer** : Stopper et relancer `npm run dev`
5. **Vérifier le contenu** :
   ```bash
   cat .env
   # Devrait afficher le contenu
   ```

### Problème : Token Mapbox invalide

**Erreur** :
```
401 Unauthorized
```

**Solutions** :
1. Vérifier que le token commence par `pk.`
2. Vérifier qu'il n'y a pas d'espaces avant/après
3. Créer un nouveau token sur Mapbox
4. Vérifier que le token est **Public** (pas Secret)

---

## 📝 Exemple complet

Voici un exemple avec de vraies clés (fictives) :

```env
# Supabase
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NzYwMDB9.abcdef123456

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbHh5ejEyM2QwMXVrMnZzOGx5djJrNm9xIn0.abc123def456

# Gemini (optionnel)
VITE_GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnop
```

---

## 🎯 Checklist finale

Avant de lancer l'application :

- [ ] Fichier `.env` créé à la racine
- [ ] Variable `VITE_SUPABASE_URL` configurée
- [ ] Variable `VITE_SUPABASE_ANON_KEY` configurée
- [ ] Variable `VITE_MAPBOX_ACCESS_TOKEN` configurée (pour carte)
- [ ] Variable `VITE_GEMINI_API_KEY` configurée (optionnel)
- [ ] Serveur redémarré après modification
- [ ] Variables visibles dans la console (test)
- [ ] Fichier `.env` **NON** committé sur Git

---

<div align="center">

**Configuration terminée ! Vous pouvez maintenant lancer l'application 🚀**

```bash
npm run dev
```

</div>

