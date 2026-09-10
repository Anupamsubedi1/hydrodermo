"use client";

import { useEffect, useRef } from "react";
import { POSTERS } from "@/lib/cinematic/assets";
import type { ProgressStore } from "@/lib/cinematic/types";
import { journeyState } from "@/lib/cinematic/visuals";
import { HydroSchematic } from "./HydroSchematic";

export type PlateSet = "mobile" | "desktop";

interface Journey2DProps {
  progress: ProgressStore;
  plates: PlateSet;
  onLoaded: () => void;
}

/**
 * Lightweight fallback presentation used when WebGL is unavailable, lost, or
 * too slow: the real scene poster with a restrained push-in, a mist veil, and
 * the CSS-driven SVG schematic. Reads the same progress store as the scene.
 */
export function Journey2D({ progress, plates, onLoaded }: Journey2DProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const src = plates === "mobile" ? POSTERS.mobile : POSTERS.desktop;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const plate = root.querySelector<HTMLImageElement>(".journey-plate--bg");
    const veil = root.querySelector<HTMLDivElement>(".journey-veil");
    const schematic = root.querySelector<HTMLDivElement>(".journey-schematic");
    const svg = root.querySelector<SVGSVGElement>("svg.hydro-schematic");
    if (!plate || !veil || !schematic || !svg) return;

    const apply = (store: ProgressStore) => {
      const s = journeyState(store.current, root.clientHeight || window.innerHeight);
      const t = s.midground;
      plate.style.transform = `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) scale(${t.scale.toFixed(4)})`;
      plate.style.opacity = t.opacity.toFixed(3);
      veil.style.opacity = s.veil.toFixed(3);
      schematic.style.opacity = s.schematic.toFixed(3);
      schematic.style.visibility = s.schematic > 0.001 ? "visible" : "hidden";
      svg.style.setProperty("--flow", s.vars.flow.toFixed(3));
      svg.style.setProperty("--spin", `${s.vars.spinDeg.toFixed(1)}deg`);
      svg.style.setProperty("--dash", s.vars.dash.toFixed(1));
      svg.style.setProperty("--gen", s.vars.gen.toFixed(3));
      svg.style.setProperty("--grid", s.vars.grid.toFixed(3));
    };
    apply(progress);
    return progress.subscribe(apply);
  }, [progress]);

  return (
    <div ref={rootRef} className="cine-layer journey" aria-hidden="true">
      {/* Plain img: a transformed layer, not a content image; the file is versioned and cached immutably. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="journey-plate journey-plate--bg" src={src.src} width={src.width} height={src.height} alt="" decoding="async" onLoad={onLoaded} onError={onLoaded} />
      <div className="journey-veil" />
      <div className="journey-schematic" style={{ visibility: "hidden" }}>
        <HydroSchematic style={{ "--flow": 0, "--spin": "0deg", "--dash": 0, "--gen": 0, "--grid": 0 }} className="journey-schematic-svg" />
      </div>
    </div>
  );
}
