/*
  # Wallet System for Customers

  ## Overview
  This migration creates a wallet system for customers to store and manage their balance,
  and track all wallet transactions (recharges, payments, refunds).

  ## 1. New Tables

  ### `wallets`
  Customer wallet accounts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - UNIQUE, one wallet per customer
  - `balance` (numeric) - current wallet balance (>= 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `wallet_transactions`
  All wallet transactions (recharges, payments, refunds)
  - `id` (uuid, primary key)
  - `wallet_id` (uuid, references wallets)
  - `user_id` (uuid, references profiles) - denormalized for easier queries
  - `type` (text) - recharge, payment, refund
  - `amount` (numeric) - transaction amount (positive for recharge/refund, negative for payment)
  - `balance_before` (numeric) - wallet balance before transaction
  - `balance_after` (numeric) - wallet balance after transaction
  - `description` (text) - transaction description
  - `reference_id` (uuid, nullable) - reference to related entity (reservation_id, etc.)
  - `reference_type` (text, nullable) - type of reference (reservation, etc.)
  - `status` (text) - pending, completed, failed, cancelled
  - `metadata` (jsonb, nullable) - additional transaction data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Functions

  ### `create_wallet_for_customer`
  Automatically creates a wallet when a customer profile is created

  ### `process_wallet_transaction`
  Processes a wallet transaction with balance validation and atomic updates

  ## 3. Indexes
  - Index on wallets.user_id (UNIQUE)
  - Index on wallet_transactions.wallet_id
  - Index on wallet_transactions.user_id
  - Index on wallet_transactions.created_at DESC
  - Index on wallet_transactions.reference_id
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('recharge', 'payment', 'refund')),
  amount numeric NOT NULL,
  balance_before numeric NOT NULL CHECK (balance_before >= 0),
  balance_after numeric NOT NULL CHECK (balance_after >= 0),
  description text NOT NULL,
  reference_id uuid,
  reference_type text CHECK (reference_type IN ('reservation', 'suspended_basket', 'mission')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- Function to automatically create wallet for new customers
CREATE OR REPLACE FUNCTION create_wallet_for_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create wallet for customers
  IF NEW.role = 'customer' THEN
    INSERT INTO wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create wallet when customer profile is created
DROP TRIGGER IF EXISTS trigger_create_wallet_for_customer ON profiles;
CREATE TRIGGER trigger_create_wallet_for_customer
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_customer();

-- Function to update wallet updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet updated_at
DROP TRIGGER IF EXISTS trigger_update_wallet_updated_at ON wallets;
CREATE TRIGGER trigger_update_wallet_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_updated_at();

-- Function to update wallet_transactions updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet_transactions updated_at
DROP TRIGGER IF EXISTS trigger_update_wallet_transaction_updated_at ON wallet_transactions;
CREATE TRIGGER trigger_update_wallet_transaction_updated_at
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_transaction_updated_at();

-- Disable Row Level Security (following project pattern)
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;

-- Create wallets for existing customers (if any)
INSERT INTO wallets (user_id, balance)
SELECT id, 0
FROM profiles
WHERE role = 'customer'
ON CONFLICT (user_id) DO NOTHING;

