/*
  # Merchant Subscription System

  ## Objectifs
  - Ajouter des colonnes d'abonnement sur le profil commerçant
  - Permettre le suivi des historiques d'abonnement et paiements associés
  - Étendre les transactions de wallet pour référencer un abonnement
*/

-- Ajouter les colonnes d'abonnement sur les profils
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none'
  CHECK (subscription_status IN ('none', 'active', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_plan text,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Initialiser les anciennes données sans abonnement
UPDATE profiles
SET subscription_status = 'none',
    subscription_plan = NULL,
    subscription_expires_at = NULL
WHERE subscription_status IS NULL;

-- Créer la table d'historique des abonnements commerçants
CREATE TABLE IF NOT EXISTS merchant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  wallet_transaction_id uuid REFERENCES wallet_transactions(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour accélérer les requêtes par commerçant
CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_merchant_id
  ON merchant_subscriptions(merchant_id);

CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_status
  ON merchant_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_starts_at
  ON merchant_subscriptions(starts_at DESC);

-- Fonction pour maintenir updated_at
CREATE OR REPLACE FUNCTION update_merchant_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur BEFORE UPDATE
DROP TRIGGER IF EXISTS trigger_update_merchant_subscription_updated_at ON merchant_subscriptions;
CREATE TRIGGER trigger_update_merchant_subscription_updated_at
  BEFORE UPDATE ON merchant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_subscription_updated_at();

-- Étendre la contrainte sur reference_type des transactions de wallet
ALTER TABLE wallet_transactions
DROP CONSTRAINT IF EXISTS wallet_transactions_reference_type_check;

ALTER TABLE wallet_transactions
ADD CONSTRAINT wallet_transactions_reference_type_check
CHECK (reference_type IN ('reservation', 'suspended_basket', 'mission', 'subscription'));

-- Désactiver la RLS conformément aux conventions du projet
ALTER TABLE merchant_subscriptions DISABLE ROW LEVEL SECURITY;


