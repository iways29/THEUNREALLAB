"use client";

/**
 * Adapted from ReactBits <MagicBento> (reactbits.dev/r/MagicBento-TS-CSS).
 *
 * One card of the bento. A gold border glow and an interior spotlight follow
 * the pointer, the panel tilts a few degrees toward it, a handful of gold
 * motes drift up while it is hovered, and a click sends a ripple out. The
 * grid-wide spotlight and the purple of the original are dropped; the panel
 * keeps the site's hairline grid, radius 0 and ink. The outer element is
 * what the scroll choreography moves, so the pointer moves the inner panel.
 * Fine pointers only; nothing moves at idle.
 */

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";

interface BentoCardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  href?: string;
  /** Degrees of lean at the panel's edge. */
  tilt?: number;
  /** Gold motes released while hovered. */
  motes?: number;
  [key: string]: unknown;
}

export default function BentoCard({
  children,
  as: Tag = "div",
  className = "",
  style,
  tilt = 4,
  motes = 6,
  ...rest
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = el.querySelector<HTMLElement>(".bento__layer");
    if (!layer) return;

    let hovered = false;
    let spawned: HTMLElement[] = [];
    let timers: number[] = [];

    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--glow-x", `${x.toFixed(1)}px`);
      el.style.setProperty("--glow-y", `${y.toFixed(1)}px`);
      gsap.to(el, {
        rotateX: ((y - r.height / 2) / (r.height / 2)) * -tilt,
        rotateY: ((x - r.width / 2) / (r.width / 2)) * tilt,
        duration: 0.35,
        ease: "power2.out",
        transformPerspective: 900,
        overwrite: "auto",
      });
    };

    const enter = () => {
      hovered = true;
      el.style.setProperty("--glow", "1");
      const r = el.getBoundingClientRect();
      for (let i = 0; i < motes; i++) {
        timers.push(
          window.setTimeout(() => {
            if (!hovered) return;
            const m = document.createElement("span");
            m.className = "bento__mote";
            m.style.left = `${(Math.random() * r.width).toFixed(0)}px`;
            m.style.top = `${(r.height * (0.45 + Math.random() * 0.55)).toFixed(0)}px`;
            layer.appendChild(m);
            spawned.push(m);
            gsap.fromTo(
              m,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
            gsap.to(m, {
              x: (Math.random() - 0.5) * 60,
              y: -(30 + Math.random() * 70),
              duration: 2.4 + Math.random() * 1.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
            gsap.to(m, {
              opacity: 0.35,
              duration: 1.2 + Math.random(),
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          }, i * 90)
        );
      }
    };

    const clearMotes = () => {
      timers.forEach(clearTimeout);
      timers = [];
      spawned.forEach((m) =>
        gsap.to(m, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)",
          onComplete: () => m.remove(),
        })
      );
      spawned = [];
    };

    const leave = () => {
      hovered = false;
      el.style.setProperty("--glow", "0");
      clearMotes();
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const click = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const reach = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height)
      );
      const ripple = document.createElement("span");
      ripple.className = "bento__ripple";
      ripple.style.cssText = `width:${reach * 2}px;height:${reach * 2}px;left:${x - reach}px;top:${y - reach}px`;
      layer.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() }
      );
    };

    el.addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("click", click);

    return () => {
      hovered = false;
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("click", click);
      timers.forEach(clearTimeout);
      spawned.forEach((m) => m.remove());
      gsap.killTweensOf(el);
      el.style.transform = "";
    };
  }, [tilt, motes]);

  return (
    <Tag className={className} style={style} {...rest}>
      <div ref={ref} className="bento">
        {children}
        <span className="bento__layer" aria-hidden="true" />
      </div>
    </Tag>
  );
}
