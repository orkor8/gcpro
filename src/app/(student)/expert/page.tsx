import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExpertClient from "./ExpertClient";

export default async function ExpertPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name, email")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; status: string; full_name: string; email: string } | null };

  if (!profile || profile.status !== "approved") redirect("/");

  const [{ data: lecturers }, { data: questions }] = await Promise.all([
    supabase
      .from("lecturers")
      .select("id, name, specialty, course_type, bio, photo_url")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("questions")
      .select("id, subject, body, created_at, lecturer_id")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <ExpertClient
      profile={profile}
      lecturers={lecturers ?? []}
      userId={user.id}
      myQuestions={questions ?? []}
    />
  );
}
