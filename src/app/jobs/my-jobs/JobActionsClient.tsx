"use client";

import Link from "next/link";
import { deleteJob, toggleActive } from "./actions";

export function JobActionsClient({
  jobId,
  status,
  isActive,
}: {
  jobId: string;
  status: string;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Edit — always available */}
      <Link
        href={`/jobs/edit/${jobId}`}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
        style={{ background: "rgba(14,165,233,0.08)", color: "#0284c7", border: "1px solid rgba(14,165,233,0.2)" }}
      >
        ✏ ערוך
      </Link>

      {/* Toggle active — only for approved */}
      {status === "approved" && (
        <form action={toggleActive}>
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="isActive" value={String(isActive)} />
          <button
            type="submit"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={
              isActive
                ? { background: "rgba(245,158,11,0.08)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }
                : { background: "rgba(16,185,129,0.08)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)" }
            }
          >
            {isActive ? "⏸ השבת" : "▶ הפעל"}
          </button>
        </form>
      )}

      {/* Delete — always available */}
      <form action={deleteJob} onSubmit={(e) => {
        if (!confirm("למחוק את המשרה לצמיתות?")) e.preventDefault();
      }}>
        <input type="hidden" name="jobId" value={jobId} />
        <button
          type="submit"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          🗑 מחק
        </button>
      </form>
    </div>
  );
}
