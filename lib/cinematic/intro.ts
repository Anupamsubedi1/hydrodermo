// Autoplay opening controller. Like the progress store, the value the scene
// reads every frame is mutated inside a closure rather than through React
// state, so driving the camera never costs a re-render.

import type { IntroState } from "./types.ts";

export interface IntroController {
  /** Handed to the scene; `value` is read every frame. */
  readonly state: IntroState;
  readonly value: number;
  /** True once the camera is fully on the scroll path. */
  readonly done: boolean;
  set(value: number): void;
}

export function createIntro(initial = 0): IntroController {
  const state: IntroState = { value: initial };
  return {
    state,
    get value() {
      return state.value;
    },
    get done() {
      return state.value >= 1;
    },
    set(value) {
      state.value = value < 0 ? 0 : value > 1 ? 1 : value;
    },
  };
}
