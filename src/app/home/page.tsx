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

  // Fetch user profile from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If onboarding not done, redirect to onboarding flow
  if (!profile?.onboarding_done) {
    redirect("/onboarding");
  }

  // Fetch last 5 scans ordered by most recent
  const { data: recentScans } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false })
    .limit(5);

  // Fetch scans from the last 7 days for weekly report
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weeklyScans } = await supabase
    .from("scans")
    .select("health_score, scanned_at")
    .eq("user_id", user.id)
    .gte("scanned_at", sevenDaysAgo.toISOString())
    .order("scanned_at", { ascending: true });

  return (
    <DashboardClient
      profile={profile ?? {
        full_name: user.user_metadata?.full_name ?? null,
        free_scans_remaining: Math.max(0, 5 - (profile?.scan_count ?? 0)),
        is_premium: false,
        scan_count: 0,
        dietary_pref: null,
        allergens: [],
        xp_points: 0,
        level: 1,
      }}
      recentScans={recentScans ?? []}
      weeklyScans={weeklyScans ?? []}
    />
  );
}
