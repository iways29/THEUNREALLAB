"use client";

/**
 * Adapted from ReactBits <CountUp> (reactbits.dev/r/CountUp-TS-CSS).
 * A numeral counts up from zero as it scrolls into view; once. The spring
 * of the original is a gsap tween, and the number is zero-padded so the
 * card numerals keep their two digits throughout.
 */

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { gsap } from "gsap";

interface CountUpProps {
  to: number;
  from?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds before it starts once in view. */
  delay?: number;
  pad?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export default function CountUp({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  pad = 2,
  as: Tag = "div",
  className = "",
  style,
}: CountUpProps) {
  const ref = useRef<HTMLElement>(null);
  const format = (n: number) => String(Math.round(n)).padStart(pad, "0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const v = { n: from };
    el.textContent = format(from);
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        tween = gsap.to(v, {
          n: to,
          duration,
          delay,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format(v.n);
          },
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = format(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, duration, delay, pad]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {format(to)}
    </Tag>
  );
}
