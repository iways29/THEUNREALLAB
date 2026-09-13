"use client";

/**
 * Adapted from ReactBits <ScrambledText> (reactbits.dev/r/ScrambledText-TS-CSS).
 * Small caps that resolve out of noise: once as they scroll into view, and
 * again under the pointer. The original scrambles per character within a
 * radius on every pointer move; here the whole label resolves as one, which
 * suits an eleven-pixel line better than a hundred-pixel headline.
 */

import { useEffect, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

interface ScrambledTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  scrambleChars?: string;
  /** Resolve again when the pointer enters. */
  rescrambleOnHover?: boolean;
}

export default function ScrambledText({
  children,
  as: Tag = "span",
  className = "",
  duration = 1.1,
  scrambleChars = "·—|/\\:",
  rescrambleOnHover = true,
}: ScrambledTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = children;
    let tween: gsap.core.Tween | null = null;
    const play = () => {
      tween?.kill();
      tween = gsap.to(el, {
        duration,
        ease: "none",
        scrambleText: { text, chars: scrambleChars, speed: 0.55, revealDelay: 0.1 },
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    const hover = () => play();
    if (rescrambleOnHover) el.addEventListener("pointerenter", hover);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = text;
      el.removeEventListener("pointerenter", hover);
    };
  }, [children, duration, scrambleChars, rescrambleOnHover]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
