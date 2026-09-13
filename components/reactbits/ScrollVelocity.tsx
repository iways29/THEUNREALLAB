"use client";

/**
 * Adapted from ReactBits <ScrollVelocity> (reactbits.dev/r/ScrollVelocity-TS-CSS).
 * A ribbon of text that drifts on its own and speeds up with the scroll
 * velocity, direction and all. The original runs on motion's springs; this
 * one is a single rAF with a critically damped velocity so it needs no
 * extra dependency.
 */

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollVelocityProps {
  children: ReactNode;
  /** px per second at rest. Negative drifts left. */
  velocity?: number;
  numCopies?: number;
  className?: string;
}

export default function ScrollVelocity({
  children,
  velocity = 40,
  numCopies = 6,
  className = "",
}: ScrollVelocityProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const copy = copyRef.current;
    if (!scroller || !copy) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let width = copy.offsetWidth;
    let lastY = window.scrollY;
    let vel = 0;
    let dir = 1;
    let last = performance.now();
    let raf = 0;

    const resize = () => {
      width = copy.offsetWidth;
    };
    window.addEventListener("resize", resize, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const y = window.scrollY;
      const instant = dt > 0 ? (y - lastY) / dt : 0;
      lastY = y;
      // Smooth the scroll velocity, then let it drive both speed and direction.
      vel += (instant - vel) * Math.min(1, dt * 6);
      if (vel > 20) dir = 1;
      else if (vel < -20) dir = -1;
      const factor = Math.min(6, Math.abs(vel) / 900);
      x += dir * velocity * dt * (1 + factor * 4);
      if (width > 0) {
        x = ((x % width) + width) % width;
        scroller.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [velocity]);

  return (
    <div className={`ribbon ${className}`} aria-hidden="true">
      <div ref={scrollerRef} className="ribbon__scroller">
        {Array.from({ length: numCopies }, (_, i) => (
          <span className="ribbon__copy" key={i} ref={i === 0 ? copyRef : null}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}
