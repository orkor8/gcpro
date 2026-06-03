"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GCPROLogo } from "@/components/ui/GCPROLogo";

const navItems = [
  {
    id: "home", label: "דף הבית", href: "/",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  },
  {
    id: "jobs", label: "לוח משרות", href: "/jobs",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>,
  },
  {
    id: "bot", label: "בוט חכם", href: "/bot",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>,
  },
  {
    id: "expert", label: "הכה את המומחה", href: "/expert",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>,
  },
  {
    id: "knowledge", label: "מרכז ידע", href: "/knowledge",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  },
];

const roleLabels: Record<string, string> = {
  student_gcp: "בוגר GCP",
  student_cra: "בוגר CRA",
  lecturer_gcp: "מרצה GCP",
  lecturer_cra: "מרצה CRA",
  admin: "מנהל מערכת",
};

interface Props {
  profile: { full_name: string; role: string; status: string } | null;
}

function SidebarContent({ profile, onClose }: Props & { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-14 lg:top-0 z-40 flex flex-col h-[calc(100dvh-3.5rem)] lg:h-screen"
      style={{
        right: 0,
        width: 260,
        background: "linear-gradient(180deg, #0F2645 0%, #091a30 100%)",
        borderLeft: "1px solid rgba(14,165,233,0.12)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <GCPROLogo variant="dark" size="md" />
        <div className="text-sky-400/50 mt-1.5" style={{ fontSize: "0.68rem", paddingRight: 2 }}>קהילת בוגרי GCP Academy</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace("/#", "/"));
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all"
                style={{
                  background: isActive ? "rgba(14,165,233,0.15)" : "transparent",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "jobs" && (
                  <span className="mr-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "0.65rem" }}>
                    חדש
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="my-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        <div className="mx-1 px-3 py-3 rounded-xl" style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />
            <span className="text-green-400 text-xs font-semibold">קהילה פעילה</span>
          </div>
          <p className="text-slate-400" style={{ fontSize: "0.7rem" }}>משרות חדשות מתעדכנות שוטף</p>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 pt-4 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        {profile ? (
          <>
            <div className="flex items-center gap-3 px-1 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
                {profile.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-bold truncate">{profile.full_name}</div>
                <div className="text-sky-400/70 text-xs">{roleLabels[profile.role] ?? profile.role}</div>
              </div>
            </div>
            {profile.role === "admin" && (
              <Link href="/admin" onClick={onClose} className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.25)" }}>
                ⚙ פאנל ניהול
              </Link>
            )}
            <Link href="/profile/edit" onClick={onClose} className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-sky-300 transition-all" style={{ border: "1px solid rgba(14,165,233,0.3)" }}>
              הפרופיל שלי
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                יציאה
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}>
              התחברות
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/register?type=student" className="block text-center py-2.5 rounded-xl text-xs font-semibold" style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.2)" }}>
                בוגר/ת קורס
              </Link>
              <Link href="/register?type=employer" className="block text-center py-2.5 rounded-xl text-xs font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                מעסיק
              </Link>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export function StudentSidebar({ profile }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4" style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.15)" }}>
        <div className="flex items-center gap-2">
          <GCPROLogo variant="dark" size="sm" />
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-white p-1.5 rounded-lg" style={{ background: "rgba(14,165,233,0.15)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block">
        <SidebarContent profile={profile} />
      </div>

      {/* Mobile sidebar — slide in */}
      {mobileOpen && (
        <div className="lg:hidden">
          <SidebarContent profile={profile} onClose={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
