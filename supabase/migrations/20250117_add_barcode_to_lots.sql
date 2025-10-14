-- Migration : Ajout du champ barcode à la table lots
-- Date : 2025-01-17
-- Description : Permet de stocker le code-barres EAN13 pour les produits ajoutés via OpenFoodFacts

-- Ajouter la colonne barcode à la table lots
ALTER TABLE lots
ADD COLUMN IF NOT EXISTS barcode VARCHAR(20);

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN lots.barcode IS 'Code-barres EAN13 du produit (récupéré via OpenFoodFacts)';

-- Créer un index pour rechercher rapidement par code-barres
CREATE INDEX IF NOT EXISTS idx_lots_barcode ON lots(barcode);

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250117_add_barcode_to_lots : Colonne barcode ajoutée avec succès';
END $$;

