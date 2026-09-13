"use client";

/**
 * Adapted from ReactBits <FlowingMenu> (reactbits.dev/r/FlowingMenu-TS-CSS).
 *
 * A list of rows. Under the pointer a cream band slides in from whichever
 * edge the pointer crossed, carrying a marquee of the row's line, and slides
 * back out the way the pointer leaves. The marquee only runs while its band
 * is on screen, so nothing moves at idle. The images of the original are
 * replaced by the diamond; the rows keep the site's hairlines.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export type FlowRow = { name: string; note: string };

const REPEATS = 8;

function Row({ name, note, speed }: FlowRow & { speed: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marquee = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const band = bandRef.current;
    if (!track || !band) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The stylesheet parks the band below the row for the first paint; gsap
    // would read that as pixels, so restate it as a percentage it can tween.
    gsap.set(band, { y: 0, yPercent: 101 });
    gsap.set(track, { y: 0, yPercent: 0 });
    const part = track.querySelector<HTMLElement>(".row__part");
    const setup = () => {
      const width = part?.offsetWidth ?? 0;
      marquee.current?.kill();
      if (!width) return;
      marquee.current = gsap.to(track, {
        x: -width,
        duration: speed,
        ease: "none",
        repeat: -1,
        paused: true,
      });
    };
    setup();
    document.fonts?.ready.then(setup);
    window.addEventListener("resize", setup, { passive: true });
    return () => {
      window.removeEventListener("resize", setup);
      marquee.current?.kill();
    };
  }, [speed, name, note]);

  const edgeOf = (e: React.MouseEvent<HTMLElement>) => {
    const r = rowRef.current!.getBoundingClientRect();
    return e.clientY - r.top < r.height / 2 ? "top" : "bottom";
  };

  const enter = (e: React.MouseEvent<HTMLElement>) => {
    const band = bandRef.current;
    const track = trackRef.current;
    if (!band || !track) return;
    const edge = edgeOf(e);
    marquee.current?.play();
    gsap
      .timeline({ defaults: { duration: 0.6, ease: "expo" } })
      .set(band, { yPercent: edge === "top" ? -101 : 101 }, 0)
      .set(track, { yPercent: edge === "top" ? 101 : -101 }, 0)
      .to([band, track], { yPercent: 0, overwrite: "auto" }, 0);
  };

  const leave = (e: React.MouseEvent<HTMLElement>) => {
    const band = bandRef.current;
    const track = trackRef.current;
    if (!band || !track) return;
    const edge = edgeOf(e);
    gsap
      .timeline({
        defaults: { duration: 0.6, ease: "expo" },
        onComplete: () => marquee.current?.pause(),
      })
      .to(band, { yPercent: edge === "top" ? -101 : 101, overwrite: "auto" }, 0)
      .to(track, { yPercent: edge === "top" ? 101 : -101, overwrite: "auto" }, 0);
  };

  return (
    <div
      ref={rowRef}
      className="row"
      data-cursor-target=""
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <span className="row__name">{name}</span>
      <span className="row__note">{note}</span>
      <div ref={bandRef} className="row__band" aria-hidden="true">
        <div ref={trackRef} className="row__track">
          {Array.from({ length: REPEATS }, (_, i) => (
            <span className="row__part" key={i}>
              <em>{name}</em>
              <i>{note}</i>
              <b className="diamond" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FlowingRows({
  rows,
  speed = 14,
}: {
  rows: FlowRow[];
  /** Seconds per marquee cycle. */
  speed?: number;
}) {
  return (
    <div className="rows">
      {rows.map((row) => (
        <Row key={row.name} {...row} speed={speed} />
      ))}
    </div>
  );
}
