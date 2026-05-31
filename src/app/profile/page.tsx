import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: scanCount } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: achievementsCount } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_unlocked", true);

  return (
    <ProfileClient
      profile={
        profile ?? {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? null,
          email: user.email ?? "",
          avatar_url: null,
          scan_count: 0,
          is_premium: false,
          dietary_pref: null,
          allergens: [],
          onboarding_done: false,
          created_at: user.created_at,
        }
      }
      scanCount={scanCount ?? 0}
      achievementsCount={achievementsCount ?? 0}
    />
  );
}
