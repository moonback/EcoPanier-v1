-- Rollback de la migration du système de fidélité EcoPanier
-- Ce script supprime toutes les tables, fonctions et triggers créés par la migration 20250121_loyalty_system.sql

-- ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE et supprimera toutes les données de fidélité !
-- Assurez-vous d'avoir une sauvegarde si nécessaire.

-- Étape 1: Supprimer les triggers
DROP TRIGGER IF EXISTS update_customer_level_trigger ON customer_loyalty;
DROP TRIGGER IF EXISTS update_loyalty_rewards_updated_at ON loyalty_rewards;
DROP TRIGGER IF EXISTS update_customer_loyalty_updated_at ON customer_loyalty;
DROP TRIGGER IF EXISTS update_loyalty_programs_updated_at ON loyalty_programs;

-- Étape 2: Supprimer les fonctions
DROP FUNCTION IF EXISTS redeem_loyalty_reward(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS add_loyalty_points(UUID, UUID, INTEGER, TEXT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_customer_level();
DROP FUNCTION IF EXISTS calculate_customer_level(INTEGER);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Étape 3: Supprimer les index
DROP INDEX IF EXISTS idx_loyalty_transactions_type;
DROP INDEX IF EXISTS idx_loyalty_transactions_customer;
DROP INDEX IF EXISTS idx_loyalty_transactions_merchant;
DROP INDEX IF EXISTS idx_loyalty_rewards_active;
DROP INDEX IF EXISTS idx_loyalty_rewards_merchant;
DROP INDEX IF EXISTS idx_customer_loyalty_points;
DROP INDEX IF EXISTS idx_customer_loyalty_customer;
DROP INDEX IF EXISTS idx_customer_loyalty_merchant;

-- Étape 4: Supprimer les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_rewards CASCADE;
DROP TABLE IF EXISTS customer_loyalty CASCADE;
DROP TABLE IF EXISTS loyalty_programs CASCADE;

-- Confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Rollback terminé avec succès !';
    RAISE NOTICE 'Toutes les tables, fonctions et triggers du système de fidélité ont été supprimés.';
END $$;

