-- ============================================================
-- ScanWise - Achievement/Badge System Database Setup
-- ============================================================
-- Run this SQL in Supabase SQL Editor to create the
-- achievements and user_achievements tables with seed data.
-- ============================================================

-- Achievement definitions table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  requirement INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievement progress + unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) NOT NULL,
  progress INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can insert own achievements') THEN
    CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can update own achievements') THEN
    CREATE POLICY "Users can update own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Anyone can view achievement definitions
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Anyone can view achievements') THEN
    CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
  END IF;
END
$$;

-- Seed achievement definitions
INSERT INTO achievements (id, title, description, icon, category, tier, requirement, points) VALUES
-- Scan milestones
('first_scan', 'First Scan', 'Scan your very first product', '🎯', 'scans', 'bronze', 1, 10),
('scan_5', 'Curious Scanner', 'Scan 5 products', '🔍', 'scans', 'bronze', 5, 20),
('scan_25', 'Scan Explorer', 'Scan 25 products', '🔭', 'scans', 'silver', 25, 50),
('scan_50', 'Scan Master', 'Scan 50 products', '🏅', 'scans', 'silver', 50, 100),
('scan_100', 'Scan Legend', 'Scan 100 products', '👑', 'scans', 'gold', 100, 200),
('scan_250', 'Scan God', 'Scan 250 products', '💎', 'scans', 'platinum', 250, 500),
-- Health milestones
('healthy_5', 'Health Starter', 'Scan 5 products with good/great scores', '🥗', 'health', 'bronze', 5, 25),
('healthy_15', 'Health Champion', 'Scan 15 products with good/great scores', '💪', 'health', 'silver', 15, 50),
('healthy_30', 'Health Warrior', 'Scan 30 products with good/great scores', '🛡️', 'health', 'gold', 30, 100),
('avoid_junk_5', 'Junk Avoider', 'Identify 5 poor-rated products', '🚫', 'health', 'bronze', 5, 15),
('avoid_junk_20', 'Junk Fighter', 'Identify 20 poor-rated products', '⚔️', 'health', 'silver', 20, 40),
-- Streak achievements
('streak_3', '3-Day Streak', 'Scan at least 1 product for 3 days in a row', '🔥', 'streak', 'bronze', 3, 30),
('streak_7', 'Weekly Warrior', '7-day scanning streak', '📅', 'streak', 'silver', 7, 75),
('streak_30', 'Monthly Master', '30-day scanning streak', '🗓️', 'streak', 'gold', 30, 200),
-- Social
('compare_first', 'First Comparison', 'Compare 2 products side by side', '⚖️', 'social', 'bronze', 1, 15),
('compare_5', 'Comparison Pro', 'Compare 5 different product pairs', '📊', 'social', 'silver', 5, 40),
('share_first', 'Sharing is Caring', 'Share your first scan result', '📤', 'social', 'bronze', 1, 15),
('share_10', 'Influencer', 'Share 10 scan results', '🌟', 'social', 'silver', 10, 50),
-- Premium
('upgrade_premium', 'Premium Member', 'Upgrade to ScanWise Premium', '👑', 'premium', 'gold', 1, 100)
ON CONFLICT (id) DO NOTHING;

-- Add XP points, level, streak, and tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_scan_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compares_count INTEGER DEFAULT 0;
