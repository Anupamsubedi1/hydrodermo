// Shared contracts between the cinematic wrapper and the deferred WebGL scene.
// This module must never import React or Three.js.

/** Chapter index derived from normalized scroll progress (see config.ts). */
export type Chapter = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Single source of truth for scroll progress. The wrapper is the only writer:
 * GSAP ScrollTrigger sets `target`, a wrapper-owned ticker damps `current`
 * toward it and derives `chapter`. Listeners are notified after every change,
 * including the final settled value.
 */
export interface ProgressStore {
  readonly target: number;
  readonly current: number;
  readonly chapter: Chapter;
  subscribe(listener: (store: ProgressStore) => void): () => void;
}

export interface SceneAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export type QualityTier = "high" | "medium" | "low";

export interface SceneQuality {
  readonly tier: QualityTier;
  /** Device pixel ratio cap handed to the renderer. */
  readonly dpr: number;
  /** Real-time shadow maps on key geometry. */
  readonly shadows: boolean;
  /** Shadow map resolution when shadows are on. */
  readonly shadowMapSize: 1024 | 2048;
  /** Planar reflection on the reservoir water (renders the scene twice). */
  readonly reflection: boolean;
  /** Half-resolution bloom pass. */
  readonly bloom: boolean;
  /** Instanced conifer count. */
  readonly trees: number;
  /** Terrain grid segments per side. */
  readonly terrainSegments: number;
  /** Particle counts scale (0..1). */
  readonly particles: number;
}

export type SceneErrorKind = "load" | "context" | "asset" | "shader" | "render";

export interface SceneError {
  readonly kind: SceneErrorKind;
  readonly message: string;
}

export interface ScenePerformanceSample {
  /** 95th percentile interval (ms) between rendered frames while active. */
  readonly activeFrameMsP95: number;
  readonly samples: number;
}

export interface SceneReadyInfo {
  readonly renderedProgress: number;
}

export type AnchorId = "penstock" | "turbine" | "generator" | "transformer" | "grid";

/** Screen-space position of a labelled 3D point, in CSS pixels relative to the canvas. */
export interface AnchorPosition {
  readonly id: AnchorId;
  readonly x: number;
  readonly y: number;
  /** False when behind the camera or outside the frame. */
  readonly visible: boolean;
}

/**
 * Props of the deferred WebGL scene. The scene owns rendering and GPU
 * resources; the wrapper owns progress, chapters, eligibility, quality
 * decisions, fallback presentation, and all HTML/accessibility.
 */
export interface HydroSceneProps {
  progress: ProgressStore;
  /** True only while the stage intersects the viewport and the document is visible. */
  active: boolean;
  quality: SceneQuality;
  onReady(info: SceneReadyInfo): void;
  onError(error: SceneError): void;
  onPerformance(sample: ScenePerformanceSample): void;
  /** Called every rendered frame during the machine chapters with projected label anchors. */
  onAnchors?(anchors: readonly AnchorPosition[]): void;
}
