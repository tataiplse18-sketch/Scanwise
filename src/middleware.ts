import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase auth middleware for Next.js App Router.
 *
 * This middleware runs on every matched request and:
 * 1. Creates a Supabase server client with cookie access
 * 2. Refreshes the user's auth session by calling getUser()
 * 3. Ensures cookies are synced between the request and response
 *
 * This ensures that the user's authentication state is always fresh
 * and consistent across server components and API routes.
 */
export async function middleware(request: NextRequest) {
  // Create a baseline response that passes through the request
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase server client with cookie management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves all cookies from the incoming request.
         * Used by Supabase to read the current auth session.
         */
        getAll() {
          return request.cookies.getAll();
        },

        /**
         * Sets cookies on both the Supabase response and the request.
         *
         * Setting on the request ensures that downstream Server Components
         * and Route Handlers see the updated cookies. Setting on the response
         * ensures the browser receives the updated cookies.
         */
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Calling getUser() refreshes the auth session.
  // Without this, the session can become stale and the user
  // will appear logged out even if they have a valid session.
  await supabase.auth.getUser();

  return supabaseResponse;
}

/**
 * Middleware matcher configuration.
 *
 * Excludes static assets and image files from middleware processing
 * to avoid unnecessary auth checks on public resources.
 *
 * Pattern explanation:
 * - _next/static  → Next.js static files (JS, CSS chunks)
 * - _next/image   → Next.js image optimization endpoint
 * - favicon.ico   → Browser favicon request
 * - *.(svg|png|jpg|jpeg|gif|webp) → Static image files
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
