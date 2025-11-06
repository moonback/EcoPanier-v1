/*
  # Extend Wallet System to Merchants

  ## Overview
  This migration extends the wallet system to merchants, allowing them to receive payments
  when customers confirm receipt of their lots.

  ## Changes

  1. Update wallet creation trigger to also create wallets for merchants
  2. Add customer_confirmed field to reservations table
  3. Add merchant_payment transaction type to wallet_transactions
  4. Create wallets for existing merchants
*/

-- Add customer_confirmed field to reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS customer_confirmed boolean DEFAULT false;

-- Add index for customer_confirmed
CREATE INDEX IF NOT EXISTS idx_reservations_customer_confirmed ON reservations(customer_confirmed);

-- Update wallet_transactions type constraint to include merchant_payment
ALTER TABLE wallet_transactions 
DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;

ALTER TABLE wallet_transactions 
ADD CONSTRAINT wallet_transactions_type_check 
CHECK (type IN ('recharge', 'payment', 'refund', 'merchant_payment'));

-- Update function to create wallet for merchants too
CREATE OR REPLACE FUNCTION create_wallet_for_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Create wallet for customers and merchants
  IF NEW.role IN ('customer', 'merchant') THEN
    INSERT INTO wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create wallets for existing merchants
INSERT INTO wallets (user_id, balance)
SELECT id, 0
FROM profiles
WHERE role = 'merchant'
ON CONFLICT (user_id) DO NOTHING;

