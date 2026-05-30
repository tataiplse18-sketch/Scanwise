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
 * @returns Supabase browser client instance
 */
export function createClient() {
  // Return existing singleton if available
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient;
  }

  // Create new client instance
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Store in global singleton
  globalThis.__supabaseClient = client;

  return client;
}
