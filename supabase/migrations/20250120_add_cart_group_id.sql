-- Migration: Ajouter le support des paniers groupés
-- Date: 2025-01-20
-- Description: Ajoute un champ cart_group_id pour lier plusieurs réservations d'un même panier

-- Ajouter le champ cart_group_id à la table reservations
ALTER TABLE reservations
ADD COLUMN cart_group_id uuid;

-- Créer un index pour améliorer les performances des requêtes groupées
CREATE INDEX idx_reservations_cart_group_id ON reservations(cart_group_id);

-- Créer un index composite pour les requêtes par utilisateur et groupe
CREATE INDEX idx_reservations_user_cart_group ON reservations(user_id, cart_group_id);

-- Commentaires pour la documentation
COMMENT ON COLUMN reservations.cart_group_id IS 'Identifiant unique du groupe de réservations (panier). Plusieurs réservations avec le même cart_group_id partagent le même code PIN et QR code.';

