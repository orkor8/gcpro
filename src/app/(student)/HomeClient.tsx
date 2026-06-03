"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── TYPES ─── */
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
  locked?: boolean;
  hoursLeft?: number;
}

interface Lecturer {
  id: string;
  name: string;
  specialty: string;
  course_type: "gcp" | "cra" | "both";
  bio: string | null;
}

interface KnowledgeItem {
  id: string;
  title: string;
  content_type: "video" | "document" | "live" | "article";
  published_at: string;
}

interface Profile {
  role: string;
  full_name: string;
  status: string;
  bio?: string | null;
  degree?: string | null;
  field_of_study?: string | null;
  english_level?: string | null;
  linkedin_url?: string | null;
  city?: string | null;
  phone?: string | null;
  skills?: string[] | null;
}

interface HomeClientProps {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  jobs: Job[];
  lecturers: Lecturer[];
  knowledgeItems: KnowledgeItem[];
}


const roleLabels: Record<string, string> = {
  student_gcp: "בוגר GCP",
  student_cra: "בוגר CRA",
  employer: "מעסיק",
  lecturer_gcp: "מרצה GCP",
  lecturer_cra: "מרצה CRA",
  admin: "מנהל",
};

const JOB_COLORS = ["#0EA5E9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
const typeColors: Record<string, string> = {
  video: "#0EA5E9",
  document: "#10b981",
  live: "#ef4444",
  article: "#8b5cf6",
};
const typeLabels: Record<string, string> = {
  video: "וידאו",
  document: "מסמך",
  live: "לייב",
  article: "מאמר",
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/* ─── PENDING OVERLAY ─── */
function PendingOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{ backdropFilter: "blur(8px)", background: "rgba(248,250,252,0.8)" }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-center px-6">
        <p className="font-bold text-sm mb-1" style={{ color: "#92400e" }}>הפרופיל שלך ממתין לאישור</p>
        <p className="text-xs" style={{ color: "#b45309" }}>התוכן יפתח לאחר אישור החשבון</p>
      </div>
    </div>
  );
}

/* ─── LOCK OVERLAY ─── */
function LockOverlay({ message }: { message: string }) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl"
      style={{ backdropFilter: "blur(8px)", background: "rgba(248,250,252,0.75)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0F2645, #162f55)", boxShadow: "0 8px 32px rgba(15,38,69,0.25)" }}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-sm mb-1" style={{ color: "#0F2645" }}>{message}</p>
        <p className="text-slate-500 text-xs">גישה לבוגרי הקורסים בלבד</p>
      </div>
      <Link
        href="/register"
        className="px-6 py-2 rounded-xl text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
      >
        הצטרף ל-GCPRO
      </Link>
    </div>
  );
}

/* ─── COUNTDOWN TIMER ─── */
function Countdown({ until }: { until: string }) {
  const calc = () => Math.max(0, new Date(until).getTime() - Date.now());
  const [ms, setMs] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(id);
  }, [until]);

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 font-black text-lg tabular-nums" style={{ color: "#0F2645", letterSpacing: "0.05em", direction: "ltr" }}>
      <span>{pad(h)}</span>
      <span className="opacity-50 text-base">:</span>
      <span>{pad(m)}</span>
      <span className="opacity-50 text-base">:</span>
      <span>{pad(s)}</span>
    </div>
  );
}

/* ─── JOB CARD ─── */
function JobCard({ job, index, isLoggedIn }: { job: Job; index: number; isLoggedIn: boolean }) {
  const color = JOB_COLORS[index % JOB_COLORS.length];
  const initials = getInitials(job.is_discrete ? "חב׳" : job.company);

  if (job.locked) {
    return (
      <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.08)" }}>
        <div className="rounded-2xl p-6 bg-white" style={{ filter: "blur(3px)", userSelect: "none" }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ background: color }}>
              {initials}
            </div>
            <div>
              <div className="font-bold text-base" style={{ color: "#0F2645" }}>{job.title}</div>
              <div className="text-slate-500 text-sm mt-0.5">{job.is_discrete ? "חברה דיסקרטית" : job.company}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
            <span className="text-xs text-slate-500">{job.location}</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${color}15`, color }}>{job.job_type}</span>
          </div>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
          style={{ backdropFilter: "blur(4px)", background: "rgba(248,250,252,0.8)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F2645, #162f55)" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <Countdown until={job.early_access_until} />
          <p className="text-xs font-bold text-center px-2" style={{ color: "#0F2645" }}>עד פתיחה לבוגרי GCP</p>
          <p className="text-xs text-slate-500">גישה מוקדמת לבוגרי CRA</p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block rounded-2xl p-6 bg-white transition-all hover:shadow-md hover:-translate-y-0.5" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.08)" }}>
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ background: color, boxShadow: `0 6px 16px ${color}40` }}
        >
          {initials}
        </div>
        <div>
          <div className="font-bold text-base" style={{ color: "#0F2645" }}>{job.title}</div>
          <div className="text-slate-500 text-sm mt-0.5">{job.is_discrete ? "חברה דיסקרטית" : job.company}</div>
        </div>
      </div>
      {job.is_junior_friendly && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ ג׳וניור</span>
      )}
      <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
          {job.location}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${color}15`, color }}>
          {job.job_type}
        </span>
      </div>
    </Link>
  );
}

/* ─── MOCK FALLBACKS ─── */
const mockJobs: Job[] = [
  { id: "1", title: "מנהל/ת מחקר קליני", company: "מכבי שירותי בריאות", location: "תל אביב", job_type: "משרה מלאה", description: "", is_discrete: false, is_junior_friendly: false, target_audience: null, early_access_until: "" },
  { id: "2", title: "רכז/ת GCP", company: "שיבא – תל השומר", location: "גבעתיים", job_type: "משרה חלקית", description: "", is_discrete: false, is_junior_friendly: true, target_audience: null, early_access_until: "" },
  { id: "3", title: "Clinical Research Associate", company: "פייזר ישראל", location: "פתח תקווה", job_type: "זמני", description: "", is_discrete: false, is_junior_friendly: false, target_audience: null, early_access_until: "" },
  { id: "4", title: "מנהל/ת רגולציה קלינית", company: "נובה נורדיסק ישראל", location: "הרצליה", job_type: "משרה מלאה", description: "", is_discrete: false, is_junior_friendly: false, target_audience: null, early_access_until: "" },
];


const mockKnowledge: KnowledgeItem[] = [
  { id: "1", title: "עדכוני FDA 2024 — שינויים בדרישות הרגולטוריות", content_type: "video", published_at: "2025-03-28" },
  { id: "2", title: "מדריך מקיף לניהול חוקת מחקר קליני", content_type: "document", published_at: "2025-03-21" },
  { id: "3", title: "סשן לייב: שאלות ותשובות עם מומחי CRA", content_type: "live", published_at: "2025-03-14" },
  { id: "4", title: "ICH E6 R3 — כל מה שצריך לדעת", content_type: "video", published_at: "2025-03-07" },
];

const LECTURER_COLORS = ["#0EA5E9", "#8b5cf6", "#ec4899", "#14b8a6"];

/* ═══════════════════════════════════════════════
   MAIN CLIENT COMPONENT
═══════════════════════════════════════════════ */
export default function HomeClient({ user, profile, jobs, lecturers, knowledgeItems }: HomeClientProps) {
  const isLoggedIn = !!user && !!profile && profile.status === "approved";
  const isPending = !!user && !!profile && profile.status === "pending";
  const displayJobs = jobs.length > 0 ? jobs : (isLoggedIn ? [] : mockJobs);
  const displayLecturers = lecturers;
  const displayKnowledge = knowledgeItems.length > 0 ? knowledgeItems : (isLoggedIn ? [] : mockKnowledge);

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }} dir="rtl">

      <main style={{ minHeight: "100vh" }}>

        {/* ─── Welcome strip ─── */}
        <div
          className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between"
          style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}
        >
          <div>
            <h1 className="text-white font-black text-lg md:text-xl" style={{ letterSpacing: "-0.02em" }}>
              {(isLoggedIn || isPending) ? `שלום, ${profile!.full_name.split(" ")[0]}!` : "ברוך הבא ל-GCPRO"}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              {isLoggedIn
                ? "הפלטפורמה המקצועית שלך לניהול הקריירה בתחום המחקר הקליני"
                : isPending
                ? "הפרופיל שלך נמצא בבדיקה — נאשר בהקדם"
                : "הפלטפורמה המקצועית לבוגרי מחקר קליני בישראל"}
            </p>
          </div>
          {!isLoggedIn && !isPending && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-sky-300 transition-all"
                style={{ border: "1px solid rgba(14,165,233,0.3)" }}
              >
                התחברות
              </Link>
              <Link
                href="/register?type=student"
                className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", boxShadow: "0 0 16px rgba(14,165,233,0.3)" }}
              >
                הרשמה
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{
                  background: profile!.role === "student_cra" ? "rgba(139,92,246,0.15)" : "rgba(14,165,233,0.15)",
                  color: profile!.role === "student_cra" ? "#a78bfa" : "#38bdf8",
                  border: `1px solid ${profile!.role === "student_cra" ? "rgba(139,92,246,0.3)" : "rgba(14,165,233,0.3)"}`,
                }}
              >
                {roleLabels[profile!.role] ?? profile!.role}
              </span>
            </div>
          )}
        </div>

        {/* ─── Pending approval banner ─── */}
        {isPending && (
          <div
            className="mx-4 md:mx-8 mt-4 rounded-2xl px-4 md:px-5 py-4 flex items-center gap-3 md:gap-4"
            style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1.5px solid #fcd34d" }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f59e0b" }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5" style={{ color: "#92400e" }}>הפרופיל שלך ממתין לאישור</div>
              <div className="text-xs" style={{ color: "#b45309" }}>
                בדקנו את פרטי הרישום שלך ונאשר את גישתך בהקדם. תוכל לגלוש בחופשיות לאחר האישור.
              </div>
            </div>
          </div>
        )}

        {/* ─── Approved banner (shown when profile is empty = just approved) ─── */}
        {isLoggedIn && !profile!.bio && !profile!.degree && !profile!.city && (
          <div
            className="mx-4 md:mx-8 mt-4 rounded-2xl px-4 md:px-5 py-4 flex items-center gap-3 md:gap-4"
            style={{ background: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.3)" }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#10b981" }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5" style={{ color: "#065f46" }}>החשבון שלך אושר! ברוך הבא ל-GCPRO</div>
              <div className="text-xs" style={{ color: "#047857" }}>
                השלם את הפרופיל שלך כדי שמעסיקים יוכלו למצוא אותך
              </div>
            </div>
            <a
              href="/profile/edit"
              className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white"
              style={{ background: "#10b981" }}
            >
              השלם פרופיל ←
            </a>
          </div>
        )}

        {/* ─── Profile completion banner ─── */}
        {isLoggedIn && (() => {
          const fields = [
            profile!.bio,
            profile!.degree,
            profile!.field_of_study,
            profile!.english_level,
            profile!.linkedin_url,
            profile!.city,
            profile!.phone,
            (profile as any).skills?.length > 0 ? true : null,
          ];
          const filled = fields.filter(Boolean).length;
          const total = fields.length;
          const pct = Math.round((filled / total) * 100);
          if (pct === 100) return null;

          const missing = [
            !profile!.bio && "תיאור אישי",
            !profile!.degree && "תואר אקדמי",
            !profile!.field_of_study && "תחום לימודים",
            !profile!.english_level && "רמת אנגלית",
            !(profile as any).skills?.length && "כישורים",
          ].filter(Boolean).slice(0, 3);

          return (
            <div
              className="mx-4 md:mx-8 mt-4 rounded-2xl px-4 md:px-5 py-4 flex items-center gap-3 md:gap-4 flex-wrap"
              style={{ background: "linear-gradient(135deg, #fffbeb, #fef9c3)", border: "1.5px solid #fde68a" }}
            >
              {/* Progress ring */}
              <div className="relative flex-shrink-0 w-12 h-12">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#fde68a" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke="#f59e0b" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: "#92400e" }}>{pct}%</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-0.5" style={{ color: "#92400e" }}>
                  השלם את הפרופיל שלך — מגדיל את הסיכוי למצוא עבודה
                </div>
                {missing.length > 0 && (
                  <div className="text-xs" style={{ color: "#b45309" }}>
                    חסר: {missing.join(" · ")}
                  </div>
                )}
              </div>

              <Link
                href="/profile/edit"
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                השלם פרופיל ←
              </Link>
            </div>
          );
        })()}

        <div className="p-4 md:p-8 space-y-6 md:space-y-10">

          {/* ════════════════════════════
              SECTION 1 — JOBS
          ════════════════════════════ */}
          <section id="jobs" className="rounded-2xl md:rounded-3xl bg-white p-5 md:p-8" style={{ boxShadow: "0 2px 16px rgba(15,38,69,0.06)" }}>
            <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 flex-wrap">
              <h2 className="font-black text-xl" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>
                משרות בתחום המחקר הקליני
              </h2>
              {!isLoggedIn && (
                <span
                  className="section-badge"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
                >
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  נגיש לבוגרים בלבד
                </span>
              )}
              {isLoggedIn && (
                <span className="text-xs text-slate-400">{displayJobs.length} משרות פעילות</span>
              )}
            </div>

            {isLoggedIn ? (
              displayJobs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">אין משרות פעילות כרגע</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {displayJobs.slice(0, 4).map((job, i) => (
                      <JobCard key={job.id} job={job} index={i} isLoggedIn={isLoggedIn} />
                    ))}
                  </div>
                  {displayJobs.length > 0 && (
                    <div className="mt-5 text-center">
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                        style={{ background: "white", color: "#0F2645", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,38,69,0.06)" }}
                      >
                        כל המשרות ←
                        {displayJobs.length > 4 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>
                            {displayJobs.length}
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="relative">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" }}>
                  {mockJobs.map((job, i) => {
                    const color = JOB_COLORS[i % JOB_COLORS.length];
                    return (
                      <div key={job.id} className="rounded-2xl p-6 bg-white" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.08)" }}>
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ background: color, boxShadow: `0 6px 16px ${color}40` }}>
                            {getInitials(job.company)}
                          </div>
                          <div>
                            <div className="font-bold text-base" style={{ color: "#0F2645" }}>{job.title}</div>
                            <div className="text-slate-500 text-sm mt-0.5">{job.company}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-500">{job.location}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${color}15`, color }}>{job.job_type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isPending ? <PendingOverlay /> : <LockOverlay message="התחבר כדי לצפות במשרות" />}
              </div>
            )}
          </section>

          {/* ════════════════════════════
              SECTION 2 — BOT
          ════════════════════════════ */}
          <section
            id="bot"
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #080f1a 0%, #0a1628 50%, #050d18 100%)",
              boxShadow: "0 24px 80px rgba(14,165,233,0.15), 0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "linear-gradient(rgba(14,165,233,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.15) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="glow-orb absolute w-80 h-80 rounded-full pointer-events-none" style={{ top: "-80px", right: "-60px", background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)" }} />
            <div className="glow-orb-2 absolute w-64 h-64 rounded-full pointer-events-none" style={{ bottom: "-40px", left: "20%", background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)" }} />

            <div className="relative z-10 p-5 md:p-12 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)", color: "#38bdf8" }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192Z" /><path d="M6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" /></svg>
                  מופעל על ידי בינה מלאכותית
                </div>
                <h2 className="animated-gradient-text font-black leading-tight mb-4" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.03em" }}>
                  הבוט החכם שלנו
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-7" style={{ maxWidth: 400 }}>
                  שאל כל שאלה על חומר הקורס וקבל תשובות מדויקות בשניות. הבוט מאומן על כל מצגות הקורס שלך.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {["GCP Bot", "CRA Bot"].map((bot) => (
                    <div key={bot} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                      {bot}
                    </div>
                  ))}
                </div>
                <Link
                  href={isLoggedIn ? "/bot" : "/register"}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0369a1)", boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
                >
                  {isLoggedIn ? "פתח את הבוט" : "נסה את הבוט"}
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                </Link>
              </div>

              {/* Chat preview UI */}
              <div>
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(14,165,233,0.2)", boxShadow: "0 0 60px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <div className="px-4 py-3 flex items-center gap-3" style={{ background: "rgba(14,165,233,0.08)", borderBottom: "1px solid rgba(14,165,233,0.15)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
                      <svg width="14" height="14" fill="white" viewBox="0 0 20 20"><path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192Z" /></svg>
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">GCPRO AI</div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-green-400" style={{ fontSize: "0.65rem" }}>מחובר · GCP Bot</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3" style={{ minHeight: 280 }}>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] text-right" style={{ background: "rgba(14,165,233,0.15)", color: "#e2e8f0" }}>
                        מה ההבדל בין ICH E6 R1 ל-R2?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] text-right" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1" }}>
                        <p className="leading-relaxed">גרסה <strong className="text-sky-400">R2</strong> הוסיפה דרישות מחמירות לניהול נתונים, כולל חתימות אלקטרוניות ותיעוד מלא של שרשרת הנתונים...</p>
                        <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <span className="text-sky-500 text-xs font-medium cursor-pointer hover:text-sky-400">קרא עוד ←</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] text-right" style={{ background: "rgba(14,165,233,0.15)", color: "#e2e8f0" }}>
                        ומה לגבי חובת הדיווח ל-IRB?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="rounded-2xl px-5 py-3.5 flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span className="dot-1 w-2 h-2 rounded-full bg-sky-400 inline-block" />
                        <span className="dot-2 w-2 h-2 rounded-full bg-sky-400 inline-block" />
                        <span className="dot-3 w-2 h-2 rounded-full bg-sky-400 inline-block" />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(14,165,233,0.15)", background: "rgba(0,0,0,0.2)" }}>
                    <div className="flex-1 rounded-xl px-4 py-2 text-sm text-slate-500" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      שאל שאלה על חומר הקורס...
                    </div>
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-slate-600 text-xs">מופעל על ידי</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.2)" }}>NotebookLM AI</span>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════
              SECTION 3 — EXPERTS
          ════════════════════════════ */}
          <section id="expert" className="rounded-2xl md:rounded-3xl overflow-hidden bg-white" style={{ boxShadow: "0 4px 24px rgba(15,38,69,0.07)" }}>
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 flex-wrap">
                <h2 className="font-black text-lg md:text-xl" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>שאל את המומחים שלנו</h2>
                <span className="section-badge" style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7" }}>הכה את המומחה</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {displayLecturers.slice(0, 3).map((lecturer, i) => {
                  const color = LECTURER_COLORS[i % LECTURER_COLORS.length];
                  const initials = lecturer.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={lecturer.id} className="card-hover rounded-2xl p-5 text-center" style={{ border: "1.5px solid #f1f5f9", background: "#fafbfc" }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4" style={{ background: color, boxShadow: `0 8px 24px ${color}30` }}>
                        {initials}
                      </div>
                      <div className="font-bold text-base mb-1" style={{ color: "#0F2645" }}>{lecturer.name}</div>
                      <div className="text-slate-500 text-xs mb-3">{lecturer.specialty}</div>
                      <span className="inline-block text-xs px-3 py-1 rounded-full font-bold" style={{
                        background: lecturer.course_type === "gcp" ? "rgba(14,165,233,0.1)" : "rgba(139,92,246,0.1)",
                        color: lecturer.course_type === "gcp" ? "#0284c7" : "#7c3aed",
                      }}>
                        קורס {lecturer.course_type === "gcp" ? "GCP" : lecturer.course_type === "cra" ? "CRA" : "GCP + CRA"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isLoggedIn ? (
                <Link
                  href="/expert"
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-5 rounded-2xl transition-all group"
                  style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1.5px solid #bae6fd" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", boxShadow: "0 6px 16px rgba(14,165,233,0.3)" }}>
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-black text-base" style={{ color: "#0F2645" }}>שלח שאלה למרצה</div>
                      <div className="text-sm text-sky-600 mt-0.5">בחר מרצה, כתוב את שאלתך — ותקבל תשובה למייל</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all group-hover:gap-3" style={{ color: "#0284c7" }}>
                    לשאלות שלי
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl" style={{ background: "#f8fafc", border: "1.5px dashed #e2e8f0" }}>
                  <p className="font-bold text-sm" style={{ color: "#0F2645" }}>
                    {isPending ? "הפרופיל ממתין לאישור" : "התחבר כדי לשאול שאלה"}
                  </p>
                  {!isPending && <Link href="/register" className="px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>הרשמה</Link>}
                </div>
              )}
            </div>
          </section>

          {/* ════════════════════════════
              SECTION 4 — KNOWLEDGE CENTER
          ════════════════════════════ */}
          <section id="knowledge" className="rounded-2xl md:rounded-3xl overflow-hidden" style={{ background: "#f8fafc", border: "1.5px solid #e8eef4" }}>
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 flex-wrap">
                <h2 className="font-black text-lg md:text-xl" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>מרכז הידע המקצועי</h2>
                <span className="section-badge" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> תוכן חדש כל שבוע
                </span>
              </div>

              {isLoggedIn ? (
                displayKnowledge.length === 0 ? (
                  <div className="flex flex-col items-center gap-6 py-10">
                    <div className="grid grid-cols-4 gap-3 w-full opacity-30 pointer-events-none select-none">
                      {["#0EA5E9","#10b981","#ef4444","#8b5cf6"].map((color, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.06)" }}>
                          <div className="h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                          </div>
                          <div className="p-3 bg-white"><div className="h-2.5 rounded-full bg-slate-200 mb-2 w-3/4" /><div className="h-2 rounded-full bg-slate-100 w-1/2" /></div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="font-black text-base mb-1" style={{ color: "#0F2645" }}>תכנים בדרך אליך</div>
                      <p className="text-slate-400 text-sm">סרטונים, מסמכים ושיעורים חיים יתווספו בקרוב</p>
                    </div>
                    <Link href="/knowledge" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7", border: "1px solid rgba(14,165,233,0.2)" }}>
                      לעמוד מרכז הידע ←
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {displayKnowledge.map((item) => {
                      const color = typeColors[item.content_type] ?? "#0EA5E9";
                      return (
                        <div key={item.id} className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.06)" }}>
                          <div className="h-32 md:h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                                {typeLabels[item.content_type] ?? item.content_type}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {new Date(item.published_at).toLocaleDateString("he-IL")}
                              </span>
                            </div>
                            <p className="text-sm font-semibold leading-snug" style={{ color: "#0F2645" }}>{item.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" }}>
                    {mockKnowledge.map((item) => {
                      const color = typeColors[item.content_type] ?? "#0EA5E9";
                      return (
                        <div key={item.id} className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.06)" }}>
                          <div className="h-32 md:h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                                {typeLabels[item.content_type]}
                              </span>
                              <span className="text-slate-400 text-xs">{item.published_at}</span>
                            </div>
                            <p className="text-sm font-semibold leading-snug" style={{ color: "#0F2645" }}>{item.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isPending ? <PendingOverlay /> : <LockOverlay message="התחבר כדי לצפות בתכנים" />}
                </div>
              )}
            </div>
          </section>

          {/* ════════════════════════════
              SECTION 5 — PODCAST
          ════════════════════════════ */}
          <section id="podcast" className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #111827 0%, #0d1520 60%, #111820 100%)" }}>
            <div className="grid md:grid-cols-2 min-h-[260px]">
              <div className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: 220, background: "linear-gradient(135deg, #1a2535, #0d1520)" }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20" style={{ background: "radial-gradient(circle at 50% 50%, rgba(14,165,233,0.15) 0%, transparent 65%)" }} />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-[-24px] rounded-full opacity-20 glow-orb" style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }} />
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(14,165,233,0.1)", border: "1.5px solid rgba(14,165,233,0.25)" }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0369a1)", boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}>
                        <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {[3, 5, 7, 4, 6, 8, 5, 3, 6, 4].map((h, i) => (
                      <div key={i} className="w-1.5 rounded-full" style={{ height: `${h * 4}px`, background: "rgba(14,165,233,0.6)", animation: `bounce-dot ${0.8 + i * 0.1}s ease-in-out infinite`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center px-5 py-6 md:px-8 md:py-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 self-start" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c" }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" /></svg>
                  הפודקאסט של התעשייה
                </span>
                <h2 className="text-white font-black leading-tight mb-3" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "-0.02em" }}>
                  מדברים ניסויים קליניים
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-7" style={{ maxWidth: 380 }}>
                  רוצים להבין באמת איך התעשייה עובדת? הצטרפו אלינו לשיחות עומק עם המומחים המובילים בישראל.
                </p>
                <a href="https://gcp-academy.co.il" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white self-start transition-all" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#fb923c" }}>
                    <svg width="10" height="10" fill="white" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" /></svg>
                  </div>
                  להאזנה לכל הפרקים
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
