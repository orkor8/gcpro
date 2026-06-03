import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotChat } from "./BotChat";

export default async function BotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; status: string; full_name: string } | null };

  if (!profile || profile.status !== "approved") redirect("/");

  return <BotChat userName={profile.full_name} role={profile.role} />;
}
