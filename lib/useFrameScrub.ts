"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FRAMES, SCENES, frameAt, frameUrl } from "@/lib/scenes";

export type FrameScrubOptions = {
  /** Disable entirely (reduced motion) and leave the video stage in charge. */
  enabled?: boolean;
  /** Fraction of a scene's travel spent dissolving across the cut into the next. */
  handoff?: number;
  /** Overscan so the stage can drift under the pointer without showing edges. */
  parallax?: number;
};

export type ScrubApi = {
  /** True once every scene has its first frame decoded and the canvas can take over. */
  ready: boolean;
  /**
   * Draw the stage at `timeline` (see `frameAt`). `px`/`py` are the pointer in
   * [-1, 1] and pan the frame a little for depth.
   */
  render: (timeline: number, px?: number, py?: number) => void;
};

/** Concurrent image requests. Keeps the network busy without starving the page. */
const CONCURRENCY = 6;
/** Scenes loaded ahead of the current one. */
const LOOKAHEAD = 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Phase 2 — the scroll-scrubbed stage.
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
  const { enabled = true, handoff = 0.09, parallax = 0.022 } = options;
  const renderRef = useRef<(t: number, px?: number, py?: number) => void>(
    () => {}
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Small screens get the half-size set; it is a quarter of the bytes.
    const small = window.innerWidth < 768;
    const count = FRAMES.count;
    const images: (HTMLImageElement | null)[] = new Array(count).fill(null);

    let cancelled = false;
    let needsDraw = true;
    let lastTimeline = -1;
    let lastPx = 0;
    let lastPy = 0;

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

    /** First frame of every scene, so the stage is never empty. */
    SCENES.forEach((s) => enqueue(s.range[0] - 1));
    pump();

    let lastPriority = -1;
    const prioritise = (scene: number) => {
      if (scene === lastPriority) return;
      lastPriority = scene;
      // Drop what is waiting; in-flight requests still land.
      for (const i of queue) queued[i] = 0;
      queue.length = 0;
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
    let cw = 0;
    let ch = 0;
    const resize = () => {
      // Full device pixels up to 2x: the frames are upscaled once, straight
      // to the screen, instead of twice through a smaller backing store.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      needsDraw = true;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── drawing ──────────────────────────────────────────────────────────
    const drawCover = (
      img: HTMLImageElement,
      alpha: number,
      px: number,
      py: number
    ) => {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number;
      let dh: number;
      if (ir > cr) {
        dh = ch;
        dw = ch * ir;
      } else {
        dw = cw;
        dh = cw / ir;
      }
      const scale = 1 + parallax;
      dw *= scale;
      dh *= scale;
      // The pointer pans the overscan; the frame moves against the pointer,
      // like looking past a window frame.
      const ox = -px * (dw - cw) * 0.5 * 0.9;
      const oy = -py * (dh - ch) * 0.5 * 0.9;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2 + ox, (ch - dh) / 2 + oy, dw, dh);
      ctx.globalAlpha = 1;
    };

    const paint = (timeline: number, px: number, py: number) => {
      const last = SCENES.length - 1;
      const clamped = Math.max(0, Math.min(timeline, last + 0.999999));
      const scene = Math.min(Math.floor(clamped), last);
      const p = clamped - scene;

      const want = frameAt(timeline) - 1;
      // The frame under the scroll position jumps the queue.
      if (!images[want]) {
        enqueue(want, true);
        pump();
      }

      ctx.fillStyle = "#100c08";
      ctx.fillRect(0, 0, cw, ch);

      const base = nearestLoaded(want);
      if (base) drawCover(base, 1, px, py);

      // Every scene boundary is a hard cut in the footage; dissolve across it
      // over the last sliver of the outgoing scene so scrolling never snaps.
      if (p > 1 - handoff && scene < last) {
        const t = smoothstep(clamp01((p - (1 - handoff)) / handoff));
        const incoming = nearestLoaded(SCENES[scene + 1].range[0] - 1);
        if (incoming) drawCover(incoming, t, px, py);
      }

      prioritise(scene);
    };

    renderRef.current = (timeline: number, px = 0, py = 0) => {
      if (
        !needsDraw &&
        Math.abs(timeline - lastTimeline) < 0.0002 &&
        Math.abs(px - lastPx) < 0.002 &&
        Math.abs(py - lastPy) < 0.002
      )
        return;
      lastTimeline = timeline;
      lastPx = px;
      lastPy = py;
      needsDraw = false;
      paint(timeline, px, py);
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
      setReady(false);
    };
  }, [canvasRef, enabled, handoff, parallax]);

  return {
    ready,
    render: (timeline, px, py) => renderRef.current(timeline, px, py),
  };
}

export default useFrameScrub;
