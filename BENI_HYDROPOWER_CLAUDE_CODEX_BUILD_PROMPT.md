# Beni Hydropower — combined Claude–Codex build prompt

Complete frontend sales-demo brief plus a real two-agent collaboration workflow.

## How to use this file

1. Save this file beside your project's `package.json` and open that project folder in VS Code.
2. Give this file to **Claude Code**, which will coordinate with the installed Codex companion. Do not submit the entire build independently to both chat panels.
3. Your earlier setup report said Codex was installed and authenticated. Confirm the companion is available in the current project/session; there is no need to reinstall a working setup.
4. Keep the automatic review gate disabled unless you explicitly choose otherwise. The workflow below already includes deliberate review checkpoints.
5. If your TypeScript Next.js project and dependencies already exist, preserve them. Do not run `create-next-app` again or create a nested duplicate project.

Send this message in Claude Code:

```text
Read @BENI_HYDROPOWER_CLAUDE_CODEX_BUILD_PROMPT.md in full and execute its
implementation brief. Follow Section 0 for actual Claude–Codex collaboration
and Sections 1–10 for the website. Begin with workspace inspection and a
read-only Codex architecture review, then divide file ownership and build.
Preserve the existing TypeScript setup. Do not simulate Codex participation.
```

## Preservation and interpretation

All text from the original `BENI_HYDROPOWER_BUILD_PROMPT(1).md` is retained below, including its opening instructions, Sections 1–10, image-generation brief, asset handover, and references. Section 0 is an addition, not a replacement for any website requirement.

Within the implementation brief, **“you” means Claude Code as lead developer and coordinator**. Codex must receive the complete brief and the specific task assigned to it. The collaboration rules determine who does the work; the original brief continues to determine what must be built and how it is judged.

The company research dates and source-access limitations in the original are historical notes, not a claim that those sources were reverified when this file was combined. Verify current company facts as Section 2 requires. The image brief is an asset-production instruction, not text to publish on the website.

The companion runs actual Codex tasks; this workflow does not merge two independent VS Code chat histories. OpenAI documents the [Codex plugin for Claude Code as the recommended integration](https://learn.chatgpt.com/docs/mcp-server#running-codex-as-an-mcp-server). Use the installed plugin's own command/skill definitions for its current invocation syntax.

---

**Beni Hydropower — impressive frontend sales-demo build prompt**

Copy the implementation brief below into your coding agent, or put this file in the project root and ask the agent to implement it. The image-generation brief near the end can be used separately to prepare the first visual asset.

**Implementation brief begins**

You are my senior creative developer and frontend engineer working inside my VS Code workspace. Build a polished, working website concept for Beni Hydropower Project Limited in Nepal, presented by Techvion Technology Private Limited. I will send its link to the company's decision-makers to win their website project. Treat this as a tailored visual sales pitch. The client should immediately recognize their company, see a memorable level of visual craft, and understand how the proposed website serves their stakeholders.

Inspect the workspace and its existing instructions before making changes. Preserve unrelated work. If the folder is empty, scaffold the project. Make reasonable implementation decisions, write the code, run it, inspect the result, and fix problems. Complete the working demo instead of stopping after a plan or scaffold. Work within the tools and permissions available in this session. If visual assets are missing, keep the local demo usable and clearly report what needs replacing. The demo must require no service credentials.

0. **Mandatory Claude–Codex collaboration**

### Roles and genuine participation

You are Claude Code, the lead creative developer, visual director, frontend engineer, and final integrator. Work with the actual OpenAI Codex companion as an engineering collaborator. Claude owns the overall experience and final decisions; Codex contributes independent architecture analysis, meaningful implementation or debugging, and code review.

Do not role-play Codex, invent its findings, or label a second Claude agent as Codex. Both agents must make verifiable contributions. Codex must complete at least one substantive, bounded implementation task or genuine code-fixing task in addition to reviews. A plan, generic advice, or a cosmetic file change alone does not meet this requirement.

### A. Inspect and confirm before building

- Read this entire file and the repository's existing instructions, including `AGENTS.md` and `CLAUDE.md` where present. Preserve unrelated work and existing instructions.
- Inspect the actual project root, Git status, package manager, lockfile, source layout, installed dependencies, supplied assets, and available verification tools. Reuse an existing scaffold; scaffold only if no application exists.
- Check that the actual Codex companion can be invoked from this Claude Code session. Use its exposed skills/tools and installed documentation. Chat slash commands are not ordinary shell commands: do not pass them to Bash or PowerShell.
- Use the already configured local authentication and model settings. Do not copy credentials into the repository, change models silently, or add API keys/services to the website. Agent authentication is separate from the credential-free demo.
- Launch a read-only architecture task and obtain an actual result before claiming collaboration works. A setup-ready message alone is not evidence of a completed Codex contribution.
- If an invocation is unavailable, inspect the installed interface and correct it. If Codex remains unavailable or a permission/authentication restriction blocks it, report the exact blocker and ask for direction. Do not bypass restrictions, loop indefinitely, or silently substitute a solo build.

### B. First checkpoint — independent architecture review

Before implementation, ask Codex to read this full file and inspect the current repository without modifying files. Supply the absolute project root and exact prompt-file path; do not assume Claude's chat history or an `@` mention is automatically available to Codex.

Request an actionable assessment of:

- Next.js Server/Client Component boundaries and static prerendering.
- React, Three.js, React Three Fiber, Drei, and GSAP compatibility in the actual project.
- One scroll-progress source, one stage-positioning approach, lifecycle cleanup, and coherent reverse scrolling.
- Poster-first loading, genuinely deferred WebGL imports, and a mobile path that does not download unused desktop assets.
- Reduced-motion, unsupported-WebGL, context-loss, and failed-asset behavior.
- Feasibility of the supplied imagery, photo-to-schematic transition, and polished turbine/generator model.
- Shared component contracts, safe file ownership, verification commands, and performance/accessibility risks.

Evaluate the recommendations against the original visual priorities. Do not accept advice merely because Codex produced it, and do not allow a technically convenient solution to erase the signature animation.

### C. Shared foundation and ownership

Claude establishes or adapts the shared foundation before delegating dependent implementation: dependencies, configuration, base layout, content schema, asset manifest, and component interfaces. Use the project's real layout; if it uses `src/`, application paths belong under `src/`. Do not create parallel root and `src/` application trees.

Maintain a short, Claude-owned `docs/AGENT_COLLABORATION.md` (or an existing equivalent) with task IDs, owners, exact allowed paths, interface decisions, job/thread IDs when returned, status, and verification evidence. Keep this outside `public/`; it is a coordination record, not client-facing content.

Suggested ownership, refined after inspection:

| Area | Initial owner | Boundary |
| --- | --- | --- |
| App routes/layout, semantic hero, navigation, corporate/investor sections, visual styling | Claude | Use the existing source root; Claude integrates the final page. |
| Cinematic engine, procedural 3D assembly, scroll-progress logic, resource lifecycle, focused tests | Codex | Assign exact files within `components/cinematic/`, `lib/cinematic/`, and the actual test directory under the appropriate root. |
| Assets, local factual content, mobile art direction, Open Graph image | Claude | Codex can advise; transfer exact paths before delegating asset edits. |
| Configuration, dependency manifest/lockfile, global CSS, root layout, instruction files | Claude | Codex requests shared-file changes instead of making them during its task. |
| Integration, browser inspection, final verification, README and delivery | Claude | Codex supplies independent findings and test evidence. |

Before parallel work, agree on component props/types, progress ownership, asset paths, quality settings, readiness/error signals, chapter-change notifications, and which component controls sticky positioning or pinning. Ensure shared contracts do not import Three.js into the initial page bundle. Provide both agents the same decisions.

### D. Real implementation, with bounded parallel work

Delegate a substantive engine/model implementation or debugging task to Codex through the real companion. Use background execution when supported and useful. While it runs, Claude may build independent page sections or prepare assets within its own paths. Continue safe, relevant independent work where available.

Every delegated task must include:

1. Task ID, goal, absolute working directory, full brief path, and relevant current code/interfaces.
2. Exact allowed files/directories and explicit forbidden/shared files.
3. Concrete deliverables and acceptance criteria, including visual requirements when the task renders a scene.
4. Relevant constraints: frontend-only scope, TypeScript, one progress source/canvas, import deferral, reduced motion, cleanup, and factual accuracy.
5. Available verification commands and the required report: files changed, decisions, commands/results, unresolved issues, and integration instructions.
6. A requirement to report scope conflicts before touching another owner's files, and not to launch further agents or delegate back to Claude.

Use at most one active Codex implementation task initially. Parallelism is for independent work, not a requirement to edit concurrently at every stage. If dependencies overlap, sequence the tasks.

Editing and runtime rules:

- Never let both agents edit the same file concurrently. Directory ownership is a coordination agreement, not an automatic filesystem lock.
- Codex must not edit `package.json`, any lockfile, global CSS, root layout, framework/TypeScript/linter configuration, or repository instruction files unless Claude explicitly transfers ownership while pausing its own edits.
- Claude must not revise Codex-owned files while that task is active. Request changes through the companion, or wait for completion and explicitly take over.
- Do not run simultaneous installs or competing production builds in the same checkout. Claude coordinates shared dependencies and final builds.
- Prefer the existing checkout with non-overlapping ownership. If separate Git worktrees are necessary, define paths, branches, and integration ownership; changes in different worktrees are not automatically visible to each other.
- Preserve user changes. Do not reset/clean the repository, broadly stage unrelated files, push, publish, or purchase services without the relevant user authorization.
- Keep the automatic stop/review gate disabled. Do not create reciprocal agent calls or an unbounded review loop.

### E. Handoff and second checkpoint — cinematic integration

Track the real job ID if available, use the companion's supported status/result mechanism, and obtain the completed result before depending on it. Report useful milestone updates to the user; do not require the user to manually relay every agent message.

After Codex finishes, Claude inspects the actual diff and verifies the task criteria. Reconcile interfaces, accept or revise the contribution, and explicitly change ownership before editing those files. Neither a completion message nor a passing type check proves that the visual brief has been met.

When the signature scroll sequence is integrated, ask Codex for a read-only technical review of the relevant changes: scroll reversal, GSAP/R3F lifecycle, static HTML/hydration, client boundaries, idle/offscreen rendering, GPU resources, mobile downloads, accessibility, and fallbacks. Supply the review target and available browser evidence.

Pause edits to the review target until findings return, or review a fixed committed snapshot, so findings refer to a stable code state. Claude evaluates and resolves valid findings while preserving the intended visual impact.

### F. Third checkpoint — final review and verification

Apply this workflow throughout the implementation order in Section 10; do not finish the entire site alone and involve Codex only at the end.

After the desktop/mobile visual pass and local checks, have Codex review the complete application changes read-only. Give it an explicit target that includes all demo work, not merely whichever uncommitted files remain. Include relevant new/untracked files; if the work is committed, identify the actual baseline/current revision. Never assume a branch named `main` exists.

Claude must independently inspect desktop and mobile, forward/reverse scrolling, anchor jumps, skip-link focus, resizing/orientation, reduced motion, asset failures, and unavailable WebGL where tools permit. Codex's code review does not replace browser-based visual inspection.

Investigate every significant finding. Fix valid problems, briefly explain rejected recommendations, and rerun relevant checks after fixes. Allow at most two normal fix/review cycles per checkpoint. If a critical defect remains after that, report it and request direction rather than looping indefinitely or marking it passed.

Use the repository's actual lint, type-check, test, and production-build commands. If a needed script is absent, Claude may add a suitable script consistent with the installed framework, or run the corresponding installed tool directly. Do not report a nonexistent `npm run typecheck` as executed. Run shared build checks sequentially after integration.

All performance measurements, screenshots, test outcomes, source verification, and deployment status must reflect actual observations. If a tool is unavailable, record the verification limit rather than inventing evidence. Prepare deployment instructions; do not publish or buy a plan without the user's authorization.

### G. Completion evidence

In addition to Section 10's handover, summarize what Claude implemented; what Codex actually implemented or fixed; the real architecture/midpoint/final review results; significant findings resolved or rejected with reasons; commands and observed results; and unresolved limitations.

A collaborative completion requires the finished frontend demo, a genuine Codex implementation/fix contribution, and the three intentional review checkpoints. If any condition cannot be met, identify it clearly. A coordination report alone is not the deliverable: the polished Beni Hydropower sales demo remains the goal.


1. **Goal and scope**

Create a cinematic, responsive corporate website with a scroll-controlled hydropower experience, readable company content, and a useful investor information section. The visual concept is a journey from a Himalayan river to electricity generation.

The deliverable is a complete FRONTEND-ONLY sales demo. The primary objective is a strong client impression and a credible reason to hire Techvion. Prioritize art direction, a striking opening, a memorable scroll sequence, polished mobile presentation, and useful investor information. Loading speed supports these goals: the first view must already feel premium while heavier effects progressively become ready. Use local TypeScript or JSON content and optimized local assets. Do not build or scaffold a backend, MongoDB integration, Cloudinary integration, API routes, authentication, admin panel, uploads, email delivery, or environment-variable setup. Prepare the project for Vercel deployment and document the steps. Report deployment as complete only if it actually happens.

Apply this priority order when making tradeoffs: a visually convincing, company-specific opening; a coherent and impressive animated story; clear corporate information and investor access; responsive interactions and smooth loading; then optional technical embellishments. Speed remains a quality requirement, but a plain template with an excellent performance score does not fulfill this brief. Optimize delivery, rendering, and asset size before weakening the signature animation. A beautiful fallback is essential, but it does not replace completing the intended animated experience on capable devices.

Use a restrained, visible label: “Independent website concept by Techvion.” Label the generated hero “Concept illustration.” The demo must be clearly identifiable as a proposal when someone receives its link.

2. **Company facts and content**

Use the name Beni Hydropower Project Limited. Research available primary sources before adding project statistics or IPO details. The SEBON prospectus landing page is https://www.sebon.gov.np/prospectus/beni-hydropower-project-limited.

Research checked on September 7, 2026 identified Beni with the Upper Solu Khola project in Solukhumbu, a run-of-river scheme. ICRA Nepal's indexed September 27, 2023 rating rationale identifies 19.8 MW installed capacity. Some secondary pages still report 18 MW. Verify the latest prospectus or company material before putting a numeric capacity in public copy. Installed capacity must never be labeled as live generation.

Do not invent IPO dates, subscription figures, share prices, financial returns, directors, addresses, achievements, annual energy output, environmental benefits, or beneficiary counts. When a fact cannot be confirmed, omit it from public copy and record the missing content in the handover. Store factual content separately from components, with source URL and verification date where appropriate.

The company domain reported in public listings is benihydro.com.np. It could not be retrieved reliably during initial research; do not claim to have reviewed its current design unless you can actually access it.

Use a typographic wordmark until an approved logo is supplied. Use supplied photographs and brand assets when available. All calls to action must lead somewhere useful. The confirmed SEBON prospectus landing page is a suitable real investor-document link. Do not fabricate downloadable reports or create buttons that silently do nothing.

3. **Technology choices**

Use Next.js App Router, TypeScript, React, and Tailwind CSS. Use mutually compatible, current stable package versions; inspect the existing package manager and preserve its lockfile workflow. Check compatibility between React, Three.js, React Three Fiber, and Drei before installation.

Use Three.js through @react-three/fiber. Include selected @react-three/drei helpers only when actually needed. Use GSAP, ScrollTrigger, and @gsap/react for scroll coordination and lifecycle cleanup. Use native document scrolling for this demo. Do not add Lenis or another smooth-scroll package by default: smoothness must come from efficient rendering and coordinated animation, not extra dependencies.

Use one coherent animation system. Do not add another animation library for effects already handled by GSAP or CSS. Keep simple hover effects and basic reveals in CSS. Avoid a separate Express server, global state library, or admin framework.

Use Vercel to deliver the Next.js application and its static assets. The 3D rendering runs in the visitor's browser. Content must render without client-side API requests. Keep large source artwork outside public build assets; serve only optimized derivatives. Do not introduce external services solely for this demo.

4. **Visual direction**

Make the design feel like a carefully art-directed energy company website. Use deep forest green, charcoal, warm off-white, and restrained blue accents inspired by river water. Use spacious layouts, strong typography, fine separators, and large photography. Keep financial documents and notices crisp and easy to scan.

Design the first viewport as the cover of the proposal. It must be visually compelling even as a screenshot: recognizable company name, exceptional hydropower imagery, confident typography, a clear project identity, restrained navigation, and a readable invitation to scroll. Give the client something beautiful immediately; do not begin with a blank canvas, a long loader, or a percentage counter. Add a short, subtle entrance for the title and foreground once the poster is visible, with the final content available immediately for reduced motion. Do not make the headline depend on completion of an intro animation.

Make one signature transition the memorable moment: follow the river visually, let foreground scenery pass the camera, then use atmosphere and a carefully timed crossfade to reveal the separate turbine-and-generator assembly. Shape the sequence with camera easing, lighting, scale, depth, and typography. Preserve realistic limits of the photo-based scene. The client should experience a coherent journey instead of a collection of unrelated effects.

Give the 3D assembly a refined industrial appearance using convincing proportions, controlled metallic materials, restrained lighting, and a clean background. Use tightly framed camera angles and deliberate motion. Default primitives with flat colors and arbitrary spinning do not meet the visual standard. Procedural geometry is acceptable when the final render looks intentional and polished; identify any missing visual asset that prevents that quality.

Use one legible font family with a considered weight hierarchy and only the font files or weights actually used. Prefer locally served WOFF2 assets through Next.js font tooling with suitable fallbacks. Avoid runtime third-party font stylesheets. Prepare the layout for future Nepali content, but do not download unused language subsets or add a language toggle unless both languages work. If a font download is unavailable in the environment, use a suitable local fallback so the preview still starts.

Suggested conceptual hero headline: “From Himalayan water to lasting energy.” Supporting copy should briefly explain the project without unsupported claims. Primary action: “Explore the project.” Secondary action: “Investor information.”

Avoid visual clutter, excessive glass effects, neon gaming aesthetics, and a page made entirely from interchangeable cards. Let the hero carry the spectacle and the document sections carry the detail.

5. **Asset strategy: photo-based environment plus separate 3D explanation**

The initial environment is 2.5D: an image-based composition with depth layers and restrained camera movement. A single photo does not contain the hidden geometry required for a full orbit, a view behind buildings, or a fly-through of the plant. Do not simulate those moves with extreme image distortion.

Look for supplied assets in source-assets and public/assets/hydro. If there is one generated photograph, create an optimized poster from it and preserve the master outside public. If only that image exists, first implement a gentle push-in and framing shift. Do not manufacture visible segmentation artifacts just to claim multiple layers.

For the enhanced version, prepare aligned image plates from the SAME approved composition: a clean distant background; a transparent middle-distance landscape/infrastructure layer; a transparent foreground layer; and a separate water mask. Transparent mist may be a small reusable texture or a restrained procedural effect. Inpaint exposed areas behind removed foreground objects. Keep the plates aligned and use sufficient overscan to avoid revealing image edges during movement.

Place the plates on textured planes at different depths. Scale them so their initial projection reconstructs the original composition. Keep the camera motion small enough that flat layers remain believable. Manage transparency and draw order deliberately. Apply the appropriate color space to color textures, and preserve masks as data textures.

Animate water only within a prepared water mask, using very subtle UV movement or an inexpensive shader. Keep buildings and mountains rigid. Use faint mist sparingly. If the water mask is unavailable, keep the image stable rather than distorting the whole scene.

Crossfade from the photographic environment into a separate, elegant 3D schematic of water moving through a penstock, turning a turbine, driving a generator, and connecting to the grid. Clearly label this “How hydropower works — illustrative.” Build a simple, well-composed procedural model with Three.js geometry for the demo. Do not suggest it is an exact engineering model of Beni's equipment.

An approved Blender-exported GLB can replace the procedural assembly later. A full 3D valley or accurate plant walkthrough requires separate modeling work or suitable reference assets; keep that outside the dependency chain of this first demo.

If image-generation tools are available, use the image brief below. Otherwise build the page with a clearly identified temporary visual, keep asset replacement straightforward, and report the exact asset needed. Never claim that an unavailable image or 3D file was created.

6. **Scroll sequence**

Use a cinematic section around 360 viewport heights on desktop with a sticky stage one viewport high. Tune the length after browser inspection. Use either CSS sticky or ScrollTrigger pinning for that stage, not both. Keep normal page scrolling and working anchor navigation.

Map the cinematic section's effective scroll range to one normalized progress value from 0 to 1:

| Progress | Visual action | Content |
| --- | --- | --- |
| 0–0.18 | Wide Himalayan valley composition; restrained depth and atmospheric motion | Company name, headline, both primary links |
| 0.18–0.43 | Gentle camera push toward the river; foreground moves more than background | Short project introduction and verified location |
| 0.43–0.60 | Crossfade into the independent 3D schematic | Brief explanation of the water-to-power process |
| 0.60–0.83 | Trace water through the penstock; turn the turbine and generator; show an abstract grid connection | Short, readable explanatory labels |
| 0.83–1.00 | Settle the composition and transition to the normal document page | Verified project information and investor-section link |

Use one mutable progress object as the common input. GSAP owns the scroll target. React Three Fiber reads progress inside useFrame and applies camera/object changes with time-based interpolation. Do not call React setState for every scroll pixel or animation frame. Update chapter state only when a boundary changes. Keep visible HTML text synchronized with the same progress source.

Make reverse scrolling coherent. Refresh layout measurements after relevant assets and fonts settle. Handle resized windows, mobile orientation changes, and anchor jumps. Clean up ScrollTriggers, observers, ticker callbacks, and listeners when components unmount.

Include a visible “Skip animation” link. Animation must not trap the reader or delay access to investor documents. Avoid autoplay audio and forced scroll snapping.

7. **Normal website content**

After the cinematic section, provide the following content in ordinary document flow: project overview; verified project highlights; investor information and the real prospectus link; notices and reports; project gallery when assets exist; and contact information when verified.

Use clear empty states for unavailable documents and photographs. Do not fill the page with invented corporate news. Use verified email or telephone links for contact when supplied. Omit a submission form for this frontend-only demo. Keep the “Independent website concept by Techvion” attribution in the footer.

8. **Next.js architecture**

Prerender the page from local content so the initial response contains headings, body copy, navigation, and investor-document links as semantic HTML. Keep routes static and verify that in the production build output. Next.js Server Components can produce this HTML at build time without creating a custom application backend. WebGL is a visual enhancement, never the only place essential content exists. The page should remain useful if JavaScript or WebGL fails.

Put the scene behind a small Client Component boundary. If using next/dynamic with ssr: false, declare it inside a Client Component, as required by Next.js. Do not make the entire page client-only to accommodate the canvas.

Use one WebGL canvas for the cinematic experience. Show an optimized poster and usable HTML immediately. Keep Three.js, React Three Fiber, scene helpers, and shaders inside the deferred scene import; do not pull them into the initial bundle through shared imports. Mount the eligible desktop scene after the initial poster is visible and the browser has an opportunity to paint, with a bounded idle scheduling fallback or user-interaction trigger. Merely setting ssr: false does not defer the download if the component mounts immediately. Synchronize to the current scroll position when it loads, and replace the poster only after a successful rendered frame. Do not block navigation or reading on scene readiness. Use Suspense and an error boundary, but keep errors or long loading times from leaving a blank hero. When the section is offscreen or the tab is hidden, stop unnecessary continuous rendering and effects.

Organize the code into clear responsibilities: local page content; cinematic wrapper; canvas and scene components; camera/scroll configuration; asset manifest; and quality settings. Keep camera keyframes and visual tuning values in a small configuration module so they can be adjusted without rewriting components. Do not create speculative backend abstractions.

9. **Performance and accessibility**

Optimize for an ordinary phone and a typical mobile connection. Aim for a mobile hero poster around 150–250 KB, desktop poster around 300 KB, and combined deferred desktop scene assets around 3 MB or less. These are measured design budgets, not guaranteed results. Retain visual quality and report any justified overrun. Keep original high-resolution artwork outside the shipped public directory. Remember that small compressed files can still occupy substantial decoded GPU memory.

Use next/image appropriately for the HTML poster and content images, with accurate responsive sizes and reserved dimensions or a stable aspect ratio. Give only the initial hero image the version-appropriate high-priority/preload treatment. Lazy-load below-the-fold images. Produce WebP or AVIF derivatives for ordinary photographs when they preserve quality; choose transparent image formats deliberately for scene layers. Three.js textures need actual optimized image URLs, not React image components. Do not fetch the full-resolution master or all responsive variants on first load.

Use normal Vercel deployment with static prerendering and platform image optimization where appropriate; a custom backend is unnecessary. Do not add output: export merely to describe the app as frontend-only. If a true static export is later requested, supply preoptimized responsive image derivatives or a suitable loader because default Next.js image optimization requires hosting support.

Use versioned asset filenames and appropriate hosting cache behavior. Do not apply immutable caching to HTML or mutable asset URLs. Keep the initial request path free of analytics, video embeds, interactive maps, third-party widgets, unnecessary icon sets, and giant image sequences. Use direct imports and inspect the resulting bundles before adding optimization packages.

Cap desktop device pixel ratio around 1.5, reduce expensive transparency, and use simple lighting without real-time shadows or heavy postprocessing for this demo. Begin with color textures around 2048 pixels on the longest side or smaller where sufficient. Use a small scene and reuse geometry/materials. Load nonessential assets later. Dispose of resources when no longer owned or needed. Use demand-driven rendering for sections that can be static; request frames while scroll interpolation or visible effects need them. Frame-based effects must stop when the experience is inactive.

Assume the client may first open the link on a phone from WhatsApp. Art-direct the mobile composition independently: keep the plant or river visible, use strong typography, and provide a deliberate animated journey with restrained image scaling, foreground parallax, and synchronized chapter transitions. Use transforms and opacity efficiently for the lightweight mobile path. Avoid making mobile an afterthought or stripping its visual identity down to a generic static banner. Gate heavyweight scene imports before downloading them, so the lightweight mobile path does not fetch unused desktop textures or Three.js. A reduced-complexity WebGL scene is welcome on capable phones if measured performance justifies it. Keep touch scrolling natural and all information accessible.

Respect prefers-reduced-motion with a static, complete layout that removes the long pinned sequence. Handle unsupported WebGL, context loss, and failed asset loading with a beautifully composed fallback. Use runtime performance feedback to reduce quality when necessary rather than relying solely on screen width as a proxy for device capability.

Maintain contrast, keyboard navigation, visible focus, proper headings, useful alt text, and comfortable touch targets. Inactive overlay chapters must not intercept clicks or remain confusingly exposed to assistive technology. The skip link must move the reader and keyboard focus to meaningful content.

10. **Implementation and verification**

Proceed in this order: exceptional first viewport using local content and an optimized poster; complete signature desktop scroll sequence and refined 3D energy schematic; intentionally designed mobile experience and reduced-motion fallback; corporate sections and interaction polish; asset and bundle optimization; final browser review and handover. Continue through these stages without asking for approval for routine local edits. If an effect makes the page materially slower, first improve its assets, loading strategy, and rendering cost. If simplification is still necessary, preserve the dramatic moment and composition.

Review the website as a prospective client: Is Beni's identity obvious on arrival? Does the first viewport look convincing before any scrolling? Is there a memorable animation worth showing a colleague? Does the river-to-power story remain coherent in reverse? Can investors reach the prospectus easily? Does it still look premium on a phone? Inspect representative screenshots and the actual scrolling experience; code correctness alone is insufficient. Prioritize finishing a short, excellent presentation over filling out many weak sections.

Prepare an attractive local social-share image with the concept's typography and visual identity, and appropriate Open Graph title and description, so the link is presentable when shared. After a deployment URL exists, use absolute image metadata URLs and check they are publicly fetchable. Do not invent a deployment URL or promise a particular messaging-app preview without checking it. Keep the page visibly labeled as an independent concept.

Run the project's actual production build, TypeScript checks, and configured lint command. Open the site and inspect desktop and mobile layouts if browser tools are available. Check forward/reverse scrolling, anchor navigation, the skip link, resized layouts, reduced motion, asset failure, and unavailable WebGL. Resolve visible gaps, unreadable text, hydration errors, console errors, and broken links. Add focused tests only where they protect a meaningful behavior.

Measure the production build, not the development server. Use a cold-cache mobile-throttled run and an unthrottled desktop check where tooling permits. Inspect the network waterfall: the hero must start early, below-the-fold images must be deferred, and mobile fallback must not download the desktop 3D scene. Check layout stability while fonts, imagery, and the canvas load. Measure both initial loading and responsiveness during scrolling; a good loading score alone does not prove smooth animation. Aim for LCP at or below 2.5 seconds and CLS at or below 0.1 under clearly reported conditions. Treat these as targets, not promises or field-data claims. Report actual measurements and test conditions, not invented scores or a guaranteed frame rate. If tooling is unavailable, state the resulting verification limit.

Finish with a working demo and a concise README explaining install/run/build commands, local content edits, asset replacement, factual content sources, performance measurements, and Vercel deployment. No database, media-service account, secrets, or custom backend should be required to run the demo. Vercel's Hobby plan is restricted to personal, non-commercial use, so plan a suitable commercial deployment tier for the client proposal. Do not purchase or enable paid services merely to complete the local build.

In your final handover, state what works, how to open it, what was tested, and which visual assets remain outstanding. Include a short performance summary with asset sizes and measured results where available. Deliver the frontend-only demo as the completed scope; do not treat absent backend features as unfinished work.

**Implementation brief ends**

**Generated image brief**

Create a photorealistic, cinematic environment image for the hero of a premium Nepalese hydropower company website. This is a conceptual illustration inspired by a run-of-river hydropower setting in Solukhumbu, Nepal; it is not documentary evidence of an actual named plant.

Use a wide 16:9 landscape composition, ideally a 3840 by 2160 working master if supported. Show a steep, green Himalayan river valley, believable Nepalese foothill terrain, distant mountain ridges, a naturally flowing river, and modest hydropower infrastructure plausibly integrated into the landscape. Include a low diversion structure in the middle distance and a restrained powerhouse area beside the river. Infrastructure should have credible scale, materials, access roads, and perspective. Avoid an enormous reservoir or monumental concrete dam.

Compose the plant and river in the middle-right of the frame. Reserve a calm, darker upper-left area for white HTML text to be added later. Keep the main subject away from extreme edges and leave useful overscan for a modest camera push-in. Build clear depth with foreground vegetation and rocks along the lower edges, a distinct middle-distance valley, and clean distant ridges and sky. Use soft morning light, delicate valley mist, rich forest greens, natural blue-green river tones, and realistic atmospheric perspective. Keep the lighting restrained and the image readable after a mobile crop.

Use documentary photographic realism with detailed natural textures. No text, letters, logos, watermark, graphic overlays, surreal machinery, impossible piping, fantasy waterfalls, artificial neon colors, or exaggerated infrastructure. Produce one coherent master image first. Additional animation layers should be derived from this approved composition so their perspective and alignment match.

**Useful asset handover**

Keep the original supplied master in a source-assets directory outside public, and preserve it. Ship only optimized derivatives in public/assets/hydro, such as hero-mobile.webp, hero-desktop.webp, background.webp, midground.webp with transparency, foreground.webp with transparency, and water-mask.png. File formats may change when testing shows a better result; do not rename extensions without actually converting the content. A mobile-specific crop should retain the subject and keep text readable. If the master was initially supplied under public, move it out after producing the derivatives and update references.

**Source notes and implementation references**

- SEBON provides the company's prospectus landing page: https://www.sebon.gov.np/prospectus/beni-hydropower-project-limited.
- ICRA's indexed 2023 rationale supports the initial installed-capacity and run-of-river identification. The PDF could not be fetched in this research session; verify current corporate figures before live use: https://www.icranepal.com/wp-content/uploads/2023/12/A.471-Beni-Hydropower_Fresh-Issuer-Rating-and-Fresh-BLR_Sept-2023-_Final.pdf.
- React Three Fiber is the React renderer for Three.js: https://r3f.docs.pmnd.rs/.
- Drei supplies optional scene helpers: https://drei.docs.pmnd.rs/.
- GSAP ScrollTrigger coordinates scroll-driven animation: https://gsap.com/docs/v3/Plugins/ScrollTrigger/.
- GSAP's React integration documents useGSAP and cleanup: https://gsap.com/resources/React/.
- Next.js documents the Client Component requirement for ssr: false: https://nextjs.org/docs/app/guides/lazy-loading.
- Blender documents glTF/GLB export for separately modeled assets: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html.
- GIMP documents transparency through layer masks: https://docs.gimp.org/2.8/en/gimp-dialogs-structure.html.
- Vercel documents the Hobby plan's non-commercial restriction: https://vercel.com/docs/plans/hobby.
- OpenAI describes Astra's intended use for complex work: https://learn.chatgpt.com/docs/models.
- Codex's VS Code workflow is documented here: https://learn.chatgpt.com/docs/codex/ide.
