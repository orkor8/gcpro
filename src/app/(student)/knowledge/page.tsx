import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KnowledgeClient from "./KnowledgeClient";

export default async function KnowledgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, status")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; full_name: string; status: string } | null };

  if (!profile || profile.status !== "approved") redirect("/pending");
  if (profile.role === "employer") redirect("/dashboard");
  if (profile.role === "admin") redirect("/admin");

  const isCra = profile.role === "student_cra";

  let query = supabase
    .from("knowledge_items")
    .select("id, title, description, content_url, content_type, cra_only, published_at, thumbnail_url")
    .order("published_at", { ascending: false });

  if (!isCra) {
    query = query.eq("cra_only", false);
  }

  const { data: items } = await query;

  return <KnowledgeClient items={items ?? []} isCra={isCra} />;
}
