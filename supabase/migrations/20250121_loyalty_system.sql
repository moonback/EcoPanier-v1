-- Migration pour le système de fidélité EcoPanier
-- Création des tables pour gérer les programmes de fidélité des commerçants

-- Table des programmes de fidélité par commerçant
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id)
);

-- Table des clients fidèles
CREATE TABLE IF NOT EXISTS customer_loyalty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'bronze',
  badges_earned TEXT[] DEFAULT '{}',
  total_purchases INTEGER DEFAULT 0,
  total_donations INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id, customer_id)
);

-- Table des récompenses disponibles
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('discount', 'free_item', 'priority_access', 'exclusive_content')),
  value DECIMAL(10,2) DEFAULT 0,
  points_cost INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions de fidélité
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'bonus')),
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  description TEXT,
  reference_id UUID, -- ID de la réservation, lot, etc.
  reference_type TEXT, -- 'reservation', 'lot', 'reward', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_merchant ON customer_loyalty(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer ON customer_loyalty(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_points ON customer_loyalty(points DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_merchant ON loyalty_rewards(merchant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_merchant ON loyalty_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);

-- Fonction pour mettre à jour automatiquement le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_loyalty_programs_updated_at 
    BEFORE UPDATE ON loyalty_programs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_loyalty_updated_at 
    BEFORE UPDATE ON customer_loyalty 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at 
    BEFORE UPDATE ON loyalty_rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement le niveau d'un client
CREATE OR REPLACE FUNCTION calculate_customer_level(points INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF points >= 600 THEN
        RETURN 'platinum';
    ELSIF points >= 300 THEN
        RETURN 'gold';
    ELSIF points >= 100 THEN
        RETURN 'silver';
    ELSE
        RETURN 'bronze';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le niveau
CREATE OR REPLACE FUNCTION update_customer_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_customer_level(NEW.points);
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_level_trigger
    BEFORE UPDATE ON customer_loyalty
    FOR EACH ROW EXECUTE FUNCTION update_customer_level();

-- Fonction pour ajouter des points à un client
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_merchant_id UUID,
    p_customer_id UUID,
    p_points INTEGER,
    p_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    customer_exists BOOLEAN;
BEGIN
    -- Vérifier si le client existe dans le programme de fidélité
    SELECT EXISTS(
        SELECT 1 FROM customer_loyalty 
        WHERE merchant_id = p_merchant_id AND customer_id = p_customer_id
    ) INTO customer_exists;
    
    -- Si le client n'existe pas, le créer
    IF NOT customer_exists THEN
        INSERT INTO customer_loyalty (merchant_id, customer_id, points)
        VALUES (p_merchant_id, p_customer_id, p_points);
    ELSE
        -- Mettre à jour les points existants
        UPDATE customer_loyalty 
        SET points = points + p_points
        WHERE merchant_id = p_merchant_id AND customer_id = p_customer_id;
    END IF;
    
    -- Enregistrer la transaction
    INSERT INTO loyalty_transactions (
        merchant_id, customer_id, type, points_earned, 
        description, reference_id, reference_type
    ) VALUES (
        p_merchant_id, p_customer_id, p_type, p_points,
        p_description, p_reference_id, p_reference_type
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour échanger des points contre une récompense
CREATE OR REPLACE FUNCTION redeem_loyalty_reward(
    p_merchant_id UUID,
    p_customer_id UUID,
    p_reward_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    reward_points INTEGER;
    customer_points INTEGER;
    reward_usage_limit INTEGER;
    reward_usage_count INTEGER;
BEGIN
    -- Récupérer les informations de la récompense
    SELECT points_cost, usage_limit, usage_count
    INTO reward_points, reward_usage_limit, reward_usage_count
    FROM loyalty_rewards
    WHERE id = p_reward_id AND merchant_id = p_merchant_id AND is_active = true;
    
    -- Vérifier si la récompense existe
    IF reward_points IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier la limite d'utilisation
    IF reward_usage_limit IS NOT NULL AND reward_usage_count >= reward_usage_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Récupérer les points du client
    SELECT points INTO customer_points
    FROM customer_loyalty
    WHERE merchant_id = p_merchant_id AND customer_id = p_customer_id;
    
    -- Vérifier si le client a assez de points
    IF customer_points IS NULL OR customer_points < reward_points THEN
        RETURN FALSE;
    END IF;
    
    -- Déduire les points du client
    UPDATE customer_loyalty 
    SET points = points - reward_points
    WHERE merchant_id = p_merchant_id AND customer_id = p_customer_id;
    
    -- Incrémenter le compteur d'utilisation de la récompense
    UPDATE loyalty_rewards 
    SET usage_count = usage_count + 1
    WHERE id = p_reward_id;
    
    -- Enregistrer la transaction
    INSERT INTO loyalty_transactions (
        merchant_id, customer_id, type, points_redeemed, 
        description, reference_id, reference_type
    ) VALUES (
        p_merchant_id, p_customer_id, 'redeem', reward_points,
        'Échange de récompense', p_reward_id, 'reward'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE loyalty_programs IS 'Programmes de fidélité configurés par commerçant';
COMMENT ON TABLE customer_loyalty IS 'Données de fidélité des clients par commerçant';
COMMENT ON TABLE loyalty_rewards IS 'Récompenses disponibles dans les programmes de fidélité';
COMMENT ON TABLE loyalty_transactions IS 'Historique des transactions de fidélité (gains, échanges, etc.)';

COMMENT ON FUNCTION add_loyalty_points IS 'Ajoute des points de fidélité à un client';
COMMENT ON FUNCTION redeem_loyalty_reward IS 'Échange des points contre une récompense';
COMMENT ON FUNCTION calculate_customer_level IS 'Calcule le niveau de fidélité basé sur les points';
