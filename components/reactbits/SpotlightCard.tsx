"use client";

/**
 * Adapted from ReactBits <SpotlightCard> (reactbits.dev/r/SpotlightCard-TS-CSS).
 * A soft gold radial follows the pointer across the panel. Radius 0, no
 * border: the card's own classes carry the look, this only adds the light.
 */

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  href?: string;
  spotlightColor?: string;
  [key: string]: unknown;
}

export default function SpotlightCard({
  children,
  as: Tag = "div",
  className = "",
  style,
  spotlightColor = "rgba(230, 199, 106, 0.16)",
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      className={`card-spotlight ${className}`}
      style={{ "--spotlight-color": spotlightColor, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
