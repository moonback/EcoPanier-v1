/*
  # Migration: Préférences des Collecteurs
  
  ## Description
  Ajoute un champ JSONB pour stocker les préférences des collecteurs dans la table profiles.
  Ce champ contient toutes les informations spécifiques à l'activité de collecteur :
  - Type de véhicule (bike, ebike, scooter, car, van)
  - Équipements disponibles (sac isotherme, glacière, etc.)
  - Zones de livraison préférées
  - Disponibilités (créneaux horaires)
  - Distance maximale de livraison
  - Acceptation de la chaîne du froid
  - Bio/présentation personnelle

  ## Schéma JSON des préférences
  {
    "vehicle_type": "bike" | "ebike" | "scooter" | "car" | "van",
    "equipment": ["cooler_bag", "large_cooler", "thermal_box", "delivery_bag"],
    "delivery_zones": ["center", "suburbs", "outskirts", "all"],
    "availability": ["morning", "afternoon", "evening", "flexible"],
    "max_distance": 5,  // en km (1-20)
    "accepts_cold_chain": true | false,
    "bio": "Présentation du collecteur (max 200 caractères)"
  }

  ## Changements
  - Ajoute la colonne `collector_preferences` à la table `profiles`
  - Type JSONB pour flexibilité et performance
  - Valeur par défaut : NULL (optionnel)
  - Index GIN pour recherches rapides dans le JSON

  ## Compatibilité
  - Compatible avec tous les rôles (seuls les collecteurs l'utilisent)
  - Pas d'impact sur les données existantes
  - Rétrocompatible : NULL si non défini

  ## Auteur
  EcoPanier - Système de préférences collecteurs
  Date: 2025-01-15
*/

-- =====================================================
-- 1. AJOUT DE LA COLONNE COLLECTOR_PREFERENCES
-- =====================================================

-- Ajouter la colonne collector_preferences à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS collector_preferences JSONB DEFAULT NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN profiles.collector_preferences IS 
'Préférences du collecteur (véhicule, équipements, zones, disponibilités, etc.) - Format JSON';


-- =====================================================
-- 2. INDEX POUR PERFORMANCES
-- =====================================================

-- Créer un index GIN pour permettre des recherches rapides dans le JSON
-- Utile pour filtrer les collecteurs par préférences (ex: ceux qui acceptent chaîne du froid)
CREATE INDEX IF NOT EXISTS idx_collector_preferences_gin 
ON profiles USING GIN (collector_preferences);

-- Index spécifique pour le champ vehicle_type (recherches fréquentes)
CREATE INDEX IF NOT EXISTS idx_collector_vehicle_type 
ON profiles ((collector_preferences->>'vehicle_type')) 
WHERE role = 'collector';

-- Index spécifique pour accepts_cold_chain (recherches fréquentes)
CREATE INDEX IF NOT EXISTS idx_collector_accepts_cold_chain 
ON profiles ((collector_preferences->>'accepts_cold_chain')) 
WHERE role = 'collector';


-- =====================================================
-- 3. FONCTION DE VALIDATION (OPTIONNELLE)
-- =====================================================

-- Fonction pour valider la structure du JSON des préférences
CREATE OR REPLACE FUNCTION validate_collector_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le rôle n'est pas collecteur et qu'il y a des préférences, lever une erreur
  IF NEW.role != 'collector' AND NEW.collector_preferences IS NOT NULL THEN
    RAISE EXCEPTION 'Les préférences collecteur ne sont disponibles que pour les utilisateurs de rôle "collector"';
  END IF;

  -- Si le rôle est collecteur et qu'il y a des préférences, valider la structure
  IF NEW.role = 'collector' AND NEW.collector_preferences IS NOT NULL THEN
    
    -- Vérifier que vehicle_type est valide
    IF NEW.collector_preferences->>'vehicle_type' IS NOT NULL 
       AND NEW.collector_preferences->>'vehicle_type' NOT IN ('bike', 'ebike', 'scooter', 'car', 'van') THEN
      RAISE EXCEPTION 'vehicle_type doit être: bike, ebike, scooter, car ou van';
    END IF;

    -- Vérifier que max_distance est dans la plage valide (1-20 km)
    IF NEW.collector_preferences->>'max_distance' IS NOT NULL THEN
      DECLARE
        max_dist INTEGER;
      BEGIN
        max_dist := (NEW.collector_preferences->>'max_distance')::INTEGER;
        IF max_dist < 1 OR max_dist > 20 THEN
          RAISE EXCEPTION 'max_distance doit être entre 1 et 20 km';
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE EXCEPTION 'max_distance doit être un nombre entier';
      END;
    END IF;

    -- Vérifier que bio ne dépasse pas 200 caractères
    IF NEW.collector_preferences->>'bio' IS NOT NULL 
       AND LENGTH(NEW.collector_preferences->>'bio') > 200 THEN
      RAISE EXCEPTION 'La bio ne peut pas dépasser 200 caractères';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour valider les préférences à chaque insertion/mise à jour
DROP TRIGGER IF EXISTS validate_collector_preferences_trigger ON profiles;
CREATE TRIGGER validate_collector_preferences_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_collector_preferences();


-- =====================================================
-- 4. DONNÉES PAR DÉFAUT POUR TESTS (OPTIONNEL)
-- =====================================================

-- Exemple de préférences par défaut pour les collecteurs existants
-- (Décommentez si vous voulez initialiser les collecteurs existants)

/*
UPDATE profiles
SET collector_preferences = jsonb_build_object(
  'vehicle_type', 'bike',
  'equipment', ARRAY['cooler_bag'],
  'delivery_zones', ARRAY['center'],
  'availability', ARRAY['flexible'],
  'max_distance', 5,
  'accepts_cold_chain', true,
  'bio', ''
)
WHERE role = 'collector' AND collector_preferences IS NULL;
*/


-- =====================================================
-- 5. FONCTIONS UTILITAIRES POUR REQUÊTES
-- =====================================================

-- Fonction pour obtenir les collecteurs disponibles pour une mission
CREATE OR REPLACE FUNCTION get_available_collectors_for_mission(
  p_requires_cold_chain BOOLEAN,
  p_distance_km NUMERIC,
  p_zone TEXT
)
RETURNS TABLE (
  collector_id UUID,
  collector_name TEXT,
  vehicle_type TEXT,
  max_distance INTEGER,
  rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.collector_preferences->>'vehicle_type' AS vehicle_type,
    (p.collector_preferences->>'max_distance')::INTEGER AS max_distance,
    COALESCE((
      SELECT AVG(5.0) -- TODO: Remplacer par vraie note depuis table ratings
      FROM missions m 
      WHERE m.collector_id = p.id 
        AND m.status = 'completed'
    ), 0) AS rating
  FROM profiles p
  WHERE p.role = 'collector'
    AND p.verified = true
    -- Filtre chaîne du froid
    AND (
      NOT p_requires_cold_chain 
      OR (p.collector_preferences->>'accepts_cold_chain')::BOOLEAN = true
    )
    -- Filtre distance maximale
    AND (
      (p.collector_preferences->>'max_distance')::INTEGER >= p_distance_km
      OR p.collector_preferences->>'max_distance' IS NULL
    )
    -- Filtre zone de livraison
    AND (
      p.collector_preferences->'delivery_zones' @> to_jsonb(p_zone)
      OR p.collector_preferences->'delivery_zones' @> to_jsonb('all')
      OR p.collector_preferences IS NULL
    )
  ORDER BY rating DESC, p.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Commentaire sur la fonction
COMMENT ON FUNCTION get_available_collectors_for_mission IS 
'Retourne les collecteurs disponibles et compatibles avec une mission donnée';


-- =====================================================
-- 6. VUES UTILES
-- =====================================================

-- Vue des collecteurs avec leurs préférences formatées
CREATE OR REPLACE VIEW v_collectors_details AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.address,
  p.verified,
  p.created_at,
  
  -- Préférences extraites
  p.collector_preferences->>'vehicle_type' AS vehicle_type,
  p.collector_preferences->'equipment' AS equipment,
  p.collector_preferences->'delivery_zones' AS delivery_zones,
  p.collector_preferences->'availability' AS availability,
  (p.collector_preferences->>'max_distance')::INTEGER AS max_distance,
  (p.collector_preferences->>'accepts_cold_chain')::BOOLEAN AS accepts_cold_chain,
  p.collector_preferences->>'bio' AS bio,
  
  -- Statistiques (à enrichir avec vraies données)
  COALESCE((
    SELECT COUNT(*) 
    FROM missions m 
    WHERE m.collector_id = p.id 
      AND m.status = 'completed'
  ), 0) AS missions_completed,
  
  COALESCE((
    SELECT SUM(m.payment_amount) 
    FROM missions m 
    WHERE m.collector_id = p.id 
      AND m.status = 'completed'
  ), 0) AS total_earnings

FROM profiles p
WHERE p.role = 'collector';

-- Commentaire sur la vue
COMMENT ON VIEW v_collectors_details IS 
'Vue détaillée des collecteurs avec leurs préférences et statistiques';


-- =====================================================
-- 7. PERMISSIONS (si RLS activé)
-- =====================================================

-- Note: RLS est désactivé dans votre schéma actuel
-- Si vous activez RLS plus tard, ajoutez ces policies:

/*
-- Les collecteurs peuvent lire et mettre à jour leurs propres préférences
CREATE POLICY collector_preferences_select 
ON profiles FOR SELECT 
TO authenticated
USING (
  id = auth.uid() 
  AND role = 'collector'
);

CREATE POLICY collector_preferences_update 
ON profiles FOR UPDATE 
TO authenticated
USING (id = auth.uid() AND role = 'collector')
WITH CHECK (id = auth.uid() AND role = 'collector');

-- Les commerçants peuvent voir les préférences des collecteurs (pour matching)
CREATE POLICY merchant_view_collector_preferences 
ON profiles FOR SELECT 
TO authenticated
USING (
  role = 'collector' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND role IN ('merchant', 'admin')
  )
);
*/


-- =====================================================
-- 8. VÉRIFICATIONS FINALES
-- =====================================================

-- Vérifier que la colonne a été créée
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
      AND column_name = 'collector_preferences'
  ) THEN
    RAISE NOTICE '✅ Migration réussie : colonne collector_preferences créée';
  ELSE
    RAISE EXCEPTION '❌ Erreur : colonne collector_preferences non créée';
  END IF;
END $$;

-- Afficher les index créés
DO $$
BEGIN
  RAISE NOTICE '📊 Index créés sur collector_preferences :';
  RAISE NOTICE '   - idx_collector_preferences_gin (GIN global)';
  RAISE NOTICE '   - idx_collector_vehicle_type (vehicle_type)';
  RAISE NOTICE '   - idx_collector_accepts_cold_chain (accepts_cold_chain)';
END $$;

-- Résumé de la migration
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION TERMINÉE AVEC SUCCÈS                        ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  📦 Ajouts :                                              ║';
  RAISE NOTICE '║    - Colonne collector_preferences (JSONB)                ║';
  RAISE NOTICE '║    - 3 index pour performances                            ║';
  RAISE NOTICE '║    - Fonction de validation                               ║';
  RAISE NOTICE '║    - Fonction get_available_collectors_for_mission()      ║';
  RAISE NOTICE '║    - Vue v_collectors_details                             ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  🎯 Prochaines étapes :                                   ║';
  RAISE NOTICE '║    1. Mettre à jour database.types.ts                     ║';
  RAISE NOTICE '║    2. Implémenter sauvegarde dans CollectorProfilePage    ║';
  RAISE NOTICE '║    3. Utiliser pour matching missions/collecteurs         ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

