import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import JobsClient from "./JobsClient";

const JOB_COLORS = ["#0EA5E9", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#10b981"];
function getInitials(name: string) {
  return name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; status: string } | null };

  if (!profile || profile.status !== "approved") redirect("/");
  if (profile.role === "employer") redirect("/dashboard");

  const { data: rawJobs } = await supabase
    .from("jobs")
    .select("id, title, company, location, job_type, description, is_discrete, is_junior_friendly, target_audience, early_access_until")
    .eq("status", "approved")
    .eq("is_active", true)
    .order("published_at", { ascending: false }) as unknown as { data: Array<{ id: string; title: string; company: string; location: string; job_type: string; description: string; is_discrete: boolean; is_junior_friendly: boolean; target_audience: string[] | null; early_access_until: string; }> | null };

  const now = Date.now();
  const jobs = (rawJobs ?? []).map((job) => {
    if (profile.role === "student_gcp") {
      const accessDate = new Date(job.early_access_until).getTime();
      if (accessDate > now) {
        return { ...job, locked: true, hoursLeft: Math.ceil((accessDate - now) / 3_600_000) };
      }
    }
    return { ...job, locked: false };
  });

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }} dir="rtl">
      <div className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between" style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
        <div>
          <h1 className="text-white font-black text-lg md:text-xl" style={{ letterSpacing: "-0.02em" }}>לוח המשרות</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">{jobs.length} משרות פעילות</p>
        </div>
        <span className="hidden md:inline-flex text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: profile.role === "student_cra" ? "rgba(139,92,246,0.15)" : "rgba(14,165,233,0.15)", color: profile.role === "student_cra" ? "#a78bfa" : "#38bdf8", border: `1px solid ${profile.role === "student_cra" ? "rgba(139,92,246,0.3)" : "rgba(14,165,233,0.3)"}` }}>
          {profile.role === "student_cra" ? "בוגר CRA" : "בוגר GCP"}
        </span>
      </div>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <JobsClient jobs={jobs} role={profile.role} />
      </main>
    </div>
  );
}
