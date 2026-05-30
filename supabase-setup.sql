-- ============================================================
-- ScanWise - Supabase Database Setup
-- ============================================================
-- Run this SQL in Supabase SQL Editor to create the required tables.
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users with app-specific data)
-- This table stores user profile data including onboarding state,
-- dietary preferences, allergens, and scan tracking.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  dietary_pref TEXT,           -- 'veg' | 'non-veg' | 'vegan' | 'jain'
  allergens TEXT[] DEFAULT '{}', -- Array of allergen strings
  onboarding_done BOOLEAN DEFAULT false,
  scan_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SCANS TABLE (stores barcode scan history)
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT NOT NULL,
  health_score INTEGER,
  risk_level TEXT,              -- 'poor' | 'fair' | 'good' | 'great'
  nutrition JSONB,
  ingredients JSONB,
  allergens JSONB DEFAULT '[]',
  nova_group INTEGER,
  alternatives JSONB DEFAULT '[]',
  ai_verdict TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES - Users can only access their own data

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Scans: users can read/insert their own scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON scans
  FOR DELETE USING (auth.uid() = user_id);

-- 5. AUTO-CREATE PROFILE ON SIGNUP (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. INDEX for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);
