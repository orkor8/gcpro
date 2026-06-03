import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { EditJobForm } from "./EditJobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();

  if (!job) redirect("/jobs/my-jobs");

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)" }}
      dir="rtl"
    >
      <AppHeader role="employer" title="עריכת משרה" />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-black text-2xl text-white mb-1" style={{ letterSpacing: "-0.02em" }}>עריכת משרה</h1>
        <p className="text-slate-400 text-sm mb-8">לאחר השמירה המשרה תחזור למצב ממתין לאישור אדמין</p>
        <EditJobForm job={job} />
      </main>
    </div>
  );
}
