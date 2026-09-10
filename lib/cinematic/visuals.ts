// Presentation math shared by the HTML overlays and the 2D fallback journey.
// Pure functions of progress so forward and reverse scrolling are symmetric.

import { CHAPTERS, STATIONS } from "./config.ts";
import { chapterLocal, clamp01 } from "./progress.ts";
import type { Chapter } from "./types.ts";

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Opacity of a chapter's text block for a given progress value. */
export function chapterOpacity(progress: number, chapter: Chapter): number {
  const { start, end } = CHAPTERS[chapter];
  const len = end - start;
  const fade = Math.min(0.035, len * 0.3);
  const fadeIn = chapter === 0 ? 1 : smoothstep(start, start + fade, progress);
  const fadeOut = chapter === CHAPTERS.length - 1 ? 1 : 1 - smoothstep(end - fade, end, progress);
  return clamp01(Math.min(fadeIn, fadeOut));
}

/** Index of the highlighted machine station (-1 before the machine chapter, 3 after it). */
export function activeStation(progress: number): number {
  if (progress < STATIONS[0].start) return -1;
  for (let i = STATIONS.length - 1; i >= 0; i--) {
    if (progress >= STATIONS[i].start) return i;
  }
  return -1;
}

/** 0..1 reveal amount of a station's label (fades in over the first quarter, stays). */
export function stationReveal(progress: number, index: number): number {
  const s = STATIONS[index];
  if (!s) return 0;
  return smoothstep(s.start, s.start + (s.end - s.start) * 0.3, progress);
}

export interface PlateTransform {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

export interface SchematicVars {
  readonly flow: number;
  readonly spinDeg: number;
  readonly dash: number;
  readonly gen: number;
  readonly grid: number;
  readonly settle: number;
}

export interface JourneyState {
  readonly background: PlateTransform;
  readonly midground: PlateTransform;
  readonly foreground: PlateTransform;
  readonly veil: number;
  readonly schematic: number;
  readonly vars: SchematicVars;
}

/** Transforms for the 2D fallback plates: push-in through the flight chapters, then fade behind a veil. */
export function journeyState(progress: number, viewportHeight = 800): JourneyState {
  const push = smoothstep(0, CHAPTERS[3].end, progress);
  const unit = viewportHeight / 100;
  const fadeOut = 1 - smoothstep(CHAPTERS[4].start, CHAPTERS[4].start + 0.05, progress);
  const veil = smoothstep(CHAPTERS[4].start, 0.68, progress) * (1 - smoothstep(0.69, CHAPTERS[4].end, progress));
  const schematic = smoothstep(0.68, CHAPTERS[4].end, progress);
  return {
    background: { scale: 1 + 0.035 * push, x: 0, y: -0.6 * unit * push, opacity: fadeOut },
    midground: { scale: 1 + 0.075 * push, x: 0.6 * unit * push, y: -1.6 * unit * push, opacity: fadeOut },
    foreground: { scale: 1 + 0.15 * push, x: 1.4 * unit * push, y: -3.6 * unit * push, opacity: fadeOut },
    veil,
    schematic,
    vars: schematicVars(progress),
  };
}

export function schematicVars(progress: number): SchematicVars {
  const p5 = chapterLocal(progress, 5);
  const p6 = chapterLocal(progress, 6);
  const inMachine = progress >= CHAPTERS[5].start;
  const flow = inMachine ? smoothstep(0, 0.25, p5) : 0;
  const spinDeg = inMachine ? smoothstep(0.2, 0.6, p5) * 1080 + p5 * 240 + p6 * 120 : 0;
  const gen = inMachine ? smoothstep(0.5, 0.75, p5) : 0;
  const grid = inMachine ? smoothstep(0.75, 1, p5) : 0;
  const dash = inMachine ? p5 * 420 + p6 * 90 : 0;
  return { flow, spinDeg, dash, gen, grid, settle: p6 };
}
