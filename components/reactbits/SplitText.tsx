"use client";

/**
 * Adapted from ReactBits <SplitText> (reactbits.dev/r/SplitText-TS-CSS).
 *
 * Words rise out of a clipped mask, one after another. Three triggers: `at`
 * "mount" fires on a timer once fonts are ready, "scroll" fires once when the
 * element scrolls into view (the section headings), and "event" holds the
 * words in their masks until a named window event (the hero headline, which
 * waits for the film). The split is reverted after the animation so the
 * markup goes back to plain text and the italic overhangs are never clipped
 * at rest. Under reduced motion the text is simply rendered.
 */

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export interface SplitTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  /** ms between words. */
  stagger?: number;
  /** ms before the first word moves (mount trigger only). */
  delay?: number;
  duration?: number;
  ease?: string;
  at?: "mount" | "scroll" | "event";
  /** Window event that fires the "event" trigger. */
  event?: string;
  /** ScrollTrigger start for the scroll trigger. */
  start?: string;
}

export default function SplitText({
  children,
  as: Tag = "span",
  className = "",
  style,
  stagger = 90,
  delay = 300,
  duration = 1.2,
  ease = "power3.out",
  at = "mount",
  event = "",
  start = "top 92%",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let split: GSAPSplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let disposed = false;
    let armed = false;

    const finish = () => {
      el.classList.add("is-split-done");
      split?.revert();
      split = null;
    };

    const rise = () => {
      if (disposed || !split) return;
      tween = gsap.fromTo(
        split.words,
        { yPercent: 108 },
        {
          yPercent: 0,
          duration,
          ease,
          stagger: stagger / 1000,
          delay: at === "mount" ? delay / 1000 : 0,
          force3D: true,
          onComplete: finish,
          scrollTrigger:
            at === "scroll"
              ? { trigger: el, start, once: true, fastScrollEnd: true }
              : undefined,
        }
      );
    };

    const onEvent = () => {
      window.removeEventListener(event, onEvent);
      if (armed) rise();
      else armed = true; // fonts still loading: rise as soon as the split exists
    };

    const run = () => {
      if (disposed) return;
      split = new GSAPSplitText(el, {
        type: "words",
        mask: "words",
        wordsClass: "split-word",
        reduceWhiteSpace: false,
      });
      if (at !== "event") {
        rise();
        return;
      }
      gsap.set(split.words, { yPercent: 108 });
      // The engine marks the root once the reveal has already happened.
      if (armed || document.documentElement.classList.contains("hero-live")) {
        rise();
      } else {
        armed = true;
      }
    };

    if (at === "event" && event) window.addEventListener(event, onEvent);

    el.classList.add("is-splitting");
    if (document.fonts?.status === "loaded") run();
    else document.fonts?.ready.then(run);

    return () => {
      disposed = true;
      if (event) window.removeEventListener(event, onEvent);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
      el.classList.remove("is-splitting", "is-split-done");
    };
  }, [at, delay, duration, ease, event, stagger, start]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
