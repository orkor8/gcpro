"use client";

import { useState, useEffect, useRef } from "react";

type ContentType = "video" | "document" | "live" | "article";

interface KnowledgeItem {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  content_type: ContentType;
  cra_only: boolean;
  published_at: string;
  thumbnail_url: string | null;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

const TYPE_META: Record<ContentType, {
  label: string; labelEn: string; color: string; glow: string;
  gradient: string; iconPath: string; action: string;
}> = {
  video: {
    label: "סרטון", labelEn: "VIDEO",
    color: "#f97316", glow: "rgba(249,115,22,0.35)",
    gradient: "linear-gradient(135deg,#7c2d12,#ea580c)",
    iconPath: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
    action: "צפה עכשיו",
  },
  document: {
    label: "מסמך", labelEn: "DOC",
    color: "#38bdf8", glow: "rgba(56,189,248,0.35)",
    gradient: "linear-gradient(135deg,#0c4a6e,#0284c7)",
    iconPath: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    action: "פתח מסמך",
  },
  live: {
    label: "שיעור חי", labelEn: "LIVE",
    color: "#4ade80", glow: "rgba(74,222,128,0.35)",
    gradient: "linear-gradient(135deg,#052e16,#16a34a)",
    iconPath: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
    action: "הצטרף",
  },
  article: {
    label: "מאמר", labelEn: "READ",
    color: "#c084fc", glow: "rgba(192,132,252,0.35)",
    gradient: "linear-gradient(135deg,#3b0764,#9333ea)",
    iconPath: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z",
    action: "קרא",
  },
};

const FILTERS: { key: "all" | ContentType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "video", label: "סרטונים" },
  { key: "document", label: "מסמכים" },
  { key: "live", label: "שיעורים חיים" },
  { key: "article", label: "מאמרים" },
];

function TypeIcon({ type, size = 20 }: { type: ContentType; size?: number }) {
  const meta = TYPE_META[type];
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={meta.iconPath} />
    </svg>
  );
}

function LivePulse() {
  return (
    <span className="kc-live-pulse" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span className="kc-dot" />
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#4ade80" }}>LIVE</span>
    </span>
  );
}

function VideoCard({ item, expanded, onToggle }: { item: KnowledgeItem; expanded: boolean; onToggle: () => void }) {
  const youtubeId = item.content_url ? getYoutubeId(item.content_url) : null;
  const meta = TYPE_META.video;

  return (
    <div className="kc-card kc-card-video" style={{ ["--glow" as string]: meta.glow, ["--accent" as string]: meta.color }}>
      <div className="kc-card-media">
        {expanded && youtubeId ? (
          <iframe
            className="kc-video-embed"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="kc-thumb-btn" onClick={onToggle} aria-label="הפעל סרטון">
            {youtubeId && (
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                alt={item.title}
                className="kc-thumb-img"
              />
            )}
            <div className="kc-thumb-overlay" />
            <div className="kc-play-btn">
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="kc-duration-badge">
              <TypeIcon type="video" size={12} />
              {meta.labelEn}
            </span>
          </button>
        )}
      </div>
      <div className="kc-card-body">
        <div className="kc-type-pill" style={{ background: `${meta.color}18`, color: meta.color }}>
          <TypeIcon type="video" size={12} />
          {meta.label}
        </div>
        {item.cra_only && <span className="kc-cra-pill">CRA</span>}
        <h3 className="kc-card-title">{item.title}</h3>
        {item.description && <p className="kc-card-desc">{item.description}</p>}
        <div className="kc-card-footer">
          <span className="kc-date">{new Date(item.published_at).toLocaleDateString("he-IL")}</span>
          <button className="kc-action-btn" style={{ ["--btn-color" as string]: meta.color, ["--btn-glow" as string]: meta.glow }} onClick={onToggle}>
            {expanded ? "סגור" : meta.action}
            {!expanded && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentCard({ item }: { item: KnowledgeItem }) {
  const meta = TYPE_META[item.content_type];
  const isLive = item.content_type === "live";

  return (
    <div className="kc-card" style={{ ["--glow" as string]: meta.glow, ["--accent" as string]: meta.color }}>
      <div className="kc-card-stripe" style={{ background: meta.gradient }} />
      <div className="kc-card-icon-wrap" style={{ background: `${meta.color}14` }}>
        <span style={{ color: meta.color }}><TypeIcon type={item.content_type} size={22} /></span>
      </div>
      <div className="kc-card-body kc-card-body-content">
        <div className="kc-card-top">
          <div className="kc-pills">
            <div className="kc-type-pill" style={{ background: `${meta.color}18`, color: meta.color }}>
              {isLive ? <LivePulse /> : (
                <><TypeIcon type={item.content_type} size={11} />{meta.label}</>
              )}
            </div>
            {item.cra_only && <span className="kc-cra-pill">CRA</span>}
          </div>
          <span className="kc-labelEn" style={{ color: meta.color }}>{meta.labelEn}</span>
        </div>
        <h3 className="kc-card-title">{item.title}</h3>
        {item.description && <p className="kc-card-desc">{item.description}</p>}
        <div className="kc-card-footer">
          <span className="kc-date">{new Date(item.published_at).toLocaleDateString("he-IL")}</span>
          {item.content_url && (
            <a
              href={item.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="kc-action-btn"
              style={{ ["--btn-color" as string]: meta.color, ["--btn-glow" as string]: meta.glow }}
            >
              {meta.action}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeClient({ items, isCra }: { items: KnowledgeItem[]; isCra: boolean }) {
  const [filter, setFilter] = useState<"all" | ContentType>("all");
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.content_type === filter);
  const counts = Object.fromEntries(
    FILTERS.map(f => [f.key, f.key === "all" ? items.length : items.filter(i => i.content_type === f.key).length])
  );

  return (
    <>
      <style>{`
        .kc-root {
          min-height: 100vh;
          background: #07101f;
          padding: 0 0 80px;
          dir: rtl;
          font-family: var(--font-rubik, 'Rubik', sans-serif);
        }

        /* ── HERO ── */
        .kc-hero {
          position: relative;
          overflow: hidden;
          padding: 52px 40px 44px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .kc-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 80% at 90% 50%, rgba(14,165,233,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(139,92,246,0.06) 0%, transparent 60%);
        }
        .kc-hero-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
          background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .kc-hero-content { position: relative; max-width: 720px; }
        .kc-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
          color: #38bdf8; text-transform: uppercase; margin-bottom: 14px;
        }
        .kc-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 10px #38bdf8;
          animation: kc-pulse 2s ease-in-out infinite;
        }
        @keyframes kc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .kc-hero-title {
          font-size: clamp(28px, 4vw, 42px); font-weight: 900;
          color: #fff; line-height: 1.15; letter-spacing: -0.02em;
          margin: 0 0 10px;
        }
        .kc-hero-title span {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .kc-hero-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.6; }
        .kc-hero-stats {
          display: flex; gap: 28px; margin-top: 28px; flex-wrap: wrap;
        }
        .kc-stat { display: flex; flex-direction: column; gap: 2px; }
        .kc-stat-num { font-size: 22px; font-weight: 900; color: #fff; }
        .kc-stat-label { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 600; letter-spacing: 0.05em; }
        .kc-cra-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 800;
          background: rgba(139,92,246,0.15); color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.3); margin-top: 16px;
        }

        /* ── FILTERS ── */
        .kc-filters-wrap {
          padding: 0 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 20;
          background: rgba(7,16,31,0.92);
          backdrop-filter: blur(16px);
        }
        .kc-filters {
          display: flex; gap: 0; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
          position: relative;
        }
        .kc-filters::-webkit-scrollbar { display: none; }
        .kc-filter-btn {
          position: relative; padding: 16px 20px;
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.35); background: none; border: none;
          cursor: pointer; white-space: nowrap; transition: color 0.2s;
          display: flex; align-items: center; gap: 7px;
        }
        .kc-filter-btn:hover { color: rgba(255,255,255,0.7); }
        .kc-filter-btn.active { color: #fff; }
        .kc-filter-btn.active::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          border-radius: 2px 2px 0 0;
        }
        .kc-filter-count {
          font-size: 10px; font-weight: 800; padding: 2px 6px;
          border-radius: 999px; background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4); transition: all 0.2s;
        }
        .kc-filter-btn.active .kc-filter-count {
          background: rgba(56,189,248,0.15); color: #38bdf8;
        }

        /* ── GRID ── */
        .kc-grid-wrap { padding: 36px 40px; max-width: 1280px; }
        .kc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .kc-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 600px) { .kc-grid { grid-template-columns: 1fr; } .kc-hero, .kc-filters-wrap, .kc-grid-wrap { padding-left: 20px; padding-right: 20px; } }

        /* ── CARD BASE ── */
        .kc-card {
          position: relative; border-radius: 16px; overflow: hidden;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          cursor: default;
          animation: kc-fade-in 0.4s ease both;
        }
        @keyframes kc-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kc-card:nth-child(1) { animation-delay: 0ms; }
        .kc-card:nth-child(2) { animation-delay: 60ms; }
        .kc-card:nth-child(3) { animation-delay: 120ms; }
        .kc-card:nth-child(4) { animation-delay: 180ms; }
        .kc-card:nth-child(5) { animation-delay: 240ms; }
        .kc-card:nth-child(6) { animation-delay: 300ms; }
        .kc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1), 0 0 30px var(--glow, rgba(56,189,248,0.1));
          border-color: rgba(255,255,255,0.12);
        }

        /* ── VIDEO CARD ── */
        .kc-card-video { }
        .kc-card-media { position: relative; width: 100%; aspect-ratio: 16/9; }
        .kc-video-embed { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .kc-thumb-btn {
          position: absolute; inset: 0; width: 100%; background: #000;
          border: none; cursor: pointer; padding: 0; display: block;
        }
        .kc-thumb-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.3s, transform 0.4s;
          transform-origin: center;
        }
        .kc-thumb-btn:hover .kc-thumb-img { opacity: 0.6; transform: scale(1.04); }
        .kc-thumb-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        }
        .kc-play-btn {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(249,115,22,0.9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(249,115,22,0.5);
          transition: transform 0.2s, background 0.2s;
        }
        .kc-thumb-btn:hover .kc-play-btn { transform: translate(-50%,-50%) scale(1.15); background: #f97316; }
        .kc-duration-badge {
          position: absolute; bottom: 10px; right: 10px;
          display: flex; align-items: center; gap: 4px;
          padding: 4px 8px; border-radius: 6px;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
          color: rgba(255,255,255,0.8);
        }

        /* ── CONTENT CARD ── */
        .kc-card-stripe {
          position: absolute; top: 0; right: 0; width: 3px; height: 100%;
          opacity: 0.8;
        }
        .kc-card-icon-wrap {
          position: absolute; top: 18px; left: 18px;
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          opacity: 0.8;
        }

        /* ── CARD BODY ── */
        .kc-card-body { padding: 18px; display: flex; flex-direction: column; flex: 1; }
        .kc-card-body-content { padding-right: 68px; }
        .kc-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .kc-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .kc-type-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 999px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.05em;
        }
        .kc-cra-pill {
          display: inline-flex; padding: 3px 8px; border-radius: 999px;
          font-size: 10px; font-weight: 800;
          background: rgba(139,92,246,0.15); color: #a78bfa;
        }
        .kc-labelEn {
          font-size: 10px; font-weight: 900; letter-spacing: 0.12em; opacity: 0.4;
          align-self: flex-start;
        }
        .kc-card-title {
          font-size: 14px; font-weight: 800; color: #f1f5f9;
          line-height: 1.4; margin: 0 0 8px; flex: 1;
        }
        .kc-card-desc {
          font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.6;
          margin: 0 0 14px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .kc-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto; padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .kc-date { font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 500; }
        .kc-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.03em;
          color: var(--btn-color, #38bdf8);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s, border-color 0.2s, transform 0.15s;
        }
        .kc-action-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 0 16px var(--btn-glow, rgba(56,189,248,0.2));
          transform: translateY(-1px);
        }

        /* ── LIVE PULSE ── */
        .kc-live-pulse { display: inline-flex; align-items: center; gap: 5px; }
        .kc-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 8px #4ade80;
          animation: kc-live 1.2s ease-in-out infinite;
        }
        @keyframes kc-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #4ade80; }
          50% { opacity: 0.4; box-shadow: 0 0 3px #4ade80; }
        }

        /* ── EMPTY STATE ── */
        .kc-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 20px; text-align: center; gap: 12px;
        }
        .kc-empty-icon {
          width: 64px; height: 64px; border-radius: 16px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin-bottom: 8px;
        }
        .kc-empty-title { font-size: 16px; font-weight: 800; color: rgba(255,255,255,0.4); }
        .kc-empty-sub { font-size: 13px; color: rgba(255,255,255,0.2); }
      `}</style>

      <div className="kc-root" dir="rtl">

        {/* ── HERO ── */}
        <div className="kc-hero">
          <div className="kc-hero-bg" />
          <div className="kc-hero-grid" />
          <div className="kc-hero-content">
            <div className="kc-eyebrow">
              <span className="kc-eyebrow-dot" />
              מרכז הידע המקצועי
            </div>
            <h1 className="kc-hero-title">
              חומרי לימוד,<br /><span>ידע שמתקדם איתך</span>
            </h1>
            <p className="kc-hero-sub">סרטונים, מסמכים, שיעורים חיים ומאמרים מקצועיים — הכל במקום אחד</p>
            {isCra && (
              <div className="kc-cra-badge">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                גישה מלאה — בוגר CRA
              </div>
            )}
            {items.length > 0 && (
              <div className="kc-hero-stats">
                {(["video","document","live","article"] as ContentType[]).map(t => {
                  const count = items.filter(i => i.content_type === t).length;
                  if (!count) return null;
                  return (
                    <div key={t} className="kc-stat">
                      <span className="kc-stat-num" style={{ color: TYPE_META[t].color }}>{count}</span>
                      <span className="kc-stat-label">{TYPE_META[t].label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="kc-filters-wrap">
          <div className="kc-filters">
            {FILTERS.map(f => {
              const c = counts[f.key] ?? 0;
              if (f.key !== "all" && c === 0) return null;
              return (
                <button
                  key={f.key}
                  className={`kc-filter-btn${filter === f.key ? " active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span className="kc-filter-count">{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="kc-grid-wrap">
          <div className="kc-grid">
            {filtered.length === 0 ? (
              <div className="kc-empty">
                <div className="kc-empty-icon">📚</div>
                <p className="kc-empty-title">אין תכנים להצגה</p>
                <p className="kc-empty-sub">תכנים חדשים יתווספו בקרוב</p>
              </div>
            ) : filtered.map(item => (
              item.content_type === "video" ? (
                <VideoCard
                  key={item.id}
                  item={item}
                  expanded={expandedVideo === item.id}
                  onToggle={() => setExpandedVideo(expandedVideo === item.id ? null : item.id)}
                />
              ) : (
                <ContentCard key={item.id} item={item} />
              )
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
