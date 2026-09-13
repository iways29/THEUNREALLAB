"use client";

/**
 * Adapted from ReactBits <Magnet> (reactbits.dev/r/Magnet-TS-CSS).
 * The wrapped element leans toward the pointer inside `padding` px of its
 * edges and springs back when it leaves. Off for coarse pointers and reduced
 * motion, where it renders its children untouched.
 */

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

const subscribeNoop = () => () => {};
const finePointer = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  /** Divisor on the pointer offset: higher is a weaker pull. */
  magnetStrength?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Magnet({
  children,
  padding = 60,
  magnetStrength = 4,
  className = "",
  style,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeNoop, finePointer, () => false);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    let inside = false;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const near =
        Math.abs(cx - e.clientX) < width / 2 + padding &&
        Math.abs(cy - e.clientY) < height / 2 + padding;
      if (near) {
        inside = true;
        setActive(true);
        setPos({ x: (e.clientX - cx) / magnetStrength, y: (e.clientY - cy) / magnetStrength });
      } else if (inside) {
        inside = false;
        setActive(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, padding, magnetStrength]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", display: "inline-block", ...style }}>
      <div
        style={{
          transform: `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`,
          transition: active
            ? "transform 0.25s cubic-bezier(0.16, 0.84, 0.3, 1)"
            : "transform 0.6s cubic-bezier(0.16, 0.84, 0.3, 1)",
          willChange: enabled ? "transform" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
