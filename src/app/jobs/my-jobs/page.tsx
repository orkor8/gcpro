import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EmployerSidebar } from "@/components/ui/EmployerSidebar";
import { Footer } from "@/components/ui/Footer";
import { JobActionsClient } from "./JobActionsClient";
import type { UserRole } from "@/types/database";

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  pending:  { text: "ממתין לאישור", color: "#d97706", bg: "#fef9c3" },
  approved: { text: "פעיל",          color: "#16a34a", bg: "#dcfce7" },
  rejected: { text: "נדחה",          color: "#dc2626", bg: "#fee2e2" },
};

export default async function MyJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; updated?: string }>;
}) {
  const { submitted, updated } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "employer") redirect("/dashboard");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }} dir="rtl">
      <EmployerSidebar />
      <div className="lg:mr-[260px] pt-14 lg:pt-0 flex flex-col min-h-screen">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 flex-1">
        {submitted && (
          <div className="mb-6 p-4 rounded-2xl text-sm font-medium" style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}>
            ✓ המשרה נשלחה בהצלחה ותעלה לאוויר לאחר אישור האדמין
          </div>
        )}
        {updated && (
          <div className="mb-6 p-4 rounded-2xl text-sm font-medium" style={{ background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
            ✓ המשרה עודכנה ונשלחה לאישור מחדש
          </div>
        )}

        <h1 className="font-black text-2xl mb-1" style={{ color: "#0F2645" }}>המשרות שלי</h1>
        <p className="text-slate-500 text-sm mb-8">{jobs?.length ?? 0} משרות</p>

        {!jobs?.length && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-slate-400 mb-4">עדיין לא פרסמת משרות</p>
            <Link
              href="/jobs/post"
              className="px-6 py-3 rounded-xl text-sm font-bold text-white inline-block"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
            >
              פרסם משרה ראשונה
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {jobs?.map((job) => {
            const s = statusLabel[job.status] ?? statusLabel.pending;
            return (
              <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.text}
                      </span>
                      {job.status === "approved" && !job.is_active && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                          מושבת
                        </span>
                      )}
                      {job.is_junior_friendly && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>
                          ✓ ג׳וניור
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-lg" style={{ color: "#0F2645" }}>{job.title}</h2>
                    <p className="text-slate-500 text-sm">{job.location} · {job.job_type}</p>
                    {job.rejection_reason && (
                      <p className="text-red-500 text-xs mt-1">סיבת דחייה: {job.rejection_reason}</p>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(job.created_at).toLocaleDateString("he-IL")}
                  </div>
                </div>
                <JobActionsClient jobId={job.id} status={job.status} isActive={job.is_active ?? true} />
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
}
