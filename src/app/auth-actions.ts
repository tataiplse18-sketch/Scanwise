"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// ScanWise - Server Actions for Authentication + Profile + Scans
// ============================================================
//
// IMPORTANT: We do NOT use redirect() inside server actions.
// In Next.js 14.2.x, redirect() throws NEXT_REDIRECT which
// can cause Set-Cookie headers to be lost in the redirect
// response. Instead, we return { success: true } and let the
// client-side code do the navigation using window.location.href
// (full page reload), which ensures cookies are properly sent.
// ============================================================

// ──────────────────────────────────────────────
// AUTH ACTIONS
// ──────────────────────────────────────────────

export async function loginAction(formData: FormData): Promise<{ error: string | null; success?: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  return { error: null, success: true };
}

export async function signupAction(formData: FormData): Promise<{
  error: string | null;
  success?: boolean;
  emailConfirmation?: boolean;
  email?: string;
}> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName?.trim()) {
    return { error: "Full name is required." };
  }

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  if (data.session) {
    return { error: null, success: true };
  }

  return { error: null, emailConfirmation: true, email };
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}

// ──────────────────────────────────────────────
// ONBOARDING ACTION
// ──────────────────────────────────────────────

export async function saveOnboardingAction(formData: FormData): Promise<{
  error: string | null;
  success?: boolean;
}> {
  const fullName = formData.get("fullName") as string;
  const age = formData.get("age") as string;
  const dietaryPref = formData.get("dietaryPref") as string;
  const allergensRaw = formData.get("allergens") as string;

  if (!fullName?.trim()) {
    return { error: "Name is required." };
  }

  if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
    return { error: "Please enter a valid age (1-120)." };
  }

  if (!dietaryPref) {
    return { error: "Please select a dietary preference." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated. Please log in again." };
  }

  // Parse allergens from JSON string
  let allergens: string[] = [];
  try {
    allergens = allergensRaw ? JSON.parse(allergensRaw) : [];
  } catch {
    allergens = [];
  }

  // Upsert profile with onboarding data
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName.trim(),
    age: Number(age),
    dietary_pref: dietaryPref,
    allergens,
    onboarding_done: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  return { error: null, success: true };
}

// ──────────────────────────────────────────────
// SCAN LIMIT ACTIONS
// ──────────────────────────────────────────────

export async function checkScanLimitAction(): Promise<{
  canScan: boolean;
  scanCount: number;
  isPremium: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { canScan: false, scanCount: 0, isPremium: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("scan_count, is_premium")
    .eq("id", user.id)
    .single();

  const scanCount = profile?.scan_count ?? 0;
  const isPremium = profile?.is_premium ?? false;

  // Free users: 5 scans max. Premium: unlimited
  const canScan = isPremium || scanCount < 5;

  return { canScan, scanCount, isPremium };
}

export async function incrementScanCountAction(): Promise<{
  success: boolean;
  scanCount?: number;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Increment scan_count atomically
  const { data, error } = await supabase.rpc("increment_scan_count", {
    user_id: user.id,
  });

  if (error) {
    // Fallback: manually increment if RPC not available
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_count")
      .eq("id", user.id)
      .single();

    const newCount = (profile?.scan_count ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ scan_count: newCount, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, scanCount: newCount };
  }

  revalidatePath("/", "layout");

  return { success: true, scanCount: data as number };
}

// ──────────────────────────────────────────────
// ACHIEVEMENT ACTIONS
// ──────────────────────────────────────────────

export async function checkAchievementsAction(): Promise<{
  success: boolean;
  newUnlocks?: Array<{
    id: string;
    title: string;
    icon: string;
    points: number;
    description: string;
  }>;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // We need to call the client-side achievements logic,
    // but since this is a server action, we replicate the
    // core logic here using the server supabase client.

    // 1. Fetch all achievement definitions
    const { data: allAchievements, error: achError } = await supabase
      .from("achievements")
      .select("*");

    if (achError || !allAchievements || allAchievements.length === 0) {
      return { success: true, newUnlocks: [] };
    }

    // 2. Fetch user's current achievements
    const { data: userAchs } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    const unlockedSet = new Set<string>();
    (userAchs || []).forEach((ua: { achievement_id: string; is_unlocked: boolean }) => {
      if (ua.is_unlocked) unlockedSet.add(ua.achievement_id);
    });

    // 3. Fetch progress data
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_count, is_premium, current_streak, shares_count, compares_count")
      .eq("id", user.id)
      .single();

    const { count: healthyCount } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("health_score", 61);

    const { count: junkCount } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lt("health_score", 30);

    const scanCount = profile?.scan_count ?? 0;
    const isPremium = profile?.is_premium ?? false;
    const currentStreak = profile?.current_streak ?? 0;
    const sharesCount = profile?.shares_count ?? 0;
    const comparesCount = profile?.compares_count ?? 0;

    // 4. Check each achievement
    const newlyUnlocked: Array<{
      id: string;
      title: string;
      icon: string;
      points: number;
      description: string;
    }> = [];

    for (const ach of allAchievements) {
      if (unlockedSet.has(ach.id)) continue;

      let progress = 0;
      switch (ach.category) {
        case "scans":
          progress = scanCount;
          break;
        case "health":
          if (ach.id.startsWith("healthy_")) progress = healthyCount ?? 0;
          else if (ach.id.startsWith("avoid_junk_")) progress = junkCount ?? 0;
          break;
        case "streak":
          progress = currentStreak;
          break;
        case "social":
          if (ach.id.startsWith("compare_")) progress = comparesCount;
          else if (ach.id.startsWith("share_")) progress = sharesCount;
          break;
        case "premium":
          progress = isPremium ? 1 : 0;
          break;
      }

      if (progress >= ach.requirement) {
        // Unlock this achievement
        const { data: existingUA } = await supabase
          .from("user_achievements")
          .select("id")
          .eq("user_id", user.id)
          .eq("achievement_id", ach.id)
          .single();

        if (existingUA) {
          await supabase
            .from("user_achievements")
            .update({
              progress: ach.requirement,
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            })
            .eq("id", existingUA.id);
        } else {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: ach.id,
            progress: ach.requirement,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          });
        }

        // Add XP to profile
        const { data: profXP } = await supabase
          .from("profiles")
          .select("xp_points, level")
          .eq("id", user.id)
          .single();

        if (profXP) {
          const newXP = (profXP.xp_points ?? 0) + ach.points;
          const newLevel = Math.floor(newXP / 100) + 1;
          await supabase
            .from("profiles")
            .update({ xp_points: newXP, level: newLevel })
            .eq("id", user.id);
        }

        newlyUnlocked.push({
          id: ach.id,
          title: ach.title,
          icon: ach.icon,
          points: ach.points,
          description: ach.description,
        });
      } else if (progress > 0) {
        // Update progress
        const { data: existingUA } = await supabase
          .from("user_achievements")
          .select("id, progress")
          .eq("user_id", user.id)
          .eq("achievement_id", ach.id)
          .single();

        if (existingUA) {
          if (existingUA.progress !== progress) {
            await supabase
              .from("user_achievements")
              .update({ progress })
              .eq("id", existingUA.id);
          }
        } else {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: ach.id,
            progress,
            is_unlocked: false,
          });
        }
      }
    }

    revalidatePath("/", "layout");

    return { success: true, newUnlocks: newlyUnlocked };
  } catch (err) {
    console.error("Achievement check failed:", err);
    return { success: false, error: "Failed to check achievements" };
  }
}

export async function updateStreakAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_scan_date, current_streak, longest_streak")
      .eq("id", user.id)
      .single();

    if (!profile) return { success: false, error: "Profile not found" };

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
        return { success: true };
      } else if (diffDays === 1) {
        newStreak = (profile.current_streak ?? 0) + 1;
      } else {
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
      .eq("id", user.id);

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update streak" };
  }
}

export async function incrementShareCountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("shares_count")
    .eq("id", user.id)
    .single();

  const newCount = (profile?.shares_count ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({ shares_count: newCount })
    .eq("id", user.id);

  return { success: true };
}

export async function incrementCompareCountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("compares_count")
    .eq("id", user.id)
    .single();

  const newCount = (profile?.compares_count ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({ compares_count: newCount })
    .eq("id", user.id);

  return { success: true };
}
