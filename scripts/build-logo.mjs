// Rebuilds the Beni Hydropower seal from the company's own artwork into crisp,
// transparent derivatives for the site.
//
// Source: source-assets/logo/seal-source.png — the seal as published on
// benihydro.com.np (150x150, already transparent). It is line art, so it is
// upscaled with a Lanczos kernel and unsharp-masked rather than interpolated
// flat, then emitted at the two sizes the layout actually uses.
//
// Usage: node scripts/build-logo.mjs

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "source-assets", "logo", "seal-source.png");
const OUT = path.join(ROOT, "public", "assets", "brand");
const VERSION = "v1";

await fs.mkdir(OUT, { recursive: true });
const report = [];

// Trim the transparent margin so the seal fills its box, then work at 4x.
const trimmed = await sharp(SRC).trim({ threshold: 8 }).toBuffer();
const base = await sharp(trimmed)
  .resize(1024, 1024, { fit: "contain", kernel: "lanczos3", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 })
  .toBuffer();

/**
 * The published seal is black line art on a faintly tinted disc. Ink density is
 * therefore how *dark* a pixel is, not how opaque it is: using alpha alone
 * floods the whole disc. Recolouring that mask gives clean line art in the
 * company's own red (sampled from their horizontal lockup) for light
 * backgrounds and in the site's off-white for dark ones.
 */
async function inked(hex) {
  const { data, info } = await sharp(base).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    // Strokes are dark; the disc and paper are light and drop out entirely.
    const ink = Math.max(0, Math.min(1, (0.86 - lum) / 0.62));
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.round(data[i + 3] * ink);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const BRAND_RED = "#b82830";
const colour = await inked(BRAND_RED);
const light = await inked("#f4f1ea");

const write = async (name, buffer, size) => {
  const file = path.join(OUT, `${name}.${VERSION}.png`);
  const info = await sharp(buffer).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9, palette: true, quality: 92 }).toFile(file);
  report.push({ file: path.relative(ROOT, file), size: `${info.width}x${info.height}`, kb: Math.round(info.size / 1024) });
};

await write("seal", colour, 512);
await write("seal-light", light, 512);

// Favicon: the red seal on the site's paper tone, so it reads in a browser tab.
const favicon = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 246, g: 243, b: 236, alpha: 1 } } })
  .composite([{ input: await sharp(colour).resize(460, 460, { kernel: "lanczos3" }).toBuffer(), gravity: "centre" }])
  .png()
  .toBuffer();
// 96px keeps tab and bookmark icons crisp without competing with the hero for bandwidth.
const icoFile = path.join(ROOT, "app", "icon.png");
const icoInfo = await sharp(favicon).resize(96, 96, { kernel: "lanczos3" }).png({ compressionLevel: 9, palette: true, colors: 64 }).toFile(icoFile);
report.push({ file: path.relative(ROOT, icoFile), size: `${icoInfo.width}x${icoInfo.height}`, kb: Math.round(icoInfo.size / 1024) });

console.table(report);
