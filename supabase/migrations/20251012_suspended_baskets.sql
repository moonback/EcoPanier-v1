-- Création de la table pour les paniers suspendus
CREATE TABLE IF NOT EXISTS suspended_baskets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informations du donateur
  donor_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Informations du commerce
  merchant_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Informations de la réservation liée (optionnel si don direct)
  reservation_id UUID REFERENCES reservations(id),
  
  -- Montant du don
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  
  -- Informations du bénéficiaire
  claimed_by UUID REFERENCES profiles(id),
  claimed_at TIMESTAMPTZ,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'claimed', 'expired')),
  
  -- Métadonnées
  notes TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_donor ON suspended_baskets(donor_id);
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_merchant ON suspended_baskets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_claimed_by ON suspended_baskets(claimed_by);
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_status ON suspended_baskets(status);
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_created_at ON suspended_baskets(created_at DESC);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_suspended_baskets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_suspended_baskets_updated_at ON suspended_baskets;
CREATE TRIGGER trigger_update_suspended_baskets_updated_at
  BEFORE UPDATE ON suspended_baskets
  FOR EACH ROW
  EXECUTE FUNCTION update_suspended_baskets_updated_at();

-- Fonction pour marquer les paniers expirés
CREATE OR REPLACE FUNCTION mark_expired_suspended_baskets()
RETURNS void AS $$
BEGIN
  UPDATE suspended_baskets
  SET status = 'expired'
  WHERE status = 'available'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Vue enrichie avec les informations des utilisateurs
CREATE OR REPLACE VIEW suspended_baskets_view AS
SELECT 
  sb.id,
  sb.amount,
  sb.status,
  sb.created_at,
  sb.claimed_at,
  sb.expires_at,
  sb.notes,
  
  -- Informations du donateur
  donor.id as donor_id,
  donor.full_name as donor_name,
  donor.phone as donor_phone,
  
  -- Informations du commerçant
  merchant.id as merchant_id,
  merchant.full_name as merchant_name,
  merchant.business_name as merchant_business_name,
  merchant.business_address as merchant_address,
  
  -- Informations du bénéficiaire
  beneficiary.id as beneficiary_id,
  beneficiary.full_name as beneficiary_name,
  beneficiary.beneficiary_id as beneficiary_code
  
FROM suspended_baskets sb
LEFT JOIN profiles donor ON sb.donor_id = donor.id
LEFT JOIN profiles merchant ON sb.merchant_id = merchant.id
LEFT JOIN profiles beneficiary ON sb.claimed_by = beneficiary.id;

-- Row Level Security
ALTER TABLE suspended_baskets ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres paniers suspendus (donnés ou reçus)
CREATE POLICY "Users can view their suspended baskets"
  ON suspended_baskets
  FOR SELECT
  TO authenticated
  USING (
    donor_id = auth.uid() 
    OR claimed_by = auth.uid()
    OR merchant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'beneficiary')
    )
  );

-- Seuls les clients authentifiés peuvent créer des paniers suspendus
CREATE POLICY "Authenticated users can create suspended baskets"
  ON suspended_baskets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    donor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('customer', 'admin')
    )
  );

-- Seuls les bénéficiaires et admins peuvent réserver/récupérer
CREATE POLICY "Beneficiaries can claim baskets"
  ON suspended_baskets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('beneficiary', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('beneficiary', 'admin')
    )
  );

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete baskets"
  ON suspended_baskets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insertion de quelques exemples (optionnel - à supprimer en production)
-- INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status) 
-- SELECT 
--   (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
--   (SELECT id FROM profiles WHERE role = 'merchant' LIMIT 1),
--   5.0,
--   'available'
-- WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
--   AND EXISTS (SELECT 1 FROM profiles WHERE role = 'merchant');

-- Commentaires pour documentation
COMMENT ON TABLE suspended_baskets IS 'Paniers suspendus offerts par les clients aux bénéficiaires';
COMMENT ON COLUMN suspended_baskets.donor_id IS 'ID du client qui offre le panier';
COMMENT ON COLUMN suspended_baskets.merchant_id IS 'ID du commerçant chez qui le panier peut être récupéré';
COMMENT ON COLUMN suspended_baskets.claimed_by IS 'ID du bénéficiaire qui a récupéré le panier';
COMMENT ON COLUMN suspended_baskets.amount IS 'Montant du don en euros';
COMMENT ON COLUMN suspended_baskets.status IS 'Statut: available, reserved, claimed, expired';

