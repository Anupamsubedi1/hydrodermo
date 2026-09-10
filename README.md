# Beni Hydropower — website concept (Techvion)

A frontend-only sales demo for **Beni Hydropower Project Limited** (Upper Solu Khola Hydropower Project,
Solukhumbu, Nepal), prepared by Techvion Technology Private Limited as an independent website concept.

The hero is a real-time Three.js cinematic: a drone flies downstream over the reservoir, climbs the dam crest,
banks back to reveal the spillway, glides to the powerhouse, and the building opens up to explain how the
electricity is made. Everything in the scene is procedural — terrain, water, forest, dam, powerhouse and
machinery are generated in the browser, so there are no downloaded 3D assets or photographs.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, GSAP ScrollTrigger and React Three
Fiber. No database, media service, secrets, or custom backend are required.

## Run

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # production build (Turbopack)
npm run start            # serve the production build
npm run lint             # eslint (next/core-web-vitals + typescript)
npm run typecheck        # tsc --noEmit
npm test                 # node --test tests/**/*.test.ts
npm run capture:posters  # regenerate hero posters + OG image from the live scene
npm run build:logo       # rebuild the seal derivatives and favicon from source-assets/logo
```

Node 20.9+ is required by Next 16. The tests use Node's built-in runner with TypeScript type stripping
(Node 22.6+; developed on Node 25).

## The opening

The camera flies on its own before the reader touches anything. On load, the header, hero copy and stage
chrome are held back and only a small "Skip intro" chip is shown, so the first seconds are pure picture. The
camera eases from an establishing pose high up the valley onto the start of the scroll path over six seconds,
then the interface fades in and scrolling takes over. Any wheel, touch, key or pointer input ends the opening
immediately, and if the scene has not produced a frame within 3.5 seconds the copy is revealed over the poster
instead, so the page is never wordless. Reduced motion skips the opening entirely.

The opening and the scroll damper are both driven from real elapsed time rather than GSAP tweens. GSAP's lag
smoothing advances animations by a fixed slice once frames run long, which stretches a six-second move into
minutes on a slow renderer.

## Brand

The seal and wordmark come from the company's own published artwork, not a redraw. `npm run build:logo`
rebuilds the derivatives from `source-assets/logo/`: the published seal is black line art on a faint disc, so
the script masks by darkness rather than alpha and re-inks it in the company's red (`#b82830`, sampled from
their horizontal lockup) for light backgrounds and in the site's off-white for dark ones. It also writes the
favicon. If the company supplies a vector original, drop it in and the raster step can go.

## The scroll sequence

One sticky stage, 520 vh on desktop and 400 vh on mobile, mapped to a single normalized progress value.
GSAP ScrollTrigger writes the target, one ticker damps it, and every presentation reads the same store.

| Progress | Shot |
| --- | --- |
| 0.00–0.20 | Drone over the reservoir at dawn, snow ridges and forested valley walls |
| 0.20–0.38 | Climb to crest height and cross the dam |
| 0.38–0.52 | Bank back and descend to face the spillway, plunge pool and penstocks |
| 0.52–0.64 | Glide along the tailrace to the powerhouse and transformer yard |
| 0.64–0.72 | Roof lifts and walls fade; the machine hall lights come up |
| 0.72–0.94 | Penstock → spiral casing → Francis runner → generator → transformer → grid, with anchored labels |
| 0.94–1.00 | Settle on the machine hall; the document continues below |

Reverse scrolling replays the same choreography backwards: every pose, spin phase and reveal is a pure
function of progress plus a bounded ambient time term.

## Presentation paths

- **WebGL scene** on any device with a working WebGL2 context. Quality starts at one of three tiers from
  device signals, and steps down (shadows, reflection, bloom, tree count, DPR) if sustained frame times
  demand it. If it is still too slow, or the context is lost, or a shader fails, the page falls back
  permanently to the 2D path for that page view.
- **2D fallback**: the real scene poster with a restrained push-in, a mist veil and a CSS-driven SVG
  schematic, driven by the same progress store.
- **Reduced motion**: CSS removes the long pinned section before hydration; the complete story is shown as a
  static figure and the scene is never mounted.

The scene chunk (three, @react-three/fiber and the three/examples modules) is imported only by
`components/cinematic/scene/`, loaded through `next/dynamic({ ssr: false })` inside a Client Component, and
mounted only after the page load event, two painted frames and an idle callback. The world is then built in
stages that yield to the browser between them.

## Editing content

- Facts, copy, links: `content/site.ts`. Each fact lists the source ids it relies on.
- Sources and verification dates: `content/sources.ts`.
- Chapter ranges, section heights, damping, mount timing, performance thresholds: `lib/cinematic/config.ts`.
- Camera waypoints: `components/cinematic/scene/camera-path.ts`.
- Colours, light levels, bloom, fog, cutaway timing: `components/cinematic/scene/scene-config.ts`.
- World layout (river course, dam dimensions, powerhouse position): `components/cinematic/scene/river.ts`.
- Site colours, type scale, cinematic CSS: `app/globals.css`.

## Assets

There is no photography or downloaded 3D asset in the project. The two hero posters and the social image are
**screenshots of frame 0 of the real scene**, captured by `npm run capture:posters` against a running
production server. The capture holds the opening at its first frame, so the poster and the canvas show the
same framing and the handover is invisible. Regenerate them after changing the scene's
opening framing or lighting, and bump `ASSET_VERSION` in `lib/cinematic/assets.ts` if the filenames change.

| File | Size | Budget |
| --- | ---: | ---: |
| `hero-desktop.v2.webp` (1920×1080) | 199 KB | ~300 KB |
| `hero-mobile.v2.webp` (1080×1920) | 82 KB | 150–250 KB |
| `app/opengraph-image.png` (1200×630) | 287 KB | — |
| `public/assets/brand/seal.v1.png` + off-white variant | 100 KB | — |

If the client supplies photography later, it can replace the posters, and an approved Blender GLB can replace
the procedural machinery in `components/cinematic/scene/machine.ts`.

## Factual content and sources

Company facts were verified on 2026-09-09 from the company website (benihydro.com.np), the SEBON prospectus
page and PDF, the company's issue-opening notice, and ICRA Nepal's 2023 and 2025 rating rationales. Installed
capacity (19.8 MW) is presented as plant size, never as live generation; the 18.236 MW PPA capacity is shown
alongside it. Items that could not be verified (annual generation, environmental figures, subscription
results, photographs, logo) are listed in `content/sources.ts` and on the page under "Deliberately omitted".
Re-verify IPO status before any public use.

The 3D scene is a **concept visualisation**, labelled as such on the page. It is not a survey of the real
site: the dam, powerhouse and machinery are plausible generic hydropower structures, not Beni's equipment.

## Verification

Measured on this machine against the production build (`npm run build && npm run start`), using Playwright
with Microsoft Edge 152 and Lighthouse 12.6.1.

| Run | Perf | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Mobile, document only (reduced motion, scene never mounts) | 95 | 2.7 s | 0 | 110 ms |
| Desktop, document only (reduced motion) | 100 | 0.7 s | 0 | 0 ms |
| Mobile, with the WebGL scene | 64 | 2.8 s | 0 | 9.6 s |
| Desktop, with the WebGL scene | 69 | 0.7 s | 0 | 2.5 s |

Accessibility 100, best practices 100 in all runs. SEO scores 60 only because the page sets `noindex` on
purpose while it is an unpublished concept.

**Verification limit:** this machine has no usable GPU for headless Chromium, so every scene measurement ran
on SwiftShader software rasterisation at roughly one frame per second. The blocking-time figures for the runs
"with the WebGL scene" therefore measure software rendering, not the experience on a real GPU, and the
runtime quality guard correctly degrades and eventually falls back to the 2D path during long software-rendered
sessions. Frame rate on real hardware has not been measured and is not claimed.

Also checked in the browser: forward and reverse scrolling at sixteen progress stations, desktop (1440×900)
and mobile (412×915) layouts, the skip link (moves focus to the project heading), anchor navigation, WebGL
disabled (falls back to the 2D journey), reduced motion (static layout, no canvas), and a clean console apart
from two informational Three.js notices.

## Deployment (Vercel)

1. Push the repository and import it in Vercel (framework preset: Next.js; no environment variables needed).
2. Vercel's Hobby plan is limited to personal, non-commercial use. For a client proposal, deploy on a Pro team
   or the client's own account.
3. After the first deployment, confirm `https://<domain>/opengraph-image.png` is publicly fetchable and check
   the link preview in the messaging app you will use.
4. Static assets under `/assets/hydro/` are versioned and served immutably (`next.config.ts`); HTML is not.

Deployment has **not** been performed as part of this build.
