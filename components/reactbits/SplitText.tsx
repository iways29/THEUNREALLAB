"use client";

/**
 * Adapted from ReactBits <SplitText> (reactbits.dev/r/SplitText-TS-CSS).
 *
 * Words rise out of a clipped mask, one after another. Two triggers: `at`
 * "mount" fires on a timer once fonts are ready (the hero headline), and
 * "scroll" fires once when the element scrolls into view (the section
 * headings). The split is reverted after the animation so the markup goes
 * back to plain text and the italic overhangs are never clipped at rest.
 * Under reduced motion the text is simply rendered.
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
  at?: "mount" | "scroll";
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

    const run = () => {
      if (disposed) return;
      split = new GSAPSplitText(el, {
        type: "words",
        mask: "words",
        wordsClass: "split-word",
        reduceWhiteSpace: false,
      });
      const finish = () => {
        el.classList.add("is-split-done");
        split?.revert();
        split = null;
      };
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

    el.classList.add("is-splitting");
    if (document.fonts?.status === "loaded") run();
    else document.fonts?.ready.then(run);

    return () => {
      disposed = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
      el.classList.remove("is-splitting", "is-split-done");
    };
  }, [at, delay, duration, ease, stagger, start]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
