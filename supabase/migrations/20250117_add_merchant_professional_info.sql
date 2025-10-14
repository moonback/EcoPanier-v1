/*
  # Ajout d'informations professionnelles pour les commerçants

  Cette migration ajoute des champs professionnels supplémentaires à la table profiles
  pour les commerçants et associations.

  ## Nouveaux champs
  - `siret` (text) - Numéro SIRET (14 chiffres) pour les commerçants français
  - `business_type` (text) - Type de commerce (boulangerie, restaurant, etc.)
  - `business_email` (text) - Email professionnel du commerce
  - `business_description` (text) - Description du commerce
  - `vat_number` (text) - Numéro de TVA intracommunautaire (optionnel)

  ## Notes
  - SIRET est obligatoire pour les commerçants en France
  - Les associations peuvent avoir un numéro RNA ou SIRET
*/

-- Ajouter les colonnes pour les informations professionnelles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS business_description text,
  ADD COLUMN IF NOT EXISTS vat_number text;

-- Ajouter des contraintes de validation pour le SIRET (14 chiffres)
ALTER TABLE profiles 
  ADD CONSTRAINT check_siret_format 
  CHECK (siret IS NULL OR (siret ~ '^[0-9]{14}$'));

-- Ajouter une contrainte pour l'email professionnel
ALTER TABLE profiles 
  ADD CONSTRAINT check_business_email_format 
  CHECK (business_email IS NULL OR business_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Créer un index pour rechercher par SIRET
CREATE INDEX IF NOT EXISTS idx_profiles_siret ON profiles(siret);

-- Créer un index pour rechercher par type de commerce
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);

-- Commentaires sur les colonnes
COMMENT ON COLUMN profiles.siret IS 'Numéro SIRET (14 chiffres) pour les commerçants français';
COMMENT ON COLUMN profiles.business_type IS 'Type de commerce (ex: boulangerie, restaurant, supermarché)';
COMMENT ON COLUMN profiles.business_email IS 'Email professionnel du commerce';
COMMENT ON COLUMN profiles.business_description IS 'Description détaillée du commerce';
COMMENT ON COLUMN profiles.vat_number IS 'Numéro de TVA intracommunautaire (optionnel)';

