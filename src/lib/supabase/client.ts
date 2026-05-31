import { createBrowserClient } from "@supabase/ssr";

/**
 * Global type declaration for the Supabase client singleton.
 * Prevents multiple client instances during development hot-reloading.
 */
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: ReturnType<typeof createBrowserClient> | undefined;
}

/**
 * Creates or returns the singleton browser-side Supabase client.
 *
 * Uses the singleton pattern with globalThis to ensure only one instance
 * of the Supabase client exists throughout the application lifecycle.
 * This is important because React's strict mode and hot module reloading
 * can cause multiple instances to be created, leading to auth state issues.
 *
 * During SSR/static generation (build time), returns a no-op proxy
 * that doesn't require env vars. The real client is created on mount.
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  // Return existing singleton if available
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During SSR/build without env vars, return a proxy that defers to real client
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      // Server-side without env vars: return a safe no-op proxy
      const noopProxy = new Proxy({} as ReturnType<typeof createBrowserClient>, {
        get() {
          return () => Promise.resolve({ data: null, error: null });
        },
      });
      return noopProxy;
    }
    // Client-side without env vars: this shouldn't happen in production
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Create new client instance
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

  // Store in global singleton (only on client side)
  if (typeof window !== "undefined") {
    globalThis.__supabaseClient = client;
  }

  return client;
}
