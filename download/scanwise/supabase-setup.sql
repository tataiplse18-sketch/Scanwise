-- ============================================================
-- ScanWise - Supabase Database Setup (Safe - Idempotent)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  dietary_pref TEXT,
  allergens TEXT[] DEFAULT '{}',
  scan_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  onboarding_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies (safe - only create if not exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own profile') THEN
    CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- 2. Create products table (if not exists)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Unknown Product',
  brand TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read products') THEN
    CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert products') THEN
    CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update products') THEN
    CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 3. Create scan_results table (if not exists)
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  barcode TEXT NOT NULL,
  health_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'fair',
  nutrition JSONB DEFAULT '{}',
  ingredients JSONB DEFAULT '[]',
  allergens TEXT[] DEFAULT '{}',
  nova_group INTEGER DEFAULT 4,
  alternatives TEXT[] DEFAULT '{}',
  ai_verdict TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add scanned_at column if missing (for existing tables)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scan_results' AND column_name = 'scanned_at'
  ) THEN
    ALTER TABLE scan_results ADD COLUMN scanned_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own scans') THEN
    CREATE POLICY "Users can view own scans" ON scan_results FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own scans') THEN
    CREATE POLICY "Users can insert own scans" ON scan_results FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own scans') THEN
    CREATE POLICY "Users can delete own scans" ON scan_results FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RPC function to increment scan count
-- Drop first to avoid "cannot change return type" error if function exists with different signature
DROP FUNCTION IF EXISTS public.increment_scan_count(UUID);
CREATE OR REPLACE FUNCTION public.increment_scan_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET scan_count = scan_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_scanned_at ON scan_results(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
