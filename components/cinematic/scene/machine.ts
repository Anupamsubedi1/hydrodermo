import * as T from "three";
import { smoothstep } from "./noise";
import { POWERHOUSE, YARD } from "./river";
import { CUTAWAY, LOOK } from "./scene-config";
import type { AnchorId } from "../../../lib/cinematic/types";

export interface Machine {
  group: T.Group;
  anchors: Record<AnchorId, T.Vector3>;
  update(progress: number, time: number, particles: number): void;
  dispose(): void;
}

/**
 * Interior of the powerhouse: a vertical-axis Francis unit (spiral casing,
 * runner, shaft, generator), draft tube, busbars to the transformer yard, an
 * overhead crane, interior lighting, and the motion graphics (flow packets and
 * energy pulses) that explain generation. Everything is derived from progress
 * except a small ambient term.
 */
export function createMachine(outdoorPenstock: T.CatmullRomCurve3, transformerAnchor: T.Vector3, gridAnchor: T.Vector3, particleScale: number): Machine {
  const group = new T.Group();
  const geometries: T.BufferGeometry[] = [];
  const materials: T.Material[] = [];
  const own = <G extends T.BufferGeometry>(g: G) => (geometries.push(g), g);
  const mat = <M extends T.Material>(m: M) => (materials.push(m), m);

  const steel = mat(new T.MeshStandardMaterial({ color: LOOK.steel, roughness: 0.3, metalness: 0.95 }));
  const painted = mat(new T.MeshStandardMaterial({ color: LOOK.paintedSteel, roughness: 0.48, metalness: 0.55, transparent: true }));
  const paintedSolid = mat(new T.MeshStandardMaterial({ color: LOOK.paintedSteel, roughness: 0.48, metalness: 0.55 }));
  const housing = mat(new T.MeshStandardMaterial({ color: LOOK.housing, roughness: 0.5, metalness: 0.55, transparent: true }));
  const concrete = mat(new T.MeshStandardMaterial({ color: "#a3a49c", roughness: 0.95 }));
  const floorMat = mat(new T.MeshStandardMaterial({ color: "#8f948f", roughness: 0.85, transparent: true }));
  const copper = mat(new T.MeshStandardMaterial({ color: LOOK.copper, roughness: 0.38, metalness: 0.92 }));
  const yellow = mat(new T.MeshStandardMaterial({ color: "#d9a441", roughness: 0.6, metalness: 0.3 }));
  const energy = mat(new T.MeshStandardMaterial({ color: LOOK.energy, emissive: LOOK.energy, emissiveIntensity: 0.9, transparent: true, opacity: 0.7, depthWrite: false }));
  const field = mat(new T.MeshStandardMaterial({ color: LOOK.energy, emissive: LOOK.energy, emissiveIntensity: 0, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide }));
  const stripMat = mat(new T.MeshStandardMaterial({ color: "#fff4df", emissive: LOOK.interiorLight, emissiveIntensity: 0 }));

  const add = (geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0, cast = true) => {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  const PX = POWERHOUSE.x;
  const PZ = POWERHOUSE.z;
  const W = POWERHOUSE.width;
  const D = POWERHOUSE.depth;
  const H = POWERHOUSE.height;
  const floorY = POWERHOUSE.floorY;

  // Unit centre (turbine axis). The machine floor is a slab with open pits
  // around each unit, so the casing and runner read from above.
  const C = new T.Vector3(PX - 8, floorY - 5.5, PZ - 1);
  const C2 = C.clone().add(new T.Vector3(16, 0, 0));
  const pitR = 6.6;
  const floorShape = new T.Shape();
  floorShape.moveTo(PX - (W - 1.6) / 2, PZ - (D - 1.6) / 2);
  floorShape.lineTo(PX + (W - 1.6) / 2, PZ - (D - 1.6) / 2);
  floorShape.lineTo(PX + (W - 1.6) / 2, PZ + (D - 1.6) / 2);
  floorShape.lineTo(PX - (W - 1.6) / 2, PZ + (D - 1.6) / 2);
  floorShape.closePath();
  for (const centre of [C, C2]) {
    const hole = new T.Path();
    hole.absarc(centre.x, centre.z, pitR, 0, Math.PI * 2, true);
    floorShape.holes.push(hole);
  }
  const floorGeo = own(new T.ExtrudeGeometry(floorShape, { depth: 1.2, bevelEnabled: false, curveSegments: 28 }));
  floorGeo.rotateX(Math.PI / 2);
  const floor = new T.Mesh(floorGeo, floorMat);
  floor.position.y = floorY;
  floor.receiveShadow = true;
  group.add(floor);
  // Pit walls and the lower gallery slab below the casings.
  for (const centre of [C, C2]) {
    add(own(new T.CylinderGeometry(pitR, pitR, 10.4, 40, 1, true)), concrete, centre.x, floorY - 5.8, centre.z, false);
  }
  add(own(new T.BoxGeometry(W - 2, 1, D - 2)), concrete, PX, C.y - 5.6, PZ, false);

  // Indoor penstock continues from the wall to the spiral inlet.
  const last = outdoorPenstock.getPointAt(1);
  const spiralR0 = 4.6;
  const inlet = new T.Vector3(C.x - 1.5, C.y, C.z - spiralR0 - 1.6);
  const indoor = new T.CatmullRomCurve3([last.clone(), new T.Vector3(last.x + 0.6, C.y + 0.2, last.z + 5), inlet.clone().add(new T.Vector3(0, 0, -2)), inlet.clone()], false, "catmullrom", 0.5);
  add(own(new T.TubeGeometry(indoor, 24, 1.7, 18, false)), steel);
  // Inlet valve (butterfly) housing.
  const valvePos = indoor.getPointAt(0.55);
  const valve = add(own(new T.CylinderGeometry(2.3, 2.3, 1.6, 24)), paintedSolid, valvePos.x, valvePos.y, valvePos.z);
  valve.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), indoor.getTangentAt(0.55));
  add(own(new T.BoxGeometry(0.8, 2.6, 0.8)), yellow, valvePos.x, valvePos.y + 2.6, valvePos.z);

  // Spiral casing: horizontal spiral around the vertical axis at C, radius decreasing.
  const spiralPts: T.Vector3[] = [];
  const turns = 1.8;
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2 * turns;
    const r = spiralR0 - (i / 72) * 2.4;
    spiralPts.push(new T.Vector3(C.x + Math.sin(a) * r, C.y, C.z - Math.cos(a) * r));
  }
  const spiralCurve = new T.CatmullRomCurve3(spiralPts, false, "catmullrom", 0.5);
  add(own(new T.TubeGeometry(spiralCurve, 120, 1.55, 20, false)), painted);
  // Casing stay-ring and cover.
  add(own(new T.CylinderGeometry(3.0, 3.0, 2.2, 32)), painted, C.x, C.y, C.z);
  add(own(new T.TorusGeometry(3.05, 0.14, 8, 40)), steel, C.x, C.y + 1.1, C.z).rotation.x = Math.PI / 2;
  add(own(new T.TorusGeometry(3.05, 0.14, 8, 40)), steel, C.x, C.y - 1.1, C.z).rotation.x = Math.PI / 2;
  // Bolts around the cover.
  const bolt = own(new T.CylinderGeometry(0.09, 0.09, 0.2, 6));
  const bolts = new T.InstancedMesh(bolt, steel, 28);
  const dummy = new T.Object3D();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    dummy.position.set(C.x + Math.cos(a) * 2.75, C.y + 1.2, C.z + Math.sin(a) * 2.75);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bolts.setMatrixAt(i, dummy.matrix);
  }
  group.add(bolts);

  // Runner inside the casing (visible when the casing turns translucent).
  const runner = new T.Group();
  runner.position.copy(C);
  group.add(runner);
  add(own(new T.CylinderGeometry(0.55, 0.8, 1.8, 24)), steel, 0, 0, 0).parent?.remove();
  const hub = new T.Mesh(own(new T.CylinderGeometry(0.55, 0.85, 1.9, 24)), steel);
  runner.add(hub);
  const bladeShape = new T.Shape();
  bladeShape.moveTo(0.5, 0);
  bladeShape.bezierCurveTo(0.9, 0.35, 1.5, 0.55, 1.95, 0.4);
  bladeShape.lineTo(1.9, 0.22);
  bladeShape.bezierCurveTo(1.45, 0.3, 1.0, 0.15, 0.6, -0.15);
  bladeShape.closePath();
  const bladeGeo = own(new T.ExtrudeGeometry(bladeShape, { depth: 0.9, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 10 }));
  bladeGeo.rotateX(Math.PI / 2);
  bladeGeo.translate(0, 0.45, 0);
  const blades = new T.InstancedMesh(bladeGeo, steel, 13);
  for (let i = 0; i < 13; i++) {
    dummy.position.set(0, -0.4, 0);
    dummy.rotation.set(0, (i / 13) * Math.PI * 2, 0.55);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    blades.setMatrixAt(i, dummy.matrix);
  }
  runner.add(blades);
  const band = new T.Mesh(own(new T.TorusGeometry(2.05, 0.12, 8, 40)), steel);
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.7;
  runner.add(band);

  // Shaft up to the generator, guide bearing and coupling.
  add(own(new T.CylinderGeometry(0.5, 0.5, 8.4, 20)), steel, C.x, C.y + 4.2, C.z);
  add(own(new T.CylinderGeometry(1.2, 1.2, 0.6, 24)), painted, C.x, C.y + 2.6, C.z);
  add(own(new T.CylinderGeometry(1.0, 1.0, 0.5, 24)), steel, C.x, C.y + 5.4, C.z);

  // Generator on the machine floor: stator housing (translucent when active), rotor, cover, exciter, railing.
  const genY = floorY + 1.9;
  add(own(new T.CylinderGeometry(4.7, 4.7, 3.8, 48, 1, false)), housing, C.x, genY, C.z);
  add(own(new T.TorusGeometry(4.75, 0.18, 8, 56)), steel, C.x, genY + 1.9, C.z).rotation.x = Math.PI / 2;
  add(own(new T.TorusGeometry(4.75, 0.18, 8, 56)), steel, C.x, genY - 1.9, C.z).rotation.x = Math.PI / 2;
  const rotor = new T.Group();
  rotor.position.set(C.x, genY, C.z);
  group.add(rotor);
  const rotorBody = new T.Mesh(own(new T.CylinderGeometry(3.6, 3.6, 3.2, 40)), paintedSolid);
  rotor.add(rotorBody);
  const poleGeo = own(new T.BoxGeometry(0.5, 2.8, 0.9));
  const poles = new T.InstancedMesh(poleGeo, copper, 20);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 3.75, 0, Math.sin(a) * 3.75);
    dummy.rotation.set(0, -a, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
  }
  rotor.add(poles);
  const fieldRing = new T.Mesh(own(new T.CylinderGeometry(4.3, 4.3, 3.2, 48, 1, true)), field);
  fieldRing.position.set(C.x, genY, C.z);
  group.add(fieldRing);
  add(own(new T.CylinderGeometry(4.9, 4.9, 0.5, 48)), painted, C.x, genY + 2.15, C.z);
  add(own(new T.CylinderGeometry(1.3, 1.5, 1.6, 24)), paintedSolid, C.x, genY + 3.2, C.z);
  add(own(new T.CylinderGeometry(0.4, 0.4, 0.8, 16)), steel, C.x, genY + 4.4, C.z);
  // Railing ring on the floor.
  const railPost = own(new T.CylinderGeometry(0.05, 0.05, 1.1, 6));
  const railPosts = new T.InstancedMesh(railPost, yellow, 24);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    dummy.position.set(C.x + Math.cos(a) * 6.3, floorY + 0.55, C.z + Math.sin(a) * 6.3);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    railPosts.setMatrixAt(i, dummy.matrix);
  }
  group.add(railPosts);
  add(own(new T.TorusGeometry(6.3, 0.05, 6, 64)), yellow, C.x, floorY + 1.1, C.z, false).rotation.x = Math.PI / 2;

  // Second unit (simplified) for hall realism.
  add(own(new T.CylinderGeometry(4.7, 4.7, 3.8, 40)), housing, C2.x, genY, C2.z);
  add(own(new T.CylinderGeometry(4.9, 4.9, 0.5, 40)), painted, C2.x, genY + 2.15, C2.z);
  add(own(new T.CylinderGeometry(1.3, 1.5, 1.6, 20)), paintedSolid, C2.x, genY + 3.2, C2.z);

  // Draft tube from below the runner curving toward the river side.
  const draft = new T.CatmullRomCurve3([
    new T.Vector3(C.x, C.y - 1.6, C.z),
    new T.Vector3(C.x - 1.5, C.y - 4.6, C.z + 1.5),
    new T.Vector3(C.x - 8, C.y - 6.2, C.z + 4),
    new T.Vector3(C.x - W / 2 + 2, C.y - 6.6, C.z + 5),
  ]);
  add(own(new T.TubeGeometry(draft, 24, 1.5, 16, false)), painted);

  // Busbars: generator → wall bushings → transformer.
  const busStart = new T.Vector3(C.x + 3.5, genY + 0.8, C.z + 2.5);
  const busCurve = new T.CatmullRomCurve3([
    busStart,
    new T.Vector3(C.x + 6, genY + 3.5, C.z + 4),
    new T.Vector3(C.x + 6, floorY + H - 4, PZ + D / 2 - 1),
    new T.Vector3(C.x + 6, floorY + H - 4, PZ + D / 2 + 3),
    new T.Vector3(transformerAnchor.x - 1.5, YARD.y + 9.5, transformerAnchor.z - 6),
    new T.Vector3(transformerAnchor.x - 1.5, YARD.y + 8.2, transformerAnchor.z),
  ]);
  for (const off of [-0.6, 0, 0.6]) {
    const pts = busCurve.points.map((p) => p.clone().add(new T.Vector3(off, 0, off * 0.4)));
    add(own(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.09, 6, false)), copper, 0, 0, 0, false);
  }
  add(own(new T.BoxGeometry(2.6, 1.4, 1.6)), painted, C.x + 6, floorY + H - 4, PZ + D / 2);

  // Overhead crane: rails along the long walls, girder, trolley.
  add(own(new T.BoxGeometry(W - 3, 0.5, 0.6)), yellow, PX, floorY + H - 2.6, PZ - D / 2 + 1.4);
  add(own(new T.BoxGeometry(W - 3, 0.5, 0.6)), yellow, PX, floorY + H - 2.6, PZ + D / 2 - 1.4);
  const girder = add(own(new T.BoxGeometry(2, 1.6, D - 2.8)), yellow, C.x + 8, floorY + H - 1.6, PZ);
  add(own(new T.BoxGeometry(2.2, 1.2, 2.2)), painted, girder.position.x, girder.position.y - 1.3, PZ - 3);
  // Light strips under the roof.
  const strips: T.Mesh[] = [];
  for (const z of [PZ - 8, PZ, PZ + 8]) strips.push(add(own(new T.BoxGeometry(W - 6, 0.15, 0.5)), stripMat, PX, floorY + H - 0.9, z, false));

  // Interior lights (ramp with the cutaway).
  const lightA = new T.PointLight(LOOK.interiorLight, 0, 70, 1.9);
  lightA.position.set(C.x, floorY + H - 3, C.z);
  const lightB = new T.PointLight(LOOK.interiorLight, 0, 70, 1.9);
  lightB.position.set(C2.x, floorY + H - 3, C2.z + 4);
  // Cool fill inside the turbine pit so the casing reads during that station.
  const pitLight = new T.PointLight("#cfe6ea", 0, 26, 1.7);
  pitLight.position.set(C.x - 3, C.y + 3.4, C.z - 3);
  group.add(lightA, lightB, pitLight);

  // Flow packets: penstock → spiral → runner → draft tube.
  const flowPts: T.Vector3[] = [];
  for (let i = 0; i <= 12; i++) flowPts.push(outdoorPenstock.getPointAt(0.4 + (i / 12) * 0.6));
  for (let i = 1; i <= 8; i++) flowPts.push(indoor.getPointAt(i / 8));
  for (let i = 1; i <= 24; i++) flowPts.push(spiralCurve.getPointAt(i / 24));
  flowPts.push(new T.Vector3(C.x, C.y - 0.6, C.z));
  for (let i = 1; i <= 8; i++) flowPts.push(draft.getPointAt(i / 8));
  const flowCurve = new T.CatmullRomCurve3(flowPts, false, "centripetal");
  const packetCount = Math.max(30, Math.round(84 * particleScale));
  const packets = new T.InstancedMesh(own(new T.CapsuleGeometry(0.18, 0.8, 3, 8)), energy, packetCount);
  packets.frustumCulled = false;
  packets.castShadow = false;
  group.add(packets);

  // Energy pulses: busbar → transformer → first span to the grid.
  const pulseCurve = new T.CatmullRomCurve3([...busCurve.points, transformerAnchor.clone().add(new T.Vector3(0, 1.5, 0)), gridAnchor.clone().add(new T.Vector3(0, -10, 0)), gridAnchor.clone()]);
  const pulseCount = 14;
  const pulses = new T.InstancedMesh(own(new T.SphereGeometry(0.28, 10, 8)), energy, pulseCount);
  pulses.frustumCulled = false;
  group.add(pulses);

  const anchors: Record<AnchorId, T.Vector3> = {
    penstock: valvePos.clone().add(new T.Vector3(0, 2.4, 0)),
    turbine: C.clone().add(new T.Vector3(0, 1.6, 0)),
    generator: new T.Vector3(C.x, genY + 3.6, C.z),
    transformer: transformerAnchor.clone().add(new T.Vector3(0, 2, 0)),
    grid: gridAnchor.clone(),
  };

  const up = new T.Vector3(0, 1, 0);
  const tangent = new T.Vector3();
  return {
    group,
    anchors,
    update(progress, time, particles) {
      const cut = smoothstep(CUTAWAY.start, CUTAWAY.end, progress);
      const s1 = smoothstep(0.72, 0.775, progress); // penstock flow
      const s2 = smoothstep(0.775, 0.83, progress); // turbine
      const s3 = smoothstep(0.83, 0.885, progress); // generator
      const s4 = smoothstep(0.885, 0.94, progress); // grid
      const settle = smoothstep(0.94, 1, progress);

      floorMat.opacity = 1 - cut * 0.35;
      floorMat.depthWrite = floorMat.opacity > 0.5;
      floor.castShadow = false;
      // X-ray reveals during the machine stations, then everything returns to
      // solid for the settling hero frame.
      const solidAgain = 1 - smoothstep(0.94, 0.995, progress);
      const xray = smoothstep(0.77, 0.79, progress) * solidAgain;
      painted.opacity = 1 - xray * 0.66;
      painted.depthWrite = xray < 0.5;
      housing.opacity = 1 - smoothstep(0.83, 0.85, progress) * 0.7 * solidAgain;
      housing.depthWrite = housing.opacity > 0.5;

      // Rotation derives from progress (reversible) plus a slow ambient term once running.
      const spinProgress = s2 * 6 + smoothstep(0.83, 1, progress) * 4;
      const ambient = s2 * time * 0.9;
      runner.rotation.y = spinProgress * Math.PI * 2 * 0.5 + ambient;
      rotor.rotation.y = runner.rotation.y;
      fieldRing.rotation.y = -runner.rotation.y * 0.5;
      (fieldRing.material as T.MeshStandardMaterial).emissiveIntensity = s3 * (1.2 + 0.4 * Math.sin(time * 4));
      stripMat.emissiveIntensity = cut * 1.1;
      lightA.intensity = cut * 140;
      lightB.intensity = cut * 110;
      pitLight.intensity = smoothstep(0.77, 0.82, progress) * (1 - smoothstep(0.9, 0.95, progress)) * 90;

      // Flow packets: visible from the cutaway; speed ramps with the turbine station.
      const flowSpeed = 0.04 + s2 * 0.08;
      const flowOffset = (progress - 0.64) * 2.5 + time * flowSpeed;
      const visiblePackets = Math.round(packetCount * Math.min(1, particles));
      packets.count = visiblePackets;
      const packetScale = s1 * (0.7 + 0.3 * settle);
      for (let i = 0; i < visiblePackets; i++) {
        const t = ((i / visiblePackets + flowOffset) % 1 + 1) % 1;
        flowCurve.getPointAt(t, dummy.position);
        flowCurve.getTangentAt(t, tangent);
        dummy.quaternion.setFromUnitVectors(up, tangent);
        dummy.scale.setScalar(packetScale * (0.8 + 0.4 * Math.sin(i * 1.7)));
        dummy.updateMatrix();
        packets.setMatrixAt(i, dummy.matrix);
      }
      packets.instanceMatrix.needsUpdate = true;
      packets.visible = packetScale > 0.01;

      // Energy pulses along busbars and the first span.
      const pulseOffset = (progress - 0.885) * 3 + time * 0.12;
      for (let i = 0; i < pulseCount; i++) {
        const t = ((i / pulseCount + pulseOffset) % 1 + 1) % 1;
        pulseCurve.getPointAt(t, dummy.position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(s4 * (0.7 + 0.5 * Math.sin(t * Math.PI)));
        dummy.updateMatrix();
        pulses.setMatrixAt(i, dummy.matrix);
      }
      pulses.instanceMatrix.needsUpdate = true;
      pulses.visible = s4 > 0.01;
      energy.emissiveIntensity = 0.85 + 0.25 * Math.sin(time * 6);
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      group.traverse((o) => {
        if (o instanceof T.InstancedMesh) o.dispose();
      });
    },
  };
}
