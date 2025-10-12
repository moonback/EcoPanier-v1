-- Création de la table platform_settings pour stocker les paramètres de la plateforme
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'general', 'lots', 'commission', 'beneficiary', 'notification', 'security'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par clé
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- Fonction pour mettre à jour automatically updated_at
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER trigger_update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();

-- Insertion des paramètres par défaut
INSERT INTO platform_settings (key, value, description, category) VALUES
  -- Paramètres généraux
  ('platform_name', '"EcoPanier"', 'Nom de la plateforme', 'general'),
  ('platform_email', '"contact@ecopanier.fr"', 'Email de contact principal', 'general'),
  ('support_phone', '"01 23 45 67 89"', 'Téléphone du support', 'general'),
  
  -- Paramètres des lots
  ('min_lot_price', '2', 'Prix minimum d''un lot en euros', 'lots'),
  ('max_lot_price', '50', 'Prix maximum d''un lot en euros', 'lots'),
  ('default_lot_duration', '24', 'Durée par défaut d''un lot en heures', 'lots'),
  ('max_reservations_per_day', '2', 'Nombre maximum de réservations par jour', 'lots'),
  
  -- Commissions
  ('merchant_commission', '15', 'Commission prélevée sur les ventes commerçants (en %)', 'commission'),
  ('collector_commission', '10', 'Commission versée aux collecteurs (en %)', 'commission'),
  
  -- Bénéficiaires
  ('beneficiary_verification_required', 'true', 'Vérification obligatoire pour les bénéficiaires', 'beneficiary'),
  ('max_daily_beneficiary_reservations', '2', 'Réservations max par jour pour bénéficiaires', 'beneficiary'),
  
  -- Notifications
  ('email_notifications_enabled', 'true', 'Activer les notifications email', 'notification'),
  ('sms_notifications_enabled', 'false', 'Activer les notifications SMS', 'notification'),
  ('push_notifications_enabled', 'true', 'Activer les notifications push', 'notification'),
  
  -- Sécurité
  ('two_factor_auth_required', 'false', 'Authentification à deux facteurs obligatoire pour admins', 'security'),
  ('password_expiration_days', '90', 'Durée avant expiration du mot de passe (jours)', 'security'),
  ('max_login_attempts', '5', 'Nombre maximum de tentatives de connexion', 'security')
ON CONFLICT (key) DO NOTHING;

-- Politique RLS (Row Level Security)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire les paramètres
CREATE POLICY "Admins can read settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seuls les admins peuvent modifier les paramètres
CREATE POLICY "Admins can update settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Table pour les logs de modifications des paramètres
CREATE TABLE IF NOT EXISTS platform_settings_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Index pour l'historique
CREATE INDEX IF NOT EXISTS idx_settings_history_key ON platform_settings_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_at ON platform_settings_history(changed_at DESC);

-- Fonction pour logger les changements
CREATE OR REPLACE FUNCTION log_platform_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO platform_settings_history (setting_key, old_value, new_value, changed_by)
    VALUES (NEW.key, OLD.value, NEW.value, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour logger les changements
DROP TRIGGER IF EXISTS trigger_log_platform_settings_change ON platform_settings;
CREATE TRIGGER trigger_log_platform_settings_change
  AFTER UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_platform_settings_change();

-- Vue pour faciliter l'accès aux paramètres
CREATE OR REPLACE VIEW platform_settings_view AS
SELECT 
  ps.key,
  ps.value,
  ps.description,
  ps.category,
  ps.updated_at,
  ps.created_at,
  p.full_name as updated_by_name,
  p.role as updated_by_role
FROM platform_settings ps
LEFT JOIN profiles p ON ps.updated_by = p.id;

-- Commentaires pour documentation
COMMENT ON TABLE platform_settings IS 'Stockage des paramètres de configuration de la plateforme';
COMMENT ON TABLE platform_settings_history IS 'Historique des modifications des paramètres';
COMMENT ON COLUMN platform_settings.key IS 'Clé unique du paramètre';
COMMENT ON COLUMN platform_settings.value IS 'Valeur du paramètre au format JSONB';
COMMENT ON COLUMN platform_settings.category IS 'Catégorie du paramètre (general, lots, commission, etc.)';

