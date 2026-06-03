"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GCPROLogo } from "@/components/ui/GCPROLogo";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "@/types/database";

/* ─── ICONS ─── */
const StudentIcon = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
);
const EmployerIcon = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const CheckIcon = () => (
  <svg width="10" height="10" fill="white" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);
const FileIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

type AccountType = "student" | "employer" | null;

/* ─── FILE UPLOAD FIELD ─── */
function CertificateUpload({
  label,
  hint,
  file,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>
        {label} {required && <span style={{ color: "#f87171" }}>*</span>}
      </label>
      {hint && <p className="text-xs mb-2" style={{ color: "#64748b" }}>{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <span style={{ color: "#34d399" }}><FileIcon /></span>
          <span className="flex-1 text-sm truncate" style={{ color: "#94a3b8" }}>{file.name}</span>
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-xs font-semibold"
            style={{ color: "#f87171" }}
          >
            הסר
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-5 rounded-xl transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1.5px dashed rgba(255,255,255,0.15)",
            color: "#64748b",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(14,165,233,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#38bdf8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}
        >
          <UploadIcon />
          <span className="text-xs font-medium">לחץ להעלאת קובץ</span>
          <span className="text-xs" style={{ color: "#475569" }}>PDF, JPG, PNG עד 10MB</span>
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   REGISTER PAGE
═══════════════════════════════════════════ */
function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Certificates
  const [certGcp, setCertGcp] = useState<File | null>(null);
  const [certCra1, setCertCra1] = useState<File | null>(null);
  const [certCra2, setCertCra2] = useState<File | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    companyName: "",
  });

  // Pre-select based on URL param
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "employer") {
      setAccountType("employer");
      setSelectedRole("employer");
    } else if (type === "student") {
      setAccountType("student");
    }
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSelectAccountType(type: AccountType) {
    setAccountType(type);
    if (type === "employer") {
      setSelectedRole("employer");
    } else {
      setSelectedRole(null);
    }
  }

  const canContinue =
    accountType === "employer" ||
    (accountType === "student" && selectedRole !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (form.password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    // Validate required certificates for students
    if (selectedRole === "student_gcp" && !certGcp) {
      setError("יש להעלות את תעודת ה-GCP");
      return;
    }
    if (selectedRole === "student_cra" && (!certCra1 || !certCra2)) {
      setError("יש להעלות את תעודת ה-GCP ואת תעודת ה-CRA");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: selectedRole } },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "כתובת המייל כבר רשומה במערכת"
          : "אירעה שגיאה. נסה שוב."
      );
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("אירעה שגיאה. נסה שוב.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // Create profile
    await supabase.from("profiles").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      role: selectedRole!,
      status: "pending",
      full_name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      city: form.city || null,
      bio: null,
      photo_url: null,
      cv_url: null,
      linkedin_url: null,
      skills: null,
    });

    // Upload certificates via server API (uses service role — no auth issues)
    const filesToUpload: { file: File; name: string }[] = [];
    if (selectedRole === "student_gcp" && certGcp) {
      filesToUpload.push({ file: certGcp, name: "תעודת GCP" });
    }
    if (selectedRole === "student_cra") {
      if (certCra1) filesToUpload.push({ file: certCra1, name: "תעודת GCP" });
      if (certCra2) filesToUpload.push({ file: certCra2, name: "תעודת CRA" });
    }

    for (const { file, name } of filesToUpload) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("userId", userId);
      fd.append("name", name);
      const res = await fetch("/api/upload-certificate", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        console.error("Certificate upload error:", err);
      }
    }

    router.push("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        fontFamily: "var(--font-rubik), Rubik, sans-serif",
        background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)",
      }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(14,165,233,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", boxShadow: "0 0 24px rgba(14,165,233,0.4)" }}
            >
              <GCPROLogo variant="dark" size="md" />
          </Link>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? "linear-gradient(135deg, #0EA5E9, #0284c7)" : "rgba(255,255,255,0.08)",
                    color: step >= s ? "white" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {s}
                </div>
                <span className="text-xs font-medium" style={{ color: step >= s ? "#94a3b8" : "rgba(255,255,255,0.25)" }}>
                  {s === 1 ? "סוג חשבון" : "פרטים ותעודות"}
                </span>
                {s < 2 && <div className="w-8 h-px mx-1" style={{ background: step > s ? "#0EA5E9" : "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
          </div>

          {/* ══════════════════ STEP 1 ══════════════════ */}
          {step === 1 && (
            <div>
              <h1 className="text-white font-black text-2xl mb-1" style={{ letterSpacing: "-0.02em" }}>
                הצטרף ל-GCPRO
              </h1>
              <p className="text-slate-400 text-sm mb-6">מי אתה?</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => handleSelectAccountType("student")}
                  className="relative p-5 rounded-2xl text-center transition-all"
                  style={{
                    background: accountType === "student" ? "rgba(14,165,233,0.12)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${accountType === "student" ? "#0EA5E9" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {accountType === "student" && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#0EA5E9" }}>
                      <CheckIcon />
                    </div>
                  )}
                  <div className="flex items-center justify-center mb-3" style={{ color: "#0EA5E9" }}><StudentIcon /></div>
                  <div className="text-white font-bold text-sm mb-1">בוגר/ת קורס</div>
                  <div className="text-slate-400 text-xs leading-snug">מחפש/ת עבודה בתחום המחקר הקליני</div>
                </button>

                <button
                  onClick={() => handleSelectAccountType("employer")}
                  className="relative p-5 rounded-2xl text-center transition-all"
                  style={{
                    background: accountType === "employer" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${accountType === "employer" ? "#10b981" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {accountType === "employer" && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#10b981" }}>
                      <CheckIcon />
                    </div>
                  )}
                  <div className="flex items-center justify-center mb-3" style={{ color: "#10b981" }}><EmployerIcon /></div>
                  <div className="text-white font-bold text-sm mb-1">מעסיק</div>
                  <div className="text-slate-400 text-xs leading-snug">בית חולים, פארמה, CRO — מחפש/ת עובדים</div>
                </button>
              </div>

              {accountType === "student" && (
                <div className="rounded-2xl p-4 mb-5 space-y-2" style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.15)" }}>
                  <p className="text-slate-300 text-xs font-semibold mb-3">איזה קורס סיימת?</p>

                  <button
                    onClick={() => setSelectedRole("student_gcp")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all"
                    style={{
                      background: selectedRole === "student_gcp" ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${selectedRole === "student_gcp" ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: selectedRole === "student_gcp" ? "rgba(14,165,233,0.25)" : "rgba(255,255,255,0.06)", color: "#0EA5E9" }}>GCP</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">קורס GCP</div>
                      <div className="text-slate-400 text-xs">Good Clinical Practice — יש להעלות תעודה אחת</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={{ borderColor: selectedRole === "student_gcp" ? "#0EA5E9" : "rgba(255,255,255,0.2)", background: selectedRole === "student_gcp" ? "#0EA5E9" : "transparent" }}>
                      {selectedRole === "student_gcp" && <CheckIcon />}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedRole("student_cra")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all"
                    style={{
                      background: selectedRole === "student_cra" ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${selectedRole === "student_cra" ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: selectedRole === "student_cra" ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)", color: "#8b5cf6" }}>CRA</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">קורס CRA</div>
                      <div className="text-slate-400 text-xs">Clinical Research Associate — יש להעלות תעודת GCP + תעודת CRA</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" style={{ borderColor: selectedRole === "student_cra" ? "#8b5cf6" : "rgba(255,255,255,0.2)", background: selectedRole === "student_cra" ? "#8b5cf6" : "transparent" }}>
                      {selectedRole === "student_cra" && <CheckIcon />}
                    </div>
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
                style={{
                  background: canContinue ? "linear-gradient(135deg, #0EA5E9, #0284c7)" : "rgba(255,255,255,0.08)",
                  opacity: canContinue ? 1 : 0.5,
                  cursor: canContinue ? "pointer" : "not-allowed",
                }}
              >
                המשך →
              </button>
            </div>
          )}

          {/* ══════════════════ STEP 2 ══════════════════ */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 mb-5">
                <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-white font-black text-xl" style={{ letterSpacing: "-0.02em" }}>פרטים ותעודות</h1>
                  <p className="text-slate-400 text-xs">
                    נרשם כ:{" "}
                    <span style={{ color: accountType === "employer" ? "#10b981" : "#0EA5E9" }}>
                      {accountType === "employer" ? "מעסיק" : selectedRole === "student_cra" ? "בוגר/ת קורס CRA" : "בוגר/ת קורס GCP"}
                    </span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Basic fields */}
                {[
                  { name: "fullName", label: "שם מלא *", type: "text", placeholder: "ישראל ישראלי", required: true },
                  { name: "email", label: "כתובת מייל *", type: "email", placeholder: "israel@example.com", required: true },
                  ...(accountType === "employer"
                    ? [{ name: "companyName", label: "שם החברה / המוסד *", type: "text", placeholder: "שם החברה", required: true }]
                    : []),
                  { name: "phone", label: "טלפון", type: "tel", placeholder: "050-0000000", required: false },
                  { name: "city", label: "עיר", type: "text", placeholder: "תל אביב", required: false },
                  { name: "password", label: "סיסמה *", type: "password", placeholder: "לפחות 6 תווים", required: true },
                  { name: "confirmPassword", label: "אימות סיסמה *", type: "password", placeholder: "הכנס שוב את הסיסמה", required: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(14,165,233,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                ))}

                {/* Certificate uploads — students only */}
                {accountType === "student" && (
                  <div className="pt-2">
                    <div
                      className="rounded-2xl p-4 space-y-4"
                      style={{ background: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.12)" }}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814" />
                        </svg>
                        <span className="text-xs font-bold" style={{ color: "#38bdf8" }}>העלאת תעודות</span>
                        <span className="text-xs" style={{ color: "#475569" }}>— נדרש לאימות החשבון</span>
                      </div>

                      {selectedRole === "student_gcp" && (
                        <CertificateUpload
                          label="תעודת GCP"
                          hint="התעודה שקיבלת בסיום קורס GCP"
                          file={certGcp}
                          onChange={setCertGcp}
                          required
                        />
                      )}

                      {selectedRole === "student_cra" && (
                        <>
                          <CertificateUpload
                            label="תעודת GCP"
                            hint="תעודת Good Clinical Practice שקיבלת לפני קורס CRA"
                            file={certCra1}
                            onChange={setCertCra1}
                            required
                          />
                          <CertificateUpload
                            label="תעודת CRA"
                            hint="תעודת Clinical Research Associate שקיבלת בסיום הקורס"
                            file={certCra2}
                            onChange={setCertCra2}
                            required
                          />
                        </>
                      )}
                    </div>

                    <p className="text-xs mt-2" style={{ color: "#475569" }}>
                      לאחר הגשה, האדמין יבדוק את התעודות ויאשר את הגישה שלך
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm mt-5 transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    יוצר חשבון...
                  </>
                ) : "צור חשבון ושלח לאישור"}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-5">
            יש לך כבר חשבון?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#0EA5E9" }}>
              התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPageWrapper() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
