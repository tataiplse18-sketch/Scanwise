import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * This function handles cookie management for authentication state persistence.
 * The setAll method is wrapped in a try/catch because cookie setting can fail
 * in Server Components (where response headers cannot be modified after streaming
 * starts). In those cases, we gracefully handle the error without throwing.
 *
 * @returns Supabase server client instance with cookie management
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves all cookies from the request.
         * Used by Supabase to read the current auth session.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Sets multiple cookies on the response.
         * Used by Supabase to persist refreshed auth tokens.
         *
         * Wrapped in try/catch because setting cookies can fail in
         * Server Components where the response has already started streaming.
         * This is expected behavior and should not throw an error.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be ignored if middleware
            // refreshes the session cookies.
          }
        },
      },
    }
  );
}
