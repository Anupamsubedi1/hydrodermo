// World layout constants and the river's analytic geometry. Everything that
// places objects (terrain, water, dam, forest, camera) reads these functions so
// the world stays consistent.

import { fbm2, smoothstep } from "./noise.ts";

/** The river flows toward +z. The dam sits at z = 0. */
export const DAM_Z = 0;
export const RESERVOIR_LEVEL = 0;
export const TAIL_LEVEL = -28;
export const DAM_CREST_Y = 8;
export const DAM_BASE_Y = -36;
export const DAM_HALF_LENGTH = 82;
/** Dam body extents along z: vertical upstream face, sloped downstream face. */
export const DAM_UPSTREAM_Z = -6;
export const DAM_CREST_DOWNSTREAM_Z = 2;
export const DAM_TOE_Z = 17;

/** Powerhouse footprint on the right bank downstream (world units, metres). */
export const POWERHOUSE = { x: 64, z: 52, width: 40, depth: 30, floorY: TAIL_LEVEL + 3, height: 20 } as const;
/** Transformer yard just downstream of the powerhouse. */
export const YARD = { x: 68, z: 84, width: 30, depth: 22, y: TAIL_LEVEL + 3 } as const;
/** Cut bench on the right bank that the plant, yard, access road and first pylon stand on. */
export const BENCH = { x: POWERHOUSE.x + 16, z: POWERHOUSE.z + 30, halfWidth: 62, halfDepth: 74, level: POWERHOUSE.floorY - 1.2, blend: 42 } as const;

export function riverX(z: number): number {
  return 30 * Math.sin(z / 300) + 8 * Math.sin(z / 110 + 1.2);
}

export function riverHalfWidth(z: number): number {
  if (z < DAM_Z) return 36 + 20 * smoothstep(-520, -80, z);
  // Plunge pool below the dam, then a narrower river.
  return 30 - 13 * smoothstep(20, 110, z) + 3 * Math.sin(z / 70);
}

export function waterLevel(z: number): number {
  return z < DAM_Z ? RESERVOIR_LEVEL : TAIL_LEVEL;
}

/** Terrain base level: steps from reservoir to tailwater across the dam site, smoothly on the banks. */
export function terrainBase(z: number): number {
  return RESERVOIR_LEVEL + (TAIL_LEVEL - RESERVOIR_LEVEL) * smoothstep(-34, 26, z);
}

export function terrainHeight(x: number, z: number): number {
  const xc = riverX(z);
  const hw = riverHalfWidth(z);
  const dx = Math.abs(x - xc);
  const d = dx - hw;
  const base = terrainBase(z);
  let y: number;
  if (d < 0) {
    const u = -d / hw; // 0 at bank, 1 at the centreline
    const depth = z < DAM_Z ? 9 : 5.5;
    y = waterLevel(z) - 1.4 - depth * Math.sin((u * Math.PI) / 2);
    if (z >= DAM_Z && z < 40) y -= 4 * smoothstep(40, 10, z); // plunge pool
  } else {
    const bank = Math.min(d, 30) * 0.16;
    const wall = Math.pow(Math.max(0, d - 30), 1.12) * 0.5;
    const n = fbm2(x * 0.0042 + 3.1, z * 0.0042 - 1.7, 5) - 0.5;
    const n2 = fbm2(x * 0.021 + 8, z * 0.021 + 2, 3) - 0.5;
    y = base - 0.8 + bank + wall + n * Math.min(d, 280) * 0.8 + n2 * Math.min(d, 46) * 0.55;
  }
  const far = fbm2(x * 0.0015 + 10, z * 0.0015 + 5, 4);
  y += Math.max(0, far - 0.42) * 640 * smoothstep(140, 560, dx);
  // Ridge crests on the far walls.
  y += (fbm2(x * 0.0009 + 40, z * 0.0009, 3) - 0.5) * 140 * smoothstep(260, 700, dx);
  // Level bench for the plant site, plus tighter pads under the buildings.
  y = pad(y, x, z, BENCH.x, BENCH.z, BENCH.halfWidth, BENCH.halfDepth, BENCH.level, BENCH.blend);
  y = pad(y, x, z, POWERHOUSE.x, POWERHOUSE.z, POWERHOUSE.width / 2 + 10, POWERHOUSE.depth / 2 + 10, POWERHOUSE.floorY - 1.2, 14);
  y = pad(y, x, z, YARD.x, YARD.z, YARD.width / 2 + 6, YARD.depth / 2 + 6, YARD.y - 0.6, 14);
  return y;
}

function pad(y: number, x: number, z: number, cx: number, cz: number, hw: number, hd: number, level: number, blend: number): number {
  const ex = Math.abs(x - cx) - hw;
  const ez = Math.abs(z - cz) - hd;
  const e = Math.max(ex, ez);
  if (e > blend) return y;
  const k = 1 - smoothstep(0, blend, e);
  return y + (Math.min(y, level) - y) * k;
}

/** Approximate terrain normal from central differences. */
export function terrainNormal(x: number, z: number, out: { x: number; y: number; z: number }, step = 2): void {
  const hl = terrainHeight(x - step, z);
  const hr = terrainHeight(x + step, z);
  const hd = terrainHeight(x, z - step);
  const hu = terrainHeight(x, z + step);
  const nx = hl - hr;
  const nz = hd - hu;
  const ny = 2 * step;
  const len = Math.hypot(nx, ny, nz) || 1;
  out.x = nx / len;
  out.y = ny / len;
  out.z = nz / len;
}

/** Height above the local water/terrain base level. */
export function heightAboveWater(x: number, z: number, y = terrainHeight(x, z)): number {
  return y - terrainBase(z);
}
