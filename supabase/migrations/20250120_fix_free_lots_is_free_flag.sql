/*
  # Correction du flag is_free pour les lots gratuits existants
  
  Cette migration corrige les lots qui ont un prix réduit de 0€ mais qui n'ont pas
  le flag is_free à true. Cela permet aux bénéficiaires de voir tous les lots gratuits.
  
  ## Changements
  - Met à jour is_free = true pour tous les lots avec discounted_price = 0
  - Met à jour original_price = 0 pour ces lots (cohérence)
  
  ## Utilisation
  Cette migration s'exécute automatiquement et corrige les incohérences dans la base.
*/

-- Mettre à jour les lots gratuits qui ne sont pas marqués comme tels
UPDATE lots
SET 
  is_free = true,
  original_price = 0,
  updated_at = NOW()
WHERE 
  discounted_price = 0 
  AND is_free = false
  AND status = 'available';

-- Afficher un résumé des changements
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Migration terminée : % lot(s) corrigé(s)', updated_count;
END $$;

