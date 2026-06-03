import Link from "next/link";
import type { UserRole } from "@/types/database";
import { GCPROLogo } from "@/components/ui/GCPROLogo";

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

const homeByRole: Record<UserRole, string> = {
  student_gcp: "/",
  student_cra: "/",
  employer: "/dashboard",
  lecturer_gcp: "/",
  lecturer_cra: "/",
  admin: "/admin",
};

interface AppHeaderProps {
  role: UserRole;
  title?: string;
}

export function AppHeader({ role, title }: AppHeaderProps) {
  const color = roleColors[role];
  const home = homeByRole[role];

  return (
    <header style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={home}>
            <GCPROLogo variant="dark" size="sm" />
          </Link>
          {title && (
            <>
              <span className="text-slate-600 text-sm">/</span>
              <span className="text-slate-300 text-sm">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={home}
            className="text-slate-400 hover:text-white text-xs font-medium transition-colors hidden sm:block"
          >
            ← {role === "employer" ? "דשבורד" : role === "admin" ? "ניהול" : "עמוד הבית"}
          </Link>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {roleLabels[role]}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              יציאה
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
