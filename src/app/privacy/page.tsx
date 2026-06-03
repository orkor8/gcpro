import Link from "next/link";

export const metadata = {
  title: "מדיניות פרטיות | GCPRO",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#f1f5f9", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
      dir="rtl"
    >
      {/* Header */}
      <div style={{ background: "#0F2645", borderBottom: "1px solid rgba(14,165,233,0.15)" }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-xl" style={{ letterSpacing: "-0.02em" }}>
            GCP<span style={{ color: "#0EA5E9" }}>RO</span>
          </Link>
          <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors">
            ← חזרה לאתר
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
          <h1 className="font-black text-2xl md:text-3xl mb-2" style={{ color: "#0F2645", letterSpacing: "-0.02em" }}>
            מדיניות פרטיות
          </h1>
          <p className="text-slate-400 text-sm mb-8">עודכן לאחרונה: יוני 2026</p>

          <div className="space-y-8 text-slate-600 leading-relaxed">

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>1. כללי</h2>
              <p>
                פלטפורמת GCPRO מופעלת על ידי <strong>ג'י.סי.פי ניסויים קליניים בע"מ</strong> ("החברה", "אנחנו").
                מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך בעת השימוש בפלטפורמה.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>2. המידע שאנו אוספים</h2>
              <ul className="list-disc list-inside space-y-2 mr-2">
                <li><strong>פרטי הרשמה:</strong> שם מלא, כתובת מייל, טלפון, עיר מגורים</li>
                <li><strong>מסמכים מקצועיים:</strong> תעודות קורס GCP / CRA להליך האימות</li>
                <li><strong>פרטי פרופיל:</strong> תואר אקדמי, תחום לימודים, כישורים, רמת אנגלית, קישור ל-LinkedIn</li>
                <li><strong>פעילות בפלטפורמה:</strong> שאלות שנשלחו למרצים, שימוש בבוט</li>
                <li><strong>קובצי Session:</strong> נעשה שימוש ב-Cookies הכרחיים לניהול ההתחברות בלבד</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>3. כיצד אנו משתמשים במידע</h2>
              <ul className="list-disc list-inside space-y-2 mr-2">
                <li>אימות זהות ואישור חשבון</li>
                <li>הצגת פרופיל מקצועי למעסיקים (לאחר אישורך)</li>
                <li>שליחת עדכונים ועמוד ניהול המערכת</li>
                <li>שיפור ופיתוח הפלטפורמה</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>4. שיתוף מידע עם צדדים שלישיים</h2>
              <p className="mb-3">אנו לא מוכרים או מעבירים את המידע האישי שלך לצדדים שלישיים, למעט:</p>
              <ul className="list-disc list-inside space-y-2 mr-2">
                <li><strong>Supabase</strong> — אחסון נתונים מוצפן (ארה"ב, עומד ב-GDPR)</li>
                <li><strong>Resend</strong> — שירות שליחת מיילים</li>
                <li><strong>Anthropic (Claude)</strong> — עיבוד שאלות לבוט החכם (ללא שמירת שיחות)</li>
                <li><strong>מרצים</strong> — שם המייל שלך מועבר למרצה שאליו בחרת לשלוח שאלה</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>5. Cookies</h2>
              <p>
                הפלטפורמה משתמשת <strong>אך ורק</strong> ב-Cookies הכרחיים לניהול הכניסה לחשבון.
                אין שימוש ב-Cookies לצורכי פרסום, מעקב או אנליטיקה.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>6. אבטחת מידע</h2>
              <p>
                המידע שלך מאוחסן בצורה מוצפנת. סיסמאות מעולם אינן נשמרות בטקסט גלוי.
                הגישה למידע מוגבלת לעובדי החברה הנדרשים לכך לצרכים תפעוליים בלבד.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>7. זכויותיך</h2>
              <p className="mb-3">בהתאם לחוק הגנת הפרטיות הישראלי ולתקנות GDPR, יש לך זכות:</p>
              <ul className="list-disc list-inside space-y-2 mr-2">
                <li>לעיין במידע שנשמר עליך</li>
                <li>לתקן מידע שגוי</li>
                <li>למחוק את חשבונך ואת כל המידע הקשור בו</li>
                <li>להתנגד לעיבוד המידע</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3" style={{ color: "#0F2645" }}>8. יצירת קשר</h2>
              <p>
                לכל שאלה בנושאי פרטיות ניתן לפנות אלינו:
              </p>
              <div className="mt-3 p-4 rounded-xl" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <p className="font-semibold" style={{ color: "#0F2645" }}>ג'י.סי.פי ניסויים קליניים בע"מ</p>
                <a href="mailto:education@gcp.co.il" className="text-sky-600 hover:text-sky-700 text-sm">
                  education@gcp.co.il
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-slate-400 text-xs">
          © 2026 ג'י.סי.פי ניסויים קליניים בע"מ · כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
}
