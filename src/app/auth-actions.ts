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
