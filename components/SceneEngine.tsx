"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import useFrameScrub from "@/lib/useFrameScrub";
import { BASE_TRAVEL, CHOREOGRAPHY, DRIFT } from "@/lib/choreography";
import { FRAMES, SCENES, frameAt } from "@/lib/scenes";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Video fallback only: mix window between adjacent clips. */
const HANDOFF = 0.1;
/** Time constants (ms) for the eased stage and pointer. */
const STAGE_LAG = 85;
const POINTER_LAG = 160;
/** Share of the viewport over which a block fades as it enters at the bottom
 *  and leaves at the top. The nav covers the top, so the exit starts under it. */
const ENTER_BAND = 0.2;
const EXIT_BAND = 0.16;
const NAV_H = 72;

/**
 * Where the veil's dark focus sits for each scene, as viewport fractions.
 * Bottom for the scenes whose copy sits low, left or right for the ones
 * whose copy sits to a side. The engine slides between them.
 */
const VEIL: [number, number][] = [
  [0.5, 1.08],
  [-0.05, 0.55],
  [1.05, 0.55],
  [0.72, 1.0],
  [-0.05, 0.55],
  [0.45, 1.08],
];

type Tracked = {
  el: HTMLElement;
  scene: number;
  depth: number;
  /** Progress offset from the element's stagger position in its section. */
  offset: number;
  scale: number;
  sway: number;
  tilt: boolean;
  track: [number, number] | null;
  phase: number;
  /** Hero only: ms before this element starts its entrance; -1 = no fade. */
  introDelay: number;
  /** Document-space top and height, measured with transforms cleared. */
  top: number;
  height: number;
  /** Viewport progress at load, for blocks already on screen: they start
   *  where the layout put them and lift from there. */
  ps0: number;
};

/** Hero entrance delays, in ms, matching the handoff's intro timing. */
const INTRO: Record<string, number> = {
  eyebrow: 200,
  eyebrow__text: 200,
  h1: -1, // the words rise out of their masks instead (SplitText)
  hero__sub: 900,
  hero__cta: 1200,
  "verse-card": 600,
  seal: 1400,
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export default function SceneEngine({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  );
  const { ready, render } = useFrameScrub(canvasRef, { enabled: !reduced });
  // The rAF loop reads this without needing to be torn down when it flips.
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = ready;
    document.documentElement.classList.toggle("scrub-ready", ready);
    // The canvas owns the stage now. Without this the clips keep playing and
    // streaming behind a fully transparent layer, forever.
    if (ready) {
      document
        .querySelectorAll<HTMLVideoElement>(".stage__video")
        .forEach((video) => {
          if (!video.paused) video.pause();
        });
    }
    return () => document.documentElement.classList.remove("scrub-ready");
  }, [ready]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene]")
    );
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene-layer]")
    );
    const bar = document.querySelector<HTMLElement>("[data-progress]");
    const veil = document.querySelector<HTMLElement>("[data-veil]");
    const rail = document.querySelector<HTMLElement>("[data-rail]");
    const railItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rail-item]")
    );
    const counterFrame = document.querySelector<HTMLElement>("[data-counter-frame]");
    const counterTime = document.querySelector<HTMLElement>("[data-counter-time]");
    const counterScene = document.querySelector<HTMLElement>("[data-counter-scene]");
    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".nav__link")
    );
    if (!sections.length) return;

    const sceneOf = (el: HTMLElement) => {
      const section = el.closest<HTMLElement>("[data-scene]");
      return section ? sections.indexOf(section) : 0;
    };

    // ── collect everything the choreography moves ────────────────────────
    const tracked: Tracked[] = [];
    const inks: { el: HTMLElement; scene: number; top: number; height: number }[] = [];
    if (!reduced) {
      CHOREOGRAPHY.forEach((spec) => {
        const perSection = new Map<number, number>();
        document
          .querySelectorAll<HTMLElement>(spec.selector)
          .forEach((el) => {
            const scene = sceneOf(el);
            const i = perSection.get(scene) ?? 0;
            perSection.set(scene, i + 1);
            const key = Object.keys(INTRO).find((k) =>
              el.classList.contains(k)
            );
            tracked.push({
              el,
              scene,
              depth: spec.depth,
              offset: (spec.stagger ?? 0) * i,
              scale: spec.scale ?? 0,
              sway: spec.sway ?? 0,
              tilt: Boolean(spec.tilt),
              track: spec.track ?? null,
              phase: tracked.length * 1.7,
              introDelay: scene === 0 && key ? INTRO[key] : 0,
              top: 0,
              height: 0,
              ps0: 0,
            });
          });
      });
      tracked.forEach((t) => {
        t.el.style.willChange = "transform, opacity";
      });
      document
        .querySelectorAll<HTMLElement>(".verse__deva, .verse-card__deva")
        .forEach((el) => inks.push({ el, scene: sceneOf(el), top: 0, height: 0 }));
    }

    // ── geometry, measured once per layout ───────────────────────────────
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    const tops: number[] = [];
    const heights: number[] = [];

    const measure = () => {
      vh = window.innerHeight;
      vw = window.innerWidth;
      const y = window.scrollY;
      // Read the layout with the choreography's transforms cleared; the next
      // frame writes them back.
      tracked.forEach((t) => (t.el.style.transform = ""));
      sections.forEach((section, i) => {
        const r = section.getBoundingClientRect();
        tops[i] = r.top + y;
        heights[i] = Math.max(1, section.offsetHeight);
      });
      tracked.forEach((t) => {
        const r = t.el.getBoundingClientRect();
        t.top = r.top + y;
        t.height = Math.max(1, r.height);
        t.ps0 = t.top < vh ? clamp01((vh - t.top) / (vh + t.height)) : 0;
      });
      inks.forEach((ink) => {
        const r = ink.el.getBoundingClientRect();
        ink.top = r.top + y;
        ink.height = Math.max(1, r.height);
      });
    };
    measure();
    // Fonts and the split headings can shift the layout after mount.
    const remeasure = window.setTimeout(measure, 1200);
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    // ── pointer, for the parallax ────────────────────────────────────────
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / vw) * 2 - 1;
      pointer.ty = (e.clientY / vh) * 2 - 1;
    };
    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };
    if (finePointer && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    // The clips exist as a safety net, not as the first thing a visitor
    // downloads. Posters carry the stage until the canvas is ready; only if it
    // is still not ready after this long do we actually start playing video.
    let fallbackEngaged = false;
    const grace = window.setTimeout(() => {
      if (!readyRef.current) fallbackEngaged = true;
    }, 2500);

    const t0 = performance.now();
    let raf = 0;
    let last = t0;
    let stageT = -1;
    let lastFrame = -1;
    let lastScene = -1;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const y = window.scrollY;

      // Scene progress spans the section's full height, so the stage keeps
      // moving the whole way through. Sections already passed contribute 1,
      // making the sum a continuous scene timeline across the whole page.
      let timeline = 0;
      for (let i = 0; i < sections.length; i++) {
        timeline += clamp01((y - tops[i]) / heights[i]);
      }

      const lastIndex = sections.length - 1;
      const scene = Math.min(Math.floor(timeline), lastIndex);
      const p = timeline - scene;

      // The stage eases toward the scroll position so a flick of the wheel
      // reads as a camera move, not a jump cut. The content follows scroll
      // exactly; the lag is short enough that the two never feel apart.
      if (stageT < 0) stageT = timeline;
      const kStage = 1 - Math.exp(-dt / STAGE_LAG);
      stageT += (timeline - stageT) * kStage;
      if (Math.abs(timeline - stageT) < 0.0004) stageT = timeline;

      const kPointer = 1 - Math.exp(-dt / POINTER_LAG);
      pointer.x += (pointer.tx - pointer.x) * kPointer;
      pointer.y += (pointer.ty - pointer.y) * kPointer;

      if (readyRef.current && !reduced) {
        render(stageT, pointer.x, pointer.y);
      } else {
        // Fallback: the six video layers, mixed on the same timeline.
        layers.forEach((layer, k) => {
          let opacity = 0;
          if (k === scene) opacity = 1;
          else if (k === scene + 1 && p > 1 - HANDOFF)
            opacity = smoothstep(clamp01((p - (1 - HANDOFF)) / HANDOFF));
          layer.style.opacity = opacity.toFixed(3);
          layer.style.zIndex = k === scene ? "2" : "1";
          if (!reduced) {
            const t = k === scene ? p : 0;
            layer.style.transform = `scale(${(
              1 + 0.22 * (k % 2 === 0 ? t : 1 - t)
            ).toFixed(4)})`;
          }
          // Opacity still mixes so the right poster is showing; playback only
          // starts once the fallback is genuinely needed.
          const video = layer.querySelector("video");
          if (video && !reduced && fallbackEngaged) {
            if (opacity > 0.02 && video.paused) video.play().catch(() => {});
            else if (opacity <= 0.02 && !video.paused) video.pause();
          }
        });
      }

      // The veil's focus slides between scenes around each cut, so the dark
      // side of the frame moves with the copy instead of switching.
      if (veil) {
        const k = Math.max(0, Math.min(stageT - 0.5, lastIndex));
        const i = Math.floor(k);
        const j = Math.min(i + 1, lastIndex);
        const f = smoothstep(clamp01(k - i));
        const vx = VEIL[i][0] + (VEIL[j][0] - VEIL[i][0]) * f;
        const vy = VEIL[i][1] + (VEIL[j][1] - VEIL[i][1]) * f;
        veil.style.setProperty("--vx", `${(vx * 100).toFixed(2)}%`);
        veil.style.setProperty("--vy", `${(vy * 100).toFixed(2)}%`);
      }

      const elapsed = now - t0;

      if (!reduced) {
        for (let i = 0; i < tracked.length; i++) {
          const t = tracked[i];
          // Where the block sits in the viewport, before its own lift.
          const vy = t.top - y;
          const vb = vy + t.height;
          // Progress through the viewport: 0 as its top enters at the bottom,
          // 1 as its bottom leaves at the top.
          let ps = clamp01((vh - vy) / (vh + t.height));
          if (t.offset) ps = clamp01((ps - t.offset) / (1 - t.offset));

          // Rises as it travels, plus a slow idle drift. Blocks on screen at
          // load start at rest and lift from there.
          const lift = -Math.max(0, ps - t.ps0) * t.depth * BASE_TRAVEL;
          const drift =
            Math.sin(elapsed / 2600 + t.phase) * DRIFT * t.depth;

          // Fades are confined to the edges of the viewport.
          const exit = smoothstep(clamp01((vb - NAV_H) / (vh * EXIT_BAND)));
          let entry = smoothstep(clamp01((vh - vy - t.offset * vh * 0.6) / (vh * ENTER_BAND)));
          let enter = 0;
          if (t.scene === 0 && t.top < vh) {
            // The hero is on screen at load, so it uses a timed entrance.
            if (t.introDelay >= 0) {
              entry = smoothstep(clamp01((elapsed - t.introDelay) / 1000));
              if (t.introDelay) enter = (1 - entry) * 30;
            } else {
              entry = 1;
            }
          }
          const alpha = exit * entry;

          const s = t.scale ? 1 - t.scale * ps : 1;
          const sx = t.sway * pointer.x;
          const sy = t.tilt ? t.sway * 0.5 * pointer.y : 0;

          t.el.style.opacity = alpha.toFixed(3);
          t.el.style.transform =
            `translate3d(${sx.toFixed(2)}px, ${(lift + drift + enter + sy).toFixed(2)}px, 0)` +
            (t.tilt
              ? ` rotateX(${(-pointer.y * 4).toFixed(2)}deg) rotateY(${(pointer.x * 5).toFixed(2)}deg)`
              : "") +
            (t.scale ? ` scale(${s.toFixed(4)})` : "");
          if (t.track) {
            t.el.style.letterSpacing = `${(t.track[0] + (t.track[1] - t.track[0]) * entry).toFixed(3)}em`;
          }
        }

        // Verses ink in from the left as their block settles into view.
        for (let i = 0; i < inks.length; i++) {
          const ink = inks[i];
          const vy = ink.top - y;
          const v =
            ink.scene === 0 && ink.top < vh
              ? smoothstep(clamp01((elapsed - 800) / 1800))
              : smoothstep(clamp01((vh * 0.92 - vy) / (vh * 0.36)));
          ink.el.style.setProperty("--ink", v.toFixed(3));
        }
      }

      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.width = `${(max > 0 ? (y / max) * 100 : 0).toFixed(2)}%`;
      }

      // Chapter rail, frame counter and nav follow the stage's own clock.
      if (rail) {
        rail.style.setProperty(
          "--t",
          (Math.min(stageT, lastIndex) / lastIndex).toFixed(4)
        );
      }
      const frame = frameAt(stageT);
      if (frame !== lastFrame) {
        lastFrame = frame;
        if (counterFrame) counterFrame.textContent = String(frame).padStart(4, "0");
        if (counterTime) {
          const secs = frame / FRAMES.fps;
          counterTime.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(
            Math.floor(secs % 60)
          ).padStart(2, "0")}`;
        }
      }
      if (scene !== lastScene) {
        lastScene = scene;
        railItems.forEach((item, k) => item.classList.toggle("is-active", k === scene));
        const id = SCENES[scene]?.id;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`)
        );
        if (counterScene)
          counterScene.textContent = `${String(scene).padStart(2, "0")} · ${SCENES[scene]?.title ?? ""}`;
      }

      // The nav veil thickens as soon as the page moves.
      document.documentElement.style.setProperty(
        "--nav-veil",
        clamp01(y / 280).toFixed(3)
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(grace);
      window.clearTimeout(remeasure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      tracked.forEach((t) => {
        t.el.style.willChange = "";
        t.el.style.transform = "";
        t.el.style.opacity = "";
        t.el.style.letterSpacing = "";
      });
      inks.forEach((ink) => ink.el.style.removeProperty("--ink"));
    };
  }, [reduced, render]);

  return null;
}
