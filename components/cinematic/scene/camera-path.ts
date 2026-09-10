import * as T from "three";
import { POWERHOUSE, riverX } from "./river.ts";
import { lerp, smoothstep } from "./noise.ts";

export interface Waypoint {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

/**
 * Drone flight → crest → turn-back reveal → powerhouse → machine hall.
 * x values are expressed relative to the river centreline at that z so the
 * path follows the valley if the river geometry is tuned.
 */
function wp(at: number, p: [number, number, number], t: [number, number, number], fov?: number): Waypoint {
  return { at, position: [riverX(p[2]) + p[0], p[1], p[2]], target: [riverX(t[2]) + t[0], t[1], t[2]], fov };
}
/** Absolute waypoint (used around the powerhouse, where the river offset is irrelevant). */
function ab(at: number, p: [number, number, number], t: [number, number, number], fov?: number): Waypoint {
  return { at, position: p, target: t, fov };
}

const PX = POWERHOUSE.x;
const PZ = POWERHOUSE.z;
const F = POWERHOUSE.floorY;
/** Turbine axis (matches machine.ts) and generator top. */
const UX = PX - 8;
const UZ = PZ - 1;
const UY = F - 5.5;

export const WAYPOINTS: readonly Waypoint[] = [
  // Drone over the reservoir, flying downstream toward the low sun.
  wp(0.0, [-6, 6.5, -820], [4, 3.5, -700], 52),
  wp(0.1, [-2, 6, -600], [6, 4, -470], 52),
  wp(0.2, [4, 8, -350], [2, 7, -200], 50),
  // Climb to the crest and cross it.
  wp(0.29, [2, 20, -150], [0, 9, -30], 46),
  wp(0.38, [4, 27, -8], [8, 6, 110], 46),
  // Bank left over the tailwater, descend and turn back to face the dam.
  wp(0.45, [-44, 20, 84], [0, -2, 6], 44),
  wp(0.52, [-30, 6, 142], [0, -13, 0], 42),
  // Swing toward the powerhouse and glide along the tailrace past the yard, above the tree line.
  ab(0.58, [PX - 46, F + 34, PZ + 100], [PX, F + 6, PZ + 10], 42),
  ab(0.64, [PX + 30, F + 27, PZ + 78], [PX, F + 6, PZ + 4], 40),
  // Cutaway: walls dissolve while we hold a three-quarter view from the yard corner.
  ab(0.72, [PX + 34, F + 17, PZ + 46], [UX + 2, F + 1, UZ], 40),
  // Penstock: low on the river side, looking at the pipe coming through the wall to the valve.
  ab(0.775, [PX - 34, F + 4, PZ + 6], [UX - 2, UY + 1.5, UZ - 9], 40),
  // Turbine: low over the open pit rim, looking down at the spiral casing and runner.
  ab(0.83, [UX - 11, F + 2.6, UZ - 10.5], [UX - 0.5, UY + 1.4, UZ - 0.5], 46),
  // Generator: upstream side, eye level with the stator.
  ab(0.885, [PX + 4, F + 5.5, PZ - 24], [UX, F + 2.5, UZ], 38),
  // Transformer and grid: along the busbars toward the yard and the first pylon.
  ab(0.94, [PX - 4, F + 12, PZ + 2], [PX + 10, F + 3, PZ + 34], 40),
  // Settle: three-quarter hero of the open hall from the yard side.
  ab(1.0, [PX + 30, F + 14, PZ + 42], [UX + 5, F + 1, UZ + 1], 42),
];

class ArcSpline {
  private readonly curve: T.CatmullRomCurve3;
  private readonly lengths: number[] = [];
  private readonly samples: T.Vector3[] = [];
  private readonly total: number;
  /** Cumulative arc length at each control point. */
  readonly pointLengths: number[] = [];

  constructor(points: T.Vector3[], tension = 0.5) {
    this.curve = new T.CatmullRomCurve3(points, false, "centripetal", tension);
    const n = 1200;
    let acc = 0;
    let prev = this.curve.getPoint(0);
    this.samples.push(prev.clone());
    this.lengths.push(0);
    for (let i = 1; i <= n; i++) {
      const p = this.curve.getPoint(i / n);
      acc += p.distanceTo(prev);
      this.lengths.push(acc);
      this.samples.push(p.clone());
      prev = p;
    }
    this.total = acc;
    const segs = points.length - 1;
    for (let i = 0; i <= segs; i++) this.pointLengths.push(this.lengths[Math.round((i / segs) * n)]);
  }

  pointAtLength(length: number, out: T.Vector3): T.Vector3 {
    const l = Math.max(0, Math.min(this.total, length));
    // Binary search the cumulative table.
    let lo = 0;
    let hi = this.lengths.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.lengths[mid] <= l) lo = mid;
      else hi = mid;
    }
    const l0 = this.lengths[lo];
    const l1 = this.lengths[hi];
    const t = l1 > l0 ? (l - l0) / (l1 - l0) : 0;
    return out.copy(this.samples[lo]).lerp(this.samples[hi], t);
  }
}

export interface CameraPose {
  position: T.Vector3;
  target: T.Vector3;
  fov: number;
  roll: number;
}

/**
 * Establishing pose the autoplay intro starts from: further up the valley and
 * higher, looking down the river toward the dam. The intro eases from here to
 * the progress-0 pose, so the sequence is already in motion before the reader
 * touches the scroll wheel. The hero posters are captured at this pose so the
 * poster-to-canvas handover is invisible.
 */
export const INTRO_POSE: Waypoint = wpLater(0, [-30, 74, -1010], [6, 8, -640], 38);
function wpLater(at: number, p: [number, number, number], t: [number, number, number], fov: number): Waypoint {
  return { at, position: [riverX(p[2]) + p[0], p[1], p[2]], target: [riverX(t[2]) + t[0], t[1], t[2]], fov };
}

export class CameraPath {
  private readonly positions: ArcSpline;
  private readonly targets: ArcSpline;
  private readonly ats: number[];
  private readonly fovs: number[];
  private readonly a = new T.Vector3();
  private readonly b = new T.Vector3();
  private readonly c = new T.Vector3();

  constructor(waypoints: readonly Waypoint[] = WAYPOINTS) {
    this.positions = new ArcSpline(waypoints.map((w) => new T.Vector3(...w.position)));
    this.targets = new ArcSpline(waypoints.map((w) => new T.Vector3(...w.target)));
    this.ats = waypoints.map((w) => w.at);
    this.fovs = waypoints.map((w) => w.fov ?? 42);
  }

  /** Segment index and eased local parameter for a progress value. */
  private locate(progress: number): { i: number; s: number } {
    const p = Math.max(0, Math.min(1, progress));
    let i = 0;
    while (i < this.ats.length - 2 && p >= this.ats[i + 1]) i++;
    const raw = (p - this.ats[i]) / (this.ats[i + 1] - this.ats[i]);
    // Gentle ease only on the very first and last segments; constant speed elsewhere.
    let s = raw;
    if (i === 0) s = raw * raw * (2 - raw) * 0.5 + raw * 0.5;
    if (i === this.ats.length - 2) s = 1 - Math.pow(1 - raw, 1.6);
    return { i, s: Math.max(0, Math.min(1, s)) };
  }

  /**
   * @param intro 1 = fully on the scroll path; below 1 the pose is blended back
   *   toward INTRO_POSE, which is what the autoplay opening animates.
   */
  poseAt(progress: number, time: number, out: CameraPose, intro = 1): CameraPose {
    const { i, s } = this.locate(progress);
    const lp = lerp(this.positions.pointLengths[i], this.positions.pointLengths[i + 1], s);
    const lt = lerp(this.targets.pointLengths[i], this.targets.pointLengths[i + 1], s);
    this.positions.pointAtLength(lp, out.position);
    this.targets.pointAtLength(lt, out.target);
    out.fov = lerp(this.fovs[i], this.fovs[i + 1], s);

    // Banking from horizontal curvature of the flight path (drone feel), fading out indoors.
    const eps = 4;
    this.positions.pointAtLength(lp - eps, this.a);
    this.positions.pointAtLength(lp + eps, this.b);
    this.a.set(out.position.x - this.a.x, 0, out.position.z - this.a.z).normalize();
    this.b.set(this.b.x - out.position.x, 0, this.b.z - out.position.z).normalize();
    const cross = this.a.x * this.b.z - this.a.z * this.b.x;
    const outdoor = 1 - smoothstep(0.62, 0.7, progress);
    out.roll = T.MathUtils.clamp(-cross * 5, -0.14, 0.14) * outdoor;

    // Autoplay opening: ease in from the establishing pose. smoothstep keeps the
    // arrival on the scroll path velocity-matched, so there is no visible seam.
    if (intro < 1) {
      const k = 1 - smoothstep(0, 1, T.MathUtils.clamp(intro, 0, 1));
      out.position.x += (INTRO_POSE.position[0] - out.position.x) * k;
      out.position.y += (INTRO_POSE.position[1] - out.position.y) * k;
      out.position.z += (INTRO_POSE.position[2] - out.position.z) * k;
      out.target.x += (INTRO_POSE.target[0] - out.target.x) * k;
      out.target.y += (INTRO_POSE.target[1] - out.target.y) * k;
      out.target.z += (INTRO_POSE.target[2] - out.target.z) * k;
      out.fov += ((INTRO_POSE.fov ?? 38) - out.fov) * k;
      out.roll *= 1 - k;
    }

    // Sub-pixel handheld life.
    const hx = Math.sin(time * 0.7) * 0.05 + Math.sin(time * 1.9) * 0.02;
    const hy = Math.cos(time * 0.9) * 0.04 + Math.sin(time * 2.3) * 0.015;
    out.position.x += hx;
    out.position.y += hy;
    out.target.x += hx * 0.5;
    out.target.y += hy * 0.5;
    return out;
  }
}

export function applyPose(camera: T.PerspectiveCamera, pose: CameraPose, aspect: number): void {
  camera.position.copy(pose.position);
  camera.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0);
  camera.lookAt(pose.target);
  camera.fov = pose.fov;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
