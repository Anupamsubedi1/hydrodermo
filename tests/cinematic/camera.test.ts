import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { CameraPath, WAYPOINTS, type CameraPose } from "../../components/cinematic/scene/camera-path.ts";
import { chapterOpacity, activeStation, journeyState } from "../../lib/cinematic/visuals.ts";
import { CHAPTERS } from "../../lib/cinematic/config.ts";
import { terrainHeight } from "../../components/cinematic/scene/river.ts";

function pose(): CameraPose {
  return { position: new T.Vector3(), target: new T.Vector3(), fov: 42, roll: 0 };
}

test("waypoints are ordered and span 0..1", () => {
  assert.equal(WAYPOINTS[0].at, 0);
  assert.equal(WAYPOINTS[WAYPOINTS.length - 1].at, 1);
  for (let i = 1; i < WAYPOINTS.length; i++) assert.ok(WAYPOINTS[i].at > WAYPOINTS[i - 1].at);
});

test("camera pose is a pure function of progress (identical forwards and backwards at t=0)", () => {
  const path = new CameraPath();
  const forward: number[][] = [];
  for (let i = 0; i <= 200; i++) {
    const p = path.poseAt(i / 200, 0, pose());
    forward.push([p.position.x, p.position.y, p.position.z, p.target.x, p.target.y, p.target.z, p.fov, p.roll]);
  }
  for (let i = 200; i >= 0; i--) {
    const p = path.poseAt(i / 200, 0, pose());
    assert.deepEqual([p.position.x, p.position.y, p.position.z, p.target.x, p.target.y, p.target.z, p.fov, p.roll], forward[i]);
  }
});

test("camera never dips below the terrain or water along the flight", () => {
  const path = new CameraPath();
  for (let i = 0; i <= 400; i++) {
    const p = path.poseAt(i / 400, 0, pose());
    const ground = terrainHeight(p.position.x, p.position.z);
    const water = p.position.z < 0 ? 0 : -28;
    assert.ok(p.position.y > Math.max(ground, water) + 1.5, `progress ${i / 400}: y=${p.position.y.toFixed(1)} ground=${ground.toFixed(1)}`);
  }
});

test("camera motion is continuous (no jumps larger than a few metres per 1/400 progress)", () => {
  const path = new CameraPath();
  let prev = path.poseAt(0, 0, pose()).position.clone();
  for (let i = 1; i <= 400; i++) {
    const p = path.poseAt(i / 400, 0, pose()).position;
    assert.ok(p.distanceTo(prev) < 12, `jump at ${i / 400}: ${p.distanceTo(prev).toFixed(1)} m`);
    prev = p.clone();
  }
});

test("overlay math: hero visible at 0, one chapter fully visible mid-range, stations advance in order", () => {
  assert.equal(chapterOpacity(0, 0), 1);
  for (const c of CHAPTERS) {
    const mid = (c.start + c.end) / 2;
    assert.ok(chapterOpacity(mid, c.index) > 0.99);
  }
  assert.equal(activeStation(0.5), -1);
  assert.equal(activeStation(0.73), 0);
  assert.equal(activeStation(0.8), 1);
  assert.equal(activeStation(0.86), 2);
  assert.equal(activeStation(0.9), 3);
  assert.equal(activeStation(0.99), 3);
  const early = journeyState(0.1);
  const late = journeyState(0.9);
  assert.ok(early.schematic === 0 && late.schematic === 1);
});
