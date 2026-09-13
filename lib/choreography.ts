/**
 * The whole scroll choreography in one place.
 *
 * Every entry binds a selector to a depth. Depth is a multiplier on how far the
 * element travels as its section is scrolled through: light, secondary things
 * (labels, rules) move most, headings least, so the page reads as layers at
 * different distances rather than one sheet sliding past.
 *
 * `sway` is the same idea for the pointer: px of horizontal travel for a
 * pointer at the far edge of the viewport, signed, so layers lean in opposite
 * directions. `tilt` adds a small 3D lean toward the pointer.
 *
 * `stagger` offsets each matched element within its section by that much
 * progress, so grids and lists shear instead of moving as a block.
 */
export type MotionSpec = {
  selector: string;
  /** Travel multiplier. 1 ≈ BASE_TRAVEL px across the section. */
  depth: number;
  /** Progress offset per element index within a section. */
  stagger?: number;
  /** Extra scale travel, e.g. headings settling as they rise. */
  scale?: number;
  /** Horizontal px at the viewport edge; negative leans against the pointer. */
  sway?: number;
  /** Lean toward the pointer in 3D (hero verse card). */
  tilt?: boolean;
  /** Letter-spacing (em) from → to as the element enters. */
  track?: [number, number];
};

/** Pixels an element of depth 1 travels across one full section. */
export const BASE_TRAVEL = 110;

/** Amplitude of the idle drift, in px, for an element of depth 1. */
export const DRIFT = 5;

export const CHOREOGRAPHY: MotionSpec[] = [
  // Structural marks move most — they read as nearest to the viewer.
  { selector: ".eyebrow", depth: 1.35, sway: -18 },
  { selector: ".eyebrow__text", depth: 0, track: [0.5, 0.26] },
  { selector: ".label", depth: 1.4, sway: -12, track: [0.5, 0.26] },

  // Headings move least so the type stays the anchor.
  { selector: ".h1", depth: 0.42, scale: 0.012, sway: -10 },
  { selector: ".h2", depth: 0.5, scale: 0.01, sway: -6 },

  // Body and supporting copy sit between the two.
  { selector: ".hero__sub", depth: 0.85, sway: -6 },
  { selector: ".hero__cta", depth: 1.05, sway: -8 },
  { selector: ".prose", depth: 0.78, stagger: 0.022, sway: -4 },

  { selector: ".verse-card", depth: 0.95, sway: 16, tilt: true },
  { selector: ".seal", depth: 1.25, sway: 22 },
  { selector: ".verse", depth: 1.1, sway: 8 },

  // Grids and lists travel as one block, so the 1px hairlines between cards
  // stay hairlines. Their children carry depth 0 and only stagger their fade,
  // which reads as the set arriving in sequence without shearing the rules.
  { selector: ".grid", depth: 0.88, sway: 6 },
  { selector: ".rows", depth: 1.0, sway: 6 },
  { selector: ".card", depth: 0, stagger: 0.035 },
  { selector: ".conch-card", depth: 0, stagger: 0.045 },
  { selector: ".row", depth: 0, stagger: 0.028 },

  { selector: ".footer", depth: 0.55 },
];
