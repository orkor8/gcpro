"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Certificate {
  id: string;
  name: string;
  file_url: string;
}

interface Props {
  certificates: Certificate[];
  userId: string;
  role: string;
}

const CERT_NAMES_GCP = ["תעודת GCP"];
const CERT_NAMES_CRA = ["תעודת GCP", "תעודת CRA"];

export default function CertificatesSection({ certificates: initial, userId, role }: Props) {
  const [certs, setCerts] = useState<Certificate[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const allowedNames = role === "student_cra" ? CERT_NAMES_CRA : CERT_NAMES_GCP;
  const existingNames = certs.map((c) => c.name);
  const missingNames = allowedNames.filter((n) => !existingNames.includes(n));
  const canAdd = missingNames.length > 0;

  function handleAddClick(name: string) {
    setPendingName(name);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingName) return;
    e.target.value = "";

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${pendingName}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError("שגיאה בהעלאת הקובץ. נסה שוב.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(uploadData.path);

    const newId = crypto.randomUUID();
    const { error: insertError } = await (supabase.from("certificates") as any).insert({
      id: newId,
      user_id: userId,
      name: pendingName,
      file_url: urlData.publicUrl,
      issue_date: null,
    });

    if (insertError) {
      setError("שגיאה בשמירת התעודה. נסה שוב.");
    } else {
      setCerts((prev) => [...prev, { id: newId, name: pendingName!, file_url: urlData.publicUrl }]);
    }

    setPendingName(null);
    setUploading(false);
  }

  async function handleRemove(cert: Certificate) {
    const supabase = createClient();

    // Extract storage path from URL
    const url = new URL(cert.file_url);
    const storagePath = url.pathname.split("/object/public/certificates/")[1];

    if (storagePath) {
      await supabase.storage.from("certificates").remove([storagePath]);
    }
    await supabase.from("certificates").delete().eq("id", cert.id);

    setCerts((prev) => prev.filter((c) => c.id !== cert.id));
  }

  return (
    <section
      className="rounded-2xl p-6 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="text-white font-bold text-sm">תעודות</div>

      {error && (
        <div className="px-4 py-2 rounded-xl text-xs font-medium" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
          {error}
        </div>
      )}

      {/* Existing certificates */}
      {certs.length > 0 && (
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>{cert.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8" }}
                >
                  צפה ↗
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(cert)}
                  className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                >
                  הסר
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add buttons for missing certs */}
      {canAdd && (
        <div className="space-y-2">
          {missingNames.map((name) => (
            <button
              key={name}
              type="button"
              disabled={uploading}
              onClick={() => handleAddClick(name)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1.5px dashed rgba(255,255,255,0.15)",
                color: uploading ? "#475569" : "#64748b",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading && pendingName === name ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  מעלה...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  הוסף {name}
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {!canAdd && certs.length > 0 && (
        <p className="text-xs" style={{ color: "#475569" }}>כל התעודות הועלו</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
    </section>
  );
}
