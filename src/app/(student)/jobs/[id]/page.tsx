import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; status: string } | null };

  if (!profile || profile.status !== "approved") redirect("/");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .eq("is_active", true)
    .single() as unknown as { data: { id: string; title: string; company: string; location: string; job_type: string; description: string; requirements: string | null; is_discrete: boolean; is_junior_friendly: boolean; target_audience: string[] | null; application_method: string; experience_level: string | null; salary_range: string | null; start_date: string | null; travel_percent: number | null; therapeutic_area: string | null; trial_phase: string | null; } | null };

  if (!job) redirect("/");

  const isEmail = job.application_method?.includes("@");
  const applyHref = isEmail ? `mailto:${job.application_method}` : job.application_method;

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }}
      dir="rtl"
    >
      {/* Page header strip */}
      <div
        className="px-8 py-5 flex items-center gap-4"
        style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}
      >
        <Link href="/jobs" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          לוח משרות
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white font-semibold text-sm truncate">{job.title}</span>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-5" style={{ border: "1.5px solid #f1f5f9" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {job.is_junior_friendly && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ ג׳וניור</span>
                )}
                {(job.target_audience as string[] ?? []).map((a: string) => (
                  <span key={a} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>
                    {a === "student_cra" ? "CRA" : "GCP"}
                  </span>
                ))}
              </div>
              <h1 className="font-black text-2xl mb-1" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>{job.title}</h1>
              <p className="text-slate-500">{job.is_discrete ? "חברה דיסקרטית" : job.company}</p>
            </div>

            <a
              href={applyHref}
              target={isEmail ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl font-bold text-white text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
            >
              הגש מועמדות ←
            </a>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "📍", text: job.location },
              { icon: "⏱", text: job.job_type },
              ...(job.experience_level ? [{ icon: "🎓", text: job.experience_level }] : []),
              ...(job.salary_range ? [{ icon: "💰", text: job.salary_range }] : []),
              ...(job.start_date ? [{ icon: "📅", text: `התחלה: ${job.start_date}` }] : []),
              ...(job.travel_percent != null ? [{ icon: "✈️", text: `${job.travel_percent}% נסיעות` }] : []),
              ...(job.therapeutic_area ? [{ icon: "🔬", text: job.therapeutic_area + (job.trial_phase ? ` · Phase ${job.trial_phase}` : "") }] : []),
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl" style={{ background: "#f8fafc", color: "#475569" }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-5" style={{ border: "1.5px solid #f1f5f9" }}>
          <h2 className="font-bold text-base mb-4" style={{ color: "#0F2645" }}>תיאור המשרה</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white rounded-3xl p-8 shadow-sm mb-5" style={{ border: "1.5px solid #f1f5f9" }}>
            <h2 className="font-bold text-base mb-4" style={{ color: "#0F2645" }}>דרישות סף</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </div>
        )}

        {/* Apply CTA */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-5 text-center" style={{ border: "1.5px solid #f1f5f9" }}>
          <p className="font-bold text-base mb-1" style={{ color: "#0F2645" }}>מעוניין/ת בתפקיד?</p>
          <p className="text-slate-500 text-sm mb-5">
            {isEmail ? `שלח/י קורות חיים ל-${job.application_method}` : "לחץ/י על הכפתור להגשת מועמדות"}
          </p>
          <a
            href={applyHref}
            target={isEmail ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
          >
            הגש מועמדות ←
          </a>
        </div>

        {/* Continue browsing */}
        <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
          <p className="font-bold text-sm mb-4" style={{ color: "#0F2645" }}>המשך לגלוש</p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/jobs" className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-slate-50" style={{ border: "1px solid #f1f5f9" }}>
              <span className="text-xl">💼</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#0F2645" }}>כל המשרות</div>
                <div className="text-xs text-slate-400">חזרה ללוח המשרות</div>
              </div>
            </Link>
            <Link href="/profile/edit" className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-slate-50" style={{ border: "1px solid #f1f5f9" }}>
              <span className="text-xl">👤</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#0F2645" }}>הפרופיל שלי</div>
                <div className="text-xs text-slate-400">עדכן פרטים וכישורים</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
