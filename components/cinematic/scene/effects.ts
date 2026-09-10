import * as T from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { mulberry32 } from "./noise";
import { DAM_BASE_Y, DAM_CREST_DOWNSTREAM_Z, DAM_CREST_Y, DAM_TOE_Z, riverHalfWidth, riverX } from "./river";
import { BAY_WIDTH, SPILLWAY_HALF } from "./structures";
import { LOOK } from "./scene-config";

// ------------------------------------------------------------------ particles
const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  uniform float uTime;
  uniform float uRise;
  uniform float uPixelRatio;
  uniform float uScale;
  varying float vAlpha;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    float life = fract(aPhase + uTime * 0.05);
    p.y += uRise * life;
    p.x += sin(uTime * 0.15 + aPhase * 6.28) * 2.5;
    vAlpha = aAlpha * (uRise > 0.0 ? sin(life * 3.14159) : 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * uScale / max(1.0, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const pointsFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vAlpha;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export interface ParticleField {
  points: T.Points;
  update(time: number): void;
  dispose(): void;
}

function particleField(sprite: T.Texture, count: number, opts: { color: string; rise: number; place: (i: number, rnd: () => number) => [number, number, number, number, number] }): ParticleField {
  const rnd = mulberry32(77 + count);
  const geo = new T.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const alpha = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const [x, y, z, s, a] = opts.place(i, rnd);
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    size[i] = s;
    alpha[i] = a;
    phase[i] = rnd();
  }
  geo.setAttribute("position", new T.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new T.BufferAttribute(size, 1));
  geo.setAttribute("aAlpha", new T.BufferAttribute(alpha, 1));
  geo.setAttribute("aPhase", new T.BufferAttribute(phase, 1));
  const material = new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([
      T.UniformsLib.fog,
      { uMap: { value: sprite }, uColor: { value: new T.Color(opts.color) }, uTime: { value: 0 }, uRise: { value: opts.rise }, uPixelRatio: { value: 1 }, uScale: { value: 600 } },
    ]),
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  const points = new T.Points(geo, material);
  points.frustumCulled = false;
  points.renderOrder = 3;
  return {
    points,
    update(time) {
      material.uniforms.uTime.value = time;
    },
    dispose() {
      geo.dispose();
      material.dispose();
    },
  };
}

export function createValleyMist(sprite: T.Texture, scale: number): ParticleField {
  const count = Math.round(420 * scale);
  return particleField(sprite, count, {
    color: "#a6bab8",
    rise: 0,
    place: (i, rnd) => {
      const z = -1100 + rnd() * 1500;
      const xc = riverX(z);
      const spread = riverHalfWidth(z) + 30 + rnd() * 160;
      const x = xc + (rnd() - 0.5) * 2 * spread;
      const y = (z < 0 ? 2 : -26) + rnd() * 34;
      return [x, y, z, 22 + rnd() * 58, 0.025 + rnd() * 0.045];
    },
  });
}

export function createSpray(sprite: T.Texture, scale: number): ParticleField {
  const count = Math.round(260 * scale);
  const xc = riverX(0);
  return particleField(sprite, count, {
    color: "#f2f7f7",
    rise: 22,
    place: (i, rnd) => {
      const x = xc + (rnd() - 0.5) * 2 * (SPILLWAY_HALF + 6);
      const z = DAM_TOE_Z - 2 + rnd() * 26;
      const y = -30 + rnd() * 6;
      return [x, y, z, 6 + rnd() * 16, 0.18 + rnd() * 0.3];
    },
  });
}

// -------------------------------------------------------------- spillway sheets
const sheetVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const sheetFragment = /* glsl */ `
  uniform sampler2D uNoise;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    vec2 uv = vUv;
    float n1 = texture2D(uNoise, vec2(uv.x * 2.0, uv.y * 6.0 - uTime * 1.6)).b;
    float n2 = texture2D(uNoise, vec2(uv.x * 5.0 + 0.3, uv.y * 14.0 - uTime * 2.4)).b;
    float streak = smoothstep(0.38, 0.9, n1 * 0.55 + n2 * 0.65);
    float alpha = 0.22 + 0.55 * streak;
    // Thinner at the crest, foaming at the toe.
    alpha *= smoothstep(0.0, 0.08, uv.y);
    float foam = smoothstep(0.82, 1.0, uv.y) * (0.5 + 0.5 * n2);
    alpha = min(1.0, alpha + foam * 0.5);
    vec3 col = mix(vec3(0.38, 0.58, 0.68), vec3(0.94, 0.97, 0.98), clamp(streak * 0.85 + foam * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export interface SpillwaySheets {
  group: T.Group;
  update(time: number): void;
  dispose(): void;
}

export function createSpillwaySheets(normalMap: T.Texture): SpillwaySheets {
  const group = new T.Group();
  const material = new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { uNoise: { value: normalMap }, uTime: { value: 0 } }]),
    vertexShader: sheetVertex,
    fragmentShader: sheetFragment,
    transparent: true,
    depthWrite: false,
    side: T.DoubleSide,
    fog: true,
  });
  const xc = riverX(0);
  const dz = DAM_TOE_Z - DAM_CREST_DOWNSTREAM_Z;
  const dy = DAM_CREST_Y - DAM_BASE_Y;
  const length = Math.hypot(dz, dy) + 3;
  const geo = new T.PlaneGeometry(BAY_WIDTH - 0.8, length, 1, 12);
  const angle = Math.atan2(dz, dy);
  for (let i = 0; i < 4; i++) {
    const x = xc - SPILLWAY_HALF + 2.4 + BAY_WIDTH / 2 + i * (BAY_WIDTH + 2.4);
    const sheet = new T.Mesh(geo, material);
    sheet.position.set(x, (DAM_CREST_Y + DAM_BASE_Y) / 2 + 0.3, (DAM_CREST_DOWNSTREAM_Z + DAM_TOE_Z) / 2 + 0.55);
    sheet.rotation.x = -angle - Math.PI;
    sheet.renderOrder = 2;
    group.add(sheet);
    // Nappe over the crest.
    const nappe = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, BAY_WIDTH - 0.8, 10, 1, false, 0, Math.PI), material);
    nappe.rotation.z = Math.PI / 2;
    nappe.rotation.y = 0;
    nappe.position.set(x, DAM_CREST_Y + 0.4, DAM_CREST_DOWNSTREAM_Z + 0.3);
    group.add(nappe);
  }
  return {
    group,
    update(time) {
      material.uniforms.uTime.value = time;
    },
    dispose() {
      geo.dispose();
      material.dispose();
      group.traverse((o) => {
        if (o instanceof T.Mesh && o.geometry !== geo) o.geometry.dispose();
      });
    },
  };
}

// ------------------------------------------------------------------ composer
export interface Post {
  render(): void;
  setSize(width: number, height: number, pixelRatio: number): void;
  setBloom(enabled: boolean): void;
  dispose(): void;
}

export function createPost(renderer: T.WebGLRenderer, scene: T.Scene, camera: T.PerspectiveCamera, width: number, height: number, pixelRatio: number): Post {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);
  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new T.Vector2(Math.max(1, width / 2), Math.max(1, height / 2)), LOOK.bloom.strength, LOOK.bloom.radius, LOOK.bloom.threshold);
  const output = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(output);
  return {
    render() {
      composer.render();
    },
    setSize(w, h, pr) {
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
      bloom.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
    },
    setBloom(enabled) {
      bloom.enabled = enabled;
    },
    dispose() {
      bloom.dispose();
      output.dispose();
      renderPass.dispose();
      composer.dispose();
    },
  };
}
