import * as T from "three";
import type { AnchorId, AnchorPosition, SceneQuality } from "../../../lib/cinematic/types";
import { CameraPath, applyPose, type CameraPose } from "./camera-path";
import { createPost, createSpillwaySheets, createSpray, createValleyMist } from "./effects";
import { createForest } from "./forest";
import { createMachine } from "./machine";
import { createAtmosphere } from "./sky";
import { createStructures } from "./structures";
import { createHeightField, createTerrainMesh, fillHeightField } from "./terrain";
import { noiseTexture, softSpriteTexture, waterNormalTexture } from "./textures";
import { createWaterSurfaces } from "./water";
import { LOOK, SUN } from "./scene-config";

export interface World {
  update(progress: number, time: number, camera: T.PerspectiveCamera, aspect: number): void;
  render(): void;
  resize(width: number, height: number, pixelRatio: number): void;
  setQuality(quality: SceneQuality): void;
  anchors(camera: T.PerspectiveCamera, width: number, height: number, out: AnchorPosition[]): void;
  dispose(): void;
}

const ANCHOR_IDS: AnchorId[] = ["penstock", "turbine", "generator", "transformer", "grid"];

/**
 * Resolve when the browser is idle again, so each build stage is its own short
 * task and input stays responsive while the world is assembled.
 */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), { timeout: 120 });
    else requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

/**
 * Builds the world in stages that yield to the browser between them. The
 * poster stays on screen the whole time; nothing renders until the returned
 * world exists and the caller has produced a frame.
 */
export async function buildWorld(
  renderer: T.WebGLRenderer,
  scene: T.Scene,
  camera: T.PerspectiveCamera,
  quality: SceneQuality,
  width: number,
  height: number,
  isCancelled: () => boolean,
  onShaderError?: (message: string) => void,
): Promise<World> {
  const previousShaderError = renderer.debug.onShaderError;
  if (onShaderError) {
    renderer.debug.onShaderError = (gl, _program, vs, fs) => {
      const log = `${gl.getShaderInfoLog(vs) ?? ""} ${gl.getShaderInfoLog(fs) ?? ""}`.trim();
      onShaderError(log || "Shader compilation failed");
    };
  }
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = LOOK.exposure;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = T.PCFShadowMap;

  const disposables: Array<{ dispose(): void }> = [];
  const bail = () => {
    if (!isCancelled()) return false;
    disposables.forEach((d) => d.dispose());
    renderer.debug.onShaderError = previousShaderError;
    return true;
  };

  // Stage 1: textures and atmosphere.
  const textures = {
    waterNormals: waterNormalTexture(512),
    sprite: softSpriteTexture(128),
    concrete: noiseTexture(512, 180, 12),
    terrainNoise: noiseTexture(256, 160, 40),
  };
  textures.concrete.repeat.set(10, 10);
  disposables.push({ dispose: () => Object.values(textures).forEach((t) => t.dispose()) });
  const atmosphere = createAtmosphere(renderer, SUN.elevation, SUN.azimuth);
  disposables.push(atmosphere);
  scene.add(atmosphere.sky);
  scene.environment = atmosphere.environment;
  scene.environmentIntensity = LOOK.envIntensity;
  scene.fog = new T.FogExp2(LOOK.fogColor, LOOK.fogDensity);

  const sun = new T.DirectionalLight(atmosphere.sunColor, LOOK.sunIntensity);
  sun.position.copy(atmosphere.sunDirection).multiplyScalar(900).add(new T.Vector3(20, 0, 20));
  sun.target.position.set(20, -10, 20);
  sun.castShadow = quality.shadows;
  sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
  sun.shadow.camera.near = 200;
  sun.shadow.camera.far = 1800;
  sun.shadow.camera.left = -LOOK.shadowExtent;
  sun.shadow.camera.right = LOOK.shadowExtent;
  sun.shadow.camera.top = LOOK.shadowExtent;
  sun.shadow.camera.bottom = -LOOK.shadowExtent;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 1.2;
  scene.add(sun, sun.target);
  scene.add(new T.HemisphereLight(LOOK.hemiSky, LOOK.hemiGround, LOOK.hemiIntensity));
  await nextFrame();
  if (bail()) throw new Error("cancelled");

  // Stage 2: heightfield in row batches, then the terrain mesh.
  const field = createHeightField(quality.terrainSegments);
  let row = 0;
  const rowsPerTask = Math.max(4, Math.round(2048 / (quality.terrainSegments + 1)) * 4);
  while (row < field.segments + 1) {
    row = fillHeightField(field, row, rowsPerTask);
    await nextFrame();
    if (bail()) throw new Error("cancelled");
  }
  const terrain = createTerrainMesh(field, textures.terrainNoise);
  disposables.push(terrain);
  scene.add(terrain.mesh);
  await nextFrame();
  if (bail()) throw new Error("cancelled");

  // Stage 3: water.
  const water = createWaterSurfaces(textures.waterNormals, atmosphere.sunDirection, quality.reflection, quality.tier === "high" ? LOOK.reflectionTexture.high : LOOK.reflectionTexture.medium);
  disposables.push(water);
  scene.add(water.reservoir, water.tail);
  await nextFrame();
  if (bail()) throw new Error("cancelled");

  // Stage 4: forest (yields internally).
  const forest = await createForest(quality.trees, field, nextFrame);
  disposables.push(forest);
  if (bail()) throw new Error("cancelled");
  scene.add(forest.trees, forest.rocks);
  await nextFrame();

  // Stage 5: structures, machine hall, effects.
  const structures = createStructures(textures.concrete);
  disposables.push(structures);
  scene.add(structures.group);
  await nextFrame();
  if (bail()) throw new Error("cancelled");
  const machine = createMachine(structures.penstock, structures.transformerAnchor, structures.gridAnchor, quality.particles);
  disposables.push(machine);
  scene.add(machine.group);
  const sheets = createSpillwaySheets(textures.waterNormals);
  const mist = createValleyMist(textures.sprite, quality.particles);
  const spray = createSpray(textures.sprite, quality.particles);
  disposables.push(sheets, mist, spray);
  scene.add(sheets.group, mist.points, spray.points);
  await nextFrame();
  if (bail()) throw new Error("cancelled");

  // Stage 6: compile shaders off the critical path where the driver supports it.
  const path = new CameraPath();
  const pose: CameraPose = { position: new T.Vector3(), target: new T.Vector3(), fov: 42, roll: 0 };
  path.poseAt(0, 0, pose);
  applyPose(camera, pose, width / height);
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    /* fall back to synchronous compilation on first render */
  }
  if (bail()) throw new Error("cancelled");

  let post = quality.bloom ? createPost(renderer, scene, camera, width, height, renderer.getPixelRatio()) : null;
  const projected = new T.Vector3();
  let currentQuality = quality;

  return {
    update(progress, time, cam, aspect) {
      path.poseAt(progress, time, pose);
      applyPose(cam, pose, aspect);
      water.update(time);
      forest.update(time);
      structures.update(progress, time);
      machine.update(progress, time, currentQuality.particles);
      sheets.update(time);
      mist.update(time);
      spray.update(time);
      sun.target.position.copy(pose.target);
      sun.position.copy(atmosphere.sunDirection).multiplyScalar(900).add(pose.target);
      const pr = renderer.getPixelRatio();
      (mist.points.material as T.ShaderMaterial).uniforms.uPixelRatio.value = pr;
      (spray.points.material as T.ShaderMaterial).uniforms.uPixelRatio.value = pr;
    },
    render() {
      if (post) post.render();
      else renderer.render(scene, camera);
    },
    resize(w, h, pr) {
      post?.setSize(w, h, pr);
    },
    setQuality(q) {
      currentQuality = q;
      renderer.shadowMap.enabled = q.shadows;
      sun.castShadow = q.shadows;
      if (!q.bloom && post) {
        post.dispose();
        post = null;
      }
    },
    anchors(cam, w, h, out) {
      out.length = 0;
      for (const id of ANCHOR_IDS) {
        projected.copy(machine.anchors[id]).project(cam);
        const visible = projected.z < 1 && projected.x > -1.1 && projected.x < 1.1 && projected.y > -1.1 && projected.y < 1.1;
        out.push({ id, x: (projected.x * 0.5 + 0.5) * w, y: (-projected.y * 0.5 + 0.5) * h, visible });
      }
    },
    dispose() {
      renderer.debug.onShaderError = previousShaderError;
      post?.dispose();
      disposables.reverse().forEach((d) => d.dispose());
      scene.environment = null;
      scene.fog = null;
      scene.clear();
    },
  };
}
