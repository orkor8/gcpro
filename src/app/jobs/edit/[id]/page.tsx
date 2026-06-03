import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { updateJob } from "./actions";

const LOCATIONS = ["מרכז", "צפון", "דרום", "ירושלים", "היברידי", "מהבית"];
const JOB_TYPES = ["משרה מלאה", "משרה חלקית", "פרויקט זמני"];
const EXPERIENCE_LEVELS = ["ללא ניסיון / ג'וניור", "1-2 שנים", "Senior (3+)"];
const THERAPEUTIC_AREAS = ["אונקולוגיה", "קרדיולוגיה", "נוירולוגיה", "אנדוקרינולוגיה", "מחלות נדירות", "זיהומיות", "אחר"];
const TRIAL_PHASES = ["I", "II", "III", "IV"];

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
const selectStyle = { background: "#1e3a5f", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
const labelCls = "block text-xs font-semibold mb-1.5 text-slate-400";

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

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-black text-2xl text-white mb-1" style={{ letterSpacing: "-0.02em" }}>עריכת משרה</h1>
        <p className="text-slate-400 text-sm mb-8">לאחר השמירה המשרה תחזור למצב ממתין לאישור אדמין</p>

        <form action={updateJob} className="space-y-5">
          <input type="hidden" name="jobId" value={job.id} />

          {/* פרטים בסיסיים */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">פרטים בסיסיים</div>

            <div>
              <label className={labelCls}>כותרת המשרה *</label>
              <input name="title" defaultValue={job.title} required className={inputCls} style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>שם החברה *</label>
                <input name="company" defaultValue={job.company ?? ""} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls}>דיסקרטי</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" name="is_discrete" defaultChecked={job.is_discrete} className="w-4 h-4 accent-sky-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>הסתר שם חברה</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>מיקום *</label>
                <select name="location" defaultValue={job.location} className={inputCls} style={selectStyle} required>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>היקף משרה *</label>
                <select name="job_type" defaultValue={job.job_type} className={inputCls} style={selectStyle} required>
                  {JOB_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>ניסיון נדרש *</label>
              <select name="experience_level" defaultValue={job.experience_level ?? ""} className={inputCls} style={selectStyle} required>
                <option value="">בחר...</option>
                {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>תיאור המשרה *</label>
              <textarea name="description" defaultValue={job.description} rows={5} required className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <label className={labelCls}>דרישות סף</label>
              <textarea name="requirements" defaultValue={job.requirements ?? ""} rows={3} className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <label className={labelCls}>דרך הגשת מועמדות *</label>
              <input name="application_method" defaultValue={job.application_method} required className={inputCls} style={inputStyle} placeholder="careers@company.com או לינק" />
            </div>
          </section>

          {/* פרטים נוספים */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">פרטים נוספים (אופציונלי)</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>תחום טיפולי</label>
                <select name="therapeutic_area" defaultValue={job.therapeutic_area ?? ""} className={inputCls} style={selectStyle}>
                  <option value="">בחר...</option>
                  {THERAPEUTIC_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>פאזה</label>
                <select name="trial_phase" defaultValue={job.trial_phase ?? ""} className={inputCls} style={selectStyle}>
                  <option value="">בחר...</option>
                  {TRIAL_PHASES.map(p => <option key={p} value={p}>Phase {p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>אחוז נסיעות</label>
                <input type="number" name="travel_percent" defaultValue={job.travel_percent ?? ""} min={0} max={100} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls}>טווח שכר</label>
                <input name="salary_range" defaultValue={job.salary_range ?? ""} className={inputCls} style={inputStyle} placeholder="12,000-18,000 ₪" />
              </div>
            </div>

            <div>
              <label className={labelCls}>תאריך התחלה</label>
              <input name="start_date" defaultValue={job.start_date ?? ""} className={inputCls} style={inputStyle} placeholder="מיידי, מרץ 2026..." />
            </div>
          </section>

          {/* הגדרות */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">הגדרות</div>

            <div>
              <label className={labelCls}>קהל יעד</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="target_cra" defaultChecked={(job.target_audience as string[])?.includes("student_cra")} className="w-4 h-4 accent-purple-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>בוגרי CRA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="target_gcp" defaultChecked={(job.target_audience as string[])?.includes("student_gcp")} className="w-4 h-4 accent-sky-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>בוגרי GCP</span>
                </label>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_junior_friendly" defaultChecked={job.is_junior_friendly} className="w-4 h-4 accent-green-500" />
              <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>משרה ידידותית לג׳וניורים</div>
              </div>
            </label>
          </section>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
            >
              שמור ושלח לאישור מחדש ←
            </button>
            <a
              href="/jobs/my-jobs"
              className="px-6 py-4 rounded-2xl font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
            >
              ביטול
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
