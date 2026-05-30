"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// ScanWise - Server Actions for Authentication
// ============================================================
//
// IMPORTANT: We do NOT use redirect() inside server actions.
// In Next.js 14.2.x, redirect() throws NEXT_REDIRECT which
// can cause Set-Cookie headers to be lost in the redirect
// response. Instead, we return { success: true } and let the
// client-side code do the navigation using window.location.href
// (full page reload), which ensures cookies are properly sent.
// ============================================================

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
