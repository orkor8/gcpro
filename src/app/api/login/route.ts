import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "כתובת המייל או הסיסמה שגויים" }, { status: 401 });
  }

  const role = data.user.user_metadata?.role;
  let redirectTo = "/";

  // Check profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .single() as unknown as { data: { role: string } | null };

  if (profile?.role === "admin") redirectTo = "/admin";
  else if (profile?.role === "employer") redirectTo = "/dashboard";

  return NextResponse.json({ ok: true, redirectTo });
}
