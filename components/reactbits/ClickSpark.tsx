"use client";

/**
 * Adapted from ReactBits <ClickSpark> (reactbits.dev/r/ClickSpark-TS-CSS).
 * A burst of gold hairlines on every click. The original sizes its canvas to
 * its parent; here it is a fixed, viewport-sized layer so it can sit over a
 * page ten thousand pixels tall without a ten-thousand-pixel canvas.
 */

import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  start: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
}

export default function ClickSpark({
  sparkColor = "#e6c76a",
  sparkSize = 9,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 480,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const sparks: Spark[] = [];
    let raf = 0;
    const easeOut = (t: number) => t * (2 - t);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const t = (now - s.start) / duration;
        if (t >= 1) {
          sparks.splice(i, 1);
          continue;
        }
        const e = easeOut(t);
        const dist = e * sparkRadius;
        const len = sparkSize * (1 - e);
        const x1 = s.x + dist * Math.cos(s.angle);
        const y1 = s.y + dist * Math.sin(s.angle);
        const x2 = s.x + (dist + len) * Math.cos(s.angle);
        const y2 = s.y + (dist + len) * Math.sin(s.angle);
        ctx.strokeStyle = sparkColor;
        ctx.globalAlpha = 1 - e * 0.6;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };

    const onClick = (e: MouseEvent) => {
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount + Math.PI / 8,
          start: now,
        });
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  return <canvas ref={canvasRef} className="click-spark" aria-hidden="true" />;
}
