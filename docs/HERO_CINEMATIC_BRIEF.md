# Beni Hydropower — cinematic hero brief (solo build, v2)

Supersedes the 2.5D illustration approach. Built solely by Claude Code at the user's direction (no Codex tasks after C2).

## The shot (scroll-driven, ~500 vh desktop, one sticky 100svh stage, progress 0→1)

| Progress | Shot | Copy |
| --- | --- | --- |
| 0.00–0.20 | **Drone over water.** 5–7 m above a snow-fed river flying downstream through a steep forested valley at dawn. Reflective water with flow and sun glitter, shore foam, mist through the trees, snow ridges under a Sky-shader sky. | Hero title, supporting line, two CTAs |
| 0.20–0.38 | **Approach and climb.** Dam ahead; drone rises to crest height, skims the crest road (railings, lamps, intake tower), out over the downstream side. | Project intro, verified location |
| 0.38–0.52 | **Turn-back reveal.** 180° banking descent facing the dam: concrete face, spillway gates, white-water sheets, plunge-pool mist, penstocks down to the toe. | The river, run-of-river, no large reservoir claim |
| 0.52–0.64 | **To the powerhouse.** Glide along the tailrace: warm windows, transformer yard, pylons climbing the hillside with sagging lines. | Powerhouse, grid connection |
| 0.64–0.72 | **Cutaway.** Walls dissolve as the camera enters; interior lights come up. | "How hydropower works — illustrative" |
| 0.72–0.94 | **How electricity is made.** Flow through penstock → spiral casing → Francis runner spins up → shaft → generator (rotating field glow) → busbars → transformer → lines. Anchored HTML labels with leader lines and verified facts. | Penstock · Turbine · Generator · Grid |
| 0.94–1.00 | **Settle** on a hero framing of the machine hall; page continues below. | Capacity facts, investor link |

Reverse scrolling replays everything backwards without pops.

## Visual quality bar

- Physically based lighting: sun DirectionalLight with soft shadows on key geometry, hemisphere fill, procedural sky → PMREM environment, ACES tone mapping, exponential fog tuned to the horizon, half-resolution UnrealBloom (sun glitter, foam, windows, energy pulses), vignette. Mobile: no bloom, no planar reflection, lower DPR.
- Terrain: 256² heightfield (fbm + carved valley), slope/height-blended shader (grass, forest floor, rock, snow) with procedural micro-noise; ≥ 8k instanced conifers with wind sway and colour variance; rocks along banks.
- Water: planar-reflection water with a locally generated tiled normal map, Fresnel, sun specular, shoreline foam, downstream turbulence.
- Dam, powerhouse, pylons, penstocks, machine hall: convincing proportions, bevels, seams, bolts, railings, lamps, gates, emissive windows, concrete/steel/copper PBR.
- Camera: CatmullRom position and target paths, arc-length parameterised, eased per segment, banking from curvature, sub-pixel handheld noise.
- Poster = a real screenshot of frame 0 of this scene (desktop and mobile crops).

## Engineering rules

One canvas; poster-first; scene chunk deferred until after first paint/idle; WebGL2 probe; quality tiers by device plus runtime frame-time feedback (one-way degrade); frameloop paused when offscreen or hidden; single progress store (GSAP owns the target, a ticker damps it, the scene reads it); no per-frame React state; readiness only after a rendered frame; error or context loss → 2D fallback; reduced motion → static complete layout. Facts only from `content/sources.ts`. The visual is labelled "Concept visualisation".

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; Playwright screenshots at eight forward and three reverse scroll stops on desktop and mobile; clean console; mobile must not download desktop-only assets; Lighthouse against the production build with conditions reported.
