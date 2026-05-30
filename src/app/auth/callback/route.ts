import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback route handler for Supabase OAuth.
 *
 * This route handles the OAuth callback after a user signs in with
 * a third-party provider (e.g., Google). Supabase redirects to this
 * route with an authorization code in the URL search params.
 *
 * Flow:
 * 1. User clicks "Sign in with Google" on the client
 * 2. Google authenticates and redirects to this callback URL with a `code`
 * 3. We exchange the code for a session using exchangeCodeForSession()
 * 4. The session cookies are set on the response
 * 5. User is redirected to /home
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Create the redirect response upfront so cookies can be set on it
  const response = NextResponse.redirect(requestUrl.origin + "/home");

  if (code) {
    // Create Supabase server client with cookie management
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            // Set cookies on both the request (for downstream) and response (for browser)
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange the OAuth code for a valid session
    // This sets the auth cookies (access_token, refresh_token) on the response
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
