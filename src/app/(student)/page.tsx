import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let jobs: any[] = [];
  let lecturers: any[] = [];
  let knowledgeItems: any[] = [];

  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("role, full_name, status, bio, degree, field_of_study, english_level, linkedin_url, skills, city, phone")
      .eq("user_id", user.id)
      .single() as unknown as { data: { role: string; full_name: string; status: string; bio: string | null; degree: string | null; field_of_study: string | null; english_level: string | null; linkedin_url: string | null; skills: string[] | null; city: string | null; phone: string | null; } | null };

    profile = p;

    // Employers go to their dashboard
    if (p?.role === "employer") redirect("/dashboard");

    if (p?.status === "approved" && (p?.role === "student_cra" || p?.role === "student_gcp")) {
      const now = new Date().toISOString();

      // Fetch approved jobs
      const { data: rawJobs } = await supabase
        .from("jobs")
        .select("id, title, company, location, job_type, description, is_discrete, is_junior_friendly, target_audience, early_access_until")
        .eq("status", "approved")
        .order("published_at", { ascending: false }) as unknown as { data: Array<{ id: string; title: string; company: string; location: string; job_type: string; description: string; is_discrete: boolean; is_junior_friendly: boolean; target_audience: string[] | null; early_access_until: string; }> | null };

      if (rawJobs) {
        jobs = rawJobs.map((job) => {
          if (p.role === "student_gcp") {
            const accessDate = new Date(job.early_access_until);
            const nowDate = new Date();
            if (accessDate > nowDate) {
              const hoursLeft = Math.ceil((accessDate.getTime() - nowDate.getTime()) / 3_600_000);
              return { ...job, locked: true, hoursLeft };
            }
          }
          return { ...job, locked: false };
        });
      }

      // Fetch lecturers
      const { data: lecs } = await supabase
        .from("lecturers")
        .select("id, name, specialty, course_type, bio")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (lecs) lecturers = lecs;

      // Fetch knowledge items
      const { data: knowledge } = await supabase
        .from("knowledge_items")
        .select("id, title, content_type, published_at")
        .order("published_at", { ascending: false })
        .limit(8);

      if (knowledge) knowledgeItems = knowledge;
    }
  }

  return (
    <HomeClient
      user={user ? { id: user.id, email: user.email } : null}
      profile={profile}
      jobs={jobs}
      lecturers={lecturers}
      knowledgeItems={knowledgeItems}
    />
  );
}
