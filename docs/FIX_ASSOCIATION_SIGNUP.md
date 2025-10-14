# 🔧 Guide de résolution : Inscription Association

## 🎯 Problème

L'inscription d'une association ne crée pas automatiquement le profil dans la base de données.

## ⚡ Solution rapide (3 minutes)

### Étape 1 : Désactiver la confirmation d'email dans Supabase

1. **Ouvrez votre Dashboard Supabase** : https://app.supabase.com
2. **Sélectionnez votre projet** EcoPanier
3. Dans le menu de gauche, cliquez sur **"Authentication"**
4. Cliquez sur **"Email Auth"** (ou "Providers" > "Email")
5. **Décochez** la case **"Enable email confirmations"** ❌
6. Cliquez sur **"Save"** en bas de la page

✅ **C'est fait !** Maintenant les utilisateurs peuvent s'inscrire sans confirmation d'email.

### Étape 2 : Tester l'inscription

1. Ouvrez votre application : http://localhost:3001
2. Cliquez sur **"Inscription"**
3. Sélectionnez le rôle **🏛️ Association**
4. Remplissez le formulaire :
   - Email : `test-asso@example.com`
   - Mot de passe : `test123`
   - Nom complet : `Jean Dupont`
   - Nom de l'association : `Restos du Cœur`
   - Adresse de l'association : `1 rue de Paris, 75001`
5. Cliquez sur **"Créer mon compte gratuitement"**

### Étape 3 : Vérifier que ça fonctionne

1. Dans Supabase Dashboard, allez dans **"Table Editor"** > **"profiles"**
2. Vous devriez voir le nouveau profil créé avec :
   - ✅ `role` = `association`
   - ✅ `business_name` = `Restos du Cœur`
   - ✅ `full_name` = `Jean Dupont`

## 🔍 Si ça ne fonctionne toujours pas

### Vérification 1 : L'utilisateur existe ?

Dans l'éditeur SQL de Supabase :
```sql
SELECT * FROM auth.users WHERE email = 'test-asso@example.com';
```

Si **NON** → Le problème vient de l'inscription Supabase Auth
Si **OUI** → Passez à la vérification 2

### Vérification 2 : Le profil existe ?

```sql
SELECT * FROM profiles WHERE id = 'USER_ID_ICI';
```
(Remplacez USER_ID_ICI par l'ID de l'utilisateur de la vérification 1)

Si **NON** → Le problème vient de la création du profil

### Vérification 3 : Y a-t-il des erreurs dans la console ?

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet **"Console"**
3. Tentez une nouvelle inscription
4. Cherchez les messages d'erreur en rouge

**Erreur courante** :
```
Error creating profile: duplicate key value violates unique constraint
```
→ Le profil existe déjà, essayez avec un autre email

### Vérification 4 : RLS est-il activé sur la table profiles ?

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
```

Si `rowsecurity` = `true` (RLS activé), désactivez-le temporairement :
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

⚠️ En production, créez plutôt une policy :
```sql
CREATE POLICY "Allow insert during signup" ON profiles
FOR INSERT WITH CHECK (true);
```

## 🛠️ Solution manuelle (si urgence)

Si vous devez créer un profil manuellement pour tester :

```sql
INSERT INTO profiles (
  id,
  role,
  full_name,
  business_name,
  business_address,
  verified,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_FROM_AUTH_USERS',  -- ID de auth.users
  'association',
  'Jean Dupont',
  'Restos du Cœur',
  '1 rue de Paris, 75001',
  false,
  NOW(),
  NOW()
);
```

## 📊 Tableau de diagnostic

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| Aucun utilisateur créé | Email confirmation activée | Désactiver dans Dashboard |
| Utilisateur créé, pas de profil | Erreur dans l'insert | Vérifier logs console |
| Erreur "duplicate key" | Profil déjà existant | Utiliser un autre email |
| Erreur "permission denied" | RLS bloquant | Désactiver RLS ou créer policy |

## ✅ Checklist finale

Avant de dire que ça marche :

- [ ] Email confirmation désactivée dans Supabase
- [ ] Inscription d'une association réussie
- [ ] Profil créé dans la table `profiles`
- [ ] Connexion possible avec les credentials
- [ ] Dashboard association s'affiche correctement
- [ ] Aucune erreur dans la console

## 📞 Besoin d'aide supplémentaire ?

1. Consultez les logs Supabase : **Dashboard** > **Logs** > **Auth Logs**
2. Vérifiez la console navigateur (F12)
3. Relisez `docs/SUPABASE_CONFIG.md`

---

**Note importante pour la production** : 
- ✅ Réactivez la confirmation d'email
- ✅ Créez une Database Webhook pour auto-créer les profils
- ✅ Activez RLS avec les bonnes policies

