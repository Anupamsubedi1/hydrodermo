import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32, smoothstep } from "./noise";
import { BENCH, DAM_HALF_LENGTH, POWERHOUSE, riverHalfWidth, riverX, terrainBase } from "./river";
import type { HeightField } from "./terrain";

export interface Forest {
  trees: T.InstancedMesh;
  rocks: T.InstancedMesh;
  update(time: number): void;
  dispose(): void;
}

function coniferGeometry(): T.BufferGeometry {
  const trunk = new T.CylinderGeometry(0.18, 0.36, 3.7, 5, 1, true);
  trunk.translate(0, 1.6, 0);
  const trunkColors = new Float32Array(trunk.attributes.position.count * 3);
  for (let i = 0; i < trunk.attributes.position.count; i++) {
    trunkColors.set([0.3, 0.23, 0.16], i * 3);
  }
  trunk.setAttribute("color", new T.BufferAttribute(trunkColors, 3));

  // Staggered, uneven branch skirts break the repeated cone silhouette. The
  // lower crowns get one extra ring, with fewer sides keeping the tree cheap.
  const rnd = mulberry32(418);
  const tiers = [
    { r: 2.7, h: 5.8, y: 4.8, sides: 7, rings: 2 },
    { r: 2.0, h: 4.9, y: 7.5, sides: 6, rings: 2 },
    { r: 1.2, h: 3.8, y: 10.0, sides: 5, rings: 1 },
  ].map((t, tier) => {
    const g = new T.ConeGeometry(t.r, t.h, t.sides, t.rings);
    const pos = g.attributes.position as T.BufferAttribute;
    const normals = g.attributes.normal as T.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const phase = rnd() * Math.PI * 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const height = (y + t.h / 2) / t.h;
      const branch = Math.sin(angle * 3 + phase) * 0.13 + Math.cos(angle * 5 - phase) * 0.09;
      const shoulder = 1 + Math.sin(height * Math.PI) * 0.32;
      const radius = (1 + branch) * shoulder;
      const droop = (Math.sin(angle * 3 + phase + 0.8) * 0.22 + Math.cos(angle * 2 - phase) * 0.12) * (1 - height);
      pos.setXYZ(i, x * radius + height * 0.19 * Math.sin(phase), y + droop, z * radius + height * 0.15 * Math.cos(phase));

      // Muted tips and darker undersides give overlapping branches depth
      // without another material, texture download or extra draw call.
      const underside = normals.getY(i) < -0.5;
      const shade = underside ? 0.42 : 0.62 + height * 0.22 + branch * 0.2 + tier * 0.025;
      colors.set([shade * 0.96, shade, shade * 0.91], i * 3);
    }
    g.setAttribute("color", new T.BufferAttribute(colors, 3));
    g.rotateY(phase);
    g.translate(0, t.y, 0);
    g.computeVertexNormals();
    return g;
  });
  const parts = [trunk, ...tiers];
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  if (!merged) throw new Error("Failed to merge conifer geometry");
  return merged;
}

function insideStructures(x: number, z: number): boolean {
  const xc = riverX(0);
  if (Math.abs(x - xc) < DAM_HALF_LENGTH + 14 && z > -40 && z < 40) return true;
  if (Math.abs(x - POWERHOUSE.x) < POWERHOUSE.width / 2 + 22 && Math.abs(z - POWERHOUSE.z) < POWERHOUSE.depth / 2 + 28) return true;
  // The plant bench stays clear of trees (a few may remain on its blended margin).
  if (Math.abs(x - BENCH.x) < BENCH.halfWidth + 6 && Math.abs(z - BENCH.z) < BENCH.halfDepth + 6) return true;
  return false;
}

/**
 * Builds the instanced forest and bank rocks. Placement samples the shared
 * heightfield (cheap) and yields between batches so the main thread stays
 * responsive while the poster is on screen.
 */
export async function createForest(treeCount: number, field: HeightField, yieldFrame: () => Promise<void>): Promise<Forest> {
  const rnd = mulberry32(2026);
  const geometry = coniferGeometry();
  const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    material.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 seed = instanceMatrix[3].xz;
          float sway = sin(uTime * 1.1 + seed.x * 0.37 + seed.y * 0.23) * 0.018 * transformed.y;
          transformed.x += sway;
          transformed.z += sway * 0.6;
        #endif
        `,
      );
  };
  const trees = new T.InstancedMesh(geometry, material, treeCount);
  trees.castShadow = true;
  trees.receiveShadow = true;
  trees.frustumCulled = false;

  const dummy = new T.Object3D();
  const color = new T.Color();
  let placed = 0;
  let attempts = 0;
  const maxAttempts = treeCount * 30;
  let sinceYield = 0;
  while (placed < treeCount && attempts < maxAttempts) {
    attempts++;
    if (++sinceYield >= 2500) {
      sinceYield = 0;
      await yieldFrame();
    }
    const z = -1150 + rnd() * 1900;
    const side = rnd() < 0.5 ? -1 : 1;
    const xc = riverX(z);
    const hw = riverHalfWidth(z);
    const spread = 40 + Math.pow(rnd(), 1.6) * 520;
    const x = xc + side * (hw + 6 + spread);
    if (insideStructures(x, z)) continue;
    const y = field.sample(x, z);
    const above = y - terrainBase(z);
    if (above < 2.5 || above > 250) continue;
    const slope = field.slope(x, z);
    if (slope > 0.55) continue;
    const density = (1 - smoothstep(150, 250, above)) * (0.35 + 0.65 * smoothstep(2.5, 14, above));
    if (rnd() > density) continue;
    const s = 0.75 + rnd() * 0.7;
    dummy.position.set(x, y - 0.4, z);
    dummy.rotation.set((rnd() - 0.5) * 0.08, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.08);
    dummy.scale.set(s * (0.9 + rnd() * 0.25), s * (0.9 + rnd() * 0.4), s * (0.9 + rnd() * 0.25));
    dummy.updateMatrix();
    trees.setMatrixAt(placed, dummy.matrix);
    const hue = 0.345 + (rnd() - 0.5) * 0.085;
    const light = 0.12 + rnd() * 0.095 + smoothstep(120, 250, above) * 0.025;
    color.setHSL(hue, 0.25 + rnd() * 0.16, light);
    trees.setColorAt(placed, color);
    placed++;
  }
  trees.count = placed;
  trees.instanceMatrix.needsUpdate = true;
  if (trees.instanceColor) trees.instanceColor.needsUpdate = true;

  await yieldFrame();

  const rockCount = Math.max(120, Math.round(treeCount * 0.08));
  const rockGeo = new T.DodecahedronGeometry(1, 1);
  const rockMat = new T.MeshStandardMaterial({ color: "#6d6b62", roughness: 0.95, metalness: 0, flatShading: true });
  const rocks = new T.InstancedMesh(rockGeo, rockMat, rockCount);
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  let r = 0;
  attempts = 0;
  while (r < rockCount && attempts < rockCount * 30) {
    attempts++;
    const z = -1000 + rnd() * 1500;
    const side = rnd() < 0.5 ? -1 : 1;
    const xc = riverX(z);
    const hw = riverHalfWidth(z);
    const x = xc + side * (hw - 2 + rnd() * 16);
    if (insideStructures(x, z)) continue;
    const y = field.sample(x, z);
    const above = y - terrainBase(z);
    if (above < -3 || above > 9) continue;
    const s = 0.8 + rnd() * 2.6;
    dummy.position.set(x, y + s * 0.2, z);
    dummy.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    dummy.scale.set(s * (0.8 + rnd() * 0.6), s * (0.5 + rnd() * 0.5), s * (0.8 + rnd() * 0.6));
    dummy.updateMatrix();
    rocks.setMatrixAt(r, dummy.matrix);
    r++;
  }
  rocks.count = r;
  rocks.instanceMatrix.needsUpdate = true;

  return {
    trees,
    rocks,
    update(time) {
      const shader = material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
      if (shader) shader.uniforms.uTime.value = time;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      trees.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      rocks.dispose();
    },
  };
}
