-- Script pour insérer des données d'exemple pour les paniers suspendus
-- À EXÉCUTER APRÈS avoir créé des utilisateurs de test

-- Insertion de paniers suspendus d'exemple
-- Note: Remplacez les UUIDs par ceux de vos utilisateurs réels

DO $$
DECLARE
  v_customer_id UUID;
  v_merchant_id UUID;
  v_beneficiary_id UUID;
BEGIN
  -- Récupérer un client (donateur)
  SELECT id INTO v_customer_id 
  FROM profiles 
  WHERE role = 'customer' 
  LIMIT 1;

  -- Récupérer un commerçant
  SELECT id INTO v_merchant_id 
  FROM profiles 
  WHERE role = 'merchant' 
  LIMIT 1;

  -- Récupérer un bénéficiaire
  SELECT id INTO v_beneficiary_id 
  FROM profiles 
  WHERE role = 'beneficiary' 
  LIMIT 1;

  -- Vérifier que nous avons les utilisateurs nécessaires
  IF v_customer_id IS NOT NULL AND v_merchant_id IS NOT NULL THEN
    
    -- Panier disponible 1
    INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status)
    VALUES (v_customer_id, v_merchant_id, 5.00, 'available');

    -- Panier disponible 2
    INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status)
    VALUES (v_customer_id, v_merchant_id, 5.00, 'available');

    -- Panier disponible 3
    INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status)
    VALUES (v_customer_id, v_merchant_id, 10.00, 'available');

    IF v_beneficiary_id IS NOT NULL THEN
      -- Panier récupéré
      INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status, claimed_by, claimed_at)
      VALUES (
        v_customer_id, 
        v_merchant_id, 
        5.00, 
        'claimed',
        v_beneficiary_id,
        NOW() - INTERVAL '2 hours'
      );

      -- Panier réservé
      INSERT INTO suspended_baskets (donor_id, merchant_id, amount, status, claimed_by)
      VALUES (
        v_customer_id, 
        v_merchant_id, 
        7.50, 
        'reserved',
        v_beneficiary_id
      );
    END IF;

    RAISE NOTICE 'Données d''exemple insérées avec succès!';
  ELSE
    RAISE NOTICE 'Impossible d''insérer les données: utilisateurs manquants. Créez d''abord un client et un commerçant.';
  END IF;
END $$;

-- Fonction helper pour créer un panier suspendu
CREATE OR REPLACE FUNCTION create_suspended_basket(
  p_donor_id UUID,
  p_merchant_id UUID,
  p_amount DECIMAL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_basket_id UUID;
BEGIN
  INSERT INTO suspended_baskets (donor_id, merchant_id, amount, notes, status)
  VALUES (p_donor_id, p_merchant_id, p_amount, p_notes, 'available')
  RETURNING id INTO v_basket_id;
  
  RETURN v_basket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour qu'un bénéficiaire récupère un panier
CREATE OR REPLACE FUNCTION claim_suspended_basket(
  p_basket_id UUID,
  p_beneficiary_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_basket_status TEXT;
BEGIN
  -- Vérifier le statut du panier
  SELECT status INTO v_basket_status
  FROM suspended_baskets
  WHERE id = p_basket_id;

  IF v_basket_status IS NULL THEN
    RAISE EXCEPTION 'Panier non trouvé';
  END IF;

  IF v_basket_status != 'available' THEN
    RAISE EXCEPTION 'Ce panier n''est pas disponible';
  END IF;

  -- Mettre à jour le panier
  UPDATE suspended_baskets
  SET 
    status = 'claimed',
    claimed_by = p_beneficiary_id,
    claimed_at = NOW()
  WHERE id = p_basket_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour réserver un panier (étape intermédiaire)
CREATE OR REPLACE FUNCTION reserve_suspended_basket(
  p_basket_id UUID,
  p_beneficiary_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_basket_status TEXT;
BEGIN
  -- Vérifier le statut du panier
  SELECT status INTO v_basket_status
  FROM suspended_baskets
  WHERE id = p_basket_id;

  IF v_basket_status IS NULL THEN
    RAISE EXCEPTION 'Panier non trouvé';
  END IF;

  IF v_basket_status != 'available' THEN
    RAISE EXCEPTION 'Ce panier n''est pas disponible';
  END IF;

  -- Réserver le panier
  UPDATE suspended_baskets
  SET 
    status = 'reserved',
    claimed_by = p_beneficiary_id
  WHERE id = p_basket_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON FUNCTION create_suspended_basket IS 'Crée un nouveau panier suspendu';
COMMENT ON FUNCTION claim_suspended_basket IS 'Permet à un bénéficiaire de récupérer un panier';
COMMENT ON FUNCTION reserve_suspended_basket IS 'Réserve un panier pour un bénéficiaire';

