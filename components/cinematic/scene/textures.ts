// Procedural textures generated on the client at scene start (no downloads).

import * as T from "three";

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return [c, ctx];
}

/** Periodic value noise on a wrapping lattice so derived textures tile seamlessly. */
function periodicNoise(u: number, v: number, cells: number, seed: number): number {
  const fx = u * cells;
  const fy = v * cells;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const h = (x: number, y: number) => {
    const wx = ((x % cells) + cells) % cells;
    const wy = ((y % cells) + cells) % cells;
    const s = Math.sin(wx * 127.1 + wy * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const fade = (t: number) => t * t * (3 - 2 * t);
  const ux = fade(fx - ix);
  const uy = fade(fy - iy);
  const a = h(ix, iy);
  const b = h(ix + 1, iy);
  const c = h(ix, iy + 1);
  const d = h(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/** Seamless water normal map: multi-octave periodic noise plus a few crossing wave trains. */
export function waterNormalTexture(size = 512): T.CanvasTexture {
  const [c, ctx] = canvas(size);
  const img = ctx.createImageData(size, size);
  const waves = [
    { fx: 4, fy: 7, a: 0.35, ph: 0.4 },
    { fx: -9, fy: 5, a: 0.25, ph: 2.1 },
    { fx: 12, fy: -14, a: 0.18, ph: 1.3 },
  ];
  const height = (u: number, v: number) => {
    let h = 0;
    h += (periodicNoise(u, v, 8, 1) - 0.5) * 1.0;
    h += (periodicNoise(u, v, 16, 2) - 0.5) * 0.55;
    h += (periodicNoise(u, v, 32, 3) - 0.5) * 0.3;
    h += (periodicNoise(u, v, 64, 4) - 0.5) * 0.16;
    for (const w of waves) h += Math.sin(2 * Math.PI * (w.fx * u + w.fy * v) + w.ph) * w.a;
    return h;
  };
  const e = 1 / size;
  const strength = 0.035;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const dx = (height(u + e, v) - height(u - e, v)) / (2 * e) * strength;
      const dy = (height(u, v + e) - height(u, v - e)) / (2 * e) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = Math.round((-dx / len * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.colorSpace = T.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft radial sprite for mist, spray and glows. */
export function softSpriteTexture(size = 128, inner = 0.05): T.CanvasTexture {
  const [c, ctx] = canvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, size * inner, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(0.7, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

/** Seamless grey noise used for concrete and rock detail. */
export function noiseTexture(size = 256, base = 168, contrast = 26): T.CanvasTexture {
  const [c, ctx] = canvas(size);
  const img = ctx.createImageData(size, size);
  const period = size;
  const grid = 16;
  const rnd: number[] = [];
  for (let i = 0; i < grid * grid; i++) rnd.push(Math.sin(i * 12.9898 + 78.233) * 43758.5453 % 1);
  const at = (gx: number, gy: number) => Math.abs(rnd[((gy % grid) + grid) % grid * grid + (((gx % grid) + grid) % grid)]);
  const fadeF = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      let amp = 1;
      let norm = 0;
      for (let o = 0; o < 3; o++) {
        const cells = grid * (1 << o);
        const fx = (x / period) * cells;
        const fy = (y / period) * cells;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const u = fadeF(fx - ix);
        const v = fadeF(fy - iy);
        const s = (1 << o);
        const a = at(Math.floor(ix / s), Math.floor(iy / s));
        const b = at(Math.floor((ix + 1) / s), Math.floor(iy / s));
        const cc = at(Math.floor(ix / s), Math.floor((iy + 1) / s));
        const d = at(Math.floor((ix + 1) / s), Math.floor((iy + 1) / s));
        value += (a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v) * amp;
        norm += amp;
        amp *= 0.55;
      }
      const g = Math.round(base + (value / norm - 0.5) * contrast * 2 + (Math.random() - 0.5) * 6);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
