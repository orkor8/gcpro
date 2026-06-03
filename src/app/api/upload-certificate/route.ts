import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string | null;
  const name = formData.get("name") as string | null;

  if (!file || !userId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const safeName = name === "תעודת GCP" ? "gcp" : name === "תעודת CRA" ? "cra" : "cert";
  const path = `${userId}/${Date.now()}-${safeName}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("certificates")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("certificates")
    .getPublicUrl(uploadData.path);

  const { error: insertError } = await supabaseAdmin.from("certificates").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    file_url: urlData.publicUrl,
    issue_date: null,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
