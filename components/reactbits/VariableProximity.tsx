"use client";

/**
 * Adapted from ReactBits <VariableProximity> (reactbits.dev/r/VariableProximity-TS-CSS).
 * Every letter is its own span; the variable axes of the font swell toward
 * the pointer and settle as it leaves. Archivo carries weight and width
 * axes, so the copy thickens under the hand like ink on damp paper. The
 * original tracks the pointer with motion; this is a plain rAF.
 */

import { useEffect, useMemo, useRef, type ElementType } from "react";

interface VariableProximityProps {
  children: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  fromSettings?: string;
  toSettings?: string;
  radius?: number;
}

const parse = (s: string) =>
  s.split(",").map((part) => {
    const [axis, value] = part.trim().split(/\s+/);
    return { axis: axis.replace(/['"]/g, ""), value: parseFloat(value) };
  });

export default function VariableProximity({
  children,
  as: Tag = "p",
  className = "",
  style,
  fromSettings = "'wght' 400, 'wdth' 100",
  toSettings = "'wght' 640, 'wdth' 118",
  radius = 90,
}: VariableProximityProps) {
  const ref = useRef<HTMLElement>(null);

  const letters = useMemo(() => {
    const out: React.ReactNode[] = [];
    children.split(/(\s+)/).forEach((word, wi) => {
      if (/^\s+$/.test(word)) {
        out.push(" ");
        return;
      }
      out.push(
        <span className="vp-word" key={wi}>
          {Array.from(word).map((ch, ci) => (
            <span className="vp-char" key={ci}>
              {ch}
            </span>
          ))}
        </span>
      );
    });
    return out;
  }, [children]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = parse(fromSettings);
    const to = parse(toSettings);
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".vp-char"));
    const centers: { x: number; y: number }[] = [];
    let mx = -1e4;
    let my = -1e4;
    let raf = 0;
    let dirty = false;

    const measure = () => {
      const y = window.scrollY;
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        centers[i] = { x: r.left + r.width / 2, y: r.top + r.height / 2 + y };
      });
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dirty = true;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => {
      mx = -1e4;
      my = -1e4;
      dirty = true;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      if (!dirty) return;
      dirty = false;
      const y = window.scrollY;
      for (let i = 0; i < chars.length; i++) {
        const c = centers[i];
        const d = Math.hypot(c.x - mx, c.y - y - my);
        const k = d >= radius ? 0 : 1 - d / radius;
        const eased = k * k * (3 - 2 * k);
        const settings = from
          .map((f, j) => `'${f.axis}' ${(f.value + (to[j].value - f.value) * eased).toFixed(1)}`)
          .join(", ");
        chars[i].style.fontVariationSettings = settings;
      }
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    // The engine lifts this block as it scrolls; re-measure when it settles.
    const onScroll = () => {
      clearTimeout(settle);
      settle = window.setTimeout(measure, 120);
    };
    let settle = 0;
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [fromSettings, toSettings, radius]);

  return (
    <Tag ref={ref} className={`vp ${className}`} style={style}>
      {letters}
    </Tag>
  );
}
