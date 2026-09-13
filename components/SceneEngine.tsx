"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import useFrameScrub from "@/lib/useFrameScrub";
import { BASE_TRAVEL, CHOREOGRAPHY, DRIFT } from "@/lib/choreography";
import {
  FRAMES,
  HERO_REVEAL_EVENT,
  INTRO_HOLD,
  INTRO_REVEAL,
  SCENES,
  frameAt,
} from "@/lib/scenes";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** Video fallback only: mix window between adjacent clips. */
const HANDOFF = 0.1;
/** Time constant (ms) for the eased stage. */
const STAGE_LAG = 85;
/** Share of the viewport over which a block fades as it enters at the bottom
 *  and leaves at the top. The nav covers the top, so the exit starts under it. */
const ENTER_BAND = 0.2;
const EXIT_BAND = 0.16;
const NAV_H = 72;

/** The opening: a beat on the wide shot, then the dolly in to Krishna. */
const INTRO_BEAT = 900;
const INTRO_PUSH = 4200;
/** How much faster the opening runs once the visitor has touched anything. */
const INTRO_SKIP_RATE = 8;

type Tracked = {
  el: HTMLElement;
  scene: number;
  depth: number;
  /** Progress offset from the element's stagger position in its section. */
  offset: number;
  scale: number;
  track: [number, number] | null;
  veil: boolean;
  /** Eased hover state, 0–1, for the reading veil and its swell. */
  hover: number;
  phase: number;
  /** Hero only: ms after the reveal before this element enters; -1 = no fade. */
  introDelay: number;
  /** Document-space top and height, measured with transforms cleared. */
  top: number;
  height: number;
  /** Viewport progress at load, for blocks already on screen: they start
   *  where the layout put them and lift from there. */
  ps0: number;
};

/** Hero entrance delays, in ms after the reveal. */
const INTRO: Record<string, number> = {
  eyebrow: 0,
  eyebrow__text: 0,
  h1: -1, // the words rise out of their masks instead (SplitText)
  hero__sub: 700,
  hero__cta: 1000,
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
  const { ready, render, has } = useFrameScrub(canvasRef, { enabled: !reduced });
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

    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

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
              track: spec.track ?? null,
              veil: Boolean(spec.veil),
              hover: 0,
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
    const tops: number[] = [];
    const heights: number[] = [];

    const measure = () => {
      vh = window.innerHeight;
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

    // ── the opening ──────────────────────────────────────────────────────
    // The chariot plays itself in. The clock only advances onto frames that
    // have decoded, so a slow connection stretches the shot rather than
    // stuttering through it. Any input races it to the end; a scroll cuts
    // straight there.
    let introT = 0;
    let introFrame = 1;
    let introDone = reduced;
    let skipping = false;
    let heroT0 = -1;

    const introFrameAt = (t: number) =>
      t <= INTRO_BEAT
        ? 1
        : 1 +
          Math.round(
            (INTRO_HOLD - 1) * easeInOut(clamp01((t - INTRO_BEAT) / INTRO_PUSH))
          );

    const reveal = (now: number) => {
      if (heroT0 >= 0) return;
      heroT0 = now;
      root.classList.add("hero-live");
      window.dispatchEvent(new Event(HERO_REVEAL_EVENT));
    };

    const skip = () => {
      skipping = true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) skip();
    };
    const listenForSkip = () => {
      window.addEventListener("wheel", skip, { passive: true });
      window.addEventListener("touchstart", skip, { passive: true });
      window.addEventListener("pointerdown", skip, { passive: true });
      window.addEventListener("keydown", onKey);
    };
    const stopListeningForSkip = () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
    };
    const finishIntro = (now: number) => {
      introDone = true;
      introFrame = INTRO_HOLD;
      reveal(now);
      stopListeningForSkip();
    };
    if (!introDone) listenForSkip();

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

      if (!introDone) {
        if (y > 8) {
          finishIntro(now);
        } else if (readyRef.current) {
          // Advance as far as the decoded frames allow.
          let next = introT + dt * (skipping ? INTRO_SKIP_RATE : 1);
          while (next > introT && !has(introFrameAt(next))) next -= 16;
          if (next > introT) introT = next;
          introFrame = introFrameAt(introT);
          if (introFrame >= INTRO_REVEAL) reveal(now);
          if (introT >= INTRO_BEAT + INTRO_PUSH) finishIntro(now);
        }
      }

      // The stage eases toward the scroll position so a flick of the wheel
      // reads as a camera move, not a jump cut. The content follows scroll
      // exactly; the lag is short enough that the two never feel apart.
      if (stageT < 0) stageT = timeline;
      const kStage = 1 - Math.exp(-dt / STAGE_LAG);
      stageT += (timeline - stageT) * kStage;
      if (Math.abs(timeline - stageT) < 0.0004) stageT = timeline;

      if (readyRef.current && !reduced) {
        if (introDone) render(stageT);
        else render(0, introFrame);
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

      const elapsed = now - t0;
      const sinceReveal = heroT0 < 0 ? -1 : now - heroT0;

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
            // The hero waits for the opening, then uses a timed entrance.
            if (sinceReveal < 0) {
              entry = 0;
            } else if (t.introDelay >= 0) {
              entry = smoothstep(clamp01((sinceReveal - t.introDelay) / 1100));
              enter = (1 - entry) * 28;
            } else {
              entry = 1;
            }
          }
          const alpha = exit * entry;

          // The reading veil: hover holds it fully, the middle of the
          // viewport holds it lightly, and it eases off as attention moves.
          if (t.veil && vb > 0 && vy < vh) {
            const hovered = finePointer && t.el.matches(":hover") ? 1 : 0;
            t.hover += (hovered - t.hover) * (1 - Math.exp(-dt / 160));
            const center = vy + t.height / 2;
            const band = smoothstep(1 - clamp01(Math.abs(center - vh * 0.5) / (vh * 0.34)));
            t.el.style.setProperty(
              "--focus",
              Math.max(t.hover, band * 0.6).toFixed(3)
            );
          }

          const s = (t.scale ? 1 - t.scale * ps : 1) * (1 + 0.016 * t.hover);

          t.el.style.opacity = alpha.toFixed(3);
          t.el.style.transform =
            `translate3d(0, ${(lift + drift + enter).toFixed(2)}px, 0)` +
            (s !== 1 ? ` scale(${s.toFixed(4)})` : "");
          if (t.track) {
            t.el.style.letterSpacing = `${(t.track[0] + (t.track[1] - t.track[0]) * entry).toFixed(3)}em`;
          }
        }

        // Verses ink in from the left as their block settles into view.
        for (let i = 0; i < inks.length; i++) {
          const ink = inks[i];
          const vy = ink.top - y;
          const v = smoothstep(clamp01((vh * 0.92 - vy) / (vh * 0.36)));
          ink.el.style.setProperty("--ink", v.toFixed(3));
        }

        // The hero's scrim thickens with the copy and thins as it leaves.
        const heroIn = sinceReveal < 0 ? 0 : smoothstep(clamp01(sinceReveal / 1400));
        const heroOut = smoothstep(clamp01((timeline - 0.3) / 0.45));
        root.style.setProperty("--veil-hero", (heroIn * (1 - heroOut)).toFixed(3));
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
      const frame = introDone ? frameAt(stageT) : introFrame;
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
      root.style.setProperty("--nav-veil", clamp01(y / 280).toFixed(3));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(grace);
      window.clearTimeout(remeasure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      stopListeningForSkip();
      root.classList.remove("hero-live");
      root.style.removeProperty("--veil-hero");
      tracked.forEach((t) => {
        t.el.style.willChange = "";
        t.el.style.transform = "";
        t.el.style.opacity = "";
        t.el.style.letterSpacing = "";
        t.el.style.removeProperty("--focus");
      });
      inks.forEach((ink) => ink.el.style.removeProperty("--ink"));
    };
  }, [reduced, render, has]);

  return null;
}
