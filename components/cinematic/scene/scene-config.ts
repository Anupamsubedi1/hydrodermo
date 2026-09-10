// Visual tuning for the WebGL scene: timings, colours, light and effect levels.

/** Low dawn sun ahead of the drone (downstream, +z) so the water carries glitter and the dam is lit on the reveal. */
export const SUN = { elevation: 15, azimuth: 56 } as const;

export const LOOK = {
  fogDensity: 0.0005,
  fogColor: "#b4c6cc",
  sunIntensity: 2.6,
  hemiSky: "#b9cfd8",
  hemiGround: "#2f3d31",
  hemiIntensity: 0.42,
  envIntensity: 0.42,
  exposure: 0.8,
  bloom: { strength: 0.18, radius: 0.45, threshold: 0.94 },
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
