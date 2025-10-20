/*
  # Ajouter le champ is_free aux lots
  
  Cette migration ajoute la colonne `is_free` à la table `lots` pour gérer
  les lots gratuits destinés aux bénéficiaires.
  
  ## Changements
  - Ajouter `is_free` (boolean, default false) à la table `lots`
  - Créer un index sur `is_free` pour les requêtes filtrées
  
  ## Utilisation
  Les commerçants peuvent manuellement passer un lot en gratuit via un bouton
  dans leur interface de gestion des lots.
*/

-- Ajouter la colonne is_free si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'is_free'
  ) THEN
    ALTER TABLE lots ADD COLUMN is_free boolean DEFAULT false;
  END IF;
END $$;

-- Créer un index sur is_free pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_lots_is_free ON lots(is_free) WHERE is_free = true;

-- Créer un index composite pour les lots gratuits disponibles
CREATE INDEX IF NOT EXISTS idx_lots_free_available ON lots(is_free, status, pickup_start) 
WHERE is_free = true AND status = 'available';

