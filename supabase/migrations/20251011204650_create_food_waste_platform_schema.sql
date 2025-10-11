/*
  # Food Waste Platform Database Schema

  ## Overview
  This migration creates a comprehensive anti-food waste and social solidarity platform
  that connects merchants, customers, collectors, beneficiaries, and associations.

  ## 1. New Tables

  ### `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `role` (text) - user role: customer, merchant, beneficiary, collector, admin
  - `full_name` (text) - user's full name
  - `phone` (text) - contact phone number
  - `address` (text) - physical address
  - `business_name` (text) - for merchants
  - `business_address` (text) - for merchants
  - `latitude` (numeric) - geolocation latitude
  - `longitude` (numeric) - geolocation longitude
  - `beneficiary_id` (text) - unique ID format YYYY-BEN-XXXXX
  - `verified` (boolean) - beneficiary verification status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `lots`
  Product lots posted by merchants
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, references profiles)
  - `title` (text) - lot title
  - `description` (text) - detailed description
  - `category` (text) - food category
  - `original_price` (numeric) - original retail price
  - `discounted_price` (numeric) - discounted selling price
  - `quantity_total` (integer) - total available quantity
  - `quantity_reserved` (integer) - currently reserved quantity
  - `quantity_sold` (integer) - sold quantity
  - `pickup_start` (timestamptz) - pickup window start
  - `pickup_end` (timestamptz) - pickup window end
  - `requires_cold_chain` (boolean) - cold chain requirement
  - `is_urgent` (boolean) - urgency flag
  - `status` (text) - available, reserved, sold_out, expired
  - `image_urls` (text[]) - product images
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `reservations`
  Customer and beneficiary reservations
  - `id` (uuid, primary key)
  - `lot_id` (uuid, references lots)
  - `user_id` (uuid, references profiles)
  - `quantity` (integer) - reserved quantity
  - `total_price` (numeric) - total price for reservation
  - `pickup_pin` (text) - 6-digit PIN code
  - `status` (text) - pending, confirmed, completed, cancelled
  - `is_donation` (boolean) - suspended basket donation
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `missions`
  Collector delivery missions
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, references profiles)
  - `collector_id` (uuid, references profiles)
  - `title` (text) - mission title
  - `description` (text) - mission details
  - `pickup_address` (text) - pickup location
  - `delivery_address` (text) - delivery destination
  - `pickup_latitude` (numeric)
  - `pickup_longitude` (numeric)
  - `delivery_latitude` (numeric)
  - `delivery_longitude` (numeric)
  - `requires_cold_chain` (boolean)
  - `is_urgent` (boolean)
  - `payment_amount` (numeric) - collector payment
  - `status` (text) - available, accepted, in_progress, completed, cancelled
  - `proof_urls` (text[]) - proof photos/signatures
  - `created_at` (timestamptz)
  - `accepted_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `beneficiary_daily_limits`
  Track daily reservation limits for beneficiaries
  - `id` (uuid, primary key)
  - `beneficiary_id` (uuid, references profiles)
  - `date` (date) - reservation date
  - `reservation_count` (integer) - number of reservations today
  - `created_at` (timestamptz)

  ### `impact_metrics`
  Environmental and social impact tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `metric_type` (text) - meals_saved, co2_saved, money_saved, donations_made
  - `value` (numeric) - metric value
  - `date` (date) - metric date
  - `created_at` (timestamptz)

  ### `notifications`
  User notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `message` (text)
  - `type` (text) - info, success, warning, error
  - `read` (boolean)
  - `created_at` (timestamptz)

  ## 2. Security

  Row Level Security (RLS) is DISABLED for all tables.
  All authenticated users have full access to all data.

  ## 3. Important Notes

  - Beneficiary IDs follow the format YYYY-BEN-XXXXX (e.g., 2025-BEN-00001)
  - Daily limit for beneficiaries is 2 reservations per day
  - All timestamps use timestamptz for timezone awareness
  - Geolocation data uses numeric type for precise coordinates
  - Images and proofs stored as arrays of URLs
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('customer', 'merchant', 'beneficiary', 'collector', 'admin')),
  full_name text NOT NULL,
  phone text,
  address text,
  business_name text,
  business_address text,
  latitude numeric,
  longitude numeric,
  beneficiary_id text UNIQUE,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lots table
CREATE TABLE IF NOT EXISTS lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  original_price numeric NOT NULL CHECK (original_price >= 0),
  discounted_price numeric NOT NULL CHECK (discounted_price >= 0),
  quantity_total integer NOT NULL CHECK (quantity_total >= 0),
  quantity_reserved integer DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_sold integer DEFAULT 0 CHECK (quantity_sold >= 0),
  pickup_start timestamptz NOT NULL,
  pickup_end timestamptz NOT NULL,
  requires_cold_chain boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold_out', 'expired')),
  image_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  pickup_pin text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_donation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  pickup_address text NOT NULL,
  delivery_address text NOT NULL,
  pickup_latitude numeric,
  pickup_longitude numeric,
  delivery_latitude numeric,
  delivery_longitude numeric,
  requires_cold_chain boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  payment_amount numeric NOT NULL CHECK (payment_amount >= 0),
  status text DEFAULT 'available' CHECK (status IN ('available', 'accepted', 'in_progress', 'completed', 'cancelled')),
  proof_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

-- Create beneficiary daily limits table
CREATE TABLE IF NOT EXISTS beneficiary_daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  reservation_count integer DEFAULT 0 CHECK (reservation_count >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(beneficiary_id, date)
);

-- Create impact metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('meals_saved', 'co2_saved', 'money_saved', 'donations_made')),
  value numeric NOT NULL CHECK (value >= 0),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Disable Row Level Security completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_daily_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_beneficiary_id ON profiles(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_lots_merchant_id ON lots(merchant_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_created_at ON lots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_lot_id ON reservations(lot_id);
CREATE INDEX IF NOT EXISTS idx_missions_collector_id ON missions(collector_id);
CREATE INDEX IF NOT EXISTS idx_missions_merchant_id ON missions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_limits_date ON beneficiary_daily_limits(beneficiary_id, date);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_user_date ON impact_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);