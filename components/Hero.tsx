"use client";

import { useEffect, useRef } from "react";
import HeroSpecimen from "./HeroSpecimen";

const WORDS = ["We", "make", "the", "unreal", "real."];

export default function Hero() {
  const secRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  /* headline words light with scroll, ORYZO-style */
  useEffect(() => {
    const sec = secRef.current;
    const h1 = h1Ref.current;
    if (!sec || !h1) return;
    const spans = Array.from(h1.querySelectorAll<HTMLSpanElement>(".w"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      spans.forEach((s) => s.classList.add("lit"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = sec.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 1;
      spans.forEach((s, i) =>
        s.classList.toggle("lit", p > 0.03 + i * 0.08)
      );
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
  }, []);

  return (
    <header ref={secRef} className="hero">
      <div className="hero-sticky">
        <HeroSpecimen sectionRef={secRef} />
        <h1 ref={h1Ref} className="hero-h1 vA">
          {WORDS.map((w, i) => (
            <span key={i}>
              <span className="w">{w}</span>
              {i < WORDS.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <div className="hero-foot">
          <div className="hero-body">
            <p className="vB" style={{ margin: 0 }}>
              The Unreal Lab is a product studio for the age of AI. We build
              instruments that shouldn&apos;t exist yet — and ship them while
              everyone else is still demoing.
            </p>
            <span className="hero-note credit">
              * Scroll to make it real.
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
