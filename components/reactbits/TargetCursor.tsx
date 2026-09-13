"use client";

/**
 * Adapted from ReactBits <TargetCursor> (reactbits.dev/r/TargetCursor-TS-CSS).
 *
 * The archer's aim: a gold diamond at the pointer with four hairline corners
 * that snap out to bracket whatever link or button is under it. The
 * original's idle spin is removed: at rest the corners hold still. Restyled
 * to the site's tokens (gold diamond, 1px paper corners), fine pointers only,
 * off under prefers-reduced-motion.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

export interface TargetCursorProps {
  targetSelector?: string;
  hoverDuration?: number;
}

const CORNER = 14;
const GAP = 6;

const subscribeNoop = () => () => {};
const finePointer = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function TargetCursor({
  targetSelector = "a, button, [data-cursor-target]",
  hoverDuration = 0.22,
}: TargetCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(subscribeNoop, finePointer, () => false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!mounted || !cursor) return;

    document.documentElement.classList.add("has-cursor");
    const corners = Array.from(
      cursor.querySelectorAll<HTMLDivElement>(".target-cursor-corner")
    );
    const dot = dotRef.current;
    const label = labelRef.current;

    let activeTarget: Element | null = null;
    let leaveHandler: (() => void) | null = null;
    let targetCorners: { x: number; y: number }[] | null = null;
    const strength = { current: 0 };

    const restCorners = () => [
      { x: -CORNER - GAP, y: -CORNER - GAP },
      { x: GAP, y: -CORNER - GAP },
      { x: GAP, y: GAP },
      { x: -CORNER - GAP, y: GAP },
    ];

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 0,
    });

    {
      const rest = restCorners();
      corners.forEach((corner, i) => gsap.set(corner, { x: rest[i].x, y: rest[i].y }));
    }

    // While a target is bracketed, keep the corners pinned to it as the
    // cursor keeps moving underneath.
    const tick = () => {
      if (!targetCorners || strength.current === 0) return;
      const cx = gsap.getProperty(cursor, "x") as number;
      const cy = gsap.getProperty(cursor, "y") as number;
      corners.forEach((corner, i) => {
        const curX = gsap.getProperty(corner, "x") as number;
        const curY = gsap.getProperty(corner, "y") as number;
        const tx = targetCorners![i].x - cx;
        const ty = targetCorners![i].y - cy;
        gsap.to(corner, {
          x: curX + (tx - curX) * strength.current,
          y: curY + (ty - curY) * strength.current,
          duration: strength.current >= 0.99 ? 0.18 : 0.05,
          ease: "power1.out",
          overwrite: "auto",
        });
      });
    };

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { opacity: 1, duration: 0.4 });
      }
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power3.out" });
    };
    const leaveDoc = () => gsap.to(cursor, { opacity: 0, duration: 0.3 });
    const enterDoc = () => gsap.to(cursor, { opacity: 1, duration: 0.3 });

    const down = () => {
      gsap.to(dot, { scale: 0.6, duration: 0.25 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    };
    const up = () => {
      gsap.to(dot, { scale: 1, duration: 0.25 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };

    const labelFor = (target: Element) => {
      const custom = target.getAttribute("data-cursor");
      if (custom) return custom;
      const href = target.getAttribute("href") || "";
      if (href.startsWith("mailto:")) return "Write";
      if (href.startsWith("#")) return "Go";
      if (/^https?:/.test(href)) return "Open";
      return "";
    };

    const release = () => {
      gsap.ticker.remove(tick);
      targetCorners = null;
      gsap.set(strength, { current: 0, overwrite: true });
      activeTarget = null;
      cursor.classList.remove("is-target");
      gsap.killTweensOf(corners, "x,y");
      const rest = restCorners();
      corners.forEach((corner, i) =>
        gsap.to(corner, { x: rest[i].x, y: rest[i].y, duration: 0.3, ease: "power3.out" })
      );
      gsap.to(label, { opacity: 0, duration: 0.15 });
    };

    const over = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest?.(targetSelector) ?? null;
      if (!target || target === activeTarget) return;
      if (activeTarget && leaveHandler) activeTarget.removeEventListener("mouseleave", leaveHandler);
      activeTarget = target;
      cursor.classList.add("is-target");
      gsap.killTweensOf(corners, "x,y");

      const r = target.getBoundingClientRect();
      const pad = r.width < 48 ? 8 : 4;
      targetCorners = [
        { x: r.left - pad, y: r.top - pad },
        { x: r.right + pad - CORNER, y: r.top - pad },
        { x: r.right + pad - CORNER, y: r.bottom + pad - CORNER },
        { x: r.left - pad, y: r.bottom + pad - CORNER },
      ];
      if (label) {
        label.textContent = labelFor(target);
        gsap.to(label, { opacity: label.textContent ? 1 : 0, duration: 0.2, delay: 0.1 });
      }

      gsap.ticker.add(tick);
      gsap.to(strength, { current: 1, duration: hoverDuration, ease: "power2.out" });

      leaveHandler = () => {
        if (activeTarget && leaveHandler)
          activeTarget.removeEventListener("mouseleave", leaveHandler);
        leaveHandler = null;
        release();
      };
      target.addEventListener("mouseleave", leaveHandler);
    };

    // Scrolling can carry the target out from under a still pointer.
    const scroll = () => {
      if (!activeTarget) return;
      const x = gsap.getProperty(cursor, "x") as number;
      const y = gsap.getProperty(cursor, "y") as number;
      const under = document.elementFromPoint(x, y);
      if (!under || under.closest(targetSelector) !== activeTarget) leaveHandler?.();
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leaveDoc);
    document.documentElement.addEventListener("mouseenter", enterDoc);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leaveDoc);
      document.documentElement.removeEventListener("mouseenter", enterDoc);
      if (activeTarget && leaveHandler) activeTarget.removeEventListener("mouseleave", leaveHandler);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [mounted, targetSelector, hoverDuration]);

  if (!mounted) return null;

  return createPortal(
    <div ref={cursorRef} className="target-cursor" aria-hidden="true">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
      <div ref={labelRef} className="target-cursor-label" />
    </div>,
    document.body
  );
}
