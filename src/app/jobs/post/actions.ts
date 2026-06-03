"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "employer") redirect("/dashboard");

  const targetAudience: string[] = [];
  if (formData.get("target_cra") === "on") targetAudience.push("student_cra");
  if (formData.get("target_gcp") === "on") targetAudience.push("student_gcp");

  await supabase.from("jobs").insert({
    employer_id: user.id,
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    is_discrete: formData.get("is_discrete") === "on",
    location: formData.get("location") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string || null,
    application_method: formData.get("application_method") as string,
    job_type: (formData.get("job_type") as string),
    travel_percent: formData.get("travel_percent") ? Number(formData.get("travel_percent")) : null,
    therapeutic_area: formData.get("therapeutic_area") as string || null,
    trial_phase: formData.get("trial_phase") as string || null,
    salary_range: formData.get("salary_range") as string || null,
    start_date: formData.get("start_date") as string || null,
    is_junior_friendly: formData.get("is_junior_friendly") === "on",
    target_audience: targetAudience,
    status: "pending",
    published_at: null,
    early_access_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  });

  redirect("/jobs/my-jobs?submitted=1");
}
