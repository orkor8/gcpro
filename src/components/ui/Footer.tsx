import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-auto py-6 px-6 text-center"
      style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} ג'י.סי.פי ניסויים קליניים בע"מ · כל הזכויות שמורות
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            מדיניות פרטיות
          </Link>
          <a href="mailto:education@gcp.co.il" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            צור קשר
          </a>
        </div>
      </div>
    </footer>
  );
}
