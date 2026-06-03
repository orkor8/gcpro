import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/types/database";
import { GCPROLogo } from "@/components/ui/GCPROLogo";
import { EmployerSidebar } from "@/components/ui/EmployerSidebar";
import { Footer } from "@/components/ui/Footer";

const roleLabels: Record<UserRole, string> = {
  student_gcp: "בוגר קורס GCP",
  student_cra: "בוגר קורס CRA",
  employer: "מעסיק",
  lecturer_gcp: "מרצה GCP",
  lecturer_cra: "מרצה CRA",
  admin: "מנהל מערכת",
};

const roleColors: Record<UserRole, string> = {
  student_gcp: "#0EA5E9",
  student_cra: "#8b5cf6",
  employer: "#10b981",
  lecturer_gcp: "#f59e0b",
  lecturer_cra: "#f59e0b",
  admin: "#ef4444",
};

const quickLinks = [
  {
    href: "/jobs",
    label: "לוח משרות",
    desc: "גלה משרות חדשות בתחום",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>,
    color: "#0EA5E9",
  },
  {
    href: "/bot",
    label: "בוט חכם",
    desc: "שאל שאלות על חומר הקורס",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>,
    color: "#8b5cf6",
  },
  {
    href: "/expert",
    label: "הכה את המומחה",
    desc: "שלח שאלה למרצה",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>,
    color: "#f59e0b",
  },
  {
    href: "/knowledge",
    label: "מרכז ידע",
    desc: "תכנים ועדכונים מקצועיים",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
    color: "#10b981",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const role = (profile?.role ?? "student_gcp") as UserRole;
  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "משתמש";
  const roleColor = roleColors[role];
  const roleLabel = roleLabels[role];

  const Header = () => (
    <header style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>CH</div>
          <span className="text-white font-bold">ClinHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}>
            {roleLabel}
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">יציאה</button>
          </form>
        </div>
      </div>
    </header>
  );

  // דשבורד מעסיק
  if (role === "employer") {
    const { data: myJobs } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("employer_id", user.id);

    const jobCounts = {
      total: myJobs?.length ?? 0,
      approved: myJobs?.filter(j => j.status === "approved").length ?? 0,
      pending: myJobs?.filter(j => j.status === "pending").length ?? 0,
    };

    return (
      <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }}>
        <EmployerSidebar />
        <div className="lg:mr-[260px] pt-14 lg:pt-0 flex flex-col min-h-screen">
        <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex-1">
          <div className="mb-8">
            <h1 className="font-black text-2xl mb-1" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>שלום, {name} 👋</h1>
            <p className="text-slate-500 text-sm">פאנל המעסיק שלך ב-GCPRO</p>
          </div>

          {/* סטטיסטיקות */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "סה״כ משרות", value: jobCounts.total, color: "#0EA5E9", href: "/jobs/my-jobs" },
              { label: "משרות פעילות", value: jobCounts.approved, color: "#10b981", href: "/jobs/my-jobs" },
              { label: "ממתינות לאישור", value: jobCounts.pending, color: "#f59e0b", href: "/jobs/my-jobs" },
            ].map((s) => (
              <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-5 shadow-sm transition-all hover:shadow-md" style={{ border: "1.5px solid #f1f5f9" }}>
                <div className="font-black text-3xl mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </Link>
            ))}
          </div>

          {/* כרטיסי פעולות */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <Link
              href="/jobs/post"
              className="rounded-2xl p-6 flex items-center gap-5 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.07)", border: "1.5px solid #f1f5f9" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: "#0F2645" }}>פרסם משרה חדשה</div>
                <div className="text-slate-400 text-sm mt-0.5">מלא פרטים ושלח לאישור</div>
              </div>
            </Link>

            <Link
              href="/candidates"
              className="rounded-2xl p-6 flex items-center gap-5 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.07)", border: "1.5px solid #f1f5f9" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: "#0F2645" }}>חיפוש בוגרים</div>
                <div className="text-slate-400 text-sm mt-0.5">סנן לפי קורס, עיר וכישורים</div>
              </div>
            </Link>

            <Link
              href="/jobs/my-jobs"
              className="rounded-2xl p-6 flex items-center gap-5 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.07)", border: "1.5px solid #f1f5f9" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: "#0F2645" }}>המשרות שלי</div>
                <div className="text-slate-400 text-sm mt-0.5">צפה וניהל את המשרות שפרסמת</div>
              </div>
            </Link>
          </div>
        </main>
        <Footer />
        </div>
      </div>
    );
  }

  // דשבורד בוגר / מרצה
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "#f1f5f9" }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-black text-2xl mb-1" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>
            שלום, {name} 👋
          </h1>
          <p className="text-slate-500 text-sm">ברוך הבא לפאנל האישי שלך ב-GCPRO</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card-hover rounded-2xl p-5 bg-white flex flex-col gap-3"
              style={{ boxShadow: "0 2px 12px rgba(15,38,69,0.07)", border: "1.5px solid #f1f5f9" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${link.color}15`, color: link.color }}>
                {link.icon}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#0F2645" }}>{link.label}</div>
                <div className="text-slate-400 text-xs mt-0.5">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {!profile?.bio && (
          <div
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, #0F2645, #162f55)", border: "1px solid rgba(14,165,233,0.2)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.15)" }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0EA5E9" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">השלם את הפרופיל שלך</p>
                <p className="text-slate-400 text-xs mt-0.5">הוסף תיאור, כישורים ותעודות כדי שמעסיקים יוכלו למצוא אותך</p>
              </div>
            </div>
            <Link href="/profile/edit" className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
              השלם פרופיל
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
