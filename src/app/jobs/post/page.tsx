import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobPostForm } from "./JobPostForm";
import { AppHeader } from "@/components/ui/AppHeader";
import type { UserRole } from "@/types/database";

export default async function JobPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "employer") redirect("/dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)" }}
      dir="rtl"
    >
      <AppHeader role={profile.role as UserRole} title="פרסום משרה" />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-black text-2xl text-white mb-1" style={{ letterSpacing: "-0.02em" }}>פרסם משרה</h1>
          <p className="text-slate-400 text-sm">המשרה תישלח לאישור האדמין לפני שתעלה לאוויר</p>
        </div>

        <JobPostForm />
      </main>
    </div>
  );
}
