-- Migration pour système de messagerie directe
-- Date: 2025-01-14
-- Description: Ajout des tables pour le chat client-commerçant

-- Table des conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE SET NULL, -- Optionnel, si conversation liée à un lot
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  customer_unread_count INTEGER DEFAULT 0,
  merchant_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte: une seule conversation par paire client-commerçant-lot
  UNIQUE(customer_id, merchant_id, lot_id)
);

-- Table des messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'quick_question', 'negotiation', 'custom_request')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index pour performance
  CONSTRAINT content_not_empty CHECK (trim(content) != '')
);

-- Table des templates de réponses rapides (pour commerçants)
CREATE TABLE quick_reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'allergens', 'schedule', 'custom')),
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_merchant ON conversations(merchant_id);
CREATE INDEX idx_conversations_lot ON conversations(lot_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_quick_replies_merchant ON quick_reply_templates(merchant_id);

-- Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reply_templates ENABLE ROW LEVEL SECURITY;

-- Policies pour conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = merchant_id
  );

CREATE POLICY "Customers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Participants can update their conversations"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = merchant_id
  );

-- Policies pour messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.merchant_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.customer_id = auth.uid() OR conversations.merchant_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Policies pour quick replies
CREATE POLICY "Merchants can view their templates"
  ON quick_reply_templates FOR SELECT
  USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can manage their templates"
  ON quick_reply_templates FOR ALL
  USING (merchant_id = auth.uid());

-- Fonction pour mettre à jour last_message_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  is_customer BOOLEAN;
BEGIN
  -- Déterminer si l'expéditeur est le client ou le commerçant
  SELECT (sender_id = customer_id) INTO is_customer
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Mettre à jour la conversation
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    -- Incrémenter le compteur de non-lus pour le destinataire
    customer_unread_count = CASE 
      WHEN is_customer THEN customer_unread_count 
      ELSE customer_unread_count + 1 
    END,
    merchant_unread_count = CASE 
      WHEN is_customer THEN merchant_unread_count + 1 
      ELSE merchant_unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la conversation
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Fonction pour marquer les messages comme lus
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  is_customer BOOLEAN;
BEGIN
  -- Déterminer si l'utilisateur est le client ou le commerçant
  SELECT (customer_id = p_user_id) INTO is_customer
  FROM conversations
  WHERE id = p_conversation_id;
  
  -- Marquer les messages comme lus
  UPDATE messages
  SET is_read = TRUE, read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND is_read = FALSE;
  
  -- Réinitialiser le compteur approprié
  UPDATE conversations
  SET 
    customer_unread_count = CASE WHEN is_customer THEN 0 ELSE customer_unread_count END,
    merchant_unread_count = CASE WHEN is_customer THEN merchant_unread_count ELSE 0 END
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Données de test: templates de réponses rapides par défaut
-- (À ajouter après création des profils commerçants)

COMMENT ON TABLE conversations IS 'Conversations entre clients et commerçants';
COMMENT ON TABLE messages IS 'Messages échangés dans les conversations';
COMMENT ON TABLE quick_reply_templates IS 'Templates de réponses rapides pour commerçants';

