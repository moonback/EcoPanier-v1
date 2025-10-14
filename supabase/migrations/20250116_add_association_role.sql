-- Migration pour ajouter le rôle 'association' à la contrainte de vérification
-- Date: 2025-01-16
-- Description: Modifie la contrainte CHECK de la table profiles pour autoriser le rôle 'association'

-- Supprimer l'ancienne contrainte
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ajouter la nouvelle contrainte avec 'association' inclus
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'merchant', 'beneficiary', 'collector', 'admin', 'association'));

-- Commentaire pour la documentation
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 
'Contrainte de vérification pour les rôles utilisateur autorisés: customer, merchant, beneficiary, collector, admin, association';

