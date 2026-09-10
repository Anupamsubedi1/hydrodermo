"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CHAPTER_COPY, HERO, PROPOSAL } from "@/content/site";
import { SCENE_DESKTOP_MIN_WIDTH, SCENE_IDLE_TIMEOUT_MS } from "@/lib/cinematic/config";
import { createProgressStore, type MutableProgressStore } from "@/lib/cinematic/progress";
import { degradeQuality, initialQuality, isSceneEligible, judgePerformance, readDeviceSignals } from "@/lib/cinematic/quality";
import type { AnchorId, AnchorPosition, Chapter, SceneError, ScenePerformanceSample, SceneQuality } from "@/lib/cinematic/types";
import { activeStation as activeStationAt, chapterOpacity, smoothstep, stationReveal } from "@/lib/cinematic/visuals";
import { ANCHOR_ORDER, ChapterOverlays } from "./ChapterOverlays";
import { HeroPoster } from "./HeroPoster";
import { HydroSchematic } from "./HydroSchematic";
import { Journey2D, type PlateSet } from "./Journey2D";
import { SceneLoader } from "./SceneLoader";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Mode = "poster" | "scene-loading" | "scene" | "journey";

/** Once WebGL fails or proves too slow we never try again for this page lifetime. */
let sceneDisabledForPage = false;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Live reduced-motion preference; false during server rendering (CSS handles the static layout before hydration). */
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
}

export function CinematicSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chapterEls = useRef<(HTMLDivElement | null)[]>([]);
  const anchorEls = useRef<Partial<Record<AnchorId, HTMLDivElement | null>>>({});
  const [store] = useState<MutableProgressStore>(() => createProgressStore(0));

  const reduced = useReducedMotion();
  const [chapter, setChapter] = useState<Chapter>(0);
  const [station, setStation] = useState(-1);
  const [mode, setMode] = useState<Mode>("poster");
  const [plates, setPlates] = useState<PlateSet>("desktop");
  const [quality, setQuality] = useState<SceneQuality | null>(null);
  const [active, setActive] = useState(true);
  const [imageryReady, setImageryReady] = useState(false);
  const posterLoadedRef = useRef(false);
  const posterWaiters = useRef<(() => void)[]>([]);

  // ----- poster load tracking (the img may have loaded before hydration) ----
  useEffect(() => {
    const img = stageRef.current?.querySelector<HTMLImageElement>("img[data-poster]");
    const done = () => {
      posterLoadedRef.current = true;
      posterWaiters.current.splice(0).forEach((fn) => fn());
    };
    // `complete` is also true for a failed image; either way there is nothing to wait for.
    if (!img || img.complete) {
      done();
      return;
    }
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    const safety = window.setTimeout(done, 4000);
    return () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      window.clearTimeout(safety);
    };
  }, []);

  const whenPosterLoaded = useCallback((fn: () => void) => {
    if (posterLoadedRef.current) fn();
    else posterWaiters.current.push(fn);
  }, []);

  // ----- scroll driver: one ScrollTrigger writes target, one ticker damps ---
  useGSAP(
    () => {
      if (reduced) {
        store.jump(0);
        return;
      }
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(1, section.offsetHeight - stage.offsetHeight)}`,
        onUpdate: (self) => store.setTarget(self.progress),
        onRefresh: (self) => store.setTarget(self.progress),
      });
      store.jump(trigger.progress);

      const tick = (_time: number, deltaTime: number) => {
        store.advance(deltaTime / 1000);
      };
      gsap.ticker.add(tick);

      let refreshTimer = 0;
      const refresh = () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
      };
      document.fonts?.ready.then(refresh).catch(() => undefined);
      whenPosterLoaded(refresh);
      window.addEventListener("orientationchange", refresh);

      return () => {
        gsap.ticker.remove(tick);
        trigger.kill();
        window.clearTimeout(refreshTimer);
        window.removeEventListener("orientationchange", refresh);
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  // ----- overlays, progress bar, chapter state (outside React per frame) ----
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const setters = chapterEls.current.map((el) => (el ? { o: gsap.quickSetter(el, "opacity"), y: gsap.quickSetter(el, "y", "px") } : null));
    const hint = stage.querySelector<HTMLElement>(".cine-scrollhint");
    let lastChapter: Chapter = store.chapter;
    let lastStation = -1;
    const apply = () => {
      const p = store.current;
      setters.forEach((s, i) => {
        if (!s) return;
        const o = reduced ? (i === 0 ? 1 : 0) : chapterOpacity(p, i as Chapter);
        s.o(o);
        s.y((1 - o) * 18);
      });
      stage.style.setProperty("--p", p.toFixed(4));
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p / 0.03));
      // Anchored labels reveal per station and clear for the settling frame;
      // their positions come from the scene.
      const labelsOut = 1 - smoothstep(0.95, 0.99, p);
      ANCHOR_ORDER.forEach((id, i) => {
        const el = anchorEls.current[id];
        if (!el) return;
        const reveal = (i === 4 ? stationReveal(p, 3) : stationReveal(p, i)) * labelsOut;
        el.style.opacity = reveal.toFixed(3);
      });
      if (store.chapter !== lastChapter) {
        lastChapter = store.chapter;
        setChapter(lastChapter);
      }
      const s = activeStationAt(p);
      if (s !== lastStation) {
        lastStation = s;
        setStation(s);
      }
    };
    apply();
    return store.subscribe(apply);
  }, [store, reduced]);

  // ----- active: intersecting and visible --------------------------------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let intersecting = true;
    const sync = () => setActive(intersecting && document.visibilityState === "visible");
    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // ----- presentation gate: WebGL after paint for eligible devices ---------
  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let armed = false;
    let idleId = 0;
    let timerId = 0;
    let decideFrame = 0;
    const listeners: Array<[string, EventListener]> = [];
    const hasIdle = typeof window.requestIdleCallback === "function";
    const cleanupListeners = () => {
      listeners.forEach(([type, fn]) => window.removeEventListener(type, fn));
      listeners.length = 0;
      if (idleId && hasIdle) window.cancelIdleCallback(idleId);
      window.clearTimeout(timerId);
    };
    const start = () => {
      if (cancelled || !armed) return;
      cancelled = true;
      cleanupListeners();
      if (!isSceneEligible(readDeviceSignals()) || sceneDisabledForPage) {
        setMode("journey");
        return;
      }
      setMode("scene-loading");
    };
    const arm = () => {
      if (cancelled) return;
      // Wait for the page's own load to finish, then for two painted frames, so
      // the scene build never competes with the first view.
      const afterLoad = () => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (cancelled) return;
            armed = true;
            if (hasIdle) idleId = window.requestIdleCallback(start, { timeout: SCENE_IDLE_TIMEOUT_MS });
            else timerId = window.setTimeout(start, 600);
            (["pointerdown", "wheel", "touchstart", "keydown"] as const).forEach((type) => {
              const fn: EventListener = () => start();
              window.addEventListener(type, fn, { once: true, passive: true });
              listeners.push([type, fn]);
            });
          }),
        );
      };
      if (document.readyState === "complete") afterLoad();
      else {
        const fn: EventListener = () => afterLoad();
        window.addEventListener("load", fn, { once: true });
        listeners.push(["load", fn]);
      }
    };
    decideFrame = requestAnimationFrame(() => {
      if (cancelled) return;
      const signals = readDeviceSignals();
      setPlates(signals.width < SCENE_DESKTOP_MIN_WIDTH ? "mobile" : "desktop");
      if (!isSceneEligible(signals) || sceneDisabledForPage) {
        setMode("journey");
        return;
      }
      setQuality(initialQuality(signals));
      whenPosterLoaded(arm);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(decideFrame);
      cleanupListeners();
    };
  }, [reduced, whenPosterLoaded]);

  // ----- scene callbacks ---------------------------------------------------
  const handleReady = useCallback(() => {
    setMode("scene");
    setImageryReady(true);
  }, []);

  const handleError = useCallback((error: SceneError) => {
    if (process.env.NODE_ENV !== "production") console.warn("[cinematic] scene unavailable:", error.kind, error.message);
    sceneDisabledForPage = true;
    setImageryReady(false);
    setMode("journey");
  }, []);

  const handlePerformance = useCallback((sample: ScenePerformanceSample) => {
    const verdict = judgePerformance(sample);
    if (verdict === "keep") return;
    setQuality((current) => {
      if (!current) return current;
      const next = verdict === "degrade" ? degradeQuality(current) : null;
      if (next) return next;
      sceneDisabledForPage = true;
      setImageryReady(false);
      setMode("journey");
      return current;
    });
  }, []);

  const handleAnchors = useCallback((positions: readonly AnchorPosition[]) => {
    for (const a of positions) {
      const el = anchorEls.current[a.id];
      if (!el) continue;
      el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
      el.style.visibility = a.visible ? "visible" : "hidden";
    }
  }, []);

  const handleJourneyLoaded = useCallback(() => setImageryReady(true), []);

  const skipToContent = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("project-heading");
    if (!target) return;
    event.preventDefault();
    document.getElementById("project")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
    history.replaceState(null, "", "#project");
  }, []);

  const showScene = (mode === "scene-loading" || mode === "scene") && quality !== null;
  const showJourney = mode === "journey";
  const posterHidden = imageryReady && (mode === "scene" || mode === "journey");

  return (
    <section ref={sectionRef} id="top" aria-label="Introduction" className="cine" data-mode={mode}>
      <div ref={stageRef} className="cine-stage">
        <HeroPoster hidden={posterHidden} />

        {showJourney && !reduced ? <Journey2D progress={store} plates={plates} onLoaded={handleJourneyLoaded} /> : null}

        {showScene && quality ? (
          <div className={`cine-canvas${mode === "scene" ? " is-ready" : ""}`} aria-hidden="true">
            <SceneLoader
              progress={store}
              active={active}
              quality={quality}
              onReady={handleReady}
              onError={handleError}
              onPerformance={handlePerformance}
              onAnchors={handleAnchors}
            />
          </div>
        ) : null}

        <div className="cine-grade" aria-hidden="true" />

        <ChapterOverlays chapter={chapter} activeStation={station} refs={chapterEls} anchorRefs={anchorEls} />

        <a href="#project" className="cine-chrome cine-skip motion-only" onClick={skipToContent}>
          Skip animation
        </a>
        <p className="cine-chrome pointer-events-none left-[var(--gutter)] bottom-[calc(env(safe-area-inset-bottom)+1.6rem)] hidden text-[0.72rem] tracking-[0.04em] text-[var(--on-dark-faint)] lg:block">
          {PROPOSAL.illustrationLabel} · real-time 3D, not a photograph of the plant
        </p>
        <div className="cine-chrome cine-scrollhint motion-only" aria-hidden="true">
          <span>{HERO.scrollHint}</span>
          <i />
        </div>
        <div className="cine-chrome cine-progress motion-only" aria-hidden="true">
          <span />
        </div>
      </div>

      {/* Reduced motion: the complete story as a static figure directly after the hero. */}
      <div className="reduced-only container py-16 text-[var(--on-dark)]">
        <p className="eyebrow text-[var(--river-300)]">{PROPOSAL.schematicLabel}</p>
        <h2 className="display-sm mt-3">{CHAPTER_COPY[5].title}</h2>
        <p className="mt-4 max-w-[40rem] text-[var(--on-dark-muted)]">{CHAPTER_COPY[5].body}</p>
        <figure className="mt-8 rounded-lg bg-[radial-gradient(120%_90%_at_60%_45%,#1b2b2b_0%,#0f1a1b_55%,#07171b_100%)] p-4 sm:p-8">
          <HydroSchematic />
          <figcaption className="mt-3 text-[0.8rem] text-[var(--on-dark-faint)]">{PROPOSAL.schematicLabel} — not an engineering model of Beni&apos;s equipment.</figcaption>
        </figure>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHAPTER_COPY[5].steps.map((s, i) => (
            <li key={s.id}>
              <span className="numeral text-[0.8rem] text-[var(--river-300)]">0{i + 1}</span>
              <p className="mt-1 font-semibold">{s.label}</p>
              <p className="mt-1 text-[0.95rem] text-[var(--on-dark-muted)]">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-[40rem] text-[var(--on-dark-muted)]">{CHAPTER_COPY[6].body}</p>
      </div>
    </section>
  );
}
