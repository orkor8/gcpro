import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import { AdminTabs } from "./AdminTabs";
import { approveUser, rejectUser, approveJob, rejectJob } from "./actions";
import { ApprovedUsersClient } from "./ApprovedUsersClient";
import { KnowledgeTab } from "./KnowledgeTab";
import type { UserRole } from "@/types/database";

const roleLabels: Record<UserRole, string> = {
  student_gcp: "בוגר GCP",
  student_cra: "בוגר CRA",
  employer: "מעסיק",
  lecturer_gcp: "מרצה GCP",
  lecturer_cra: "מרצה CRA",
  admin: "מנהל",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab ?? "users";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string } | null };

  if (me?.role !== "admin") redirect("/dashboard");

  // Use admin client (service role) so RLS doesn't block cross-user queries
  const adminSupabase = createAdminClient();

  const [{ data: pendingUsersRaw }, { data: pendingJobs }, { data: allCerts }, { data: approvedUsersRaw }, { data: knowledgeItems }] = await Promise.all([
    adminSupabase.from("profiles").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    adminSupabase.from("jobs").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    adminSupabase.from("certificates").select("id, name, file_url, user_id"),
    adminSupabase.from("profiles").select("*").eq("status", "approved").neq("role", "admin").order("created_at", { ascending: false }),
    adminSupabase.from("knowledge_items").select("*").order("published_at", { ascending: false }),
  ]);

  // Attach certificates to each profile manually
  const pendingUsers = (pendingUsersRaw as any[] | null)?.map((p) => ({
    ...p,
    certificates: (allCerts ?? []).filter((c: any) => c.user_id === p.user_id),
  })) ?? null;

  const approvedUsers = (approvedUsersRaw as any[] | null) ?? [];

  const counts = { users: pendingUsers?.length ?? 0, jobs: pendingJobs?.length ?? 0, approved: approvedUsers.length, knowledge: knowledgeItems?.length ?? 0 };

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }} dir="rtl">
      <AppHeader role="admin" title="פאנל ניהול" />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-black text-2xl" style={{ color: "#0F2645" }}>פאנל ניהול</h1>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7", border: "1px solid rgba(14,165,233,0.2)" }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            צפה באתר
          </a>
        </div>

        <Suspense>
          <AdminTabs counts={counts} />
        </Suspense>

        {/* טאב משתמשים */}
        {activeTab === "users" && (
          <div>
            <p className="text-slate-500 text-sm mb-6">{counts.users} משתמשים ממתינים לאישור</p>
            {!counts.users && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">אין משתמשים ממתינים</div>
            )}
            <div className="space-y-4">
              {pendingUsers?.map((p) => (
                <div key={p.user_id} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1.5px solid #f1f5f9" }}>

                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-lg" style={{ color: "#0F2645" }}>{p.full_name}</div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>
                            {roleLabels[p.role as UserRole]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                          <span>{p.email}</span>
                          {p.phone && <span>· {p.phone}</span>}
                          {p.city && <span>· {p.city}</span>}
                          <span className="text-slate-400 text-xs">· {new Date(p.created_at).toLocaleDateString("he-IL")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Academic & skills details */}
                    {(p.degree || p.field_of_study || p.institution || p.english_level || p.has_coordinator_experience || p.bio || p.linkedin_url || p.skills?.length) && (
                      <div className="rounded-xl p-4 mb-4 space-y-2" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">פרטים אקדמיים וכישורים</div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          {p.degree && <span className="text-slate-600"><span className="text-slate-400 text-xs">תואר:</span> {p.degree}</span>}
                          {p.field_of_study && <span className="text-slate-600"><span className="text-slate-400 text-xs">תחום:</span> {p.field_of_study}</span>}
                          {p.institution && <span className="text-slate-600"><span className="text-slate-400 text-xs">מוסד:</span> {p.institution}</span>}
                          {p.english_level && <span className="text-slate-600"><span className="text-slate-400 text-xs">אנגלית:</span> {p.english_level}</span>}
                          {p.has_coordinator_experience && <span className="font-semibold" style={{ color: "#059669" }}>✓ מתאם/ת מחקר</span>}
                        </div>
                        {p.bio && <p className="text-sm text-slate-500 leading-relaxed">{p.bio}</p>}
                        {p.linkedin_url && (
                          <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
                            LinkedIn ↗
                          </a>
                        )}
                        {p.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(p.skills as string[]).map((s: string) => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#e2e8f0", color: "#475569" }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Certificates */}
                    <div className="rounded-xl p-4 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">תעודות שהועלו</div>
                      {p.certificates?.length > 0 ? (
                        <div className="space-y-2">
                          {(p.certificates as { id: string; name: string; file_url: string }[]).map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between gap-3 py-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                {cert.name}
                              </div>
                              <a
                                href={cert.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold px-3 py-1 rounded-lg"
                                style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}
                              >
                                צפה ↗
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm" style={{ color: "#d97706" }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                          לא הועלו תעודות
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval actions */}
                  <div className="px-6 py-4" style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <form action={approveUser} className="flex items-center gap-3 flex-wrap flex-1">
                        <input type="hidden" name="userId" value={p.user_id} />
                        <div className="flex gap-3 flex-wrap">
                          {(["student_gcp", "student_cra", "employer"] as UserRole[]).map((r) => (
                            <label key={r} className="flex items-center gap-1 text-xs cursor-pointer">
                              <input type="radio" name="role" value={r} defaultChecked={p.role === r} className="accent-sky-500" />
                              {roleLabels[r]}
                            </label>
                          ))}
                        </div>
                        <button type="submit" className="px-4 py-2 rounded-xl text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                          ✓ אשר גישה
                        </button>
                      </form>
                      <form action={rejectUser}>
                        <input type="hidden" name="userId" value={p.user_id} />
                        <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                          ✕ דחה / מחק
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* טאב משרות */}
        {activeTab === "jobs" && (
          <div>
            <p className="text-slate-500 text-sm mb-6">{counts.jobs} משרות ממתינות לאישור</p>
            {!counts.jobs && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">אין משרות ממתינות</div>
            )}
            <div className="space-y-4">
              {pendingJobs?.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {job.is_junior_friendly && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ ג׳וניור</span>
                      )}
                      {(job.target_audience as string[] ?? []).map((a: string) => (
                        <span key={a} className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>
                          {a === "student_cra" ? "CRA" : "GCP"}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-bold text-xl" style={{ color: "#0F2645" }}>{job.title}</h2>
                    <p className="text-slate-500 text-sm">{job.is_discrete ? "חברה דיסקרטית" : job.company} · {job.location} · {job.job_type}</p>
                    {job.therapeutic_area && <p className="text-xs text-slate-400 mt-0.5">{job.therapeutic_area}{job.trial_phase ? ` · Phase ${job.trial_phase}` : ""}</p>}
                    <div className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{job.description}</div>
                    {job.requirements && <div className="mt-2 text-xs text-slate-500 line-clamp-2">דרישות: {job.requirements}</div>}
                    <div className="mt-2 text-xs text-slate-400">הגשה: {job.application_method}</div>
                    <div className="text-xs text-slate-400">{new Date(job.created_at).toLocaleDateString("he-IL")}</div>
                  </div>
                  <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <form action={approveJob} className="flex-1">
                      <input type="hidden" name="jobId" value={job.id} />
                      <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        אשר ופרסם
                      </button>
                    </form>
                    <form action={rejectJob} className="flex-1">
                      <input type="hidden" name="jobId" value={job.id} />
                      <input
                        name="rejection_reason"
                        className="w-full mb-2 px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}
                        placeholder="סיבת הדחייה (אופציונלי)"
                      />
                      <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                        דחה
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* טאב כל המשתמשים */}
        {activeTab === "approved" && (
          <div>
            <p className="text-slate-500 text-sm mb-4">{approvedUsers.length} משתמשים פעילים במערכת</p>
            <ApprovedUsersClient users={approvedUsers} roleLabels={roleLabels} />
          </div>
        )}

        {/* טאב מרכז ידע */}
        {activeTab === "knowledge" && (
          <KnowledgeTab items={(knowledgeItems as any[]) ?? []} />
        )}
      </main>
    </div>
  );
}
