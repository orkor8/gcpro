import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, full_name, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.status === "approved") redirect("/dashboard");

  const roleLabel =
    profile?.role === "student_cra" ? "בוגר קורס CRA" :
    profile?.role === "student_gcp" ? "בוגר קורס GCP" :
    profile?.role === "employer" ? "מעסיק" : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        fontFamily: "var(--font-rubik), Rubik, sans-serif",
        background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)",
      }}
    >
      <div className="relative w-full max-w-md text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" }}
        >
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#0EA5E9" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h1 className="text-white font-black text-2xl mb-2" style={{ letterSpacing: "-0.02em" }}>
          ממתין לאישור
        </h1>
        <p className="text-slate-400 text-sm mb-2">
          שלום {profile?.full_name}, הבקשה שלך התקבלה!
        </p>
        {roleLabel && (
          <p className="text-slate-500 text-xs mb-6">
            נרשמת כ: <span className="text-sky-400 font-semibold">{roleLabel}</span>
          </p>
        )}
        <div
          className="rounded-2xl p-5 text-right mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-slate-300 text-sm leading-relaxed">
            הצוות שלנו יבדוק את הפרטים שלך ויאשר את החשבון בהקדם.
            לאחר האישור תקבל גישה מלאה למערכת.
          </p>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            התנתק
          </button>
        </form>
      </div>
    </div>
  );
}
