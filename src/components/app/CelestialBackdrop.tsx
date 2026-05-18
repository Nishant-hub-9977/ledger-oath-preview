/**
 * CelestialBackdrop — shared atmospheric background system.
 *
 * Variants tailor a non-literal celestial / observatory / manuscript
 * atmosphere to each section. Layers: gradient bloom, painterly fresco
 * image, SVG linework, paper grain. Theme-aware via design tokens.
 */

import frescoFigure from "@/assets/atmos/fresco-figure.jpg";
import celestialDrift from "@/assets/atmos/celestial-drift.jpg";
import parchmentFresco from "@/assets/atmos/parchment-fresco.jpg";

type Variant =
  | "observatory" // landing hero — grandeur
  | "chamber" // command center — preparation
  | "verdict" // decision room — gravitas
  | "starchart" // timeline — operational alignment
  | "archive" // dossier — archival calm
  | "manuscript"; // auth / workspace — quiet ivory ambience

type Painterly = "figure" | "drift" | "fresco" | "none";

const DEFAULT_PAINTERLY: Record<Variant, Painterly> = {
  observatory: "figure",
  manuscript: "figure",
  verdict: "drift",
  starchart: "drift",
  archive: "fresco",
  chamber: "fresco",
};

const PAINTERLY_SRC: Record<Exclude<Painterly, "none">, string> = {
  figure: frescoFigure,
  drift: celestialDrift,
  fresco: parchmentFresco,
};

export function CelestialBackdrop({
  variant = "observatory",
  intensity = "default",
  painterly,
  eager = false,
}: {
  variant?: Variant;
  intensity?: "default" | "subtle";
  painterly?: Painterly;
  eager?: boolean;
}) {
  const op = intensity === "subtle" ? 0.55 : 1;
  const p = painterly ?? DEFAULT_PAINTERLY[variant];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: op }}
    >
      {/* Layer 0 — painterly fresco image (dissolves into theme) */}
      {p !== "none" && (
        <PainterlyLayer kind={p} intensity={intensity} eager={eager} />
      )}

      {/* Layer 1 — atmospheric gradient bloom */}
      <div className={`absolute inset-0 ${gradientFor(variant)}`} />

      {/* Layer 2 — celestial linework (SVG) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <radialGradient id={`bloom-${variant}`} cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="var(--celestial-teal, var(--emerald-muted))" stopOpacity="0.10" />
            <stop offset="60%" stopColor="var(--celestial-teal, var(--emerald-muted))" stopOpacity="0.02" />
            <stop offset="100%" stopColor="var(--celestial-teal, var(--emerald-muted))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`vh-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* soft bloom */}
        <rect width="1200" height="800" fill={`url(#bloom-${variant})`} />

        {/* variant-specific motifs */}
        {variant === "observatory" && <ObservatoryMotif />}
        {variant === "chamber" && <ChamberMotif />}
        {variant === "verdict" && <VerdictMotif />}
        {variant === "starchart" && <StarchartMotif />}
        {variant === "archive" && <ArchiveMotif />}
        {variant === "manuscript" && <ManuscriptMotif />}

        {/* vignette wash */}
        <rect width="1200" height="800" fill={`url(#vh-${variant})`} />
      </svg>

      {/* Layer 3 — paper / observatory grain via tokens */}
      <div className="absolute inset-0 grain opacity-[0.55]" />
    </div>
  );
}

function gradientFor(v: Variant) {
  // All values map to design tokens already in styles.css.
  switch (v) {
    case "observatory":
      return "bg-[radial-gradient(ellipse_at_70%_15%,color-mix(in_oklab,var(--celestial-teal,var(--emerald-muted))_14%,transparent),transparent_55%),radial-gradient(ellipse_at_10%_90%,color-mix(in_oklab,var(--amber-restrained)_8%,transparent),transparent_60%)]";
    case "chamber":
      return "bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--celestial-teal,var(--emerald-muted))_8%,transparent),transparent_60%)]";
    case "verdict":
      return "bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_oklab,var(--amber-restrained)_10%,transparent),transparent_55%),radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--celestial-teal,var(--emerald-muted))_8%,transparent),transparent_60%)]";
    case "starchart":
      return "bg-[radial-gradient(ellipse_at_20%_30%,color-mix(in_oklab,var(--celestial-teal,var(--emerald-muted))_8%,transparent),transparent_55%)]";
    case "archive":
      return "bg-[radial-gradient(ellipse_at_85%_15%,color-mix(in_oklab,var(--amber-restrained)_7%,transparent),transparent_55%)]";
    case "manuscript":
    default:
      return "bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklab,var(--celestial-teal,var(--emerald-muted))_6%,transparent),transparent_60%)]";
  }
}

/* ───────── motifs ───────── */

const lineStyle = {
  stroke: "var(--foreground)",
  strokeOpacity: 0.07,
  strokeWidth: 0.6,
  fill: "none" as const,
};

function ObservatoryMotif() {
  // Concentric celestial arcs + horizon coordinates
  return (
    <g style={lineStyle}>
      {[260, 360, 460, 560].map((r) => (
        <circle key={r} cx="900" cy="140" r={r} />
      ))}
      <line x1="0" y1="640" x2="1200" y2="640" />
      <line x1="0" y1="660" x2="1200" y2="660" strokeOpacity="0.04" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={i * 100} y1="630" x2={i * 100} y2="650" />
      ))}
      {/* faint star marks */}
      {STAR_MARKS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="var(--foreground)" fillOpacity="0.18" stroke="none" />
      ))}
    </g>
  );
}

function ChamberMotif() {
  return (
    <g style={lineStyle}>
      {/* grid index marks */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="12" />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50} x2="12" y2={i * 50} />
      ))}
      <circle cx="600" cy="400" r="300" />
      <circle cx="600" cy="400" r="180" strokeOpacity="0.04" />
    </g>
  );
}

function VerdictMotif() {
  return (
    <g style={lineStyle}>
      {/* converging meridians */}
      {[-60, -30, 0, 30, 60].map((deg) => (
        <line
          key={deg}
          x1="600"
          y1="-100"
          x2={600 + Math.sin((deg * Math.PI) / 180) * 1200}
          y2={Math.cos((deg * Math.PI) / 180) * 1200 - 100}
        />
      ))}
      <circle cx="600" cy="400" r="420" />
      <circle cx="600" cy="400" r="280" strokeOpacity="0.05" />
    </g>
  );
}

function StarchartMotif() {
  return (
    <g style={lineStyle}>
      {/* sequence line + nodes (constellation) */}
      <path d="M120 700 L260 540 L420 580 L560 360 L720 420 L860 220 L1020 280 L1140 120" />
      {[
        [120, 700],
        [260, 540],
        [420, 580],
        [560, 360],
        [720, 420],
        [860, 220],
        [1020, 280],
        [1140, 120],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--foreground)" fillOpacity="0.25" stroke="none" />
      ))}
      {STAR_MARKS.map(([x, y, r], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={r * 0.7} fill="var(--foreground)" fillOpacity="0.12" stroke="none" />
      ))}
    </g>
  );
}

function ArchiveMotif() {
  return (
    <g style={lineStyle}>
      {/* archival page margin marks */}
      <line x1="120" y1="0" x2="120" y2="800" />
      <line x1="1080" y1="0" x2="1080" y2="800" />
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={i} x1="116" y1={i * 40} x2="124" y2={i * 40} />
      ))}
      <circle cx="980" cy="120" r="80" strokeOpacity="0.06" />
    </g>
  );
}

function ManuscriptMotif() {
  return (
    <g style={lineStyle}>
      <circle cx="200" cy="160" r="220" strokeOpacity="0.05" />
      <circle cx="1000" cy="640" r="280" strokeOpacity="0.05" />
      <line x1="0" y1="120" x2="1200" y2="120" strokeOpacity="0.05" />
    </g>
  );
}

const STAR_MARKS: Array<[number, number, number]> = [
  [120, 90, 1.2],
  [340, 50, 0.9],
  [510, 130, 1.4],
  [780, 70, 1.0],
  [1080, 180, 1.2],
  [220, 230, 0.8],
  [620, 260, 1.1],
  [940, 320, 0.9],
  [1150, 420, 1.3],
];
