import * as T from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { DAM_UPSTREAM_Z, DAM_TOE_Z, TAIL_LEVEL, RESERVOIR_LEVEL } from "./river";

export interface WaterSurfaces {
  reservoir: T.Mesh;
  tail: T.Mesh;
  update(time: number): void;
  dispose(): void;
}

const simpleVertex = /* glsl */ `
  varying vec3 vWorldPos;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const simpleFragment = /* glsl */ `
  uniform sampler2D normalMap;
  uniform float time;
  uniform vec3 sunDir;
  uniform vec3 sunColor;
  uniform vec3 waterColor;
  uniform vec3 deepColor;
  uniform vec3 skyColor;
  uniform float distortion;
  uniform float foamStart;
  uniform float foamEnd;
  uniform float flowSpeed;
  varying vec3 vWorldPos;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    vec2 p = vWorldPos.xz;
    vec2 uv1 = p * 0.014 + vec2(time * 0.018, time * flowSpeed);
    vec2 uv2 = p * 0.037 + vec2(-time * 0.012, time * flowSpeed * 1.7);
    vec2 uv3 = p * 0.08 + vec2(time * 0.03, time * flowSpeed * 2.6);
    vec3 n1 = texture2D(normalMap, uv1).xyz * 2.0 - 1.0;
    vec3 n2 = texture2D(normalMap, uv2).xyz * 2.0 - 1.0;
    vec3 n3 = texture2D(normalMap, uv3).xyz * 2.0 - 1.0;
    vec2 nxz = (n1.xy * 1.0 + n2.xy * 0.6 + n3.xy * 0.35) * distortion;
    vec3 n = normalize(vec3(nxz.x, 1.0, nxz.y));
    vec3 V = normalize(cameraPosition - vWorldPos);
    float ndv = max(dot(n, V), 0.0);
    float fres = pow(1.0 - ndv, 5.0);
    fres = mix(0.04, 1.0, fres);
    vec3 R = reflect(-V, n);
    float spec = pow(max(dot(R, sunDir), 0.0), 320.0) * 1.8 + pow(max(dot(R, sunDir), 0.0), 40.0) * 0.12;
    float skyUp = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 refl = mix(skyColor * 0.55, skyColor, skyUp);
    vec3 body = mix(deepColor, waterColor, ndv);
    vec3 col = mix(body, refl, fres) + sunColor * spec;
    float foamNoise = texture2D(normalMap, p * 0.05 + vec2(0.0, time * 0.25)).b;
    float foamNoise2 = texture2D(normalMap, p * 0.11 + vec2(time * 0.05, time * 0.4)).g;
    float foamMask = smoothstep(0.42, 0.75, foamNoise * 0.6 + foamNoise2 * 0.6);
    float foam = smoothstep(foamEnd, foamStart, vWorldPos.z) * foamMask;
    col = mix(col, vec3(0.88, 0.93, 0.94), clamp(foam, 0.0, 1.0) * 0.7);
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
    #include <colorspace_fragment>
  }
`;

function simpleWaterMaterial(normalMap: T.Texture, sunDir: T.Vector3, opts: { foamStart: number; foamEnd: number; flowSpeed: number; distortion: number }) {
  return new T.ShaderMaterial({
    uniforms: T.UniformsUtils.merge([
      T.UniformsLib.fog,
      {
        normalMap: { value: normalMap },
        time: { value: 0 },
        sunDir: { value: sunDir.clone().normalize() },
        sunColor: { value: new T.Color("#ffe9cf") },
        waterColor: { value: new T.Color("#1a4d54") },
        deepColor: { value: new T.Color("#071f25") },
        skyColor: { value: new T.Color("#b7ccd4") },
        distortion: { value: opts.distortion },
        foamStart: { value: opts.foamStart },
        foamEnd: { value: opts.foamEnd },
        flowSpeed: { value: opts.flowSpeed },
      },
    ]),
    vertexShader: simpleVertex,
    fragmentShader: simpleFragment,
    fog: true,
  });
}

export function createWaterSurfaces(normalMap: T.Texture, sunDir: T.Vector3, reflection: boolean, textureSize: number): WaterSurfaces {
  // Reservoir: from far upstream to the dam's upstream face.
  const resLength = 1400;
  const resGeo = new T.PlaneGeometry(1100, resLength, 1, 1);
  let reservoir: T.Mesh;
  let reservoirWater: Water | null = null;
  if (reflection) {
    reservoirWater = new Water(resGeo, {
      textureWidth: textureSize,
      textureHeight: textureSize,
      waterNormals: normalMap,
      sunDirection: sunDir.clone().normalize(),
      sunColor: 0xffe9cf,
      waterColor: 0x0b333a,
      distortionScale: 1.7,
      fog: true,
      alpha: 1,
    });
    reservoirWater.material.uniforms.size.value = 1.6;
    reservoir = reservoirWater;
  } else {
    reservoir = new T.Mesh(resGeo, simpleWaterMaterial(normalMap, sunDir, { foamStart: -9999, foamEnd: -9998, flowSpeed: 0.006, distortion: 0.5 }));
  }
  reservoir.rotation.x = -Math.PI / 2;
  reservoir.position.set(0, RESERVOIR_LEVEL, DAM_UPSTREAM_Z - resLength / 2 + 0.5);
  reservoir.frustumCulled = false;
  reservoir.renderOrder = 1;

  // Tailwater: turbulent below the dam, calming downstream.
  const tailLength = 900;
  const tailGeo = new T.PlaneGeometry(1100, tailLength, 1, 1);
  const tailMaterial = simpleWaterMaterial(normalMap, sunDir, { foamStart: DAM_TOE_Z + 18, foamEnd: DAM_TOE_Z + 2, flowSpeed: 0.05, distortion: 0.9 });
  const tail = new T.Mesh(tailGeo, tailMaterial);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, TAIL_LEVEL, DAM_TOE_Z - 5 + tailLength / 2);
  tail.frustumCulled = false;
  tail.renderOrder = 1;

  return {
    reservoir,
    tail,
    update(time) {
      if (reservoirWater) reservoirWater.material.uniforms.time.value = time * 0.6;
      else (reservoir.material as T.ShaderMaterial).uniforms.time.value = time;
      tailMaterial.uniforms.time.value = time;
    },
    dispose() {
      resGeo.dispose();
      tailGeo.dispose();
      (reservoir.material as T.Material).dispose();
      tailMaterial.dispose();
    },
  };
}
