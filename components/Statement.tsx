"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-lit statement — words sit in driftwood and brighten to cream
 * one by one as the block travels up the viewport. The ORYZO signature.
 */
export default function Statement({
  text,
  className = "statement",
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: "h2" | "p";
}) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>(".w"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      spans.forEach((s) => s.classList.add("lit"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0→1 while the block moves from 90% to 35% of the viewport
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.55))
      );
      const lit = Math.round(progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="w">{word}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
