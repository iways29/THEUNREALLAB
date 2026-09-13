"use client";

import { useEffect } from "react";

/** Layer scale travel, per scene: 1 → 1 + ZOOM across the section. */
const ZOOM = 0.22;
/** Multiplier on the parallax lift and idle drift of floating panels. */
const FLOAT = 1;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Phase 1 motion. Every frame it mixes the six stage layers against scroll
 * position, floats the revealed panels, and advances the progress line.
 *
 * TODO(phase-2): once lib/useFrameScrub reports ready, hand the stage over to
 * the canvas frame-scrub engine and keep only the panel float here.
 */
export default function SceneEngine() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene]")
    );
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene-layer]")
    );
    const floats = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const bar = document.querySelector<HTMLElement>("[data-progress]");

    let observer: IntersectionObserver | undefined;

    if (!reduced) {
      // Reveal: blocks rise into place once they cross into view.
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
      );
      floats.forEach((el) => observer?.observe(el));

      // Hero intro: eyebrow, then words on a 90ms stagger, then sub and CTA.
      requestAnimationFrame(() => {
        document
          .querySelectorAll<HTMLElement>("[data-intro]")
          .forEach((el) => el.classList.add("is-in"));
        document
          .querySelectorAll<HTMLElement>("[data-word]")
          .forEach((word, i) => {
            word.style.transitionDelay = `${(0.3 + i * 0.09).toFixed(2)}s`;
            word.classList.add("is-in");
          });
      });
    }

    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const vh = window.innerHeight;

      // The section nearest the viewport centre owns the stage.
      let best = 0;
      let bestDistance = Infinity;
      sections.forEach((section, i) => {
        const r = section.getBoundingClientRect();
        const d = Math.abs(r.top + Math.min(r.height, vh) / 2 - vh / 2);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });

      layers.forEach((layer, k) => {
        const section = sections[k];
        if (!section) return;
        const r = section.getBoundingClientRect();
        // 0 = entering from below, 1 = gone above.
        const p = clamp01((vh - r.top) / (r.height + vh));
        // Fraction of the viewport this section covers.
        const cover =
          Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
        const opacity = k === best ? 1 : easeInOut(clamp01(cover));

        layer.style.opacity = opacity.toFixed(3);
        layer.style.zIndex = k === best ? "2" : "1";

        if (!reduced) {
          // Alternating zoom-in / zoom-out so adjacent scenes move apart.
          const t = k % 2 === 0 ? p : 1 - p;
          layer.style.transform = `scale(${(1 + ZOOM * t).toFixed(4)})`;
        }

        const video = layer.querySelector("video");
        if (video && !reduced) {
          if (opacity > 0.02 && video.paused) {
            video.play().catch(() => {});
          } else if (opacity <= 0.02 && !video.paused) {
            video.pause();
          }
        }
      });

      if (!reduced) {
        // Floating panels: scroll parallax plus a slow idle drift.
        floats.forEach((el, i) => {
          if (!el.classList.contains("is-in")) return;
          const r = el.getBoundingClientRect();
          const c = (r.top + r.height / 2 - vh / 2) / vh;
          const drift = Math.sin((now - t0) / 2600 + i * 1.7) * 6 * FLOAT;
          el.style.transform = `translate3d(0, ${(
            -c * 48 * FLOAT +
            drift
          ).toFixed(2)}px, 0)`;
          el.style.transition = "opacity 1s ease";
        });
      }

      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = `${pct.toFixed(2)}%`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  return null;
}
