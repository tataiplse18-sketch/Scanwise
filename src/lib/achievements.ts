// ============================================================
// ScanWise - Achievement Checking Logic
// ============================================================
//
// This module provides functions to check, unlock, and track
// user achievements. It is designed to be called from client
// components after actions like scanning, sharing, or comparing.
// ============================================================

import { createClient } from "@/lib/supabase/client";
import type {
  Achievement,
  UserAchievement,
  AchievementWithProgress,
  AchievementCategory,
} from "@/types";

// ──────────────────────────────────────────────
// Types for achievement check results
// ──────────────────────────────────────────────

interface AchievementProgressData {
  scan_count: number;
  is_premium: boolean;
  current_streak: number;
  shares_count: number;
  compares_count: number;
  healthy_count: number;
  junk_count: number;
}

interface UnlockedAchievement {
  id: string;
  title: string;
  icon: string;
  points: number;
  description: string;
}

// ──────────────────────────────────────────────
// Main: Check and Unlock Achievements
// ──────────────────────────────────────────────

/**
 * Checks all achievements for a user and unlocks any that qualify.
 * Called after scan, share, compare, or premium upgrade actions.
 *
 * Returns an array of newly unlocked achievements so the UI can
 * show celebration modals.
 */
export async function checkAndUnlockAchievements(
  userId: string
): Promise<UnlockedAchievement[]> {
  const supabase = createClient();

  // 1. Fetch all achievement definitions
  const { data: allAchievements, error: achError } = await supabase
    .from("achievements")
    .select("*");

  if (achError || !allAchievements || allAchievements.length === 0) {
    console.error("Failed to fetch achievements:", achError);
    return [];
  }

  // 2. Fetch user's current achievement progress
  const { data: userAchs } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  const userAchMap = new Map<string, UserAchievement>();
  (userAchs || []).forEach((ua: UserAchievement) => {
    userAchMap.set(ua.achievement_id, ua);
  });

  // 3. Fetch user's progress data
  const progressData = await fetchProgressData(userId, supabase);

  // 4. Check each achievement
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const ach of allAchievements as Achievement[]) {
    const existing = userAchMap.get(ach.id);

    // Skip if already unlocked
    if (existing?.is_unlocked) continue;

    // Calculate current progress for this achievement
    const currentProgress = calculateProgress(ach, progressData);

    if (currentProgress >= ach.requirement) {
      // UNLOCK this achievement!
      const unlockData = {
        user_id: userId,
        achievement_id: ach.id,
        progress: ach.requirement,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing record
        await supabase
          .from("user_achievements")
          .update({
            progress: ach.requirement,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert new record
        await supabase.from("user_achievements").insert(unlockData);
      }

      // Add XP to profile
      await supabase.rpc("increment_xp", {
        user_id: userId,
        xp_amount: ach.points,
      }).catch(() => {
        // Fallback if RPC not available: manual update
        incrementXPManual(userId, ach.points);
      });

      newlyUnlocked.push({
        id: ach.id,
        title: ach.title,
        icon: ach.icon,
        points: ach.points,
        description: ach.description,
      });
    } else if (existing) {
      // Update progress if changed
      if (existing.progress !== currentProgress) {
        await supabase
          .from("user_achievements")
          .update({ progress: currentProgress })
          .eq("id", existing.id);
      }
    } else if (currentProgress > 0) {
      // Create initial progress record
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: ach.id,
        progress: currentProgress,
        is_unlocked: false,
        unlocked_at: null,
      });
    }
  }

  return newlyUnlocked;
}

// ──────────────────────────────────────────────
// Get All Achievements with Progress for Display
// ──────────────────────────────────────────────

/**
 * Returns all achievements with the user's current progress.
 * Used by the achievements page to render the grid.
 */
export async function getAchievementProgress(
  userId: string
): Promise<AchievementWithProgress[]> {
  const supabase = createClient();

  // Fetch all achievement definitions
  const { data: allAchievements, error } = await supabase
    .from("achievements")
    .select("*")
    .order("category", { ascending: true })
    .order("requirement", { ascending: true });

  if (error || !allAchievements) {
    console.error("Failed to fetch achievements:", error);
    return [];
  }

  // Fetch user's current progress
  const { data: userAchs } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  const userAchMap = new Map<string, UserAchievement>();
  (userAchs || []).forEach((ua: UserAchievement) => {
    userAchMap.set(ua.achievement_id, ua);
  });

  // Fetch progress data for calculations
  const progressData = await fetchProgressData(userId, supabase);

  // Combine achievement definitions with user progress
  return (allAchievements as Achievement[]).map((ach) => {
    const existing = userAchMap.get(ach.id);
    const calculatedProgress = calculateProgress(ach, progressData);

    return {
      ...ach,
      progress: existing?.is_unlocked
        ? ach.requirement
        : Math.min(calculatedProgress, ach.requirement),
      is_unlocked: existing?.is_unlocked ?? false,
      unlocked_at: existing?.unlocked_at ?? null,
    };
  });
}

// ──────────────────────────────────────────────
// Streak Tracking
// ──────────────────────────────────────────────

/**
 * Updates the user's scanning streak after a scan.
 * - If last_scan_date was yesterday: increment streak
 * - If last_scan_date is today: no change
 * - If last_scan_date was before yesterday: reset to 1
 */
export async function updateStreak(userId: string): Promise<void> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_scan_date, current_streak, longest_streak")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastScan = profile.last_scan_date
    ? new Date(profile.last_scan_date)
    : null;

  let newStreak = 1;
  let newLongest = profile.longest_streak ?? 0;

  if (lastScan) {
    lastScan.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // Already scanned today, no change
      return;
    } else if (diffDays === 1) {
      // Scanned yesterday, increment streak
      newStreak = (profile.current_streak ?? 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  }

  newLongest = Math.max(newLongest, newStreak);

  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_scan_date: today.toISOString().split("T")[0],
    })
    .eq("id", userId);
}

// ──────────────────────────────────────────────
// Increment counters for social achievements
// ──────────────────────────────────────────────

/**
 * Increments the user's share count and checks share achievements.
 */
export async function incrementShareCount(userId: string): Promise<UnlockedAchievement[]> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("shares_count")
    .eq("id", userId)
    .single();

  const newCount = (profile?.shares_count ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({ shares_count: newCount })
    .eq("id", userId);

  return checkAndUnlockAchievements(userId);
}

/**
 * Increments the user's compare count and checks compare achievements.
 */
export async function incrementCompareCount(userId: string): Promise<UnlockedAchievement[]> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("compares_count")
    .eq("id", userId)
    .single();

  const newCount = (profile?.compares_count ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({ compares_count: newCount })
    .eq("id", userId);

  return checkAndUnlockAchievements(userId);
}

// ──────────────────────────────────────────────
// Helper: Fetch all data needed for progress calculation
// ──────────────────────────────────────────────

async function fetchProgressData(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<AchievementProgressData> {
  // Fetch profile stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("scan_count, is_premium, current_streak, shares_count, compares_count")
    .eq("id", userId)
    .single();

  // Count healthy scans (score >= 61)
  const { count: healthyCount } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("health_score", 61);

  // Count junk scans (score < 30)
  const { count: junkCount } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lt("health_score", 30);

  return {
    scan_count: profile?.scan_count ?? 0,
    is_premium: profile?.is_premium ?? false,
    current_streak: profile?.current_streak ?? 0,
    shares_count: profile?.shares_count ?? 0,
    compares_count: profile?.compares_count ?? 0,
    healthy_count: healthyCount ?? 0,
    junk_count: junkCount ?? 0,
  };
}

// ──────────────────────────────────────────────
// Helper: Calculate progress for a specific achievement
// ──────────────────────────────────────────────

function calculateProgress(
  ach: Achievement,
  data: AchievementProgressData
): number {
  const categoryMap: Record<AchievementCategory, () => number> = {
    scans: () => data.scan_count,
    health: () => {
      // Determine which health metric based on achievement id
      if (ach.id.startsWith("healthy_")) return data.healthy_count;
      if (ach.id.startsWith("avoid_junk_")) return data.junk_count;
      return 0;
    },
    streak: () => data.current_streak,
    social: () => {
      if (ach.id.startsWith("compare_")) return data.compares_count;
      if (ach.id.startsWith("share_")) return data.shares_count;
      return 0;
    },
    premium: () => (data.is_premium ? 1 : 0),
  };

  return categoryMap[ach.category]?.() ?? 0;
}

// ──────────────────────────────────────────────
// Helper: Manual XP increment (fallback if RPC not available)
// ──────────────────────────────────────────────

async function incrementXPManual(userId: string, xpAmount: number): Promise<void> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_points, level")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const newXP = (profile.xp_points ?? 0) + xpAmount;
  const newLevel = Math.floor(newXP / 100) + 1;

  await supabase
    .from("profiles")
    .update({
      xp_points: newXP,
      level: newLevel,
    })
    .eq("id", userId);
}
