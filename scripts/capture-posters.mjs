// Captures frame 0 of the real WebGL scene as the HTML posters and the social
// image, so the poster → canvas swap is invisible and the share preview shows
// the actual experience.
//
// Requirements: a running production server (npm run build && npm run start),
// Playwright available via npx (not a project dependency), and Microsoft Edge
// or Chrome installed. Usage:
//   node scripts/capture-posters.mjs http://localhost:3000
// Then bump ASSET_VERSION in lib/cinematic/assets.ts if the filenames changed.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "assets", "hydro");
const VERSION = "v2";
const baseUrl = process.argv[2] ?? "http://localhost:3000";
const playwrightPath = process.argv[3]; // optional path to a playwright install

async function loadPlaywright() {
  const candidates = [playwrightPath, "playwright"].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      /* try next */
    }
  }
  throw new Error("Playwright not found. Run: npx playwright@1.50.1 install --with-deps chromium, or pass the path to a playwright package as the 3rd argument.");
}

async function capture(browser, { width, height, dpr, mobile }) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "load" });
  await page.waitForSelector(".cine-canvas.is-ready", { timeout: 120000 });
  // Let the water settle and hide every HTML layer over the canvas.
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: ".cine-chapters, .cine-chrome, .cine-grade, header, .cine-poster { visibility: hidden !important; }" });
  await page.waitForTimeout(300);
  const canvas = await page.$(".cine-canvas canvas");
  const buffer = await canvas.screenshot({ type: "png" });
  await context.close();
  return buffer;
}

const { chromium } = await loadPlaywright();
const launchArgs = ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"];
let browser;
for (const channel of ["msedge", "chrome", undefined]) {
  try {
    browser = await chromium.launch({ channel, headless: true, args: launchArgs });
    break;
  } catch {
    /* next */
  }
}
if (!browser) throw new Error("No Chromium-based browser could be launched.");

await fs.mkdir(OUT, { recursive: true });
const report = [];

const desktopPng = await capture(browser, { width: 1920, height: 1080, dpr: 1, mobile: false });
const desktopFile = path.join(OUT, `hero-desktop.${VERSION}.webp`);
const d = await sharp(desktopPng).resize(1920, 1080).webp({ quality: 82, effort: 6 }).toFile(desktopFile);
report.push({ file: path.relative(ROOT, desktopFile), width: d.width, height: d.height, kb: Math.round(d.size / 1024) });

const mobilePng = await capture(browser, { width: 540, height: 960, dpr: 2, mobile: true });
const mobileFile = path.join(OUT, `hero-mobile.${VERSION}.webp`);
const m = await sharp(mobilePng).resize(1080, 1920).webp({ quality: 78, effort: 6 }).toFile(mobileFile);
report.push({ file: path.relative(ROOT, mobileFile), width: m.width, height: m.height, kb: Math.round(m.size / 1024) });

// Social image: desktop frame cropped to 1.91:1 with the concept typography.
const og = await sharp(desktopPng).extract({ left: 0, top: 54, width: 1920, height: 1005 }).resize(1200, 630).png().toBuffer();
const ogText = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#03110f" stop-opacity="0.8"/><stop offset="0.55" stop-color="#03110f" stop-opacity="0.32"/><stop offset="1" stop-color="#03110f" stop-opacity="0"/></linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="#03110f" stop-opacity="0"/><stop offset="1" stop-color="#03110f" stop-opacity="0.6"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#bottom)"/>
  <g font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" fill="#f4f1ea">
    <text x="72" y="96" font-size="17" font-weight="600" letter-spacing="4.5" fill="#cfe3d6">BENI HYDROPOWER PROJECT LIMITED</text>
    <text x="72" y="266" font-size="66" font-weight="600" letter-spacing="-1.5">From Himalayan water</text>
    <text x="72" y="342" font-size="66" font-weight="600" letter-spacing="-1.5">to lasting energy.</text>
    <text x="72" y="400" font-size="22" fill="#d9e2dc">Upper Solu Khola Hydropower Project · Solukhumbu, Nepal</text>
    <line x1="72" y1="546" x2="1128" y2="546" stroke="#cfe3d6" stroke-opacity="0.35"/>
    <text x="72" y="584" font-size="16" font-weight="500" letter-spacing="1.5" fill="#cfe3d6">INDEPENDENT WEBSITE CONCEPT BY TECHVION</text>
    <text x="1128" y="584" font-size="16" text-anchor="end" fill="#b9c9c0">Concept visualisation · real-time 3D</text>
  </g>
</svg>`;
const ogFile = path.join(ROOT, "app", "opengraph-image.png");
const o = await sharp(og).composite([{ input: Buffer.from(ogText) }]).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(ogFile);
report.push({ file: path.relative(ROOT, ogFile), width: o.width, height: o.height, kb: Math.round(o.size / 1024) });

await browser.close();
console.table(report);
