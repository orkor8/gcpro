import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF only" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const admin = createAdminClient();
  const path = `${user.id}/cv-${Date.now()}.pdf`;
  const buffer = new Uint8Array(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await admin.storage
    .from("certificates")
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage
    .from("certificates")
    .getPublicUrl(uploadData.path);

  await admin.from("profiles")
    .update({ cv_url: urlData.publicUrl })
    .eq("user_id", user.id);

  return NextResponse.json({ url: urlData.publicUrl });
}
