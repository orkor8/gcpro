"use client";

import { useSearchParams, useRouter } from "next/navigation";

const tabs = [
  { key: "users", label: "ממתינים לאישור" },
  { key: "jobs",  label: "משרות לאישור" },
  { key: "approved", label: "כל המשתמשים" },
  { key: "knowledge", label: "מרכז ידע" },
];

export function AdminTabs({ counts }: { counts: { users: number; jobs: number; approved: number; knowledge: number } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = searchParams.get("tab") ?? "users";

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => router.push(`/admin?tab=${t.key}`)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          style={{
            background: active === t.key ? "#0F2645" : "white",
            color: active === t.key ? "white" : "#64748b",
            border: active === t.key ? "none" : "1.5px solid #e2e8f0",
            boxShadow: active === t.key ? "0 2px 12px rgba(15,38,69,0.15)" : "none",
          }}
        >
          {t.label}
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-black"
            style={{
              background: active === t.key ? "rgba(14,165,233,0.2)" : "#f1f5f9",
              color: active === t.key ? "#0EA5E9" : "#94a3b8",
            }}
          >
            {counts[t.key as keyof typeof counts]}
          </span>
        </button>
      ))}
    </div>
  );
}
