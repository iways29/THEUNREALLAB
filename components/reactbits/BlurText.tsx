"use client";

/**
 * Adapted from ReactBits <BlurText> (reactbits.dev/r/BlurText-TS-CSS).
 * Words resolve out of a soft blur, one after another, as the block scrolls
 * into view; once. The `motion` keyframes of the original are a gsap tween.
 * Strings are split into words; nested elements (links) travel as one unit.
 */

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";

interface BlurTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** ms between words. */
  delay?: number;
  /** Seconds each word takes to resolve. */
  duration?: number;
  rootMargin?: string;
}

let keySeed = 0;

const wrap = (node: ReactNode): ReactNode[] => {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
      .split(/(\s+)/)
      .map((part) =>
        /^\s+$/.test(part) || part === "" ? (
          part
        ) : (
          <span className="blur-word" key={keySeed++}>
            {part}
          </span>
        )
      );
  }
  if (Array.isArray(node)) return node.flatMap(wrap);
  if (isValidElement(node)) {
    return [
      <span className="blur-word" key={keySeed++}>
        {node}
      </span>,
    ];
  }
  return [];
};

export default function BlurText({
  children,
  as: Tag = "p",
  className = "",
  style,
  delay = 26,
  duration = 0.7,
  rootMargin = "0px 0px -10% 0px",
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);
  const words = useMemo(() => Children.toArray(children).flatMap(wrap), [children]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = el.querySelectorAll<HTMLElement>(".blur-word");
    gsap.set(targets, { opacity: 0, y: 12, filter: "blur(8px)" });
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        tween = gsap.to(targets, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration,
          stagger: delay / 1000,
          ease: "power2.out",
          clearProps: "filter,transform,opacity",
        });
      },
      { rootMargin }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      gsap.set(targets, { clearProps: "all" });
    };
  }, [delay, duration, rootMargin, words]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words}
    </Tag>
  );
}
