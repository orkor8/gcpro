"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export async function approveUser(formData: FormData) {
  const supabase = createAdminClient();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;
  await supabase.from("profiles").update({ status: "approved", role }).eq("user_id", userId);
  redirect("/admin?tab=users");
}

export async function rejectUser(formData: FormData) {
  const supabase = createAdminClient();
  const userId = formData.get("userId") as string;
  await supabase.from("profiles").delete().eq("user_id", userId);
  redirect("/admin?tab=users");
}

export async function approveJob(formData: FormData) {
  const supabase = createAdminClient();
  const jobId = formData.get("jobId") as string;
  await supabase.from("jobs").update({ status: "approved", published_at: new Date().toISOString() }).eq("id", jobId);
  redirect("/admin?tab=jobs");
}

export async function rejectJob(formData: FormData) {
  const supabase = createAdminClient();
  const jobId = formData.get("jobId") as string;
  const reason = formData.get("rejection_reason") as string;
  await supabase.from("jobs").update({ status: "rejected", rejection_reason: reason }).eq("id", jobId);
  redirect("/admin?tab=jobs");
}

export async function addKnowledgeItem(formData: FormData) {
  const supabase = createAdminClient();
  await supabase.from("knowledge_items").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    content_url: (formData.get("content_url") as string) || null,
    content_type: formData.get("content_type") as string,
    cra_only: formData.get("cra_only") === "on",
    published_at: new Date().toISOString(),
  });
  redirect("/admin?tab=knowledge");
}

export async function deleteKnowledgeItem(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("knowledge_items").delete().eq("id", id);
  redirect("/admin?tab=knowledge");
}
