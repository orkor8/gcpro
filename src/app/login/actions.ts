"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "כתובת המייל או הסיסמה שגויים" };
  }

  // Fetch profile to determine where to redirect
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single() as unknown as { data: { role: string } | null };

    if (profile?.role === "admin") redirect("/admin");
    if (profile?.role === "employer") redirect("/dashboard");
  }

  redirect("/");
}
