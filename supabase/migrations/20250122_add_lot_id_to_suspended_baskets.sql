-- Ajouter la colonne lot_id à la table suspended_baskets
ALTER TABLE suspended_baskets 
ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES lots(id);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_suspended_baskets_lot_id ON suspended_baskets(lot_id);

-- Commentaire
COMMENT ON COLUMN suspended_baskets.lot_id IS 'ID du lot associé au panier suspendu';

