/*
  # Withdrawal Requests for Merchants

  ## Overview
  This migration creates a system for merchants to request withdrawals from their wallet
  with a minimum amount of 100€ and 8% commission.

  ## Changes

  1. Create withdrawal_requests table
  2. Add indexes for performance
*/

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  requested_amount numeric NOT NULL CHECK (requested_amount >= 100),
  commission_amount numeric NOT NULL CHECK (commission_amount >= 0),
  net_amount numeric NOT NULL CHECK (net_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
  bank_account_name text,
  bank_account_iban text,
  bank_account_bic text,
  rejection_reason text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_merchant_id ON withdrawal_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_wallet_id ON withdrawal_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Function to update withdrawal_requests updated_at timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update withdrawal_requests updated_at
DROP TRIGGER IF EXISTS trigger_update_withdrawal_request_updated_at ON withdrawal_requests;
CREATE TRIGGER trigger_update_withdrawal_request_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_request_updated_at();

-- Disable Row Level Security (following project pattern)
ALTER TABLE withdrawal_requests DISABLE ROW LEVEL SECURITY;

