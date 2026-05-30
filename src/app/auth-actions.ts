"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ============================================================
// ScanWise - Server Actions for Authentication
// ============================================================
//
// All auth operations run on the SERVER so that Supabase cookies
// (access_token, refresh_token) are set in the HTTP response
// headers. This eliminates the cookie-sync issue that occurs when
// auth is done client-side and the server component cannot read
// the session on the next request.
//
// Flow:
// 1. Client component calls the server action
// 2. Server action uses the SERVER Supabase client (sets cookies)
// 3. On success, redirect() is called — Next.js handles the
//    redirect and the browser receives the Set-Cookie headers
// 4. The target page's server component reads the session correctly
// ============================================================

/**
 * Server Action: Login with email and password.
 *
 * Uses the server-side Supabase client so auth cookies are set
 * in the response headers, ensuring proper session persistence.
 * On success, redirects to /home via Next.js server redirect.
 */
export async function loginAction(formData: FormData): Promise<{ error: string | null }> {
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

  // redirect() throws NEXT_REDIRECT internally — Next.js handles it.
  // The redirect response includes the Set-Cookie headers from
  // the Supabase server client, so the session is properly persisted.
  redirect("/home");
}

/**
 * Server Action: Sign up with full name, email, and password.
 *
 * If email confirmation is disabled in Supabase, the user is
 * auto-confirmed and redirected to /home.
 * If email confirmation is required, returns a flag so the client
 * can display the verification email message.
 */
export async function signupAction(formData: FormData): Promise<{
  error: string | null;
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

  // If session exists, user is auto-confirmed (email confirmation disabled)
  // Redirect directly to /home
  if (data.session) {
    redirect("/home");
  }

  // Email confirmation required — return info so client can show message
  return { error: null, emailConfirmation: true, email };
}

/**
 * Server Action: Log out the current user.
 *
 * Signs out on the server side, which clears the auth cookies
 * from the response. Then redirects to /login.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
