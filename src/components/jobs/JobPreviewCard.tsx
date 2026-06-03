export interface JobPreviewData {
  title: string;
  company: string;
  is_discrete: boolean;
  location: string;
  job_type: string;
  role_type?: string;
  experience_level: string;
  description: string;
  requirements: string;
  application_method: string;
  travel_percent: string;
  therapeutic_area: string;
  trial_phase: string;
  salary_range: string;
  start_date: string;
  is_junior_friendly: boolean;
  target_audience: string[];
}

const locationIcon = (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const briefcaseIcon = (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
  </svg>
);

export function JobPreviewCard({ job }: { job: JobPreviewData }) {
  const isEmpty = !job.title && !job.company && !job.description;

  if (isEmpty) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center text-center h-64"
        style={{ background: "rgba(255,255,255,0.03)", border: "1.5px dashed rgba(255,255,255,0.1)" }}
      >
        <div className="text-slate-600 text-sm">התצוגה המקדימה תופיע כאן בזמן אמת</div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,38,69,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {job.is_junior_friendly && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>
                ✓ ידידותית לג׳וניורים
              </span>
            )}
            {job.target_audience?.includes("student_cra") && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>CRA</span>
            )}
            {job.target_audience?.includes("student_gcp") && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>GCP</span>
            )}
          </div>
          <h2 className="font-black text-xl" style={{ color: "#0F2645" }}>
            {job.title || "כותרת המשרה"}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            {job.is_discrete ? "חברה דיסקרטית" : job.company || "שם החברה"}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-lg"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
        >
          {(job.is_discrete ? "?" : (job.company?.[0] || "C")).toUpperCase()}
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.location && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>
            {locationIcon} {job.location}
          </span>
        )}
        {job.job_type && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>
            {briefcaseIcon} {job.job_type}
          </span>
        )}
        {job.role_type && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
            {job.role_type}
          </span>
        )}
        {job.experience_level && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>
            {job.experience_level}
          </span>
        )}
        {job.therapeutic_area && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7" }}>
            {job.therapeutic_area}
          </span>
        )}
        {job.trial_phase && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.08)", color: "#7c3aed" }}>
            Phase {job.trial_phase}
          </span>
        )}
        {job.travel_percent && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#fef9c3", color: "#a16207" }}>
            {job.travel_percent}% נסיעות
          </span>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <div className="mb-4">
          <div className="font-bold text-xs mb-1.5" style={{ color: "#0F2645" }}>תיאור המשרה</div>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line line-clamp-4">{job.description}</p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-4">
          <div className="font-bold text-xs mb-1.5" style={{ color: "#0F2645" }}>דרישות</div>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line line-clamp-3">{job.requirements}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: "1px solid #f1f5f9" }}>
        <div className="text-xs text-slate-400">
          {job.salary_range && <span className="ml-3">💰 {job.salary_range}</span>}
          {job.start_date && <span>📅 {job.start_date}</span>}
        </div>
        <div
          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
        >
          הגש מועמדות
        </div>
      </div>
    </div>
  );
}
