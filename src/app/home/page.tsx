import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function HomePage() {
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user session, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch last 5 scans ordered by most recent
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false })
    .limit(5);

  return (
    <DashboardClient
      profile={profile ?? { full_name: user.user_metadata?.full_name ?? null, free_scans_remaining: 5, is_premium: false }}
      recentScans={recentScans ?? []}
    />
  );
}
