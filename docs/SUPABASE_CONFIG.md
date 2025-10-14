# Configuration Supabase pour EcoPanier

## 🔧 Configuration de l'authentification

### ⚠️ Problème : Le profil ne se crée pas automatiquement

Par défaut, Supabase exige que les utilisateurs confirment leur email avant que leur compte soit pleinement créé. Cela peut empêcher la création du profil.

## ✅ Solution : Désactiver la confirmation d'email (OBLIGATOIRE pour le développement)

### Étapes à suivre dans Supabase Dashboard :

1. **Allez dans votre projet Supabase**
2. **Cliquez sur "Authentication"** dans le menu de gauche
3. **Cliquez sur "Email Auth"** dans les paramètres
4. **Trouvez "Enable email confirmations"**
5. **DÉCOCHEZ cette option** ❌
6. **Cliquez sur "Save"**

![Configuration Email Auth](https://supabase.com/docs/img/guides/auth/email-confirmation.png)

⚠️ **Important** : 
- En **développement** : Cette option DOIT être décochée
- En **production** : Réactivez-la pour la sécurité

### Alternative : Confirmer manuellement les emails

Si vous gardez la confirmation activée, vous devez :
1. Aller dans **Authentication** > **Users**
2. Cliquer sur l'utilisateur créé
3. Cliquer sur **"Confirm Email"** manuellement

## 🔍 Pourquoi le trigger ne fonctionne pas ?

L'erreur `must be owner of relation users` signifie que :
- La table `auth.users` appartient au système Supabase
- Vous ne pouvez pas créer de triggers dessus directement
- La création du profil se fait dans le code `authStore.ts`

## 🚀 Comment fonctionne la création du profil maintenant ?

Le code dans `authStore.ts` fait ceci :

1. **Inscription** avec métadonnées :
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: profileData.role,
      full_name: profileData.full_name,
      // ... autres données
    }
  }
});
```

2. **Création du profil** :
```typescript
await supabase.from('profiles').insert({
  id: data.user.id,
  ...profileData,
  verified: false,
});
```

## 📋 Checklist de vérification

Pour qu'une association puisse s'inscrire :

- [ ] Email confirmation **DÉSACTIVÉE** dans Supabase Dashboard
- [ ] Table `profiles` créée (migration exécutée)
- [ ] Pas de RLS bloquant sur `profiles` (ou policy correcte)
- [ ] Le serveur de développement est lancé (`npm run dev`)

## 🐛 Debugging

Modifier `authStore.ts` pour passer les métadonnées lors de l'inscription :

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: profileData.role,
      full_name: profileData.full_name,
      business_name: profileData.business_name,
      business_address: profileData.business_address,
      phone: profileData.phone,
      address: profileData.address,
    }
  }
});
```

## 🔍 Vérification

Pour vérifier si le profil a été créé :

1. Allez dans **Table Editor** > **profiles**
2. Cherchez l'ID de l'utilisateur
3. Si le profil n'existe pas, créez-le manuellement pour tester

## 🐛 Debug

Si le profil ne se crée toujours pas :

1. **Vérifiez les logs Supabase** :
   - Dashboard Supabase > Logs > Auth Logs
   
2. **Vérifiez la console du navigateur** :
   - F12 > Console
   - Cherchez les erreurs "Error creating profile"

3. **Vérifiez que l'utilisateur existe** :
   ```sql
   SELECT * FROM auth.users WHERE email = 'test@example.com';
   ```

4. **Vérifiez que le profil existe** :
   ```sql
   SELECT * FROM public.profiles WHERE id = 'USER_ID';
   ```

## ✅ Checklist de configuration

- [ ] Email confirmation désactivée (dev) ou trigger créé (prod)
- [ ] Table `profiles` accessible
- [ ] RLS désactivé sur `profiles` pour l'insertion (ou policy créée)
- [ ] Métadonnées passées lors du signUp
- [ ] Logs vérifiés

---

**Note** : En production, utilisez toujours la confirmation d'email avec un trigger automatique pour créer les profils.

