"use client";

import { Component, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as T from "three";
import type { AnchorPosition, HydroSceneProps, SceneError } from "../../../lib/cinematic/types";
import { buildWorld, type World } from "./world";

class SceneBoundary extends Component<{ children: ReactNode; onError: HydroSceneProps["onError"] }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError({ kind: "render", message: error.message });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function SceneContents(props: HydroSceneProps) {
  const { gl, scene, camera, size } = useThree();
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const world = useRef<World | null>(null);
  const failed = useRef(false);
  const ready = useRef(false);
  const clock = useRef({ last: 0, time: 0, samples: [] as number[], activeMs: 0 });
  const anchors = useRef<AnchorPosition[]>([]);
  const appliedQuality = useRef(props.quality);

  useEffect(() => {
    const fail = (error: SceneError) => {
      if (failed.current) return;
      failed.current = true;
      latest.current.onError(error);
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      fail({ kind: "context", message: "WebGL context lost" });
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    let disposed = false;
    buildWorld(gl, scene, camera as T.PerspectiveCamera, latest.current.quality, size.width, size.height, () => disposed, (message) =>
      fail({ kind: "shader", message }),
    )
      .then((built) => {
        if (disposed) {
          built.dispose();
          return;
        }
        world.current = built;
        built.resize(size.width, size.height, gl.getPixelRatio());
      })
      .catch((error: unknown) => {
        if (disposed) return;
        fail({ kind: "render", message: error instanceof Error ? error.message : "World construction failed" });
      });
    return () => {
      disposed = true;
      gl.domElement.removeEventListener("webglcontextlost", onLost);
      world.current?.dispose();
      world.current = null;
    };
    // The world is built once; quality changes are applied incrementally below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    world.current?.resize(size.width, size.height, gl.getPixelRatio());
  }, [size.width, size.height, gl]);

  useEffect(() => {
    if (appliedQuality.current !== props.quality) {
      appliedQuality.current = props.quality;
      world.current?.setQuality(props.quality);
      world.current?.resize(size.width, size.height, gl.getPixelRatio());
      clock.current.samples = [];
      clock.current.activeMs = 0;
    }
  }, [props.quality, size.width, size.height, gl]);

  useFrame(() => {
    const w = world.current;
    if (!w || failed.current) return;
    const current = latest.current;
    const now = performance.now();
    const c = clock.current;
    const dt = c.last ? Math.min(0.1, (now - c.last) / 1000) : 0;
    if (current.active) c.time += dt;
    const progress = current.progress.current;
    try {
      w.update(progress, c.time, camera as T.PerspectiveCamera, size.width / size.height);
      w.render();
      if (!ready.current) {
        ready.current = true;
        current.onReady({ renderedProgress: progress });
      }
      if (current.onAnchors && progress > 0.66) {
        w.anchors(camera as T.PerspectiveCamera, size.width, size.height, anchors.current);
        current.onAnchors(anchors.current);
      }
      if (current.active && c.last) {
        const interval = now - c.last;
        c.samples.push(interval);
        if (c.samples.length > 180) c.samples.shift();
        c.activeMs += interval;
        if (c.activeMs >= 2500) {
          const sorted = [...c.samples].sort((a, b) => a - b);
          current.onPerformance({ activeFrameMsP95: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)], samples: sorted.length });
          c.activeMs = 0;
        }
      }
      c.last = current.active ? now : 0;
    } catch (error) {
      failed.current = true;
      current.onError({ kind: "render", message: error instanceof Error ? error.message : "Scene render failed" });
    }
  }, 1);

  return null;
}

export default function HydroScene(props: HydroSceneProps) {
  return (
    <SceneBoundary onError={props.onError}>
      <Canvas
        frameloop={props.active ? "always" : "never"}
        dpr={props.quality.dpr}
        camera={{ fov: 42, near: 0.5, far: 6000, position: [0, 6, -800] }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false, depth: true, preserveDrawingBuffer: false }}
        shadows={props.quality.shadows ? { type: T.PCFShadowMap } : false}
        style={{ position: "absolute", inset: 0 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new T.Color("#b9cbd0"), 1);
        }}
      >
        <SceneContents {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
