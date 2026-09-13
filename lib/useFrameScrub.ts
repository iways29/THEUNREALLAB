"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { SCENES } from "@/lib/scenes";

export type FrameScrubOptions = {
  /** Disable entirely (reduced motion) and leave the video stage in charge. */
  enabled?: boolean;
  /** Fraction of a scene's travel spent cross-dissolving into the next. */
  handoff?: number;
  /** Scale travel per scene, alternating zoom-in / zoom-out. */
  zoom?: number;
};

export type ScrubApi = {
  /** True once every scene has its first frame decoded and the canvas can take over. */
  ready: boolean;
  /**
   * Draw the stage at `timeline`, a position in [0, SCENES.length] where the
   * integer part is the scene and the fraction is progress through it.
   */
  render: (timeline: number) => void;
};

/** Concurrent image requests. Keeps the network busy without starving the page. */
const CONCURRENCY = 6;
/** Scenes loaded ahead of the current one. */
const LOOKAHEAD = 2;

type Sequence = {
  urls: string[];
  images: (HTMLImageElement | null)[];
  /** Indices already decoded, kept sorted for nearest-frame fallback. */
  done: number[];
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Nearest already-decoded frame, so scrubbing degrades instead of blanking. */
function nearestLoaded(seq: Sequence, want: number): HTMLImageElement | null {
  if (seq.images[want]) return seq.images[want];
  const { done } = seq;
  if (done.length === 0) return null;
  let best = done[0];
  let bestD = Math.abs(best - want);
  for (let i = 1; i < done.length; i++) {
    const d = Math.abs(done[i] - want);
    if (d < bestD) {
      bestD = d;
      best = done[i];
    }
  }
  return seq.images[best];
}

/**
 * Phase 2 — scroll-scrubbed frame sequences.
 *
 * One full-screen canvas replaces the six <video> layers. Section progress maps
 * straight onto a frame index, so the camera moves exactly as far as the user
 * scrolls, forward and backward, with a cross-dissolve at each handoff.
 *
 * TODO(phase-2): the exit clips in `Scene.exitClip` are generated and committed
 * but not yet extracted to frames. When they are, append their frames to the
 * same sequence and raise `Scene.frames.count` — nothing here needs to change,
 * since a scene is treated as one flat timeline.
 */
export function useFrameScrub(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: FrameScrubOptions = {}
): ScrubApi {
  const { enabled = true, handoff = 0.1, zoom = 0.22 } = options;
  const renderRef = useRef<(timeline: number) => void>(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const frames = SCENES.map((s) => s.frames);
    if (frames.some((f) => f === null)) return; // no sequences yet

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Small screens get the half-size set; it is a quarter of the bytes.
    const small = window.innerWidth < 768;
    const sequences: Sequence[] = frames.map((f) => {
      const dir = small ? f!.dir.replace("/frames/", "/frames-sm/") : f!.dir;
      return {
        urls: Array.from(
          { length: f!.count },
          (_, i) => `${dir}/${String(i + 1).padStart(4, "0")}.jpg`
        ),
        images: new Array(f!.count).fill(null),
        done: [],
      };
    });

    let cancelled = false;
    let needsDraw = true;
    let lastTimeline = -1;

    // ── loading ──────────────────────────────────────────────────────────
    const queue: { scene: number; index: number }[] = [];
    const queued = new Set<string>();
    let active = 0;

    const enqueue = (scene: number, index: number, front = false) => {
      const key = `${scene}:${index}`;
      if (queued.has(key) || sequences[scene].images[index]) return;
      queued.add(key);
      const job = { scene, index };
      if (front) queue.unshift(job);
      else queue.push(job);
    };

    const pump = () => {
      while (!cancelled && active < CONCURRENCY && queue.length) {
        const job = queue.shift()!;
        const seq = sequences[job.scene];
        active++;
        const img = new Image();
        img.decoding = "async";
        img.src = seq.urls[job.index];
        const settle = (ok: boolean) => {
          active--;
          if (cancelled) return;
          if (ok) {
            seq.images[job.index] = img;
            seq.done.push(job.index);
            needsDraw = true;
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
    sequences.forEach((_, k) => enqueue(k, 0));
    pump();

    let lastPriority = -1;
    const prioritise = (scene: number) => {
      if (scene === lastPriority) return;
      lastPriority = scene;
      queue.length = 0;
      queued.clear();
      for (let k = scene; k <= Math.min(scene + LOOKAHEAD, sequences.length - 1); k++) {
        const seq = sequences[k];
        // Interleave so a coarse pass lands before the in-between frames.
        for (let step = 8; step >= 1; step = Math.floor(step / 2)) {
          for (let i = 0; i < seq.urls.length; i += step) enqueue(k, i);
          if (step === 1) break;
        }
      }
      pump();
    };

    // ── canvas sizing ────────────────────────────────────────────────────
    let cw = 0;
    let ch = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsDraw = true;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── drawing ──────────────────────────────────────────────────────────
    const drawCover = (img: HTMLImageElement, scale: number, alpha: number) => {
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
      dw *= scale;
      dh *= scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    };

    const frameFor = (seq: Sequence, p: number) =>
      Math.round(clamp01(p) * (seq.urls.length - 1));

    // Alternating zoom-in / zoom-out, matching the Phase 1 layer scale.
    const scaleFor = (scene: number, p: number) =>
      1 + zoom * (scene % 2 === 0 ? p : 1 - p);

    const paint = (timeline: number) => {
      const last = sequences.length - 1;
      const clamped = Math.max(0, Math.min(timeline, last + 0.999999));
      const scene = Math.min(Math.floor(clamped), last);
      const p = clamped - scene;

      ctx.fillStyle = "#100c08";
      ctx.fillRect(0, 0, cw, ch);

      const base = nearestLoaded(sequences[scene], frameFor(sequences[scene], p));
      if (base) drawCover(base, scaleFor(scene, p), 1);

      // Cross-dissolve into the next scene's first frame over the last `handoff`.
      if (p > 1 - handoff && scene < last) {
        const t = smoothstep(clamp01((p - (1 - handoff)) / handoff));
        const nextSeq = sequences[scene + 1];
        const incoming = nearestLoaded(nextSeq, 0);
        if (incoming) drawCover(incoming, scaleFor(scene + 1, 0), t);
      }

      prioritise(scene);
    };

    renderRef.current = (timeline: number) => {
      if (!needsDraw && Math.abs(timeline - lastTimeline) < 0.0002) return;
      lastTimeline = timeline;
      needsDraw = false;
      paint(timeline);
    };

    // Take over only once every scene can show something.
    const firstFramesReady = () => sequences.every((s) => s.images[0]);
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
  }, [canvasRef, enabled, handoff, zoom]);

  return {
    ready,
    render: (timeline: number) => renderRef.current(timeline),
  };
}

export default useFrameScrub;
