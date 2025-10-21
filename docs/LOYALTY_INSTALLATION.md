# 🚀 Guide d'Installation du Système de Fidélité

## ⚠️ Erreur 406 - Tables manquantes

Si vous rencontrez l'erreur **406 (Not Acceptable)** lors de l'accès au système de fidélité, cela signifie que les tables de base de données n'ont pas encore été créées.

## 📋 Solution : Exécuter la Migration SQL

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. **Connectez-vous** à votre projet Supabase : https://app.supabase.com

2. **Accédez à l'éditeur SQL** :
   - Cliquez sur **"SQL Editor"** dans le menu de gauche
   - Ou allez directement sur : `https://app.supabase.com/project/[VOTRE_PROJECT_ID]/sql`

3. **Copiez le contenu** du fichier `supabase/migrations/20250121_loyalty_system.sql`

4. **Collez-le** dans l'éditeur SQL

5. **Exécutez la requête** en cliquant sur **"Run"** ou `Ctrl+Enter`

6. **Vérifiez la création** :
   - Allez dans **"Table Editor"**
   - Vous devriez voir 4 nouvelles tables :
     - `loyalty_programs`
     - `customer_loyalty`
     - `loyalty_rewards`
     - `loyalty_transactions`

### Méthode 2 : Via Supabase CLI

Si vous avez installé Supabase CLI :

```bash
# 1. Connectez-vous à Supabase
supabase login

# 2. Liez votre projet
supabase link --project-ref [VOTRE_PROJECT_REF]

# 3. Exécutez la migration
supabase db push
```

### Méthode 3 : Exécution Manuelle

Si vous préférez exécuter manuellement :

```bash
# 1. Installez psql (PostgreSQL client)
# Windows : https://www.postgresql.org/download/windows/
# Mac : brew install postgresql
# Linux : sudo apt-get install postgresql-client

# 2. Connectez-vous à votre base de données Supabase
psql "postgresql://postgres:[VOTRE_PASSWORD]@[VOTRE_PROJECT_REF].supabase.co:5432/postgres"

# 3. Exécutez le fichier SQL
\i supabase/migrations/20250121_loyalty_system.sql
```

## ✅ Vérification de l'Installation

### 1. Vérifier les Tables

Dans Supabase Dashboard → Table Editor, vous devriez voir :

- ✅ **loyalty_programs** (0 lignes initialement)
- ✅ **customer_loyalty** (0 lignes initialement)
- ✅ **loyalty_rewards** (0 lignes initialement)
- ✅ **loyalty_transactions** (0 lignes initialement)

### 2. Vérifier les Fonctions

Dans Supabase Dashboard → Database → Functions :

- ✅ `add_loyalty_points()`
- ✅ `redeem_loyalty_reward()`
- ✅ `calculate_customer_level()`
- ✅ `update_customer_level()`
- ✅ `update_updated_at_column()`

### 3. Tester l'Application

1. **Redémarrez** le serveur de développement :
   ```bash
   npm run dev
   ```

2. **Connectez-vous** en tant que commerçant

3. **Accédez** à l'onglet **"🎁 Fidélité"**

4. **Vous devriez voir** :
   - Dashboard de fidélité avec 0 clients
   - Onglets : Vue d'ensemble, Clients, Récompenses, Statistiques, Configuration
   - Pas d'erreur 406 !

## 🔧 Résolution de Problèmes

### Erreur : "permission denied for schema public"

**Solution** : Assurez-vous que votre utilisateur a les permissions nécessaires.

Dans l'éditeur SQL Supabase, exécutez :

```sql
-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
```

### Erreur : "function already exists"

**Solution** : Les fonctions existent déjà. Supprimez-les d'abord :

```sql
-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS add_loyalty_points CASCADE;
DROP FUNCTION IF EXISTS redeem_loyalty_reward CASCADE;
DROP FUNCTION IF EXISTS calculate_customer_level CASCADE;
DROP FUNCTION IF EXISTS update_customer_level CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Puis réexécutez la migration complète
```

### Erreur : "table already exists"

**Solution** : Les tables existent déjà. Vous pouvez :

**Option A** : Supprimer et recréer (⚠️ perte de données) :

```sql
-- ATTENTION : Ceci supprimera toutes les données !
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_rewards CASCADE;
DROP TABLE IF EXISTS customer_loyalty CASCADE;
DROP TABLE IF EXISTS loyalty_programs CASCADE;

-- Puis réexécutez la migration complète
```

**Option B** : Garder les données existantes :

Si les tables existent déjà et vous voulez garder les données, ignorez l'erreur. Les tables sont déjà créées.

## 🎯 Étapes Suivantes

Une fois la migration effectuée avec succès :

1. **Configurez** votre premier programme de fidélité :
   - Allez dans **Fidélité → Configuration**
   - Personnalisez les points par action
   - Définissez les bonus spéciaux
   - Activez le programme

2. **Créez** vos premières récompenses :
   - Allez dans **Fidélité → Récompenses**
   - Cliquez sur **"Nouvelle récompense"**
   - Définissez le nom, la description, le type et le coût en points

3. **Testez** avec un compte client :
   - Effectuez un achat
   - Vérifiez que les points sont bien attribués
   - Essayez d'échanger une récompense

## 📞 Support

Si vous rencontrez d'autres problèmes :

1. Vérifiez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Consultez la documentation : `docs/LOYALTY_SYSTEM.md`

## 🔐 Permissions RLS (Optionnel)

Pour activer Row Level Security sur les tables de fidélité (recommandé en production) :

```sql
-- Activer RLS
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Policies pour loyalty_programs
CREATE POLICY "Commerçants peuvent voir leur programme"
  ON loyalty_programs FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Commerçants peuvent gérer leur programme"
  ON loyalty_programs FOR ALL
  USING (auth.uid() = merchant_id);

-- Policies pour customer_loyalty
CREATE POLICY "Clients peuvent voir leur fidélité"
  ON customer_loyalty FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = merchant_id);

CREATE POLICY "Commerçants peuvent gérer la fidélité"
  ON customer_loyalty FOR ALL
  USING (auth.uid() = merchant_id);

-- Policies pour loyalty_rewards
CREATE POLICY "Tout le monde peut voir les récompenses actives"
  ON loyalty_rewards FOR SELECT
  USING (is_active = true OR auth.uid() = merchant_id);

CREATE POLICY "Commerçants peuvent gérer leurs récompenses"
  ON loyalty_rewards FOR ALL
  USING (auth.uid() = merchant_id);

-- Policies pour loyalty_transactions
CREATE POLICY "Clients peuvent voir leurs transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = merchant_id);

CREATE POLICY "Système peut créer des transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (true);
```

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Équipe EcoPanier
