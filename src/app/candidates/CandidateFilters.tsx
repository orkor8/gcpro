"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const CITIES = ["תל אביב", "ירושלים", "חיפה", "באר שבע", "רמת גן", "פתח תקווה", "נתניה", "ראשון לציון", "רחובות", "אחר"];
const DEGREES = ["תואר ראשון (B.Sc/B.A)", "תואר שני (M.Sc/M.A)", "PhD", "MD", "PharmD"];
const FIELDS = ["מדעי החיים", "רוקחות", "סיעוד", "רפואה", "ביוטכנולוגיה", "כימיה", "פסיכולוגיה"];
const ENGLISH_LEVELS = ["בינוני", "טוב מאוד", "שפת אם / דובר ילידי"];
const EDC_SYSTEMS = ["Medidata Rave", "Oracle InForm", "REDCap", "Veeva Vault", "OpenClinica", "Castor EDC"];

const selectStyle = {
  background: "white",
  border: "1.5px solid #e2e8f0",
  borderRadius: "12px",
  padding: "9px 14px",
  fontSize: "13px",
  color: "#0F2645",
  outline: "none",
  cursor: "pointer",
  width: "100%",
};

export function CandidateFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    course: sp.get("course") ?? "",
    city: sp.get("city") ?? "",
    degree: sp.get("degree") ?? "",
    field: sp.get("field") ?? "",
    english: sp.get("english") ?? "",
    edc: sp.get("edc") ?? "",
    coordinator: sp.get("coordinator") ?? "",
  });

  const set = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters(f => ({ ...f, [k]: e.target.type === "checkbox" ? ((e.target as HTMLInputElement).checked ? "1" : "") : e.target.value }));

  function apply() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    startTransition(() => router.push(`/candidates?${params.toString()}`));
  }

  function reset() {
    setFilters({ course: "", city: "", degree: "", field: "", english: "", edc: "", coordinator: "" });
    startTransition(() => router.push("/candidates"));
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
      <div className="font-bold text-sm mb-4" style={{ color: "#0F2645" }}>סינון מועמדים</div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">קורס</label>
          <select value={filters.course} onChange={set("course")} style={selectStyle}>
            <option value="">הכל</option>
            <option value="student_cra">בוגרי CRA</option>
            <option value="student_gcp">בוגרי GCP</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">עיר</label>
          <select value={filters.city} onChange={set("city")} style={selectStyle}>
            <option value="">כל הערים</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">תואר אקדמי</label>
          <select value={filters.degree} onChange={set("degree")} style={selectStyle}>
            <option value="">כל התארים</option>
            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">תחום לימודים</label>
          <select value={filters.field} onChange={set("field")} style={selectStyle}>
            <option value="">כל התחומים</option>
            {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">רמת אנגלית מינימלית</label>
          <select value={filters.english} onChange={set("english")} style={selectStyle}>
            <option value="">לא משנה</option>
            {ENGLISH_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">מערכת EDC</label>
          <select value={filters.edc} onChange={set("edc")} style={selectStyle}>
            <option value="">כל המערכות</option>
            {EDC_SYSTEMS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.coordinator === "1"}
          onChange={set("coordinator")}
          className="w-4 h-4 accent-sky-500"
        />
        <span className="text-sm text-slate-600 font-medium">רק מועמדים עם ניסיון כמתאם/ת מחקר</span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={apply}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
        >
          חפש
        </button>
        {hasFilters && (
          <button onClick={reset} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500" style={{ background: "#f1f5f9" }}>
            נקה הכל
          </button>
        )}
      </div>
    </div>
  );
}
