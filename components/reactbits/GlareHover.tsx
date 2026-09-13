/**
 * Adapted from ReactBits <GlareHover> (reactbits.dev/r/GlareHover-TS-CSS).
 * A diagonal band of light sweeps across the child on hover. Sized to its
 * content rather than a fixed box, radius 0, no border.
 */

import type { CSSProperties, ReactNode } from "react";

interface GlareHoverProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  style?: CSSProperties;
}

export default function GlareHover({
  children,
  className = "",
  glareColor = "rgba(230, 199, 106, 0.55)",
  glareAngle = -35,
  glareSize = 260,
  transitionDuration = 700,
  style,
}: GlareHoverProps) {
  const vars = {
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": glareColor,
  } as CSSProperties;
  return (
    <span className={`glare-hover ${className}`} style={{ ...vars, ...style }}>
      {children}
    </span>
  );
}
