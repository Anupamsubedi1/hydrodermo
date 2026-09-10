import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clamp01, smoothstep } from "./noise";
import {
  DAM_BASE_Y,
  DAM_CREST_DOWNSTREAM_Z,
  DAM_CREST_Y,
  DAM_HALF_LENGTH,
  DAM_TOE_Z,
  DAM_UPSTREAM_Z,
  POWERHOUSE,
  YARD,
  riverX,
  terrainHeight,
} from "./river";
import { CUTAWAY, LOOK } from "./scene-config";

export interface Structures {
  group: T.Group;
  /** Outdoor penstock centreline (dam → powerhouse wall), continued indoors by the machine module. */
  penstock: T.CatmullRomCurve3;
  /** World position of the first pylon's top (grid anchor). */
  gridAnchor: T.Vector3;
  transformerAnchor: T.Vector3;
  update(progress: number, time: number): void;
  dispose(): void;
}

const SPILLWAY_BAYS = 4;
export const BAY_WIDTH = 11;
const PIER_WIDTH = 2.4;
export const SPILLWAY_HALF = (SPILLWAY_BAYS * BAY_WIDTH + (SPILLWAY_BAYS + 1) * PIER_WIDTH) / 2;

export function createStructures(concreteMap: T.Texture): Structures {
  const group = new T.Group();
  const geometries: T.BufferGeometry[] = [];
  const materials: T.Material[] = [];
  const own = <G extends T.BufferGeometry>(g: G) => (geometries.push(g), g);
  const mat = <M extends T.Material>(m: M) => (materials.push(m), m);

  const concrete = mat(new T.MeshStandardMaterial({ color: LOOK.concrete, roughness: 0.92, metalness: 0, map: concreteMap }));
  const concreteDark = mat(new T.MeshStandardMaterial({ color: LOOK.concreteDark, roughness: 0.95, metalness: 0, map: concreteMap }));
  const steel = mat(new T.MeshStandardMaterial({ color: LOOK.steel, roughness: 0.35, metalness: 0.9 }));
  const darkSteel = mat(new T.MeshStandardMaterial({ color: "#3b4245", roughness: 0.55, metalness: 0.7 }));
  const painted = mat(new T.MeshStandardMaterial({ color: LOOK.paintedSteel, roughness: 0.5, metalness: 0.55 }));
  const roofMat = mat(new T.MeshStandardMaterial({ color: "#3d4a4d", roughness: 0.6, metalness: 0.5, transparent: true }));
  const wallMat = mat(new T.MeshStandardMaterial({ color: "#b9b7ae", roughness: 0.9, metalness: 0, map: concreteMap, transparent: true }));
  const glass = mat(new T.MeshStandardMaterial({ color: "#e8c890", emissive: LOOK.windowGlow, emissiveIntensity: 0.75, roughness: 0.2, metalness: 0.1, transparent: true }));
  const lampMat = mat(new T.MeshStandardMaterial({ color: "#fff2d6", emissive: "#ffd28a", emissiveIntensity: 1.3 }));
  const copper = mat(new T.MeshStandardMaterial({ color: LOOK.copper, roughness: 0.4, metalness: 0.9 }));
  const ceramic = mat(new T.MeshStandardMaterial({ color: "#c9c4b2", roughness: 0.5, metalness: 0 }));

  const add = (geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0, castShadow = true) => {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = castShadow;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  const xc0 = riverX(0);

  // ------------------------------------------------------------------ dam body
  const profile = new T.Shape();
  profile.moveTo(DAM_UPSTREAM_Z, DAM_BASE_Y);
  profile.lineTo(DAM_UPSTREAM_Z, DAM_CREST_Y);
  profile.lineTo(DAM_CREST_DOWNSTREAM_Z, DAM_CREST_Y);
  profile.lineTo(DAM_TOE_Z, DAM_BASE_Y);
  profile.closePath();
  const damGeo = own(new T.ExtrudeGeometry(profile, { depth: DAM_HALF_LENGTH * 2, bevelEnabled: false, curveSegments: 1 }));
  damGeo.rotateY(-Math.PI / 2);
  damGeo.translate(DAM_HALF_LENGTH + xc0, 0, 0);
  // UVs for the concrete map: derive from world position on the sloped face.
  const dPos = damGeo.attributes.position;
  const dUv = new Float32Array(dPos.count * 2);
  for (let i = 0; i < dPos.count; i++) {
    dUv[i * 2] = dPos.getX(i) / 9;
    dUv[i * 2 + 1] = (dPos.getY(i) + dPos.getZ(i) * 0.3) / 9;
  }
  damGeo.setAttribute("uv", new T.BufferAttribute(dUv, 2));
  damGeo.computeVertexNormals();
  add(damGeo, concrete);

  // Construction-joint grooves on the downstream face: thin dark strips every 14 m.
  const grooveGeo = own(new T.BoxGeometry(0.5, 46, 0.35));
  const slopeAngle = Math.atan2(DAM_TOE_Z - DAM_CREST_DOWNSTREAM_Z, DAM_CREST_Y - DAM_BASE_Y);
  for (let x = -DAM_HALF_LENGTH + 14; x < DAM_HALF_LENGTH; x += 14) {
    if (Math.abs(x) < SPILLWAY_HALF + 1) continue;
    const g = add(grooveGeo, concreteDark, xc0 + x, (DAM_CREST_Y + DAM_BASE_Y) / 2, (DAM_CREST_DOWNSTREAM_Z + DAM_TOE_Z) / 2 + 0.05, false);
    g.rotation.x = slopeAngle;
  }

  // Spillway piers and the bridge deck over the bays.
  const pierGeo = own(new T.BoxGeometry(PIER_WIDTH, 7.2, 12));
  const pierNose = own(new T.CylinderGeometry(PIER_WIDTH / 2, PIER_WIDTH / 2, 7.2, 12));
  for (let i = 0; i <= SPILLWAY_BAYS; i++) {
    const x = xc0 - SPILLWAY_HALF + PIER_WIDTH / 2 + i * (BAY_WIDTH + PIER_WIDTH);
    add(pierGeo, concrete, x, DAM_CREST_Y + 3.6, DAM_UPSTREAM_Z + 4);
    add(pierNose, concrete, x, DAM_CREST_Y + 3.6, DAM_UPSTREAM_Z - 2);
  }
  const deckGeo = own(new T.BoxGeometry(SPILLWAY_HALF * 2 + 6, 0.9, 8));
  add(deckGeo, concrete, xc0, DAM_CREST_Y + 7.65, DAM_UPSTREAM_Z + 3);
  // Gate hoist frames above each bay.
  const hoistLeg = own(new T.BoxGeometry(0.35, 9, 0.35));
  const hoistBeam = own(new T.BoxGeometry(BAY_WIDTH + 0.4, 0.5, 0.5));
  for (let i = 0; i < SPILLWAY_BAYS; i++) {
    const x = xc0 - SPILLWAY_HALF + PIER_WIDTH + BAY_WIDTH / 2 + i * (BAY_WIDTH + PIER_WIDTH);
    add(hoistLeg, darkSteel, x - BAY_WIDTH / 2 - 0.2, DAM_CREST_Y + 12.6, DAM_UPSTREAM_Z + 0.4);
    add(hoistLeg, darkSteel, x + BAY_WIDTH / 2 + 0.2, DAM_CREST_Y + 12.6, DAM_UPSTREAM_Z + 0.4);
    add(hoistBeam, darkSteel, x, DAM_CREST_Y + 17.1, DAM_UPSTREAM_Z + 0.4);
    // Raised radial gate leaf (partly open).
    const gate = add(own(new T.BoxGeometry(BAY_WIDTH - 0.6, 3.2, 0.6)), painted, x, DAM_CREST_Y + 5.4, DAM_UPSTREAM_Z - 0.4);
    gate.rotation.x = -0.35;
  }

  // Crest road railings and lamps (outside the spillway) and on the bridge.
  const postGeo = own(new T.CylinderGeometry(0.06, 0.06, 1.15, 6));
  const railGeo = own(new T.BoxGeometry(1, 0.08, 0.08));
  const postCount = Math.floor((DAM_HALF_LENGTH * 2) / 2.5) * 2;
  const posts = new T.InstancedMesh(postGeo, steel, postCount);
  const dummy = new T.Object3D();
  let pi = 0;
  for (let side = -1; side <= 1; side += 2) {
    for (let x = -DAM_HALF_LENGTH + 1; x < DAM_HALF_LENGTH; x += 2.5) {
      const onBridge = Math.abs(x) < SPILLWAY_HALF + 3;
      const y = onBridge ? DAM_CREST_Y + 8.1 : DAM_CREST_Y + 0.55;
      const z = onBridge ? DAM_UPSTREAM_Z + 3 + side * 3.85 : (side < 0 ? DAM_UPSTREAM_Z + 0.35 : DAM_CREST_DOWNSTREAM_Z - 0.35);
      dummy.position.set(xc0 + x, y + 0.55, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      if (pi < postCount) posts.setMatrixAt(pi++, dummy.matrix);
    }
  }
  posts.count = pi;
  posts.instanceMatrix.needsUpdate = true;
  posts.castShadow = true;
  group.add(posts);
  for (let side = -1; side <= 1; side += 2) {
    const rail = add(railGeo, steel, xc0, DAM_CREST_Y + 1.65, side < 0 ? DAM_UPSTREAM_Z + 0.35 : DAM_CREST_DOWNSTREAM_Z - 0.35, false);
    rail.scale.x = DAM_HALF_LENGTH * 2;
    const bridgeRail = add(railGeo, steel, xc0, DAM_CREST_Y + 9.2, DAM_UPSTREAM_Z + 3 + side * 3.85, false);
    bridgeRail.scale.x = SPILLWAY_HALF * 2 + 6;
  }
  const lampPost = own(new T.CylinderGeometry(0.09, 0.14, 6, 8));
  const lampHead = own(new T.SphereGeometry(0.42, 12, 10));
  const lampHeads: T.Mesh[] = [];
  for (let x = -DAM_HALF_LENGTH + 8; x < DAM_HALF_LENGTH; x += 16) {
    const onBridge = Math.abs(x) < SPILLWAY_HALF + 3;
    const base = onBridge ? DAM_CREST_Y + 8.1 : DAM_CREST_Y;
    add(lampPost, darkSteel, xc0 + x, base + 3, DAM_CREST_DOWNSTREAM_Z - 0.9);
    lampHeads.push(add(lampHead, lampMat, xc0 + x, base + 6.2, DAM_CREST_DOWNSTREAM_Z - 0.9, false));
  }

  // Intake tower on the upstream face (right side) with trash rack and access bridge.
  const towerX = xc0 + 46;
  add(own(new T.CylinderGeometry(6, 6.6, 50, 28)), concrete, towerX, DAM_BASE_Y + 25 + 3, DAM_UPSTREAM_Z - 8);
  add(own(new T.CylinderGeometry(6.8, 6.8, 1.2, 28)), concrete, towerX, DAM_CREST_Y + 8.4, DAM_UPSTREAM_Z - 8);
  add(own(new T.BoxGeometry(7, 3.4, 7)), wallMat, towerX, DAM_CREST_Y + 10.6, DAM_UPSTREAM_Z - 8);
  add(own(new T.ConeGeometry(5.4, 2.2, 4)), roofMat, towerX, DAM_CREST_Y + 13.3, DAM_UPSTREAM_Z - 8).rotation.y = Math.PI / 4;
  const rack = add(own(new T.BoxGeometry(6, 10, 0.4)), darkSteel, towerX, -12, DAM_UPSTREAM_Z - 14.2);
  rack.rotation.y = 0;
  add(own(new T.BoxGeometry(2.4, 0.4, 8)), concrete, towerX, DAM_CREST_Y + 8.4, DAM_UPSTREAM_Z - 3);

  // ------------------------------------------------------------- penstocks
  const PX = POWERHOUSE.x;
  const PZ = POWERHOUSE.z;
  const wallZ = PZ - POWERHOUSE.depth / 2;
  const penstock = new T.CatmullRomCurve3(
    [
      new T.Vector3(towerX, -14, DAM_TOE_Z - 8),
      new T.Vector3(towerX + 2, -17, DAM_TOE_Z + 2),
      new T.Vector3(PX - 10, -21.5, wallZ - 12),
      new T.Vector3(PX - 8, -23, wallZ + 1),
    ],
    false,
    "catmullrom",
    0.4,
  );
  const penstockGeo = own(new T.TubeGeometry(penstock, 40, 1.7, 18, false));
  add(penstockGeo, steel);
  const secondary = new T.CatmullRomCurve3(penstock.points.map((p) => p.clone().add(new T.Vector3(7, 0, 0))), false, "catmullrom", 0.4);
  add(own(new T.TubeGeometry(secondary, 40, 1.7, 18, false)), steel);
  const saddleGeo = own(new T.BoxGeometry(4.6, 3, 2.2));
  for (const t of [0.25, 0.5, 0.75]) {
    for (const curve of [penstock, secondary]) {
      const p = curve.getPointAt(t);
      const y = terrainHeight(p.x, p.z);
      add(saddleGeo, concrete, p.x, (p.y - 1.7 + y) / 2, p.z).scale.y = Math.max(0.4, (p.y - 1.7 - y) / 3);
    }
  }
  const ringGeo = own(new T.TorusGeometry(1.85, 0.16, 8, 28));
  for (const t of [0.12, 0.37, 0.62, 0.87]) {
    for (const curve of [penstock, secondary]) {
      const ring = add(ringGeo, darkSteel, 0, 0, 0, false);
      ring.position.copy(curve.getPointAt(t));
      ring.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), curve.getTangentAt(t));
    }
  }

  // ------------------------------------------------------------ powerhouse
  const W = POWERHOUSE.width;
  const D = POWERHOUSE.depth;
  const H = POWERHOUSE.height;
  const floorY = POWERHOUSE.floorY;
  add(own(new T.BoxGeometry(W + 10, 4.5, D + 12)), concreteDark, PX, floorY - 2.25 - 0.01, PZ + 1); // base slab / platform
  const wallT = 0.8;
  const shellParts: T.Mesh[] = [];
  const roofParts: T.Mesh[] = [];
  const wall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const m = add(own(new T.BoxGeometry(w, h, d)), wallMat, x, y, z);
    shellParts.push(m);
    return m;
  };
  // Long walls (±z) with window openings represented by emissive panels in front of the wall.
  wall(W, H, wallT, PX, floorY + H / 2, PZ - D / 2);
  wall(W, H, wallT, PX, floorY + H / 2, PZ + D / 2);
  wall(wallT, H, D, PX - W / 2, floorY + H / 2, PZ);
  wall(wallT, H, D, PX + W / 2, floorY + H / 2, PZ);
  // Gable roof.
  const roofShape = new T.Shape();
  roofShape.moveTo(-D / 2 - 1.2, 0);
  roofShape.lineTo(0, 5);
  roofShape.lineTo(D / 2 + 1.2, 0);
  roofShape.lineTo(D / 2 + 1.2, -0.7);
  roofShape.lineTo(0, 4.3);
  roofShape.lineTo(-D / 2 - 1.2, -0.7);
  roofShape.closePath();
  const roofGeo = own(new T.ExtrudeGeometry(roofShape, { depth: W + 2.4, bevelEnabled: false }));
  roofGeo.rotateY(-Math.PI / 2);
  roofGeo.translate(PX + (W + 2.4) / 2, 0, PZ);
  const roof = add(roofGeo, roofMat, 0, floorY + H, 0);
  roofParts.push(roof);
  // Gable end infill (triangles) as thin boxes approximated by the wall material.
  const gableGeo = own(new T.CylinderGeometry(0, D / 2 + 1.2, 5, 4, 1, true));
  const gableMat = mat(new T.MeshStandardMaterial({ color: "#b9b7ae", roughness: 0.9, metalness: 0, map: concreteMap, transparent: true }));
  for (const x of [PX - W / 2 + 0.2, PX + W / 2 - 0.2]) {
    const g = add(gableGeo, gableMat, x, floorY + H + 2.5, PZ);
    g.rotation.y = Math.PI / 4;
    g.scale.set(0.02, 1, 1);
    roofParts.push(g);
  }
  // Windows along both long walls and a large door downstream.
  const winGeo = own(new T.BoxGeometry(2.4, 9, 0.3));
  const windows: T.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const x = PX - W / 2 + 5 + i * 6;
    windows.push(add(winGeo, glass, x, floorY + 11, PZ - D / 2 - 0.35, false));
    windows.push(add(winGeo, glass, x, floorY + 11, PZ + D / 2 + 0.35, false));
  }
  const door = add(own(new T.BoxGeometry(7, 9, 0.4)), mat(new T.MeshStandardMaterial({ color: "#3b4245", roughness: 0.55, metalness: 0.7, transparent: true })), PX + 10, floorY + 4.5, PZ + D / 2 + 0.45, false);
  shellParts.push(door);
  add(own(new T.BoxGeometry(W + 1, 0.6, 0.6)), concreteDark, PX, floorY + H - 0.3, PZ - D / 2 - 0.5, false);
  add(own(new T.BoxGeometry(W + 1, 0.6, 0.6)), concreteDark, PX, floorY + H - 0.3, PZ + D / 2 + 0.5, false);
  // Crane rails visible when the shell is cut away are part of the machine module.
  // Tailrace outlet arch on the river side.
  const tailraceGeo = own(new T.BoxGeometry(1.2, 6, 10));
  add(tailraceGeo, mat(new T.MeshStandardMaterial({ color: "#07110f", roughness: 1 })), PX - W / 2 - 0.9, floorY - 3, PZ + 2, false);
  add(own(new T.BoxGeometry(8, 1.2, 14)), concreteDark, PX - W / 2 - 5, floorY - 6.4, PZ + 2);

  // ------------------------------------------------------ transformer yard
  const gravel = add(own(new T.BoxGeometry(YARD.width, 0.4, YARD.depth)), mat(new T.MeshStandardMaterial({ color: "#8f8c80", roughness: 1 })), YARD.x, YARD.y - 0.2, YARD.z, false);
  gravel.receiveShadow = true;
  const finGeo = own(new T.BoxGeometry(0.12, 3.6, 1.4));
  const transformerAnchor = new T.Vector3();
  const bushingTops: T.Vector3[] = [];
  for (let k = 0; k < 2; k++) {
    const tx = YARD.x - 7 + k * 14;
    const tz = YARD.z - 2;
    add(own(new T.BoxGeometry(5, 5, 4)), painted, tx, YARD.y + 2.5, tz);
    add(own(new T.BoxGeometry(6.2, 0.6, 5.2)), concrete, tx, YARD.y + 0.3, tz, false);
    const fins = new T.InstancedMesh(finGeo, painted, 24);
    for (let i = 0; i < 24; i++) {
      const side = i < 12 ? -1 : 1;
      dummy.position.set(tx - 2.3 + (i % 12) * 0.42, YARD.y + 2.6, tz + side * 2.9);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      fins.setMatrixAt(i, dummy.matrix);
    }
    fins.castShadow = true;
    group.add(fins);
    add(own(new T.CylinderGeometry(0.9, 0.9, 3.4, 14)), painted, tx + 3.2, YARD.y + 3.2, tz);
    for (let b = 0; b < 3; b++) {
      const bx = tx - 1.5 + b * 1.5;
      add(own(new T.CylinderGeometry(0.22, 0.3, 2.6, 10)), ceramic, bx, YARD.y + 6.3, tz);
      add(own(new T.CylinderGeometry(0.1, 0.1, 0.6, 8)), copper, bx, YARD.y + 7.9, tz);
      if (k === 0) bushingTops.push(new T.Vector3(bx, YARD.y + 8.1, tz));
    }
    if (k === 0) transformerAnchor.set(tx, YARD.y + 7, tz);
  }
  // Yard fence posts.
  const fenceGeo = own(new T.CylinderGeometry(0.05, 0.05, 2.2, 5));
  const fence = new T.InstancedMesh(fenceGeo, darkSteel, 48);
  let fi = 0;
  for (let i = 0; i < 16; i++) {
    dummy.position.set(YARD.x - YARD.width / 2 + (i / 15) * YARD.width, YARD.y + 1.1, YARD.z + YARD.depth / 2);
    dummy.updateMatrix();
    fence.setMatrixAt(fi++, dummy.matrix);
    dummy.position.set(YARD.x - YARD.width / 2 + (i / 15) * YARD.width, YARD.y + 1.1, YARD.z - YARD.depth / 2);
    dummy.updateMatrix();
    fence.setMatrixAt(fi++, dummy.matrix);
    dummy.position.set(YARD.x + YARD.width / 2, YARD.y + 1.1, YARD.z - YARD.depth / 2 + (i / 15) * YARD.depth);
    dummy.updateMatrix();
    fence.setMatrixAt(fi++, dummy.matrix);
  }
  fence.count = fi;
  group.add(fence);

  // ----------------------------------------------------------------- pylons
  const legGeo = own(new T.BoxGeometry(0.34, 30, 0.34));
  const pylonParts: T.BufferGeometry[] = [];
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const leg = legGeo.clone();
    leg.translate(sx * 2.4, 15, sz * 2.4);
    // Lean the legs inward toward the top.
    const p = leg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = 1 - (y / 30) * 0.65;
      p.setX(i, p.getX(i) * k);
      p.setZ(i, p.getZ(i) * k);
    }
    pylonParts.push(leg);
  }
  for (const [y, half] of [
    [20, 6.5],
    [25, 5.5],
    [30, 4.2],
  ]) {
    const arm = new T.BoxGeometry(half * 2, 0.4, 0.4);
    arm.translate(0, y, 0);
    pylonParts.push(arm);
    const brace = new T.BoxGeometry(half * 2 - 1, 0.25, 0.25);
    brace.translate(0, y - 1.5, 0);
    pylonParts.push(brace);
  }
  for (let y = 4; y < 20; y += 5) {
    const ring = new T.BoxGeometry(4.2, 0.22, 4.2);
    ring.translate(0, y, 0);
    pylonParts.push(ring);
  }
  const pylonGeo = own(mergeGeometries(pylonParts, false) ?? new T.BoxGeometry(1, 30, 1));
  pylonParts.forEach((g) => g.dispose());
  const pylonPositions: T.Vector3[] = [];
  const route: Array<[number, number]> = [
    [YARD.x + 8, YARD.z + 34],
    [YARD.x + 70, YARD.z + 96],
    [YARD.x + 150, YARD.z + 160],
    [YARD.x + 245, YARD.z + 222],
    [YARD.x + 350, YARD.z + 290],
    [YARD.x + 470, YARD.z + 360],
  ];
  const pylons = new T.InstancedMesh(pylonGeo, darkSteel, route.length);
  route.forEach(([x, z], i) => {
    const y = i === 0 ? YARD.y : terrainHeight(x, z);
    const next = route[Math.min(i + 1, route.length - 1)];
    const prev = route[Math.max(i - 1, 0)];
    const heading = Math.atan2(next[0] - prev[0], next[1] - prev[1]);
    dummy.position.set(x, y - 0.5, z);
    dummy.rotation.set(0, heading, 0);
    dummy.scale.set(1, 1 + i * 0.05, 1);
    dummy.updateMatrix();
    pylons.setMatrixAt(i, dummy.matrix);
    pylonPositions.push(new T.Vector3(x, y - 0.5, z));
  });
  pylons.castShadow = true;
  group.add(pylons);
  const gridAnchor = pylonPositions[0].clone().add(new T.Vector3(0, 30, 0));

  // Conductors: three per side between pylon arms, sagging catenaries.
  const lineMat = mat(new T.MeshStandardMaterial({ color: "#1f2426", roughness: 0.6, metalness: 0.4 }));
  const armOffsets: Array<[number, number]> = [
    [-6.5, 20],
    [6.5, 20],
    [-5.5, 25],
    [5.5, 25],
    [-4.2, 30],
    [4.2, 30],
  ];
  const lineGeos: T.BufferGeometry[] = [];
  for (let i = 0; i < pylonPositions.length - 1; i++) {
    const a = pylonPositions[i];
    const b = pylonPositions[i + 1];
    const heading = Math.atan2(b.x - a.x, b.z - a.z);
    const perp = new T.Vector3(Math.cos(heading), 0, -Math.sin(heading));
    for (const [off, h] of armOffsets) {
      const pa = a.clone().add(perp.clone().multiplyScalar(off)).add(new T.Vector3(0, h * (1 + i * 0.05), 0));
      const pb = b.clone().add(perp.clone().multiplyScalar(off)).add(new T.Vector3(0, h * (1 + (i + 1) * 0.05), 0));
      const mid = pa.clone().lerp(pb, 0.5);
      mid.y -= pa.distanceTo(pb) * 0.06;
      const curve = new T.QuadraticBezierCurve3(pa, mid, pb);
      lineGeos.push(new T.TubeGeometry(curve, 14, 0.09, 4, false));
    }
  }
  // Transformer bushings to the first pylon's lower arm.
  const first = pylonPositions[0];
  const firstHeading = Math.atan2(pylonPositions[1].x - first.x, pylonPositions[1].z - first.z);
  const firstPerp = new T.Vector3(Math.cos(firstHeading), 0, -Math.sin(firstHeading));
  bushingTops.forEach((top, i) => {
    const end = first.clone().add(firstPerp.clone().multiplyScalar(-6.5 + i * 6.5)).add(new T.Vector3(0, 20, 0));
    const mid = top.clone().lerp(end, 0.5);
    mid.y -= 2.5;
    lineGeos.push(new T.TubeGeometry(new T.QuadraticBezierCurve3(top, mid, end), 12, 0.09, 4, false));
  });
  const linesGeo = own(mergeGeometries(lineGeos, false) ?? new T.BufferGeometry());
  lineGeos.forEach((g) => g.dispose());
  add(linesGeo, lineMat, 0, 0, 0, false);

  return {
    group,
    penstock,
    gridAnchor,
    transformerAnchor,
    update(progress, time) {
      const cut = smoothstep(CUTAWAY.start, CUTAWAY.end, progress);
      // Walls keep a faint ghost so the building volume still reads; the roof
      // lifts away entirely so the hall is legible from above.
      const shellOpacity = 1 - cut * 0.82;
      for (const part of shellParts) {
        const m = part.material as T.MeshStandardMaterial;
        m.opacity = shellOpacity;
        m.depthWrite = shellOpacity > 0.5;
        part.castShadow = shellOpacity > 0.5;
      }
      for (const part of roofParts) {
        const m = part.material as T.MeshStandardMaterial;
        m.opacity = 1 - cut;
        m.depthWrite = m.opacity > 0.5;
        part.castShadow = m.opacity > 0.5;
        part.visible = m.opacity > 0.02;
        part.position.y = (part === roof ? floorY + H : floorY + H + 2.5) + cut * 9;
      }
      for (const w of windows) {
        const m = w.material as T.MeshStandardMaterial;
        if (m.transparent) m.opacity = clamp01(1 - cut * 1.2);
        w.visible = m.opacity > 0.02 || !m.transparent;
      }
      // Lamps flicker very subtly.
      lampMat.emissiveIntensity = 1.25 + Math.sin(time * 3.1) * 0.08;
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      posts.dispose();
      fence.dispose();
      pylons.dispose();
      group.traverse((o) => {
        if (o instanceof T.InstancedMesh) o.dispose();
      });
    },
  };
}
