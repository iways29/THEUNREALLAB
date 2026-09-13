"use client";

import { useEffect, useRef } from "react";

/** Gold dot tracks the pointer exactly; the ring lerps toward it. */
const LERP = 0.14;

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");
    dot.hidden = false;
    ring.hidden = false;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      const target = e.target as Element | null;
      const over = Boolean(target?.closest?.("a, button"));
      ring.classList.toggle("is-over", over);
    };

    let raf = 0;
    const step = () => {
      const size = ring.classList.contains("is-over") ? 64 : 34;
      rx += (mx - rx - size / 2) * LERP;
      ry += (my - ry - size / 2) * LERP;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" hidden aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" hidden aria-hidden="true" />
    </>
  );
}
