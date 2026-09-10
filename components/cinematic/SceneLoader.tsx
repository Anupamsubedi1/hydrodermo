"use client";

import dynamic from "next/dynamic";
import { Component, type ErrorInfo, type ReactNode } from "react";
import type { HydroSceneProps, SceneError } from "@/lib/cinematic/types";

// Declared inside a Client Component as Next requires for ssr: false. Nothing
// in this module imports Three.js; the whole scene graph stays in the deferred
// chunk that only this import touches.
const HydroScene = dynamic(() => import("./scene/HydroScene"), { ssr: false, loading: () => null });
// (three, @react-three/fiber and the three/examples modules live only in that chunk.)

interface BoundaryProps {
  onError: (error: SceneError) => void;
  children: ReactNode;
}

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const chunkFailure = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(`${error.name} ${error.message}`);
    this.props.onError({
      kind: chunkFailure ? "load" : "render",
      message: `${error.message}${info.componentStack ? ` @ ${info.componentStack.split("\n")[1]?.trim() ?? ""}` : ""}`,
    });
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneLoader(props: HydroSceneProps) {
  return (
    <SceneBoundary onError={props.onError}>
      <HydroScene {...props} />
    </SceneBoundary>
  );
}
