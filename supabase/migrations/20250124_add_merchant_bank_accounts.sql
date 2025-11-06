/*
  # Merchant Bank Accounts

  ## Overview
  This migration creates a system for merchants to save their bank account information
  so they don't have to re-enter it for each withdrawal request.

  ## Changes

  1. Create merchant_bank_accounts table
  2. Add indexes for performance
*/

-- Create merchant_bank_accounts table
CREATE TABLE IF NOT EXISTS merchant_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  iban text NOT NULL,
  bic text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure only one default account per merchant
  UNIQUE(merchant_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_merchant_bank_accounts_merchant_id ON merchant_bank_accounts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_bank_accounts_is_default ON merchant_bank_accounts(merchant_id, is_default) WHERE is_default = true;

-- Function to update merchant_bank_accounts updated_at timestamp
CREATE OR REPLACE FUNCTION update_merchant_bank_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update merchant_bank_accounts updated_at
DROP TRIGGER IF EXISTS trigger_update_merchant_bank_account_updated_at ON merchant_bank_accounts;
CREATE TRIGGER trigger_update_merchant_bank_account_updated_at
  BEFORE UPDATE ON merchant_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_merchant_bank_account_updated_at();

-- Function to ensure only one default account per merchant
CREATE OR REPLACE FUNCTION ensure_single_default_bank_account()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this account as default, unset all other defaults for this merchant
  IF NEW.is_default = true THEN
    UPDATE merchant_bank_accounts
    SET is_default = false
    WHERE merchant_id = NEW.merchant_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one default account
DROP TRIGGER IF EXISTS trigger_ensure_single_default_bank_account ON merchant_bank_accounts;
CREATE TRIGGER trigger_ensure_single_default_bank_account
  BEFORE INSERT OR UPDATE ON merchant_bank_accounts
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_bank_account();

-- Disable Row Level Security (following project pattern)
ALTER TABLE merchant_bank_accounts DISABLE ROW LEVEL SECURITY;

