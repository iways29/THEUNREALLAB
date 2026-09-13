/**
 * Adapted from ReactBits <GradualBlur> (reactbits.dev/r/GradualBlur-TS-CSS).
 * A stack of backdrop-filter layers, each masked to a band, so the page
 * melts into blur at the viewport edge instead of ending at a line. Fixed to
 * the page; the original's presets and animation options are dropped.
 */

import type { CSSProperties } from "react";

interface GradualBlurProps {
  position?: "top" | "bottom";
  strength?: number;
  height?: string;
  divCount?: number;
  className?: string;
}

export default function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "16vh",
  divCount = 5,
  className = "",
}: GradualBlurProps) {
  const dir = position === "top" ? "to top" : "to bottom";
  const layers = Array.from({ length: divCount }, (_, i) => {
    const p = (i + 1) / divCount;
    const blur = Math.pow(2, p * 4) * 0.0625 * strength;
    const a = i / divCount;
    const b = (i + 1) / divCount;
    const c = Math.min(1, (i + 2) / divCount);
    const mask = `linear-gradient(${dir}, rgba(0,0,0,0) ${(a * 100).toFixed(1)}%, rgba(0,0,0,1) ${(b * 100).toFixed(1)}%, rgba(0,0,0,1) ${(c * 100).toFixed(1)}%, rgba(0,0,0,0) ${Math.min(100, c * 100 + 100 / divCount).toFixed(1)}%)`;
    const style: CSSProperties = {
      position: "absolute",
      inset: 0,
      maskImage: mask,
      WebkitMaskImage: mask,
      backdropFilter: `blur(${blur.toFixed(2)}px)`,
      WebkitBackdropFilter: `blur(${blur.toFixed(2)}px)`,
    };
    return <div key={i} style={style} />;
  });
  return (
    <div
      className={`gradual-blur gradual-blur--${position} ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {layers}
    </div>
  );
}
