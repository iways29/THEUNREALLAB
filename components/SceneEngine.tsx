"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import useFrameScrub from "@/lib/useFrameScrub";
import { BASE_TRAVEL, CHOREOGRAPHY, DRIFT } from "@/lib/choreography";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Fraction of a section spent fading content in, and out again at the end. */
const FADE_IN = 0.1;
const FADE_OUT_FROM = 0.86;
/** Matches the canvas cross-dissolve window in useFrameScrub. */
const HANDOFF = 0.1;

type Tracked = {
  el: HTMLElement;
  scene: number;
  depth: number;
  /** Progress offset from the element's stagger position in its section. */
  offset: number;
  scale: number;
  phase: number;
  /** Hero only: ms before this element starts its entrance. */
  introDelay: number;
};

/** Hero entrance delays, in ms, matching the handoff's intro timing. */
const INTRO: Record<string, number> = {
  eyebrow: 200,
  "hero__sub": 900,
  "hero__cta": 1200,
  "verse-card": 600,
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
    if (!sections.length) return;

    const sceneOf = (el: HTMLElement) => {
      const section = el.closest<HTMLElement>("[data-scene]");
      return section ? sections.indexOf(section) : 0;
    };

    // ── collect everything the choreography moves ────────────────────────
    const tracked: Tracked[] = [];
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
              phase: tracked.length * 1.7,
              introDelay: scene === 0 && key ? INTRO[key] : 0,
            });
          });
      });

      // Hero headline words carry their own stagger.
      document
        .querySelectorAll<HTMLElement>("[data-word]")
        .forEach((el, i) => {
          tracked.push({
            el,
            scene: 0,
            depth: 0.42,
            offset: 0,
            scale: 0,
            phase: i * 0.9,
            introDelay: 300 + i * 90,
          });
        });

      tracked.forEach((t) => {
        t.el.style.willChange = "transform, opacity";
      });
    }

    // ── geometry, measured once per layout ───────────────────────────────
    let vh = window.innerHeight;
    const tops: number[] = [];
    const heights: number[] = [];

    const measure = () => {
      vh = window.innerHeight;
      const y = window.scrollY;
      sections.forEach((section, i) => {
        const r = section.getBoundingClientRect();
        tops[i] = r.top + y;
        heights[i] = Math.max(1, section.offsetHeight);
      });
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const y = window.scrollY;

      // Scene progress spans the section's full height, so the stage keeps
      // moving while one section's content leaves and the next arrives.
      // Sections already passed contribute 1, making the sum a continuous
      // scene timeline across the whole page.
      let timeline = 0;
      const scenePos: number[] = [];
      const contentPos: number[] = [];
      for (let i = 0; i < sections.length; i++) {
        const sp = clamp01((y - tops[i]) / heights[i]);
        scenePos[i] = sp;
        timeline += sp;
        // Content runs on its own clock, spanning the whole time it is on
        // screen: rising into view, held while the section is pinned, then
        // leaving. That keeps a block fully lit for every pinned frame and
        // confines the fades to entry and exit. The hero is already on screen
        // at load, so it has no entry phase.
        contentPos[i] =
          i === 0
            ? clamp01((y - tops[i]) / (heights[i] + vh))
            : clamp01((y - (tops[i] - vh)) / (heights[i] + vh));
      }

      const last = sections.length - 1;
      const scene = Math.min(Math.floor(timeline), last);
      const p = timeline - scene;

      if (readyRef.current && !reduced) {
        render(timeline);
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
          const video = layer.querySelector("video");
          if (video && !reduced) {
            if (opacity > 0.02 && video.paused) video.play().catch(() => {});
            else if (opacity <= 0.02 && !video.paused) video.pause();
          }
        });
      }

      if (!reduced) {
        const elapsed = now - t0;
        for (let i = 0; i < tracked.length; i++) {
          const t = tracked[i];
          const sp = contentPos[t.scene] ?? 0;
          const span = 1 - t.offset;
          const ps = span > 0 ? clamp01((sp - t.offset) / span) : sp;

          // Rises as its section is scrolled through, plus a slow idle drift.
          const lift = -ps * t.depth * BASE_TRAVEL;
          const drift =
            Math.sin(elapsed / 2600 + t.phase) * DRIFT * t.depth;

          let alpha = 1 - smoothstep(clamp01((ps - FADE_OUT_FROM) / (1 - FADE_OUT_FROM)));
          if (t.scene === 0) {
            // The hero is on screen at load, so it uses a timed entrance.
            alpha *= smoothstep(clamp01((elapsed - t.introDelay) / 1000));
          } else {
            alpha *= smoothstep(clamp01(ps / FADE_IN));
          }

          const enter = t.introDelay
            ? (1 - smoothstep(clamp01((elapsed - t.introDelay) / 1000))) * 30
            : 0;
          const s = t.scale ? 1 - t.scale * ps : 1;

          t.el.style.opacity = alpha.toFixed(3);
          t.el.style.transform =
            `translate3d(0, ${(lift + drift + enter).toFixed(2)}px, 0)` +
            (t.scale ? ` scale(${s.toFixed(4)})` : "");
        }
      }

      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.width = `${(max > 0 ? (y / max) * 100 : 0).toFixed(2)}%`;
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
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      tracked.forEach((t) => {
        t.el.style.willChange = "";
        t.el.style.transform = "";
        t.el.style.opacity = "";
      });
    };
  }, [reduced, render]);

  return null;
}
