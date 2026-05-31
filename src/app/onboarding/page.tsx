import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Check if onboarding is already done
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done, full_name")
    .eq("id", user.id)
    .single();

  // If onboarding already done, go to home
  if (profile?.onboarding_done) {
    redirect("/home");
  }

  return (
    <OnboardingClient
      defaultName={profile?.full_name || user.user_metadata?.full_name || ""}
    />
  );
}
