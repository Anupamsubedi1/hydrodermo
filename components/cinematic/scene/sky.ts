import * as T from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { LOOK } from "./scene-config";

export interface Atmosphere {
  sky: Sky;
  sunDirection: T.Vector3;
  sunColor: T.Color;
  environment: T.Texture;
  fogColor: T.Color;
  dispose(): void;
}

/** Procedural dawn sky, sun direction and a PMREM environment derived from it (no downloads). */
export function createAtmosphere(renderer: T.WebGLRenderer, elevationDeg: number, azimuthDeg: number): Atmosphere {
  const sky = new Sky();
  sky.scale.setScalar(20000);
  const u = sky.material.uniforms;
  u.turbidity.value = 2.8;
  u.rayleigh.value = 2.1;
  u.mieCoefficient.value = 0.002;
  u.mieDirectionalG.value = 0.76;
  u.cloudCoverage.value = 0.32;
  u.cloudDensity.value = 0.65;
  // Scale linear sky radiance before both the environment capture and display.
  // Lowering the directional light alone leaves the sky and reflections blown out.
  u.skyRadiance = { value: LOOK.skyRadiance };
  sky.material.fragmentShader = `uniform float skyRadiance;\n${sky.material.fragmentShader}`.replace(
    "vec4( texColor, 1.0 )",
    "vec4( texColor * skyRadiance, 1.0 )",
  );
  const phi = T.MathUtils.degToRad(90 - elevationDeg);
  const theta = T.MathUtils.degToRad(azimuthDeg);
  const sunDirection = new T.Vector3().setFromSphericalCoords(1, phi, theta);
  u.sunPosition.value.copy(sunDirection);

  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new T.Scene();
  envScene.add(sky);
  const target = pmrem.fromScene(envScene, 0.02);
  envScene.remove(sky);
  pmrem.dispose();

  return {
    sky,
    sunDirection,
    sunColor: new T.Color("#ffe6c4"),
    environment: target.texture,
    fogColor: new T.Color(LOOK.fogColor),
    dispose() {
      target.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
    },
  };
}
