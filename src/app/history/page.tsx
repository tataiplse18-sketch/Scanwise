import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: scans } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false });

  return <HistoryClient scans={scans ?? []} />;
}
