// Visual tuning for the WebGL scene: timings, colours, light and effect levels.

/** Low dawn sun ahead of the drone (downstream, +z) so the water carries glitter and the dam is lit on the reveal. */
export const SUN = { elevation: 15, azimuth: 56 } as const;

export const LOOK = {
  fogDensity: 0.00034,
  fogColor: "#819a9e",
  sunIntensity: 1.9,
  hemiSky: "#b9cfd8",
  hemiGround: "#2f3d31",
  hemiIntensity: 0.36,
  envIntensity: 0.34,
  exposure: 0.64,
  skyRadiance: 0.48,
  bloom: { strength: 0.075, radius: 0.35, threshold: 1.2 },
  reflectionTexture: { high: 768, medium: 512 },
  shadowExtent: 420,
  concrete: "#a3a49d",
  concreteDark: "#858680",
  steel: "#b9bdbf",
  paintedSteel: "#2f4a45",
  housing: "#22282b",
  copper: "#b87333",
  windowGlow: "#ffd9a0",
  energy: "#7fe3ec",
  interiorLight: "#ffe4c2",
} as const;

/** Cutaway of the powerhouse shell and interior light ramp. */
export const CUTAWAY = { start: 0.64, end: 0.71 } as const;
