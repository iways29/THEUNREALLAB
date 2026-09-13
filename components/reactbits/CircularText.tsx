"use client";

/**
 * Adapted from ReactBits <CircularText> (reactbits.dev/r/CircularText-TS-CSS).
 * Letters set around a ring that turns slowly and quickens under the
 * pointer. A seal, in the spirit of the Rajmudra. The original spins with
 * motion; this one is one rAF with the rate eased between the two speeds.
 */

import { useEffect, useRef, type ReactNode } from "react";

interface CircularTextProps {
  text: string;
  /** Seconds per revolution at rest. */
  spinDuration?: number;
  hoverFactor?: number;
  className?: string;
  children?: ReactNode;
}

export default function CircularText({
  text,
  spinDuration = 40,
  hoverFactor = 5,
  className = "",
  children,
}: CircularTextProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const letters = Array.from(text);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = ring.parentElement!;
    let angle = 0;
    let rate = 1;
    let target = 1;
    let last = performance.now();
    let raf = 0;
    const enter = () => (target = hoverFactor);
    const leave = () => (target = 1);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      rate += (target - rate) * Math.min(1, dt * 4);
      angle = (angle + (360 / spinDuration) * rate * dt) % 360;
      ring.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
    };
  }, [spinDuration, hoverFactor]);

  return (
    <div className={`seal ${className}`} aria-hidden="true">
      <div ref={ringRef} className="seal__ring">
        {letters.map((letter, i) => (
          <span
            key={i}
            style={{ transform: `rotate(${(360 / letters.length) * i}deg)` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="seal__core">{children}</div>
    </div>
  );
}
