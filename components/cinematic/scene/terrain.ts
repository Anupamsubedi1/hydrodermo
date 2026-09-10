import * as T from "three";
import { fbm2, smoothstep } from "./noise";
import { terrainBase, terrainHeight } from "./river";

export interface Terrain {
  mesh: T.Mesh;
  field: HeightField;
  dispose(): void;
}

const GRASS = new T.Color("#3d6a34");
const MEADOW = new T.Color("#5a8a45");
const FOREST_FLOOR = new T.Color("#233f29");
const ROCK = new T.Color("#67665f");
const ROCK_DARK = new T.Color("#45453f");
const SNOW = new T.Color("#e9eef1");
const GRAVEL = new T.Color("#54554d");

export const WORLD = { x0: -1000, x1: 1000, z0: -1200, z1: 900 } as const;

/** Sampled heightfield shared with placement code so nothing re-evaluates the analytic terrain per object. */
export class HeightField {
  readonly heights: Float32Array;
  constructor(
    readonly segments: number,
    readonly x0: number,
    readonly z0: number,
    readonly width: number,
    readonly depth: number,
  ) {
    this.heights = new Float32Array((segments + 1) * (segments + 1));
  }
  index(ix: number, iz: number): number {
    return iz * (this.segments + 1) + ix;
  }
  /** Bilinear height at a world position (clamped to the field). */
  sample(x: number, z: number): number {
    const fx = ((x - this.x0) / this.width) * this.segments;
    const fz = ((z - this.z0) / this.depth) * this.segments;
    const ix = Math.max(0, Math.min(this.segments - 1, Math.floor(fx)));
    const iz = Math.max(0, Math.min(this.segments - 1, Math.floor(fz)));
    const tx = Math.max(0, Math.min(1, fx - ix));
    const tz = Math.max(0, Math.min(1, fz - iz));
    const h = this.heights;
    const a = h[this.index(ix, iz)];
    const b = h[this.index(ix + 1, iz)];
    const c = h[this.index(ix, iz + 1)];
    const d = h[this.index(ix + 1, iz + 1)];
    return a + (b - a) * tx + (c - a) * tz + (a - b - c + d) * tx * tz;
  }
  /** Approximate slope (1 - normal.y) from grid differences. */
  slope(x: number, z: number): number {
    const step = this.width / this.segments;
    const dx = (this.sample(x + step, z) - this.sample(x - step, z)) / (2 * step);
    const dz = (this.sample(x, z + step) - this.sample(x, z - step)) / (2 * step);
    return 1 - 1 / Math.sqrt(1 + dx * dx + dz * dz);
  }
}

/** Fills the heightfield in row batches; call repeatedly until it returns true. */
export function fillHeightField(field: HeightField, fromRow: number, rows: number): number {
  const n = field.segments + 1;
  const end = Math.min(n, fromRow + rows);
  for (let iz = fromRow; iz < end; iz++) {
    const z = field.z0 + (iz / field.segments) * field.depth;
    for (let ix = 0; ix < n; ix++) {
      const x = field.x0 + (ix / field.segments) * field.width;
      field.heights[field.index(ix, iz)] = terrainHeight(x, z);
    }
  }
  return end;
}

export function createHeightField(segments: number): HeightField {
  return new HeightField(segments, WORLD.x0, WORLD.z0, WORLD.x1 - WORLD.x0, WORLD.z1 - WORLD.z0);
}

export function createTerrainMesh(field: HeightField, noiseMap: T.Texture): Terrain {
  const segments = field.segments;
  const geometry = new T.PlaneGeometry(field.width, field.depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as T.BufferAttribute;
  const n = segments + 1;
  // PlaneGeometry vertices run row by row from -depth/2 (after rotation: z = -depth/2 at the first row).
  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      const i = iz * n + ix;
      const x = field.x0 + (ix / segments) * field.width;
      const z = field.z0 + (iz / segments) * field.depth;
      pos.setXYZ(i, x, field.heights[field.index(ix, iz)], z);
    }
  }
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal as T.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const above = y - terrainBase(z);
    const slope = 1 - normals.getY(i);
    const noise = fbm2(x * 0.03 + 1, z * 0.03 + 7, 2);
    const noise2 = fbm2(x * 0.006 + 9, z * 0.006 + 3, 2);
    tmp.copy(GRASS).lerp(MEADOW, noise * 0.7);
    tmp.lerp(FOREST_FLOOR, smoothstep(24, 90, above) * (0.55 + 0.45 * noise2));
    tmp.lerp(GRAVEL, 1 - smoothstep(0.6, 3.5, above));
    const rockAmt = Math.max(smoothstep(0.42, 0.62, slope), smoothstep(210, 300, above) * 0.85);
    tmp.lerp(noise > 0.5 ? ROCK : ROCK_DARK, rockAmt);
    tmp.lerp(SNOW, smoothstep(280, 360, above) * (1 - smoothstep(0.55, 0.8, slope)));
    tmp.multiplyScalar(0.92 + noise * 0.16);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0, map: noiseMap });
  noiseMap.repeat.set(140, 150);
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
      .replace(
        "#include <map_fragment>",
        `
        vec4 detail = texture2D(map, vWorldPos.xz * 0.045);
        vec4 detail2 = texture2D(map, vWorldPos.xz * 0.006 + 0.3);
        float micro = mix(0.86, 1.14, detail.r) * mix(0.9, 1.1, detail2.r);
        diffuseColor.rgb *= micro;
        `,
      );
  };
  const mesh = new T.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.frustumCulled = false;
  return {
    mesh,
    field,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
