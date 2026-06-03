"use client";

import { useRef, useState } from "react";

export function CvUpload({ currentUrl }: { currentUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("יש להעלות קובץ PDF בלבד");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("הקובץ גדול מדי — מקסימום 5MB");
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload-cv", { method: "POST", body: fd });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("שגיאה בהעלאה. נסה שוב.");
      return;
    }

    setUrl(json.url);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {url ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#34d399" }}>קורות חיים הועלו</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#94a3b8" }}>
              לצפייה בקובץ
            </a>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-semibold flex-shrink-0"
            style={{ color: "#0EA5E9" }}
          >
            {loading ? "מעלה..." : "החלף"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full flex flex-col items-center gap-2 py-6 rounded-xl transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1.5px dashed rgba(255,255,255,0.15)",
            color: "#64748b",
          }}
          onMouseEnter={e => { (e.currentTarget).style.borderColor = "rgba(14,165,233,0.4)"; (e.currentTarget).style.color = "#38bdf8"; }}
          onMouseLeave={e => { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget).style.color = "#64748b"; }}
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          )}
          <span className="text-sm font-medium">{loading ? "מעלה קובץ..." : "לחץ להעלאת קורות חיים"}</span>
          <span className="text-xs" style={{ color: "#475569" }}>PDF בלבד · עד 5MB</span>
        </button>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}
