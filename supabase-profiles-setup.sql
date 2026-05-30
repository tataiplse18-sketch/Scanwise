-- ============================================================
-- ScanWise - Profiles Table Setup (SAFE - no duplicates)
-- ============================================================
-- Run ONLY this SQL in Supabase SQL Editor.
-- This will NOT touch the existing "scans" table or its policies.
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users with app-specific data)
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

-- 2. ENABLE ROW LEVEL SECURITY ON PROFILES ONLY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR PROFILES ONLY (using DO block to avoid duplicate errors)
DO $$
BEGIN
  -- Users can view own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Users can update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Users can insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- 4. AUTO-CREATE PROFILE ON SIGNUP (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RPC FUNCTION: increment_scan_count (used by incrementScanCountAction)
CREATE OR REPLACE FUNCTION public.increment_scan_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE profiles
  SET scan_count = scan_count + 1,
      updated_at = now()
  WHERE id = user_id
  RETURNING scan_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. INDEX for faster profile queries (safe - IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
