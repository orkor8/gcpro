"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { GCPROLogo } from "@/components/ui/GCPROLogo";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("כתובת המייל או הסיסמה שגויים");
      setLoading(false);
      return;
    }

    // Full page reload so the server reads the new session cookie
    window.location.replace("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)" }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <GCPROLogo variant="dark" size="lg" />
          </Link>
        </div>

        <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
          <h1 className="text-white font-black text-2xl mb-1">ברוך הבא בחזרה</h1>
          <p className="text-slate-400 text-sm mb-7">התחבר לחשבון שלך ב-GCPRO</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>כתובת מייל</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="israel@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="הכנס סיסמה"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm mt-2 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" /></svg>מתחבר...</>) : "התחבר"}
            </button>
          </form>

          <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-slate-500 text-xs">
              אין לך חשבון?{" "}
              <Link href="/register" className="font-semibold" style={{ color: "#0EA5E9" }}>הצטרף ל-GCPRO</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
