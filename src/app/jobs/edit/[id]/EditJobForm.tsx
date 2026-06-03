"use client";

import { useState } from "react";
import { updateJob } from "./actions";
import { JobPreviewCard, type JobPreviewData } from "@/components/jobs/JobPreviewCard";

const LOCATIONS = [
  "מרכז (תל אביב והסביבה)", "שרון (נתניה, כפר סבא)", "ירושלים והסביבה",
  "צפון (חיפה וגליל)", "דרום (באר שבע, נגב)", "שפלה (ראשון לציון, רחובות)",
  "היברידי", "מהבית / Remote",
];
const JOB_TYPES = ["משרה מלאה", "משרה חלקית", "פרויקט זמני", "פרילנס"];
const ROLE_TYPES = [
  "מתאם/ת מחקר קליני (CRC)", "CRA / Monitor", "CTA",
  "מנהל/ת פרויקט קליני", "רגולציה / Regulatory Affairs",
  "ועדת הלסינקי / IRB", "הבטחת איכות (QA)", "ניהול נתונים (Data Management)",
  "פארמקווויג'ילנס", "Medical Affairs", "אחר",
];
const EXPERIENCE_LEVELS = ["ללא ניסיון / ג'וניור", "1-2 שנים", "Senior (3+)"];
const THERAPEUTIC_AREAS = ["אונקולוגיה", "קרדיולוגיה", "נוירולוגיה", "אנדוקרינולוגיה", "מחלות נדירות", "זיהומיות", "אחר"];
const TRIAL_PHASES = ["I", "II", "III", "IV"];

const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", padding: "10px 14px", fontSize: "14px", width: "100%", outline: "none" };
const selectStyle = { background: "#1e3a5f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", padding: "10px 14px", fontSize: "14px", width: "100%", outline: "none" };
const labelStyle = { display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: 600, marginBottom: "6px" } as const;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && " *"}</label>
      {children}
    </div>
  );
}

export function EditJobForm({ job }: { job: Record<string, any> }) {
  const [form, setForm] = useState({
    title: job.title ?? "",
    company: job.company ?? "",
    is_discrete: job.is_discrete ?? false,
    location: job.location ?? "",
    job_type: job.job_type ?? "",
    role_type: job.role_type ?? "",
    experience_level: job.experience_level ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    application_method: job.application_method ?? "",
    travel_percent: job.travel_percent ? String(job.travel_percent) : "",
    therapeutic_area: job.therapeutic_area ?? "",
    trial_phase: job.trial_phase ?? "",
    salary_range: job.salary_range ?? "",
    start_date: job.start_date ?? "",
    is_junior_friendly: job.is_junior_friendly ?? false,
    target_cra: (job.target_audience as string[])?.includes("student_cra") ?? true,
    target_gcp: (job.target_audience as string[])?.includes("student_gcp") ?? true,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  const preview: JobPreviewData = {
    title: form.title, company: form.company, is_discrete: form.is_discrete,
    location: form.location, job_type: form.job_type, role_type: form.role_type,
    experience_level: form.experience_level, description: form.description,
    requirements: form.requirements, application_method: form.application_method,
    travel_percent: form.travel_percent, therapeutic_area: form.therapeutic_area,
    trial_phase: form.trial_phase, salary_range: form.salary_range,
    start_date: form.start_date, is_junior_friendly: form.is_junior_friendly,
    target_audience: [...(form.target_cra ? ["student_cra"] : []), ...(form.target_gcp ? ["student_gcp"] : [])],
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updateJob(fd);
  }

  return (
    <div className="flex gap-8 items-start" dir="rtl">
      {/* Form */}
      <div className="flex-1 min-w-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="jobId" value={job.id} />

          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm mb-2">פרטים בסיסיים</div>

            <Field label="כותרת המשרה" required>
              <input name="title" value={form.title} onChange={set("title")} style={inputStyle} required />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="שם החברה">
                <input name="company" value={form.is_discrete ? "" : form.company} onChange={set("company")}
                  style={{ ...inputStyle, opacity: form.is_discrete ? 0.4 : 1 }} disabled={form.is_discrete} />
              </Field>
              <Field label="דיסקרטי">
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" name="is_discrete" checked={form.is_discrete} onChange={set("is_discrete")} className="w-4 h-4 accent-sky-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>הסתר שם חברה</span>
                </label>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="מיקום" required>
                <select name="location" value={form.location} onChange={set("location")} style={selectStyle} required>
                  <option value="">בחר אזור...</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="היקף משרה" required>
                <select name="job_type" value={form.job_type} onChange={set("job_type")} style={selectStyle} required>
                  <option value="">בחר...</option>
                  {JOB_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </Field>
            </div>

            <Field label="סוג תפקיד" required>
              <select name="role_type" value={form.role_type} onChange={set("role_type")} style={selectStyle} required>
                <option value="">בחר סוג תפקיד...</option>
                {ROLE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="ניסיון נדרש" required>
              <select name="experience_level" value={form.experience_level} onChange={set("experience_level")} style={selectStyle} required>
                <option value="">בחר...</option>
                {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>

            <Field label="תיאור המשרה" required>
              <textarea name="description" value={form.description} onChange={set("description")}
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} required />
            </Field>

            <Field label="דרישות סף">
              <textarea name="requirements" value={form.requirements} onChange={set("requirements")}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
            </Field>

            <Field label="דרך הגשת מועמדות" required>
              <input name="application_method" value={form.application_method} onChange={set("application_method")}
                style={inputStyle} placeholder="careers@company.com או לינק" required />
            </Field>
          </section>

          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm mb-2">פרטים נוספים (אופציונלי)</div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="תחום טיפולי">
                <select name="therapeutic_area" value={form.therapeutic_area} onChange={set("therapeutic_area")} style={selectStyle}>
                  <option value="">בחר...</option>
                  {THERAPEUTIC_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="פאזה">
                <select name="trial_phase" value={form.trial_phase} onChange={set("trial_phase")} style={selectStyle}>
                  <option value="">בחר...</option>
                  {TRIAL_PHASES.map(p => <option key={p} value={p}>Phase {p}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="אחוז נסיעות">
                <input type="number" name="travel_percent" value={form.travel_percent} onChange={set("travel_percent")}
                  style={inputStyle} placeholder="0-100" min={0} max={100} />
              </Field>
              <Field label="טווח שכר">
                <input name="salary_range" value={form.salary_range} onChange={set("salary_range")}
                  style={inputStyle} placeholder="12,000-18,000 ₪" />
              </Field>
            </div>

            <Field label="תאריך התחלה משוער">
              <input name="start_date" value={form.start_date} onChange={set("start_date")}
                style={inputStyle} placeholder="מיידי, מרץ 2026..." />
            </Field>
          </section>

          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm mb-2">הגדרות מערכת</div>

            <Field label="קהל יעד מועדף">
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="target_cra" checked={form.target_cra} onChange={set("target_cra")} className="w-4 h-4 accent-purple-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>בוגרי CRA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="target_gcp" checked={form.target_gcp} onChange={set("target_gcp")} className="w-4 h-4 accent-sky-500" />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>בוגרי GCP</span>
                </label>
              </div>
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_junior_friendly" checked={form.is_junior_friendly} onChange={set("is_junior_friendly")} className="w-4 h-4 accent-green-500" />
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>משרה ידידותית לג׳וניורים</div>
            </label>
          </section>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "שומר..." : "שמור ושלח לאישור מחדש ←"}
            </button>
            <a href="/jobs/my-jobs" className="px-6 py-4 rounded-2xl font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
              ביטול
            </a>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="w-96 flex-shrink-0 sticky top-6 hidden lg:block">
        <div className="text-xs font-bold mb-3" style={{ color: "#94a3b8" }}>תצוגה מקדימה — כך יראה הבוגר</div>
        <JobPreviewCard job={preview} />
      </div>
    </div>
  );
}
