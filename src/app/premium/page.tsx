import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PremiumClient from "./PremiumClient";

export default async function PremiumPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("scan_count, is_premium")
    .eq("id", user.id)
    .single();

  return (
    <PremiumClient
      scanCount={profile?.scan_count ?? 0}
      isPremium={profile?.is_premium ?? false}
    />
  );
}
