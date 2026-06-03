"use client";

import React from "react";

// ─── Brand tokens ──────────────────────────────────────────────────────────
const NAVY = "#0F2645";
const BLUE = "#0EA5E9";
const WHITE = "#FFFFFF";

// ─── Size scale ────────────────────────────────────────────────────────────
const SIZES = {
  sm: { icon: 28, gcp: 13, ro: 16, gap: 7  },
  md: { icon: 38, gcp: 17, ro: 21, gap: 10 },
  lg: { icon: 52, gcp: 23, ro: 28, gap: 13 },
  xl: { icon: 68, gcp: 30, ro: 37, gap: 18 },
} as const;

// ─── Icon SVG (viewBox 0 0 44 48) ─────────────────────────────────────────
//
//  Design: Rounded-rect badge  (navy gradient)
//  Inside: Geometric G (white 270° arc + horizontal bar)
//  Accent: Sky-blue upward arrow at top-right — in the G's natural opening
//
//  G circle: center (22, 29), r=10, circumference ≈ 62.83
//  270° visible arc = 47.12 px  |  90° gap = 15.71 px
//  SVG arcs start at 3-o'clock → dasharray="47.12 15.71" offset="0"
//  produces gap at top-right — exactly where a G opens ✓
//
function IconSVG({
  bg, fg, accent, uid,
}: {
  bg: string; fg: string; accent: string; uid: string;
}) {
  return (
    <svg viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={bg === NAVY ? "#1b3f7a" : bg} />
          <stop offset="100%" stopColor={bg} />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect x="1" y="1" width="42" height="46" rx="11" fill={`url(#bg-${uid})`} />

      {/* Subtle top shine */}
      <rect x="1" y="1" width="42" height="22" rx="11" fill={WHITE} fillOpacity="0.06" />

      {/* ── G letterform ────────────────────────────── */}
      {/* 270° arc — gap at top-right (natural G opening) */}
      <circle
        cx="22" cy="29" r="10"
        stroke={fg}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="47.12 15.71"
        strokeDashoffset="0"
      />
      {/* Horizontal bar: center → right edge */}
      <line
        x1="22" y1="29" x2="32" y2="29"
        stroke={fg} strokeWidth="4.5" strokeLinecap="round"
      />

      {/* ── Sky-blue arrow — lives in G's opening ───── */}
      {/* Vertical shaft */}
      <line x1="33" y1="20" x2="33" y2="13" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
      {/* Arrowhead (V-shape) */}
      <path d="M29 17 L33 11 L37 17" stroke={accent} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* ── Accent dot — bottom left badge corner ─── */}
      <circle cx="9" cy="40" r="2.5" fill={accent} opacity="0.7" />
    </svg>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────
export interface GCPROLogoProps {
  variant?:  "dark" | "light";
  size?:     keyof typeof SIZES;
  iconOnly?: boolean;
  className?: string;
  style?:    React.CSSProperties;
}

// ─── Main component ────────────────────────────────────────────────────────
export function GCPROLogo({
  variant   = "dark",
  size      = "md",
  iconOnly  = false,
  className,
  style,
}: GCPROLogoProps) {
  const s        = SIZES[size];
  const isDark   = variant === "dark";
  const iconBg   = NAVY;
  const iconFg   = WHITE;
  const textMain = isDark ? WHITE : NAVY;
  const uid      = `${variant}-${size}`;

  return (
    <div
      className={className}
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         s.gap,
        userSelect:  "none",
        flexShrink:  0,
        direction:   "ltr",
        ...style,
      }}
    >
      {/* Icon */}
      <div style={{ width: s.icon, height: s.icon * (48 / 44), flexShrink: 0 }}>
        <IconSVG bg={iconBg} fg={iconFg} accent={BLUE} uid={uid} />
      </div>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          style={{
            display:    "inline-flex",
            alignItems: "baseline",
            lineHeight:  1,
            direction:  "ltr",
            fontFamily: "var(--font-rubik, 'Rubik', 'Segoe UI', system-ui, sans-serif)",
          }}
        >
          {/* GCP — medium weight */}
          <span style={{
            fontSize:      s.gcp,
            fontWeight:    600,
            color:         textMain,
            letterSpacing: "-0.02em",
          }}>
            GCP
          </span>
          {/* RO — bold, larger, accent blue */}
          <span style={{
            fontSize:      s.ro,
            fontWeight:    900,
            color:         BLUE,
            letterSpacing: "-0.04em",
            position:      "relative",
            top:           "1px",
          }}>
            RO
          </span>
        </span>
      )}
    </div>
  );
}

// ─── Icon-only shorthand ───────────────────────────────────────────────────
export function GCPROIcon(props: Omit<GCPROLogoProps, "iconOnly">) {
  return <GCPROLogo {...props} iconOnly />;
}

// ─── Preview (for visual testing at /logo-preview) ────────────────────────
export function GCPROLogoPreview() {
  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
  };
  return (
    <div style={{ fontFamily: "system-ui", padding: 48, display: "flex", flexDirection: "column", gap: 48 }}>

      {/* Dark bg */}
      <div style={{ background: NAVY, padding: 40, borderRadius: 20, display: "flex", flexDirection: "column", gap: 28 }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.12em", margin: 0 }}>DARK VARIANT — FULL LOCKUP</p>
        <div style={row}>
          {(["xl","lg","md","sm"] as const).map(s => (
            <GCPROLogo key={s} variant="dark" size={s} />
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.12em", margin: 0 }}>ICON ONLY</p>
        <div style={row}>
          {(["xl","lg","md","sm"] as const).map(s => (
            <GCPROIcon key={s} variant="dark" size={s} />
          ))}
        </div>
      </div>

      {/* Light bg */}
      <div style={{ background: "#f1f5f9", padding: 40, borderRadius: 20, display: "flex", flexDirection: "column", gap: 28 }}>
        <p style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", margin: 0 }}>LIGHT VARIANT — FULL LOCKUP</p>
        <div style={row}>
          {(["xl","lg","md","sm"] as const).map(s => (
            <GCPROLogo key={s} variant="light" size={s} />
          ))}
        </div>
        <p style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", margin: 0 }}>ICON ONLY</p>
        <div style={row}>
          {(["xl","lg","md","sm"] as const).map(s => (
            <GCPROIcon key={s} variant="light" size={s} />
          ))}
        </div>
      </div>

      {/* White bg */}
      <div style={{ background: WHITE, padding: 40, borderRadius: 20, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 28 }}>
        <p style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", margin: 0 }}>WHITE BACKGROUND</p>
        <div style={row}>
          <GCPROLogo variant="light" size="xl" />
          <GCPROLogo variant="light" size="lg" />
          <GCPROLogo variant="light" size="md" />
          <GCPROLogo variant="light" size="sm" />
        </div>
      </div>

    </div>
  );
}
