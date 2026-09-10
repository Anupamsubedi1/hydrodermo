# Build record — Beni Hydropower sales demo

Coordination and verification log. Not client-facing.

Project root: `D:\beni_hydro\my-app` (git `main`, baseline commit `d69608d`). Package manager: npm.

## How the build ran

The original brief (`BENI_HYDROPOWER_CLAUDE_CODEX_BUILD_PROMPT.md`) required a Claude–Codex collaboration.
That ran through checkpoint 1 and one delegated implementation task, then **the user reviewed the result,
rejected the 2.5D illustration hero, and directed Claude Code to rebuild the hero as a real Three.js
cinematic and to continue solo without Codex.** Everything after task C2 is Claude Code's own work.
The current brief for the hero is `docs/HERO_CINEMATIC_BRIEF.md`.

Codex companion used for C0–C2: plugin `openai-codex/codex` 1.0.6, codex-cli 0.153.4, ChatGPT login, review
gate disabled, invoked through the companion's `task` runtime with prompt files kept outside the repository.

| ID | Kind | Owner | Job / session | Status | Outcome |
| --- | --- | --- | --- | --- | --- |
| C0 | Companion readiness probe | Codex | thread `01a08541-30f9-7a20-b27d-875a610be9a4` | done | `setup --json` ready; live thread answered |
| C1 | Read-only architecture review | Codex | job `task-mttucuxe-7ypwbv`, session `01a0854c-f2b3-7201-83df-e6afdf8678e5` | done, 3m03s | 7 findings (5 major); all accepted, see below |
| C2 | WebGL scene implementation | Codex | job `task-mttv1xkm-fw2dlp`, session `01a0855e-c8a2-7fa3-ad37-413afa751ea2` | done, 16m21s | Delivered a working 2.5D plate scene + 13 tests; **superseded and removed** when the user rejected that visual direction |
| H1 | Real-time 3D cinematic hero | Claude | — | done | Terrain, water, forest, dam, powerhouse, machine hall, camera path, effects, fallbacks |

C1's findings that still shape the code, even after the rewrite:

| Finding | How it survives today |
| --- | --- |
| Progress must not depend on the optional renderer | The wrapper owns the damping clock; the scene only reads `progress.current`. |
| Mobile must not download desktop-only assets | The scene chunk is only imported by `components/cinematic/scene/**` and mounted behind a gate; the fallback uses the same poster the page already loaded. |
| Readiness needs a real rendered frame | `onReady` fires from the render loop after the first successful `render()`, then the poster crossfades out. |
| Errors need typed kinds and a latch | `onError` distinguishes load/context/asset/shader/render and disables the scene for the page lifetime. |
| `next/font/google` throws at build if the download fails | Instrument Sans (OFL) is committed under `app/fonts/` and loaded with `next/font/local`. |
| `priority` is deprecated in Next 16 | The poster uses `getImageProps` with eager loading and high fetch priority per breakpoint. |
| Node tests need explicit `.ts` imports and erasable syntax | Tests import with `.ts` extensions; a constructor parameter property was removed after Node rejected it. |

## Defects found and fixed during verification

| Defect | Fix |
| --- | --- |
| Progress lagged badly on slow frames because each frame's delta was clamped to 50 ms | `advance()` splits a frame into bounded sub-steps, so damping is frame-rate independent and still bounded after tab suspension (covered by a test) |
| Camera dipped below the terrain near the powerhouse | A level bench was cut for the plant site; a test now asserts clearance above terrain and water across the whole path |
| Trees grew through the plant platform and the flight corridor | Placement excludes the bench and structures |
| Turbine was invisible from above (generator sits on the same axis) | The machine floor is a slab with open pits; a pit light ramps during that station |
| Roof ghost cluttered the settle frame; equipment stayed translucent | The roof lifts and fades to zero, walls keep a faint ghost, and x-ray reveals reverse before the final frame |
| Anchored labels collided with the mobile step list | Labels are desktop-only; they also fade out for the settling frame |
| Contrast and accessible-name failures | Faint text tokens darkened/lightened, header wordmark no longer overrides its own name; accessibility is 100 |

## Verification evidence

Commands run against the production build on this machine:

```
npm run typecheck   → clean
npm run lint        → clean
npm test            → 15 tests, 15 pass
npm run build       → compiled; / and /opengraph-image.png prerendered as static
```

Browser checks with Playwright + Microsoft Edge 152 (headless): sixteen forward progress stations plus a
reverse pass on desktop 1440×900; mobile 412×915; WebGL disabled; reduced motion. Skip link moves focus to
the project heading. Console is clean apart from two informational Three.js notices.

Lighthouse 12.6.1 numbers and the software-rendering verification limit are recorded in `README.md`.
