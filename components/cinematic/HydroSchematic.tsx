import type { CSSProperties } from "react";
import { PROPOSAL } from "@/content/site";

export interface SchematicStyle extends CSSProperties {
  "--flow"?: number;
  "--spin"?: string;
  "--dash"?: number;
  "--gen"?: number;
  "--grid"?: number;
}

const STATIC_VARS: SchematicStyle = { "--flow": 1, "--spin": "0deg", "--dash": 0, "--gen": 1, "--grid": 1 };

/**
 * Inline SVG schematic of water → penstock → turbine → generator → grid.
 * Driven entirely by CSS custom properties so the 2D journey can animate it
 * from the progress store without touching individual elements; with the
 * static variables it doubles as the reduced-motion figure.
 */
export function HydroSchematic({ style, className, id }: { style?: SchematicStyle; className?: string; id?: string }) {
  return (
    <svg
      id={id}
      viewBox="0 0 960 560"
      role="img"
      aria-label={`${PROPOSAL.schematicLabel}: water falls through a penstock, turns a turbine that drives a generator, and a transformer connects the plant to the grid.`}
      className={`hydro-schematic ${className ?? ""}`}
      style={style ?? STATIC_VARS}
    >
      <defs>
        <linearGradient id="hs-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d0d1" />
          <stop offset="0.5" stopColor="#8d9a9d" />
          <stop offset="1" stopColor="#5e6b6e" />
        </linearGradient>
        <linearGradient id="hs-paint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b5c56" />
          <stop offset="1" stopColor="#22403a" />
        </linearGradient>
        <linearGradient id="hs-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4347" />
          <stop offset="0.45" stopColor="#23292c" />
          <stop offset="1" stopColor="#15191b" />
        </linearGradient>
        <linearGradient id="hs-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e8e8" />
          <stop offset="0.5" stopColor="#a9b2b4" />
          <stop offset="1" stopColor="#6f797c" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9fd2d6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#9fd2d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aeb1a9" />
          <stop offset="1" stopColor="#7d827c" />
        </linearGradient>
      </defs>

      {/* plinths */}
      <rect x="352" y="428" width="196" height="26" rx="3" fill="url(#hs-floor)" />
      <rect x="600" y="428" width="230" height="26" rx="3" fill="url(#hs-floor)" />
      <rect x="0" y="454" width="960" height="3" fill="#0b1513" opacity="0.6" />

      {/* penstock */}
      <path
        d="M60 70 C 200 70, 250 150, 300 250 S 380 330, 430 336"
        fill="none"
        stroke="url(#hs-steel)"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path d="M60 70 C 200 70, 250 150, 300 250 S 380 330, 430 336" fill="none" stroke="#e9eeee" strokeWidth="5" strokeLinecap="round" opacity="0.45" transform="translate(0 -8)" />
      {[120, 210, 290, 360].map((x, i) => (
        <rect key={x} x={x - 6} y={[52, 96, 208, 296][i]} width="12" height="44" rx="2" fill="#5e6b6e" transform={`rotate(${[0, 28, 58, 40][i]} ${x} ${[74, 118, 230, 318][i]})`} />
      ))}
      {/* water flow along the penstock */}
      <path
        className="hs-flow"
        d="M60 70 C 200 70, 250 150, 300 250 S 380 330, 430 336"
        fill="none"
        stroke="#7fd6df"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="22 26"
      />

      {/* spiral casing and runner */}
      <circle cx="450" cy="340" r="86" fill="url(#hs-paint)" stroke="#142622" strokeWidth="3" />
      <circle cx="450" cy="340" r="70" fill="#17211f" stroke="#0e1615" strokeWidth="2" />
      <g className="hs-runner">
        <circle cx="450" cy="340" r="58" fill="#20292b" />
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d="M450 296 C 470 306, 476 326, 462 340 C 456 346, 450 350, 450 350 Z"
            fill="#9aa5a8"
            stroke="#d5dcdd"
            strokeWidth="1"
            transform={`rotate(${(360 / 11) * i} 450 340)`}
          />
        ))}
        <circle cx="450" cy="340" r="16" fill="url(#hs-shaft)" stroke="#3b4548" strokeWidth="2" />
      </g>
      <circle cx="450" cy="340" r="86" fill="url(#hs-glow)" className="hs-runner-glow" />
      {/* draft tube */}
      <path d="M418 420 L 418 456 L 482 456 L 482 420" fill="none" stroke="#5e6b6e" strokeWidth="14" />

      {/* shaft */}
      <rect x="530" y="331" width="86" height="18" rx="4" fill="url(#hs-shaft)" />
      <rect x="524" y="322" width="12" height="36" rx="2" fill="#7d878a" />
      <rect x="610" y="322" width="12" height="36" rx="2" fill="#7d878a" />

      {/* generator */}
      <rect x="622" y="262" width="196" height="156" rx="20" fill="url(#hs-housing)" stroke="#0e1416" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={640 + i * 14} y="276" width="5" height="128" rx="2" fill="#0f1416" opacity="0.75" />
      ))}
      <rect x="806" y="292" width="26" height="96" rx="8" fill="#2f383b" stroke="#0e1416" strokeWidth="2" />
      <ellipse cx="720" cy="340" rx="86" ry="52" fill="url(#hs-glow)" className="hs-gen-glow" />
      <rect x="690" y="404" width="60" height="12" rx="2" fill="#1a2022" />

      {/* transformer and grid */}
      <rect x="848" y="318" width="68" height="100" rx="6" fill="#30373a" stroke="#0e1416" strokeWidth="2" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x="924" y={324 + i * 18} width="22" height="8" rx="2" fill="#3f484c" />
      ))}
      <g className="hs-grid">
        <path d="M862 318 C 860 250, 880 200, 905 140 L 905 110" fill="none" stroke="#b87333" strokeWidth="3" />
        <path d="M882 318 C 884 250, 905 200, 928 140 L 928 110" fill="none" stroke="#b87333" strokeWidth="3" />
        <path d="M902 318 C 906 250, 930 200, 951 140 L 951 110" fill="none" stroke="#b87333" strokeWidth="3" />
        <path d="M896 110 L 960 110 M 892 130 L 960 130" stroke="#8d9a9d" strokeWidth="3" />
        <path className="hs-pulse" d="M862 318 C 860 250, 880 200, 905 140 L 905 110" fill="none" stroke="#9fd2d6" strokeWidth="4" strokeDasharray="14 40" strokeLinecap="round" />
      </g>

      {/* labels */}
      <g fill="#d9e2dc" fontSize="13" fontWeight="600" letterSpacing="1.2">
        <text x="150" y="146">PENSTOCK</text>
        <text x="392" y="474">TURBINE</text>
        <text x="676" y="474">GENERATOR</text>
        <text x="860" y="474">GRID</text>
      </g>
      <text x="16" y="546" fill="#7f8c89" fontSize="12" letterSpacing="0.6">
        {PROPOSAL.schematicLabel}
      </text>
    </svg>
  );
}
