// Tuning values shared by every presentation of the scroll sequence
// (WebGL scene, 2D fallback journey, HTML overlays). Pure data: no React, no Three.

import type { Chapter } from "./types.ts";

export interface ChapterRange {
  readonly index: Chapter;
  readonly id: "flight" | "approach" | "reveal" | "powerhouse" | "cutaway" | "machine" | "settle";
  readonly start: number;
  readonly end: number;
}

/** Shot list from docs/HERO_CINEMATIC_BRIEF.md. */
export const CHAPTERS: readonly ChapterRange[] = [
  { index: 0, id: "flight", start: 0, end: 0.2 },
  { index: 1, id: "approach", start: 0.2, end: 0.38 },
  { index: 2, id: "reveal", start: 0.38, end: 0.52 },
  { index: 3, id: "powerhouse", start: 0.52, end: 0.64 },
  { index: 4, id: "cutaway", start: 0.64, end: 0.72 },
  { index: 5, id: "machine", start: 0.72, end: 0.94 },
  { index: 6, id: "settle", start: 0.94, end: 1 },
];

/** Machine-chapter stations (progress ranges inside chapter 5) used for labels and motion graphics. */
export const STATIONS = [
  { id: "penstock", start: 0.72, end: 0.775 },
  { id: "turbine", start: 0.775, end: 0.83 },
  { id: "generator", start: 0.83, end: 0.885 },
  { id: "transformer", start: 0.885, end: 0.94 },
] as const;

/** Height of the scrolling section in viewport heights (the stage itself is one viewport). */
export const SECTION_HEIGHT_VH = {
  desktop: 520,
  mobile: 400,
} as const;

/** Exponential damping rate (per second) applied by the wrapper's ticker. */
export const PROGRESS_DAMPING = 4.5;
/** Below this distance the store snaps to target and reports settled. */
export const PROGRESS_SETTLE_EPSILON = 0.0003;
/** Largest single damping sub-step (s); keeps the damper stable. */
export const PROGRESS_MAX_DT = 1 / 20;
/** Largest total time (s) a single frame may advance, so a suspended tab never jumps. */
export const PROGRESS_MAX_FRAME = 0.4;

/** Deferred scene mount: wait for idle, but never longer than this after the poster is painted. */
export const SCENE_IDLE_TIMEOUT_MS = 1800;

/** Autoplay opening: seconds of camera move before the reader takes over by scrolling. */
export const INTRO_DURATION_S = 6;
/** How quickly the opening finishes when the reader scrolls or presses a key during it. */
export const INTRO_SKIP_S = 0.7;
/**
 * If the scene has not produced a frame by now, the opening is abandoned and the
 * hero copy is revealed over the poster. The page must never sit wordless.
 */
export const INTRO_READY_DEADLINE_MS = 3500;
/** Minimum width for the high/medium tiers; below it phones get the low tier. */
export const SCENE_DESKTOP_MIN_WIDTH = 1024;

/**
 * Sustained-performance thresholds used by the wrapper to step quality down (one-way).
 * Samples are intervals between consecutively rendered frames while the scene is active
 * and running its continuous loop (target 60 fps, ~16.7 ms).
 */
export const PERFORMANCE = {
  minSamples: 90,
  degradeAboveMsP95: 34,
  disableAboveMsP95: 80,
} as const;
