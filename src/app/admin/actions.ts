"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import type { UserRole } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

const roleLabels: Record<string, string> = {
  student_gcp: "בוגר/ת קורס GCP",
  student_cra: "בוגר/ת קורס CRA",
  employer: "מעסיק",
};

export async function approveUser(formData: FormData) {
  const supabase = createAdminClient();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;

  // Get profile before approving (to get name + email)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", userId)
    .single() as unknown as { data: { full_name: string; email: string } | null };

  await supabase.from("profiles").update({ status: "approved", role }).eq("user_id", userId);

  // Send approval email
  if (profile?.email) {
    try {
      await resend.emails.send({
        from: "GCPRO <onboarding@resend.dev>",
        to: profile.email,
        subject: "החשבון שלך ב-GCPRO אושר! 🎉",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #0F2645; padding: 20px 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.02em;">
                GCP<span style="color: #0EA5E9;">RO</span>
              </h1>
              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">הפלטפורמה המקצועית לבוגרי מחקר קליני</p>
            </div>
            <div style="background: #f8fafc; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span style="font-size: 28px;">✓</span>
                </div>
                <h2 style="color: #0F2645; margin: 0 0 8px; font-size: 22px;">החשבון שלך אושר!</h2>
                <p style="color: #64748b; margin: 0; font-size: 15px;">שלום ${profile.full_name}, ברוך הבא ל-GCPRO</p>
              </div>

              <div style="background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8;">רשום/ה כ</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0F2645;">${roleLabels[role] ?? role}</p>
              </div>

              <p style="color: #334155; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
                יש לך כעת גישה מלאה לפלטפורמה — לוח משרות, הבוט החכם, מרכז הידע, ושאלות למומחים.
              </p>

              <div style="text-align: center;">
                <a href="https://gcpro.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #0EA5E9, #0284c7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 15px;">
                  כניסה לפלטפורמה ←
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Approval email failed:", e);
    }
  }

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
