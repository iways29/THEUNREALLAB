"use client";

/**
 * Adapted from ReactBits <ScrollReveal> (reactbits.dev/r/ScrollReveal-TS-CSS).
 * Body copy inks in word by word as it scrolls into place, scrubbed so it
 * runs backward too. The rotation and blur of the original are dropped: on
 * this page the paragraphs already travel with the parallax and the blur
 * fought the painting behind them.
 */

import { useEffect, useMemo, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  baseOpacity?: number;
  start?: string;
  end?: string;
}

export default function ScrollReveal({
  children,
  as: Tag = "p",
  className = "",
  style,
  baseOpacity = 0.18,
  start = "top 96%",
  end = "top 58%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((w, i) =>
        /^\s+$/.test(w) ? (
          w
        ) : (
          <span className="reveal-word" key={i}>
            {w}
          </span>
        )
      ),
    [children]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = el.querySelectorAll<HTMLElement>(".reveal-word");
    const tween = gsap.fromTo(
      targets,
      { opacity: baseOpacity },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.04,
        scrollTrigger: { trigger: el, start, end, scrub: 0.4 },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [baseOpacity, start, end]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words}
    </Tag>
  );
}
