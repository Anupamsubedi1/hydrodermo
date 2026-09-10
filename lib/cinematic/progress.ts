// Progress store implementation. Pure TypeScript so it can be unit-tested with
// Node's test runner and shared by the WebGL scene and the 2D journey.

import { CHAPTERS, PROGRESS_DAMPING, PROGRESS_MAX_DT, PROGRESS_MAX_FRAME, PROGRESS_SETTLE_EPSILON } from "./config.ts";
import type { Chapter, ProgressStore } from "./types.ts";

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Chapter index for a progress value (upper bounds are exclusive except for 1). */
export function chapterAt(progress: number): Chapter {
  const p = clamp01(progress);
  for (const chapter of CHAPTERS) {
    if (p < chapter.end) return chapter.index;
  }
  return CHAPTERS[CHAPTERS.length - 1].index;
}

/** 0..1 position inside the given chapter, clamped. */
export function chapterLocal(progress: number, chapter: Chapter): number {
  const range = CHAPTERS[chapter];
  return clamp01((progress - range.start) / (range.end - range.start));
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export interface MutableProgressStore extends ProgressStore {
  /** Called by the scroll driver (ScrollTrigger onUpdate). */
  setTarget(value: number): void;
  /** Jump both values (initial sync, anchor jumps, reduced motion). Notifies. */
  jump(value: number): void;
  /**
   * Advance `current` toward `target` by one damping step of at most
   * PROGRESS_MAX_DT. Returns true while still moving. Notifies subscribers when
   * `current` or `chapter` changed, including the final settled step.
   */
  step(dtSeconds: number): boolean;
  /**
   * Advance by a whole frame's elapsed time, split into bounded sub-steps so
   * damping stays frame-rate independent on slow devices, and clamped overall
   * so a suspended tab does not jump. Notifies subscribers once.
   */
  advance(dtSeconds: number): boolean;
  /** True when `current` has reached `target`. */
  readonly settled: boolean;
}

export function createProgressStore(initial = 0): MutableProgressStore {
  const listeners = new Set<(store: ProgressStore) => void>();
  let target = clamp01(initial);
  let current = target;
  let chapter = chapterAt(current);

  const notify = () => {
    for (const listener of listeners) listener(store);
  };

  const store: MutableProgressStore = {
    get target() {
      return target;
    },
    get current() {
      return current;
    },
    get chapter() {
      return chapter;
    },
    get settled() {
      return current === target;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setTarget(value) {
      target = clamp01(value);
    },
    jump(value) {
      target = clamp01(value);
      current = target;
      chapter = chapterAt(current);
      notify();
    },
    step(dtSeconds) {
      if (current === target) return false;
      const dt = Math.min(Math.max(dtSeconds, 0), PROGRESS_MAX_DT);
      let next = damp(current, target, PROGRESS_DAMPING, dt);
      if (Math.abs(target - next) < PROGRESS_SETTLE_EPSILON) next = target;
      current = next;
      chapter = chapterAt(current);
      notify();
      return current !== target;
    },
    advance(dtSeconds) {
      if (current === target) return false;
      let remaining = Math.min(Math.max(dtSeconds, 0), PROGRESS_MAX_FRAME);
      while (remaining > 0 && current !== target) {
        const dt = Math.min(remaining, PROGRESS_MAX_DT);
        let next = damp(current, target, PROGRESS_DAMPING, dt);
        if (Math.abs(target - next) < PROGRESS_SETTLE_EPSILON) next = target;
        current = next;
        remaining -= dt;
      }
      chapter = chapterAt(current);
      notify();
      return current !== target;
    },
  };

  return store;
}
