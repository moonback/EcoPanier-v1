-- Données de test pour le système de messagerie
-- Date: 2025-01-14
-- Description: Templates de réponses rapides par défaut pour les commerçants

-- NOTE: Ces données seront ajoutées automatiquement aux commerçants existants
-- Si vous voulez des templates spécifiques, modifiez ce fichier

-- Fonction pour créer des templates par défaut pour un commerçant
CREATE OR REPLACE FUNCTION create_default_quick_replies(p_merchant_id UUID)
RETURNS void AS $$
BEGIN
  -- Vérifier que l'utilisateur est bien un commerçant
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = p_merchant_id AND role = 'merchant'
  ) THEN
    RAISE EXCEPTION 'L''utilisateur n''est pas un commerçant';
  END IF;

  -- Insérer les templates par défaut (seulement s'ils n'existent pas déjà)
  INSERT INTO quick_reply_templates (merchant_id, title, content, category)
  SELECT p_merchant_id, title, content, category
  FROM (VALUES
    -- Catégorie: Général
    ('Bienvenue', 'Bonjour ! Merci de votre intérêt pour nos produits. Comment puis-je vous aider ?', 'general'),
    ('Disponibilité', 'Nos lots sont disponibles jusqu''à la fin de la journée. N''hésitez pas à réserver rapidement !', 'general'),
    ('Qualité', 'Nos produits sont frais du jour et de qualité. Ils sont parfaits pour une consommation immédiate.', 'general'),
    
    -- Catégorie: Allergènes
    ('Sans allergènes courants', 'Ce lot ne contient pas d''allergènes courants (gluten, lactose, fruits à coque). N''hésitez pas pour plus de détails !', 'allergens'),
    ('Liste allergènes', 'Je peux vous fournir la liste complète des ingrédients et allergènes. De quels produits souhaitez-vous les détails ?', 'allergens'),
    ('Traçabilité', 'Tous nos produits sont traçables et étiquetés selon les normes. Je peux vous montrer les étiquettes si besoin.', 'allergens'),
    
    -- Catégorie: Horaires
    ('Horaires retrait', 'Vous pouvez venir récupérer votre lot entre 17h et 20h aujourd''hui. Ça vous convient ?', 'schedule'),
    ('Flexibilité horaire', 'Pas de souci pour l''horaire ! Prévenez-moi quand vous arrivez et je m''arrange.', 'schedule'),
    ('Retard possible', 'Si vous avez un peu de retard, pas de problème. Contactez-moi pour qu''on s''organise.', 'schedule'),
    
    -- Catégorie: Personnalisé
    ('Personnalisation possible', 'Je peux adapter le contenu du lot selon vos préférences. Dites-moi ce que vous aimeriez !', 'custom'),
    ('Plus de quantité', 'Je peux augmenter la quantité si vous le souhaitez. Combien vous en faudrait-il ?', 'custom'),
    ('Produits spécifiques', 'Je peux privilégier certains produits si vous avez des préférences. Lesquels vous intéressent ?', 'custom')
  ) AS templates(title, content, category)
  WHERE NOT EXISTS (
    SELECT 1 FROM quick_reply_templates 
    WHERE merchant_id = p_merchant_id AND title = templates.title
  );
  
  RAISE NOTICE 'Templates de réponses rapides créés pour le commerçant %', p_merchant_id;
END;
$$ LANGUAGE plpgsql;

-- Créer automatiquement les templates pour tous les commerçants existants
DO $$
DECLARE
  merchant_record RECORD;
  templates_created INTEGER := 0;
BEGIN
  FOR merchant_record IN 
    SELECT id FROM profiles WHERE role = 'merchant'
  LOOP
    BEGIN
      PERFORM create_default_quick_replies(merchant_record.id);
      templates_created := templates_created + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la création des templates pour %: %', merchant_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Templates créés pour % commerçant(s)', templates_created;
END $$;

-- Trigger pour créer automatiquement les templates quand un nouveau commerçant est créé
CREATE OR REPLACE FUNCTION auto_create_merchant_quick_replies()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'merchant' THEN
    PERFORM create_default_quick_replies(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger s'il n'existe pas déjà
DROP TRIGGER IF EXISTS on_merchant_created ON profiles;
CREATE TRIGGER on_merchant_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'merchant')
  EXECUTE FUNCTION auto_create_merchant_quick_replies();

-- Commentaires
COMMENT ON FUNCTION create_default_quick_replies IS 'Crée des templates de réponses rapides par défaut pour un commerçant';
COMMENT ON FUNCTION auto_create_merchant_quick_replies IS 'Trigger pour créer automatiquement des templates quand un commerçant est créé';

