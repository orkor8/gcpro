import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CandidateFilters } from "./CandidateFilters";
import { EmployerSidebar } from "@/components/ui/EmployerSidebar";
import { Footer } from "@/components/ui/Footer";

const roleLabel: Record<string, { text: string; color: string; bg: string }> = {
  student_cra: { text: "בוגר CRA", color: "#7c3aed", bg: "rgba(139,92,246,0.1)" },
  student_gcp: { text: "בוגר GCP", color: "#0284c7", bg: "rgba(14,165,233,0.1)" },
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; city?: string; degree?: string; field?: string; english?: string; edc?: string; coordinator?: string }>;
}) {
  const { course, city, degree, field, english, edc, coordinator } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "employer") redirect("/dashboard");

  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("user_id, full_name, email, phone, city, linkedin_url, cv_url, skills, bio, role, degree, field_of_study, institution, english_level, edc_systems, has_coordinator_experience")
    .in("role", ["student_gcp", "student_cra"])
    .eq("status", "approved")
    .eq("is_open_to_work", true);

  if (course) query = query.eq("role", course);
  if (city) query = query.eq("city", city);
  if (degree) query = query.eq("degree", degree);
  if (field) query = query.eq("field_of_study", field);
  if (english) query = query.eq("english_level", english);
  if (edc) query = query.contains("edc_systems", [edc]);
  if (coordinator === "1") query = query.eq("has_coordinator_experience", true);

  const { data: candidates } = await query.order("created_at", { ascending: false });

  // Fetch certificates for all candidates
  const candidateIds = candidates?.map(c => c.user_id) ?? [];
  const { data: allCertificates } = candidateIds.length > 0
    ? await admin.from("certificates").select("user_id, name, file_url").in("user_id", candidateIds)
    : { data: [] };

  const certsByUser: Record<string, { name: string; file_url: string }[]> = {};
  (allCertificates ?? []).forEach(cert => {
    if (!certsByUser[cert.user_id]) certsByUser[cert.user_id] = [];
    certsByUser[cert.user_id].push({ name: cert.name, file_url: cert.file_url });
  });

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }} dir="rtl">
      <EmployerSidebar />
      <div className="lg:mr-[260px] pt-14 lg:pt-0 flex flex-col min-h-screen">
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex-1">
        <div className="mb-6">
          <h1 className="font-black text-2xl mb-1" style={{ color: "#0F2645" }}>חיפוש בוגרים</h1>
          <p className="text-slate-500 text-sm">{candidates?.length ?? 0} בוגרים נמצאו</p>
        </div>

        <Suspense>
          <CandidateFilters />
        </Suspense>

        {!candidates?.length && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm text-slate-400">
            לא נמצאו בוגרים התואמים את הסינון
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates?.map((c) => {
            const rl = roleLabel[c.role] ?? roleLabel.student_gcp;
            return (
              <div key={c.user_id} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1.5px solid #f1f5f9" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: rl.bg, color: rl.color }}>
                        {rl.text}
                      </span>
                    </div>
                    <h2 className="font-bold text-lg" style={{ color: "#0F2645" }}>{c.full_name}</h2>
                    {c.city && <p className="text-slate-500 text-sm">{c.city}</p>}
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", fontSize: 18 }}
                  >
                    {c.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                </div>

                {c.bio && (
                  <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-2">{c.bio}</p>
                )}

                {/* תואר + תחום */}
                {(c.degree || c.field_of_study) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {c.degree && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>{c.degree}</span>}
                    {c.field_of_study && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{c.field_of_study}</span>}
                    {c.institution && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#64748b" }}>{c.institution}</span>}
                  </div>
                )}

                {/* מיומנויות */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.english_level && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#fef9c3", color: "#a16207" }}>🇬🇧 {c.english_level}</span>}
                  {c.has_coordinator_experience && <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#dcfce7", color: "#16a34a" }}>✓ מתאם/ת מחקר</span>}
                  {(c.edc_systems as string[] ?? []).slice(0, 2).map((s: string) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>{s}</span>
                  ))}
                </div>

                {c.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(c.skills as string[]).slice(0, 4).map((s: string) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{s}</span>
                    ))}
                  </div>
                )}

                <div className="pt-3 space-y-1.5" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                    {c.email}
                  </a>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:underline">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      {c.phone}
                    </a>
                  )}
                  {c.cv_url && (
                    <a href={c.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: "#0EA5E9" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                      הורד קורות חיים
                    </a>
                  )}
                  {(certsByUser[c.user_id] ?? []).map(cert => (
                    <a key={cert.file_url} href={cert.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: "#7c3aed" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814" /></svg>
                      {cert.name}
                    </a>
                  ))}
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                  )}
                </div>
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
