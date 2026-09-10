import * as T from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

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
  u.turbidity.value = 4;
  u.rayleigh.value = 1.7;
  u.mieCoefficient.value = 0.0035;
  u.mieDirectionalG.value = 0.8;
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
    fogColor: new T.Color("#bfd0d2"),
    dispose() {
      target.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
    },
  };
}
