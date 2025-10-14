-- Migration pour ajouter la gestion des associations et l'enregistrement de bénéficiaires
-- Date: 2025-01-16
-- Description: Permet aux associations d'enregistrer des bénéficiaires

-- Table pour lier les associations aux bénéficiaires qu'elles ont enregistrés
CREATE TABLE IF NOT EXISTS association_beneficiary_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  verification_document_url TEXT, -- URL d'un document de vérification si nécessaire
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité : une association ne peut enregistrer un bénéficiaire qu'une seule fois
  UNIQUE(association_id, beneficiary_id)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_association_beneficiary_registrations_association_id 
ON association_beneficiary_registrations(association_id);

CREATE INDEX idx_association_beneficiary_registrations_beneficiary_id 
ON association_beneficiary_registrations(beneficiary_id);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_association_beneficiary_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_association_beneficiary_registrations_timestamp
BEFORE UPDATE ON association_beneficiary_registrations
FOR EACH ROW
EXECUTE FUNCTION update_association_beneficiary_registrations_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE association_beneficiary_registrations IS 'Table de liaison entre les associations et les bénéficiaires qu''elles ont enregistrés';
COMMENT ON COLUMN association_beneficiary_registrations.association_id IS 'ID de l''association qui a enregistré le bénéficiaire';
COMMENT ON COLUMN association_beneficiary_registrations.beneficiary_id IS 'ID du bénéficiaire enregistré';
COMMENT ON COLUMN association_beneficiary_registrations.notes IS 'Notes ou informations supplémentaires sur l''enregistrement';
COMMENT ON COLUMN association_beneficiary_registrations.verification_document_url IS 'URL d''un document de vérification (optionnel)';
COMMENT ON COLUMN association_beneficiary_registrations.is_verified IS 'Indique si l''enregistrement a été vérifié par l''association';

