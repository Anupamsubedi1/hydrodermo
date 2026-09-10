// Versioned asset manifest. Posters are real screenshots of frame 0 of the WebGL
// scene (see scripts/capture-posters.mjs). Bump ASSET_VERSION together with the
// filenames when recapturing so caches never serve stale posters.

import type { SceneAsset } from "./types.ts";

export const ASSET_VERSION = "v2";
const base = "/assets/hydro";

/** HTML posters (art-directed per breakpoint) and the single fallback plate. */
export const POSTERS = {
  desktop: { src: `${base}/hero-desktop.${ASSET_VERSION}.webp`, width: 1920, height: 1080 },
  mobile: { src: `${base}/hero-mobile.${ASSET_VERSION}.webp`, width: 1080, height: 1920 },
} as const satisfies Record<string, SceneAsset>;

/** Design budgets (KB); measured values live in the README. */
export const ASSET_BUDGETS_KB = {
  posterMobile: 250,
  posterDesktop: 300,
} as const;
