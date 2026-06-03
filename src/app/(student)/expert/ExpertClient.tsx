"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Lecturer {
  id: string;
  name: string;
  specialty: string;
  course_type: "gcp" | "cra" | "both";
  bio: string | null;
  photo_url: string | null;
}

interface Profile {
  role: string;
  full_name: string;
  email: string;
}

interface Question {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  lecturer_id: string;
}

const COLORS = ["#0EA5E9", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

export default function ExpertClient({
  profile,
  lecturers,
  userId,
  myQuestions,
}: {
  profile: Profile;
  lecturers: Lecturer[];
  userId: string;
  myQuestions: Question[];
}) {
  const [tab, setTab] = useState<"ask" | "my">("ask");
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(myQuestions);

  const relevantLecturers = lecturers.filter(
    (l) =>
      l.course_type === "both" ||
      (profile.role === "student_gcp" && l.course_type === "gcp") ||
      (profile.role === "student_cra" && (l.course_type === "cra" || l.course_type === "gcp"))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLecturer || !subject.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error: insertError } = await supabase.from("questions").insert({
      student_id: userId,
      lecturer_id: selectedLecturer,
      subject: subject.trim(),
      body: body.trim(),
      student_email: profile.email,
    }).select("id, subject, body, created_at, lecturer_id").single();

    setLoading(false);

    if (insertError) {
      setError("שגיאה בשליחת השאלה. נסה שוב.");
      return;
    }

    if (data) {
      setLocalQuestions(prev => [data as Question, ...prev]);
    }

    setSent(true);
    setSelectedLecturer("");
    setSubject("");
    setBody("");

    setTimeout(() => {
      setSent(false);
      setTab("my");
    }, 1500);
  }

  const getLecturerName = (id: string) =>
    lecturers.find(l => l.id === id)?.name ?? "מרצה";

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }}
      dir="rtl"
    >
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
        <div>
          <h1 className="text-white font-black text-xl" style={{ letterSpacing: "-0.02em" }}>הכה את המומחה</h1>
          <p className="text-slate-400 text-sm mt-0.5">שאל שאלה ישירות למרצים שלנו</p>
        </div>
        <span className="hidden md:inline-flex text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(14,165,233,0.15)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.3)" }}>
          {profile.full_name}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0F2645", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-4xl mx-auto px-6 flex gap-0">
          {[{ key: "ask", label: "שאל שאלה" }, { key: "my", label: `השאלות שלי (${localQuestions.length})` }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "ask" | "my")}
              className="px-5 py-4 text-sm font-bold transition-all relative"
              style={{
                color: tab === t.key ? "#38bdf8" : "rgba(255,255,255,0.4)",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "#38bdf8" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── Tab: שאל שאלה ── */}
        {tab === "ask" && (
          <>
            {/* Lecturers */}
            <section>
              <h2 className="font-black text-lg mb-4" style={{ color: "#0F2645" }}>המרצים שלנו</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relevantLecturers.map((lecturer, i) => {
                  const color = COLORS[i % COLORS.length];
                  const initials = lecturer.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  const isSelected = selectedLecturer === lecturer.id;
                  return (
                    <button
                      key={lecturer.id}
                      onClick={() => setSelectedLecturer(isSelected ? "" : lecturer.id)}
                      className="text-right rounded-2xl p-5 transition-all w-full"
                      style={{
                        background: "white",
                        border: isSelected ? `2px solid ${color}` : "1.5px solid #e2e8f0",
                        boxShadow: isSelected ? `0 4px 20px ${color}25` : "0 2px 8px rgba(15,38,69,0.06)",
                        transform: isSelected ? "translateY(-2px)" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                          style={{ background: color, boxShadow: `0 6px 16px ${color}40` }}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "#0F2645" }}>{lecturer.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{lecturer.specialty}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: lecturer.course_type === "gcp" ? "rgba(14,165,233,0.1)" : "rgba(139,92,246,0.1)", color: lecturer.course_type === "gcp" ? "#0284c7" : "#7c3aed" }}>
                          {lecturer.course_type === "gcp" ? "GCP" : lecturer.course_type === "cra" ? "CRA" : "GCP + CRA"}
                        </span>
                        {isSelected && <span className="text-xs font-bold" style={{ color }}>✓ נבחר</span>}
                      </div>
                    </button>
                  );
                })}
                {relevantLecturers.length === 0 && (
                  <div className="col-span-3 rounded-2xl p-8 text-center text-slate-400 bg-white" style={{ border: "1.5px solid #f1f5f9" }}>
                    אין מרצים פעילים כרגע
                  </div>
                )}
              </div>
            </section>

            {/* Form */}
            <section>
              <h2 className="font-black text-lg mb-4" style={{ color: "#0F2645" }}>כתוב את שאלתך</h2>

              {sent && (
                <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.25)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#10b981" }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#065f46" }}>השאלה נשלחה!</div>
                    <div className="text-xs mt-0.5" style={{ color: "#047857" }}>עובר לטאב "השאלות שלי"...</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: "1.5px solid #f1f5f9" }}>
                {!selectedLecturer && (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
                    ← בחר מרצה מהרשימה למעלה
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">נושא השאלה *</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="לדוגמה: שאלה על ICH E6" required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#0F2645" }}
                    onFocus={e => e.target.style.borderColor = "#0EA5E9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">תוכן השאלה *</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="פרט את שאלתך..." required rows={5}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#0F2645" }}
                    onFocus={e => e.target.style.borderColor = "#0EA5E9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                </div>
                {error && <div className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
                <button type="submit" disabled={loading || !selectedLecturer}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: selectedLecturer ? "linear-gradient(135deg, #0EA5E9, #0284c7)" : "#cbd5e1", cursor: selectedLecturer ? "pointer" : "not-allowed" }}>
                  {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>שולח...</>) : "שלח שאלה →"}
                </button>
              </form>
            </section>
          </>
        )}

        {/* ── Tab: השאלות שלי ── */}
        {tab === "my" && (
          <section>
            <h2 className="font-black text-lg mb-4" style={{ color: "#0F2645" }}>
              השאלות שלי
              <span className="text-sm font-normal text-slate-400 mr-2">({localQuestions.length})</span>
            </h2>

            {localQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
                <div className="text-4xl mb-3">💬</div>
                <p className="font-bold text-slate-400 mb-1">עדיין לא שלחת שאלות</p>
                <p className="text-sm text-slate-300">שאלות שתשלח יופיעו כאן</p>
                <button onClick={() => setTab("ask")} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
                  שאל שאלה ראשונה ←
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {localQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-bold text-sm" style={{ color: "#0F2645" }}>{q.subject}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          אל: {getLecturerName(q.lecturer_id)} · {new Date(q.created_at).toLocaleDateString("he-IL")}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7" }}>
                        נשלח
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{q.body}</p>
                    <div className="mt-3 pt-3 text-xs text-slate-400" style={{ borderTop: "1px solid #f1f5f9" }}>
                      💡 תשובה תישלח אליך למייל: {profile.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
