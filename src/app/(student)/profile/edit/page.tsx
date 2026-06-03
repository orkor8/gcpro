import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveProfile } from "./actions";
import CertificatesSection from "./CertificatesSection";

const DEGREES = ["תואר ראשון (B.Sc/B.A)", "תואר שני (M.Sc/M.A)", "PhD", "MD", "PharmD", "אחר"];
const FIELDS = ["מדעי החיים", "רוקחות", "סיעוד", "רפואה", "ביוטכנולוגיה", "כימיה", "פסיכולוגיה", "אחר"];
const ENGLISH_LEVELS = ["בסיסי", "בינוני", "טוב מאוד", "שפת אם / דובר ילידי"];
const EDC_SYSTEMS = ["Medidata Rave", "Oracle InForm", "REDCap", "Veeva Vault", "OpenClinica", "Castor EDC", "אחר"];
const CITIES = ["תל אביב", "ירושלים", "חיפה", "באר שבע", "רמת גן", "פתח תקווה", "נתניה", "ראשון לציון", "רחובות", "אחר"];

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
const selectStyle = { background: "#1e3a5f", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
const labelStyle = "block text-xs font-semibold mb-1.5 text-slate-400";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single() as unknown as Promise<{ data: Record<string, any> | null }>,
    supabase.from("certificates").select("id, name, file_url").eq("user_id", user.id).order("created_at", { ascending: true }) as unknown as Promise<{ data: Array<{ id: string; name: string; file_url: string }> | null }>,
  ]);

  if (profile?.role === "employer") redirect("/dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", background: "linear-gradient(160deg, #0F2645 0%, #091a30 100%)" }}
      dir="rtl"
    >
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-black text-2xl text-white mb-1" style={{ letterSpacing: "-0.02em" }}>הפרופיל שלי</h1>
        <p className="text-slate-400 text-sm mb-8">הפרטים שימלאו כאן יהיו גלויים למעסיקים שמחפשים בוגרים</p>

        <form action={saveProfile} className="space-y-5">

          {/* Open to work toggle */}
          <section
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}
          >
            <label htmlFor="open_to_work" className="flex items-center gap-4 cursor-pointer select-none">
              <div className="flex-1">
                <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>הצג אותי למעסיקים</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                  כשמופעל — הפרופיל שלך יופיע בחיפוש מעסיקים ויוכלו לפנות אליך
                </div>
              </div>

              {/* Toggle — pure CSS via peer */}
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  id="open_to_work"
                  name="is_open_to_work"
                  defaultChecked={profile?.is_open_to_work ?? false}
                  className="peer sr-only"
                />
                {/* Track — no inline style so peer-checked can override */}
                <div className="w-12 h-6 rounded-full bg-white/10 peer-checked:bg-emerald-500 transition-colors duration-200" />
                {/* Thumb */}
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-6" />
              </div>
            </label>
          </section>

          {/* פרטים בסיסיים */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">פרטים בסיסיים</div>

            <div>
              <label className={labelStyle}>שם מלא *</label>
              <input name="full_name" defaultValue={profile?.full_name ?? ""} required className={inputCls} style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>טלפון</label>
                <input name="phone" defaultValue={profile?.phone ?? ""} className={inputCls} style={inputStyle} placeholder="050-0000000" />
              </div>
              <div>
                <label className={labelStyle}>עיר מגורים</label>
                <select name="city" defaultValue={profile?.city ?? ""} className={inputCls} style={selectStyle}>
                  <option value="">בחר עיר...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyle}>LinkedIn</label>
              <input name="linkedin_url" defaultValue={profile?.linkedin_url ?? ""} className={inputCls} style={inputStyle} placeholder="https://linkedin.com/in/..." />
            </div>

            <div>
              <label className={labelStyle}>על עצמי (Bio)</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={3}
                className={inputCls}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="תאר את הרקע, הניסיון והיעדים המקצועיים שלך..."
              />
            </div>
          </section>

          {/* רקע אקדמי */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">רקע אקדמי</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>דרגה אקדמית</label>
                <select name="degree" defaultValue={profile?.degree ?? ""} className={inputCls} style={selectStyle}>
                  <option value="">בחר תואר...</option>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>תחום לימודים</label>
                <select name="field_of_study" defaultValue={profile?.field_of_study ?? ""} className={inputCls} style={selectStyle}>
                  <option value="">בחר תחום...</option>
                  {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyle}>מוסד לימודים (אופציונלי)</label>
              <input name="institution" defaultValue={profile?.institution ?? ""} className={inputCls} style={inputStyle} placeholder="אוניברסיטת תל אביב, הטכניון..." />
            </div>
          </section>

          {/* מיומנויות */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-white font-bold text-sm">מיומנויות טכניות</div>

            <div>
              <label className={labelStyle}>רמת אנגלית</label>
              <select name="english_level" defaultValue={profile?.english_level ?? ""} className={inputCls} style={selectStyle}>
                <option value="">בחר רמה...</option>
                {ENGLISH_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className={labelStyle}>מערכות EDC מוכרות</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {EDC_SYSTEMS.map(sys => (
                  <label key={sys} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`edc_${sys}`}
                      className="w-4 h-4 accent-sky-500"
                      defaultChecked={profile?.edc_systems?.includes(sys)}
                    />
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{sys}</span>
                  </label>
                ))}
              </div>
              {/* שדה נסתר שנבנה ב-submit */}
              <input type="hidden" name="edc_systems" id="edc_hidden" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="has_coordinator_experience"
                className="w-4 h-4 accent-sky-500"
                defaultChecked={profile?.has_coordinator_experience ?? false}
              />
              <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>ניסיון כמתאם/ת מחקר (Study Coordinator)</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>יתרון משמעותי למשרות CRA</div>
              </div>
            </label>

            <div>
              <label className={labelStyle}>כישורים נוספים (מופרדים בפסיקים)</label>
              <input
                name="skills"
                defaultValue={profile?.skills?.join(", ") ?? ""}
                className={inputCls}
                style={inputStyle}
                placeholder="ICH-GCP, GxP, CDISC, SAS, Excel..."
              />
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
          >
            שמור פרופיל
          </button>
        </form>

        <div className="mt-5">
          <CertificatesSection
            certificates={certificates ?? []}
            userId={user.id}
            role={profile?.role ?? "student_gcp"}
          />
        </div>
      </main>

      {/* Script לאיסוף checkboxes של EDC */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('form').addEventListener('submit', function() {
          const systems = [];
          document.querySelectorAll('[name^="edc_"]:checked').forEach(function(cb) {
            systems.push(cb.name.replace('edc_', ''));
          });
          document.getElementById('edc_hidden').value = systems.join(',');
        });
      `}} />
    </div>
  );
}
