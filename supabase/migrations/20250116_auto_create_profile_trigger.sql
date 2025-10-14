-- Migration pour configurer la création automatique du profil
-- Date: 2025-01-16
-- Description: Fonction utilitaire pour créer des profils utilisateur
--              Note: Les triggers sur auth.users ne sont pas possibles directement
--              La création du profil se fait dans le code (authStore.ts)

-- Cette migration est intentionnellement vide mais documentée pour traçabilité
-- Le profil est créé automatiquement par le code frontend lors de l'inscription

-- Pour une solution avec trigger automatique, il faut :
-- 1. Aller dans Supabase Dashboard
-- 2. Authentication > Settings > Email Auth
-- 3. Décocher "Enable email confirmations" (dev seulement)
-- OU
-- 4. Utiliser une Database Webhook Supabase (Dashboard > Database > Webhooks)
--    - Événement: INSERT sur auth.users
--    - URL: Edge Function qui crée le profil

-- La création du profil se fait maintenant en deux étapes dans authStore.ts:
-- 1. supabase.auth.signUp avec options.data (métadonnées)
-- 2. supabase.from('profiles').insert (création explicite du profil)

-- Commentaire pour documentation
COMMENT ON SCHEMA public IS 'Schéma public contenant les tables de l''application EcoPanier';

