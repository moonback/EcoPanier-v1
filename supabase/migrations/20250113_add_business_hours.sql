-- Migration: Ajouter les horaires d'ouverture aux profils commerçants
-- Date: 2025-01-13
-- Description: Ajoute un champ JSON pour stocker les horaires d'ouverture du magasin

-- Ajouter la colonne business_hours (format JSON)
ALTER TABLE profiles
ADD COLUMN business_hours JSONB DEFAULT NULL;

-- Commentaire pour documenter le format attendu
COMMENT ON COLUMN profiles.business_hours IS 
'Horaires d''ouverture du magasin au format JSON.
Exemple: {
  "monday": {"open": "08:00", "close": "20:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "20:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "20:00", "closed": false},
  "thursday": {"open": "08:00", "close": "20:00", "closed": false},
  "friday": {"open": "08:00", "close": "20:00", "closed": false},
  "saturday": {"open": "09:00", "close": "19:00", "closed": false},
  "sunday": {"open": null, "close": null, "closed": true}
}';

-- Exemple: Mettre à jour un commerçant avec des horaires (à adapter selon vos besoins)
-- UPDATE profiles 
-- SET business_hours = '{
--   "monday": {"open": "08:00", "close": "20:00", "closed": false},
--   "tuesday": {"open": "08:00", "close": "20:00", "closed": false},
--   "wednesday": {"open": "08:00", "close": "20:00", "closed": false},
--   "thursday": {"open": "08:00", "close": "20:00", "closed": false},
--   "friday": {"open": "08:00", "close": "20:00", "closed": false},
--   "saturday": {"open": "09:00", "close": "19:00", "closed": false},
--   "sunday": {"open": null, "close": null, "closed": true}
-- }'::jsonb
-- WHERE role = 'merchant';

