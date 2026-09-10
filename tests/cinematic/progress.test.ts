import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterAt, chapterLocal, createProgressStore, damp } from "../../lib/cinematic/progress.ts";
import { CHAPTERS, PROGRESS_DAMPING, PROGRESS_SETTLE_EPSILON } from "../../lib/cinematic/config.ts";

test("chapter boundaries map to the shot list, upper bounds exclusive", () => {
  for (const c of CHAPTERS) {
    assert.equal(chapterAt(c.start), c.index);
    if (c.index < CHAPTERS.length - 1) assert.equal(chapterAt(c.end - 1e-9), c.index);
  }
  assert.equal(chapterAt(1), CHAPTERS.length - 1);
  assert.equal(chapterAt(-2), 0);
  assert.equal(chapterAt(Number.NaN), 0);
});

test("chapterLocal clamps and interpolates inside a chapter", () => {
  const c = CHAPTERS[2];
  assert.equal(chapterLocal(c.start, 2), 0);
  assert.equal(chapterLocal(c.end, 2), 1);
  assert.ok(Math.abs(chapterLocal((c.start + c.end) / 2, 2) - 0.5) < 1e-12);
});

test("damp converges and is step-size independent", () => {
  let p = 0;
  for (let i = 0; i < 240; i++) p = damp(p, 1, PROGRESS_DAMPING, 1 / 60);
  assert.ok(1 - p < PROGRESS_SETTLE_EPSILON);
  const one = damp(0, 1, 5, 0.1);
  const two = damp(damp(0, 1, 5, 0.05), 1, 5, 0.05);
  assert.ok(Math.abs(one - two) < 1e-12);
});

test("store notifies every step including the settled one, and jump is immediate", () => {
  const store = createProgressStore();
  const seen: number[] = [];
  const off = store.subscribe((s) => seen.push(s.current));
  store.setTarget(0.9);
  let steps = 0;
  while (store.step(1 / 60)) assert.ok(++steps < 400);
  assert.equal(store.current, 0.9);
  assert.equal(seen.at(-1), 0.9);
  assert.equal(seen.length, steps + 1);
  assert.equal(store.settled, true);
  store.jump(0.45);
  assert.equal(store.current, 0.45);
  assert.equal(store.chapter, chapterAt(0.45));
  const count = seen.length;
  off();
  store.jump(0);
  assert.equal(seen.length, count);
});

test("advance is frame-rate independent and bounded after suspension", () => {
  const fast = createProgressStore();
  fast.setTarget(1);
  for (let i = 0; i < 20; i++) fast.advance(1 / 60);
  const slow = createProgressStore();
  slow.setTarget(1);
  for (let i = 0; i < 2; i++) slow.advance(10 / 60);
  // One-third of a second of elapsed time either way: same position.
  assert.ok(Math.abs(fast.current - slow.current) < 1e-9, `${fast.current} vs ${slow.current}`);
  // A long suspension advances at most PROGRESS_MAX_FRAME worth of damping.
  const suspended = createProgressStore();
  suspended.setTarget(1);
  suspended.advance(600);
  const bounded = createProgressStore();
  bounded.setTarget(1);
  bounded.advance(0.4);
  assert.ok(Math.abs(suspended.current - bounded.current) < 1e-9);
  assert.ok(suspended.current < 1);
});

test("reverse scrolling converges monotonically through earlier chapters", () => {
  const store = createProgressStore(1);
  store.setTarget(0);
  let previous = 1;
  const chapters = new Set<number>([store.chapter]);
  for (let i = 0; i < 600 && !store.settled; i++) {
    store.step(1 / 60);
    assert.ok(store.current < previous);
    previous = store.current;
    chapters.add(store.chapter);
  }
  assert.equal(store.current, 0);
  assert.ok(chapters.has(0) && chapters.has(3) && chapters.has(6));
});
