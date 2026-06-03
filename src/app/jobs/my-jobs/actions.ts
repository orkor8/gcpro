"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobId = formData.get("jobId") as string;

  // Only allow deleting own jobs that are not approved
  await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("employer_id", user.id)
    .in("status", ["pending", "rejected"]);

  redirect("/jobs/my-jobs");
}

export async function toggleActive(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobId = formData.get("jobId") as string;
  const isActive = formData.get("isActive") === "true";

  await supabase
    .from("jobs")
    .update({ is_active: !isActive })
    .eq("id", jobId)
    .eq("employer_id", user.id)
    .eq("status", "approved");

  redirect("/jobs/my-jobs");
}
