"use client";

import { SCENES } from "@/lib/scenes";

export type FrameScrubOptions = {
  /** Disable entirely (reduced motion, small screens) and fall back to video. */
  enabled?: boolean;
  /** Fraction of a section's travel spent cross-dissolving into its neighbour. */
  handoff?: number;
};

/**
 * Phase 2 — scroll-scrubbed frame sequences.
 *
 * TODO(phase-2): replace the Phase 1 <video> stage with a single full-screen
 * <canvas> driven entirely by scroll position, so the camera moves exactly as
 * far as the user scrolls, forward and backward. Per design_handoff/README.md:
 *
 *   1. Assets: `frames/0N-<scene>/0001.jpg …` at 1920x1080, JPG q80, exported
 *      from each clip at 15fps. The exit clip's frames continue the same count
 *      (entry 0001-0120, exit 0121-0240) so one sequence spans the whole scene
 *      and hands off to the next on its final frame. Optional `frames-sm/` at
 *      960x540 for mobile. Fill in `Scene.frames` in lib/scenes.ts.
 *   2. Map section progress `p` in [0,1] to `round(p * (count - 1))`.
 *   3. Draw cover-fit, keeping the alternating scale mapping from
 *      SceneEngine (`1 + 0.22 * t`, t = p on even scenes, 1 - p on odd).
 *   4. Handoffs: cross-dissolve the last/first `handoff` of adjacent sections
 *      between the two frames.
 *   5. Preload the first frame of every scene immediately, then the current
 *      scene plus the next two; decode via `createImageBitmap`.
 *   6. Render inside requestAnimationFrame, and only when scroll or size
 *      actually changed.
 *   7. Grow the sections to ~2 viewport heights so each scene has enough
 *      scroll travel (tunable).
 *   8. Optionally key the verse blocks to frame ranges, e.g. Gita 2.3 fading
 *      in as Arjuna lifts his head.
 *   9. Mobile fallback: Phase 1 video behaviour, or `frames-sm/`.
 *
 * Until then this is inert: it reports that no scene has a frame sequence yet,
 * which is the signal SceneEngine uses to stay on the video stage.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- options land with the Phase 2 implementation
export function useFrameScrub(_options: FrameScrubOptions = {}): { ready: boolean } {
  // TODO(phase-2): build the canvas, preloader and rAF draw loop here.
  const ready = SCENES.every((scene) => scene.frames !== null);
  return { ready: ready && false };
}

export default useFrameScrub;
