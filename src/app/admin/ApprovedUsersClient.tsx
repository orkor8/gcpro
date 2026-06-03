"use client";

import { useState } from "react";
import type { UserRole } from "@/types/database";

const ROLE_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "student_gcp", label: "בוגר GCP" },
  { key: "student_cra", label: "בוגר CRA" },
  { key: "employer", label: "מעסיקים" },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  student_gcp: { bg: "rgba(14,165,233,0.1)", color: "#0284c7" },
  student_cra: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed" },
  employer: { bg: "rgba(16,185,129,0.1)", color: "#059669" },
};

export function ApprovedUsersClient({
  users,
  roleLabels,
}: {
  users: any[];
  roleLabels: Record<UserRole, string>;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, מייל, עיר..."
          className="px-4 py-2 rounded-xl text-sm outline-none flex-1 min-w-[200px]"
          style={{ background: "white", border: "1.5px solid #e2e8f0", color: "#0F2645" }}
        />
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: roleFilter === f.key ? "#0F2645" : "white",
                color: roleFilter === f.key ? "white" : "#64748b",
                border: roleFilter === f.key ? "none" : "1.5px solid #e2e8f0",
              }}
            >
              {f.label}
              <span className="mr-1.5 opacity-60">
                {f.key === "all"
                  ? users.length
                  : users.filter((u) => u.role === f.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search || roleFilter !== "all" ? (
        <p className="text-xs text-slate-400 mb-3">{filtered.length} תוצאות</p>
      ) : null}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">אין משתמשים</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1.5px solid #f1f5f9" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafbfc" }}>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">שם</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">מייל</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">תפקיד</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">עיר</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">טלפון</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400 text-xs">הצטרף</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const colors = ROLE_COLORS[u.role] ?? { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr
                    key={u.user_id}
                    style={{ borderTop: i > 0 ? "1px solid #f8fafc" : "none" }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold" style={{ color: "#0F2645" }}>{u.full_name}</td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.color }}>
                        {roleLabels[u.role as UserRole] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.city ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{u.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
