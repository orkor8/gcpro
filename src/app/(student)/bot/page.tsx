import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotChat } from "./BotChat";

export default async function BotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name")
    .eq("user_id", user.id)
    .single() as unknown as { data: { role: string; status: string; full_name: string } | null };

  if (!profile || profile.status !== "approved") redirect("/");

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }}
      dir="rtl"
    >
      {/* Page header */}
      <div
        className="px-8 py-5 flex items-center justify-between"
        style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}
      >
        <div>
          <h1 className="text-white font-black text-xl" style={{ letterSpacing: "-0.02em" }}>הבוט החכם</h1>
          <p className="text-slate-400 text-sm mt-0.5">שאל כל שאלה על GCP, CRA ומחקר קליני</p>
        </div>
        <span
          className="hidden md:inline-flex text-xs font-bold px-3 py-1.5 rounded-full"
          style={{
            background: profile.role === "student_cra" ? "rgba(139,92,246,0.15)" : "rgba(14,165,233,0.15)",
            color: profile.role === "student_cra" ? "#a78bfa" : "#38bdf8",
            border: `1px solid ${profile.role === "student_cra" ? "rgba(139,92,246,0.3)" : "rgba(14,165,233,0.3)"}`,
          }}
        >
          {profile.role === "student_cra" ? "בוגר CRA" : "בוגר GCP"}
        </span>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <BotChat userName={profile.full_name} role={profile.role} />
      </main>
    </div>
  );
}
