"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FRAMES, SCENES, frameAt, frameUrl } from "@/lib/scenes";
import { createStageRenderer } from "@/lib/stageRenderer";

export type FrameScrubOptions = {
  /** Disable entirely (reduced motion) and leave the video stage in charge. */
  enabled?: boolean;
  /** Fraction of a scene's travel spent dissolving across the cut into the next. */
  handoff?: number;
};

export type ScrubApi = {
  /** True once every scene has its first frame decoded and the canvas can take over. */
  ready: boolean;
  /** Draw the stage at `timeline` (see `frameAt`), or at an exact 1-based `frame`. */
  render: (timeline: number, frame?: number) => void;
  /** Whether a 1-based frame has decoded. */
  has: (frame: number) => boolean;
};

/** Concurrent image requests. Keeps the network busy without starving the page. */
const CONCURRENCY = 6;
/** Scenes loaded ahead of the current one. */
const LOOKAHEAD = 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The scroll-scrubbed stage.
 *
 * One full-screen canvas draws a frame of the merged film indexed by scroll
 * position, forward and backward. Frames load coarse-to-fine around the
 * current scene, and the nearest already-decoded frame is drawn while the
 * exact one is still in flight, so fast scrubbing degrades instead of blanking.
 */
export function useFrameScrub(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: FrameScrubOptions = {}
): ScrubApi {
  const { enabled = true, handoff = 0.09 } = options;
  const renderRef = useRef<(t: number, f?: number) => void>(() => {});
  const hasRef = useRef<(f: number) => boolean>(() => false);
  // Stable identities, so consumers can list them as effect dependencies.
  const api = useRef({
    render: (t: number, f?: number) => renderRef.current(t, f),
    has: (f: number) => hasRef.current(f),
  }).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const renderer = createStageRenderer(canvas);
    if (!renderer) return;

    // Small screens get the half-size set; it is a quarter of the bytes.
    const small = window.innerWidth < 768;
    const count = FRAMES.count;
    const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
    hasRef.current = (f) => Boolean(images[f - 1]);

    let cancelled = false;
    let needsDraw = true;
    let lastTimeline = -1;
    let lastFrame = -1;

    // ── loading ──────────────────────────────────────────────────────────
    const queue: number[] = [];
    const queued = new Uint8Array(count);
    let active = 0;

    const enqueue = (index: number, front = false) => {
      if (index < 0 || index >= count || queued[index] || images[index]) return;
      queued[index] = 1;
      if (front) queue.unshift(index);
      else queue.push(index);
    };

    const pump = () => {
      while (!cancelled && active < CONCURRENCY && queue.length) {
        const index = queue.shift()!;
        active++;
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(index + 1, small);
        const settle = (ok: boolean) => {
          active--;
          if (cancelled) return;
          if (ok) {
            images[index] = img;
            needsDraw = true;
          } else {
            queued[index] = 0;
          }
          pump();
        };
        img
          .decode()
          .then(() => settle(true))
          .catch(() => {
            // Safari can reject decode() for images that still load fine.
            if (img.complete && img.naturalWidth > 0) settle(true);
            else settle(false);
          });
      }
    };

    // First frame of every scene so the stage is never empty, then the whole
    // opening scene in order: it plays itself on load and wants to run ahead
    // of the network, not behind it.
    SCENES.forEach((s) => enqueue(s.range[0] - 1));
    for (let i = SCENES[0].range[0] - 1; i <= SCENES[0].range[1] - 1; i++) enqueue(i);
    pump();

    let lastPriority = -1;
    const prioritise = (scene: number) => {
      if (scene === lastPriority) return;
      // The first pass appends behind the opening; later ones drop what is
      // waiting (in-flight requests still land).
      if (lastPriority >= 0) {
        for (const i of queue) queued[i] = 0;
        queue.length = 0;
      }
      lastPriority = scene;
      const last = SCENES.length - 1;
      const window_ = [];
      for (let k = scene; k <= Math.min(scene + LOOKAHEAD, last); k++) window_.push(k);
      if (scene > 0) window_.push(scene - 1);
      // Coarse pass over the whole window first, then refine.
      for (let step = 16; step >= 1; step = step >> 1) {
        for (const k of window_) {
          const [start, end] = SCENES[k].range;
          for (let i = start - 1; i <= end - 1; i += step) enqueue(i);
          enqueue(end - 1);
        }
      }
      pump();
    };

    /** Nearest already-decoded frame, searching outward from the one wanted. */
    const nearestLoaded = (want: number): HTMLImageElement | null => {
      if (images[want]) return images[want];
      for (let d = 1; d < count; d++) {
        const a = want - d;
        const b = want + d;
        if (a >= 0 && images[a]) return images[a];
        if (b < count && images[b]) return images[b];
        if (a < 0 && b >= count) break;
      }
      return null;
    };

    // ── canvas sizing ────────────────────────────────────────────────────
    const resize = () => {
      // Full device pixels up to 2x: the frames are resampled once, straight
      // to the screen, instead of twice through a smaller backing store.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.resize(window.innerWidth, window.innerHeight, dpr);
      needsDraw = true;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── drawing ──────────────────────────────────────────────────────────
    const paint = (timeline: number, frame?: number) => {
      const last = SCENES.length - 1;
      const clamped = Math.max(0, Math.min(timeline, last + 0.999999));
      const scene = Math.min(Math.floor(clamped), last);
      const p = clamped - scene;

      const want = (frame ?? frameAt(timeline)) - 1;
      // The frame under the playhead jumps the queue.
      if (!images[want]) {
        enqueue(want, true);
        pump();
      }

      const base = nearestLoaded(want);
      if (!base) return;

      // Every scene boundary is a hard cut in the footage; dissolve across it
      // over the last sliver of the outgoing scene so scrolling never snaps.
      let incoming: HTMLImageElement | null = null;
      let mix = 0;
      if (frame === undefined && p > 1 - handoff && scene < last) {
        mix = smoothstep(clamp01((p - (1 - handoff)) / handoff));
        incoming = nearestLoaded(SCENES[scene + 1].range[0] - 1);
      }
      renderer.draw(base, incoming, mix);

      prioritise(scene);
    };

    renderRef.current = (timeline: number, frame?: number) => {
      const f = frame ?? -1;
      if (
        !needsDraw &&
        f === lastFrame &&
        Math.abs(timeline - lastTimeline) < 0.0002
      )
        return;
      lastTimeline = timeline;
      lastFrame = f;
      needsDraw = false;
      paint(timeline, frame);
    };

    // Take over only once every scene can show something.
    const firstFramesReady = () => SCENES.every((s) => images[s.range[0] - 1]);
    const watch = window.setInterval(() => {
      if (cancelled) return;
      if (firstFramesReady()) {
        window.clearInterval(watch);
        setReady(true);
        needsDraw = true;
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearInterval(watch);
      window.removeEventListener("resize", resize);
      renderRef.current = () => {};
      hasRef.current = () => false;
      renderer.dispose();
      setReady(false);
    };
  }, [canvasRef, enabled, handoff]);

  return { ready, render: api.render, has: api.has };
}

export default useFrameScrub;
