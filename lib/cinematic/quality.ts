// Device eligibility and quality tiers. Pure functions over a signals object so
// the decisions are testable; `readDeviceSignals` is the only browser-touching helper.

import { PERFORMANCE, SCENE_DESKTOP_MIN_WIDTH } from "./config.ts";
import type { ScenePerformanceSample, SceneQuality } from "./types.ts";

export interface DeviceSignals {
  readonly width: number;
  readonly height: number;
  readonly finePointer: boolean;
  readonly hover: boolean;
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
  readonly hardwareConcurrency: number;
  readonly deviceMemory: number;
  readonly devicePixelRatio: number;
  readonly webgl2: boolean;
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Attempts a real WebGL2 context on a throwaway canvas; constructor presence is only a hint. */
export function probeWebGL2(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  if (typeof window.WebGL2RenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false });
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function readDeviceSignals(): DeviceSignals {
  const nav = navigator as NavigatorWithHints;
  const mq = (query: string) => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false);
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    finePointer: mq("(pointer: fine)"),
    hover: mq("(hover: hover)"),
    reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    saveData: Boolean(nav.connection?.saveData),
    hardwareConcurrency: nav.hardwareConcurrency ?? 4,
    deviceMemory: nav.deviceMemory ?? 4,
    devicePixelRatio: window.devicePixelRatio || 1,
    webgl2: probeWebGL2(),
  };
}

/** Any device with real WebGL2 gets the scene unless motion is reduced or data saving is on. */
export function isSceneEligible(s: DeviceSignals): boolean {
  return !s.reducedMotion && !s.saveData && s.webgl2 && s.width >= 320;
}

export const QUALITY_PRESETS: Readonly<Record<SceneQuality["tier"], SceneQuality>> = {
  high: { tier: "high", dpr: 1.5, shadows: true, shadowMapSize: 2048, reflection: true, bloom: true, trees: 9000, terrainSegments: 256, particles: 1 },
  medium: { tier: "medium", dpr: 1.25, shadows: true, shadowMapSize: 1024, reflection: true, bloom: true, trees: 5200, terrainSegments: 192, particles: 0.7 },
  low: { tier: "low", dpr: 1, shadows: false, shadowMapSize: 1024, reflection: false, bloom: false, trees: 2600, terrainSegments: 128, particles: 0.45 },
};

export function initialQuality(s: DeviceSignals): SceneQuality {
  const desktop = s.width >= SCENE_DESKTOP_MIN_WIDTH && s.finePointer && s.hover;
  if (!desktop) return QUALITY_PRESETS.low;
  if (s.hardwareConcurrency <= 4 || s.deviceMemory <= 4) return QUALITY_PRESETS.medium;
  return QUALITY_PRESETS.high;
}

/** One-way degradation. Returns null when the scene should be disabled in favour of the 2D path. */
export function degradeQuality(q: SceneQuality): SceneQuality | null {
  if (q.tier === "high") return QUALITY_PRESETS.medium;
  if (q.tier === "medium") return QUALITY_PRESETS.low;
  return null;
}

export type PerformanceVerdict = "keep" | "degrade" | "disable";

export function judgePerformance(sample: ScenePerformanceSample): PerformanceVerdict {
  if (sample.samples < PERFORMANCE.minSamples) return "keep";
  if (sample.activeFrameMsP95 > PERFORMANCE.disableAboveMsP95) return "disable";
  if (sample.activeFrameMsP95 > PERFORMANCE.degradeAboveMsP95) return "degrade";
  return "keep";
}
