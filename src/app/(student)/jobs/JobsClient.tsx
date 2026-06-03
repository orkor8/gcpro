"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  is_discrete: boolean;
  is_junior_friendly: boolean;
  target_audience: string[] | null;
  early_access_until: string;
  locked: boolean;
  hoursLeft?: number;
}

const JOB_COLORS = ["#0EA5E9", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#10b981"];

function getInitials(name: string) {
  return name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

const SAVED_KEY = "clinhub_saved_jobs";

function useSavedJobs() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function toggle(id: string) {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  return { saved, toggle };
}

export default function JobsClient({ jobs, role }: { jobs: Job[]; role: string }) {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [juniorOnly, setJuniorOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const { saved, toggle } = useSavedJobs();

  const locations = useMemo(() => [...new Set(jobs.map(j => j.location).filter(Boolean))], [jobs]);
  const jobTypes = useMemo(() => [...new Set(jobs.map(j => j.job_type).filter(Boolean))], [jobs]);

  const filtered = useMemo(() => jobs.filter(job => {
    if (savedOnly && !saved.has(job.id)) return false;
    if (juniorOnly && !job.is_junior_friendly) return false;
    if (location && job.location !== location) return false;
    if (jobType && job.job_type !== jobType) return false;
    if (q) {
      const lower = q.toLowerCase();
      if (!job.title?.toLowerCase().includes(lower) && !job.company?.toLowerCase().includes(lower)) return false;
    }
    return true;
  }), [jobs, q, location, jobType, juniorOnly, savedOnly, saved]);

  const hasFilters = q || location || jobType || juniorOnly || savedOnly;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm space-y-3" style={{ border: "1.5px solid #f1f5f9" }}>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="חיפוש לפי כותרת או חברה..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0F2645" }}
            />
          </div>

          {/* Location */}
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: location ? "#0F2645" : "#94a3b8" }}>
            <option value="">כל המיקומים</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Job type */}
          <select value={jobType} onChange={e => setJobType(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: jobType ? "#0F2645" : "#94a3b8" }}>
            <option value="">כל הסוגים</option>
            {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Toggle filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setJuniorOnly(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: juniorOnly ? "#dcfce7" : "#f8fafc",
              color: juniorOnly ? "#16a34a" : "#94a3b8",
              border: `1.5px solid ${juniorOnly ? "#bbf7d0" : "#e2e8f0"}`,
            }}
          >
            ✓ ג׳וניור בלבד
          </button>
          <button
            onClick={() => setSavedOnly(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: savedOnly ? "rgba(249,115,22,0.08)" : "#f8fafc",
              color: savedOnly ? "#ea580c" : "#94a3b8",
              border: `1.5px solid ${savedOnly ? "rgba(249,115,22,0.25)" : "#e2e8f0"}`,
            }}
          >
            🔖 שמורות בלבד {saved.size > 0 && `(${saved.size})`}
          </button>
          {hasFilters && (
            <button
              onClick={() => { setQ(""); setLocation(""); setJobType(""); setJuniorOnly(false); setSavedOnly(false); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#f8fafc", color: "#94a3b8", border: "1.5px solid #e2e8f0" }}
            >
              נקה הכל ✕
            </button>
          )}
        </div>

        {hasFilters && (
          <p className="text-xs text-slate-400">{filtered.length} תוצאות</p>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          {savedOnly ? (
            <><div className="text-3xl mb-2">🔖</div><p>אין משרות שמורות עדיין</p></>
          ) : (
            <p>לא נמצאו משרות מתאימות</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job, i) => {
            const color = JOB_COLORS[i % JOB_COLORS.length];
            const initials = getInitials(job.is_discrete ? "חב׳" : job.company);
            const isSaved = saved.has(job.id);

            if (job.locked) {
              return (
                <div key={job.id} className="relative rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.08)" }}>
                  <div className="p-6" style={{ filter: "blur(3px)", userSelect: "none" }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: color }}>{initials}</div>
                      <div>
                        <div className="font-bold" style={{ color: "#0F2645" }}>{job.title}</div>
                        <div className="text-slate-500 text-sm">{job.is_discrete ? "חברה דיסקרטית" : job.company}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl" style={{ backdropFilter: "blur(4px)", background: "rgba(248,250,252,0.85)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1" style={{ background: "linear-gradient(135deg, #0F2645, #162f55)" }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    </div>
                    <p className="text-xs font-bold" style={{ color: "#0F2645" }}>נחשף בעוד {job.hoursLeft} שעות</p>
                    <p className="text-xs text-slate-500">גישה מוקדמת לבוגרי CRA</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={job.id} className="relative rounded-2xl bg-white transition-all hover:shadow-md hover:-translate-y-0.5 group"
                style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.08)" }}>
                {/* Bookmark button */}
                <button
                  onClick={() => toggle(job.id)}
                  className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: isSaved ? "rgba(249,115,22,0.1)" : "rgba(0,0,0,0.04)",
                    color: isSaved ? "#ea580c" : "#cbd5e1",
                  }}
                  title={isSaved ? "הסר משמורות" : "שמור משרה"}
                >
                  <svg width="14" height="14" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>

                <Link href={`/jobs/${job.id}`} className="block p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>{initials}</div>
                    <div>
                      <div className="font-bold" style={{ color: "#0F2645" }}>{job.title}</div>
                      <div className="text-slate-500 text-sm">{job.is_discrete ? "חברה דיסקרטית" : job.company}</div>
                    </div>
                  </div>
                  {job.is_junior_friendly && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ ג׳וניור</span>
                  )}
                  <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <span className="text-xs text-slate-500">{job.location}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${color}15`, color }}>{job.job_type}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
