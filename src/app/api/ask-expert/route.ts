import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lecturerId, subject, body } = await req.json();

  if (!lecturerId || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get student profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("user_id", user.id)
    .single() as unknown as { data: { full_name: string; email: string; role: string } | null };

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Get lecturer
  const { data: lecturer } = await supabase
    .from("lecturers")
    .select("id, name, email, course_type")
    .eq("id", lecturerId)
    .single() as unknown as { data: { id: string; name: string; email: string; course_type: string } | null };

  if (!lecturer) return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });

  // Validate access: GCP students can only ask Orna (course_type = 'gcp')
  if (profile.role === "student_gcp" && lecturer.course_type !== "gcp") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Save question to DB
  const { data: question, error: insertError } = await supabase
    .from("questions")
    .insert({
      student_id: user.id,
      lecturer_id: lecturerId,
      subject: subject.trim(),
      body: body.trim(),
      student_email: profile.email,
    })
    .select("id, subject, body, created_at, lecturer_id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Failed to save question" }, { status: 500 });
  }

  // Send email to lecturer
  try {
    await resend.emails.send({
      from: "GCPRO <onboarding@resend.dev>",
      to: lecturer.email,
      subject: `שאלה חדשה מ-GCPRO: ${subject.trim()}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #0F2645; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">GCPRO — שאלה חדשה</h1>
            <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">הכה את המומחה</p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">שלום ${lecturer.name},</p>
            <p style="margin: 0 0 20px; color: #0F2645; font-size: 15px;">
              קיבלת שאלה חדשה מ-<strong>${profile.full_name}</strong> דרך פלטפורמת GCPRO.
            </p>

            <div style="background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">נושא</p>
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: bold; color: #0F2645;">${subject.trim()}</p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">תוכן השאלה</p>
              <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${body.trim()}</p>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px;">
              <p style="margin: 0; font-size: 13px; color: #1e40af;">
                <strong>לתשובה:</strong> השב ישירות למייל זה או פנה לסטודנט ב:
                <a href="mailto:${profile.email}" style="color: #0EA5E9;">${profile.email}</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email send failed:", emailError);
    // Don't fail the request if email fails — question is already saved
  }

  return NextResponse.json({ question });
}
