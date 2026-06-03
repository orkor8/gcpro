"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobId = formData.get("jobId") as string;

  const targetAudience = [];
  if (formData.get("target_cra")) targetAudience.push("student_cra");
  if (formData.get("target_gcp")) targetAudience.push("student_gcp");

  await supabase
    .from("jobs")
    .update({
      title: formData.get("title") as string,
      company: formData.get("is_discrete") ? null : formData.get("company") as string,
      is_discrete: !!formData.get("is_discrete"),
      location: formData.get("location") as string,
      job_type: formData.get("job_type") as string,
      experience_level: formData.get("experience_level") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string || null,
      application_method: formData.get("application_method") as string,
      travel_percent: formData.get("travel_percent") ? Number(formData.get("travel_percent")) : null,
      salary_range: formData.get("salary_range") as string || null,
      start_date: formData.get("start_date") as string || null,
      therapeutic_area: formData.get("therapeutic_area") as string || null,
      trial_phase: formData.get("trial_phase") as string || null,
      is_junior_friendly: !!formData.get("is_junior_friendly"),
      target_audience: targetAudience,
      status: "pending",
    })
    .eq("id", jobId)
    .eq("employer_id", user.id);

  redirect("/jobs/my-jobs?updated=1");
}
