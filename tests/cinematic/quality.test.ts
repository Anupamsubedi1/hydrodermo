import { test } from "node:test";
import assert from "node:assert/strict";
import { degradeQuality, initialQuality, isSceneEligible, judgePerformance, QUALITY_PRESETS, type DeviceSignals } from "../../lib/cinematic/quality.ts";
import { PERFORMANCE } from "../../lib/cinematic/config.ts";

const desktop: DeviceSignals = {
  width: 1440,
  height: 900,
  finePointer: true,
  hover: true,
  reducedMotion: false,
  saveData: false,
  hardwareConcurrency: 8,
  deviceMemory: 8,
  devicePixelRatio: 2,
  webgl2: true,
};
const phone: DeviceSignals = { ...desktop, width: 390, height: 844, finePointer: false, hover: false, hardwareConcurrency: 6, deviceMemory: 4 };

test("eligibility: any WebGL2 device unless reduced motion or save-data", () => {
  assert.equal(isSceneEligible(desktop), true);
  assert.equal(isSceneEligible(phone), true);
  assert.equal(isSceneEligible({ ...phone, webgl2: false }), false);
  assert.equal(isSceneEligible({ ...desktop, reducedMotion: true }), false);
  assert.equal(isSceneEligible({ ...desktop, saveData: true }), false);
});

test("tiers: phones and touch tablets start low, weak desktops medium, others high", () => {
  assert.equal(initialQuality(phone).tier, "low");
  assert.equal(initialQuality({ ...desktop, width: 1024, finePointer: false, hover: false }).tier, "low");
  assert.equal(initialQuality({ ...desktop, hardwareConcurrency: 4 }).tier, "medium");
  assert.equal(initialQuality(desktop).tier, "high");
  assert.equal(QUALITY_PRESETS.low.reflection, false);
  assert.equal(QUALITY_PRESETS.low.bloom, false);
});

test("degradation is one-way and ends in disabling the scene", () => {
  assert.equal(degradeQuality(QUALITY_PRESETS.high), QUALITY_PRESETS.medium);
  assert.equal(degradeQuality(QUALITY_PRESETS.medium), QUALITY_PRESETS.low);
  assert.equal(degradeQuality(QUALITY_PRESETS.low), null);
});

test("performance verdicts respect the sample gate and thresholds", () => {
  assert.equal(judgePerformance({ activeFrameMsP95: 200, samples: PERFORMANCE.minSamples - 1 }), "keep");
  assert.equal(judgePerformance({ activeFrameMsP95: PERFORMANCE.degradeAboveMsP95, samples: PERFORMANCE.minSamples }), "keep");
  assert.equal(judgePerformance({ activeFrameMsP95: PERFORMANCE.degradeAboveMsP95 + 0.01, samples: PERFORMANCE.minSamples }), "degrade");
  assert.equal(judgePerformance({ activeFrameMsP95: PERFORMANCE.disableAboveMsP95 + 0.01, samples: PERFORMANCE.minSamples }), "disable");
});
