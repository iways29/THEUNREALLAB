/**
 * One scene per section, in scroll order.
 *
 * The stage is a single 1017-frame sequence extracted from the merged 78s
 * film (13 fps). Each scene owns a contiguous frame range; the cuts between
 * them are hard cuts in the footage, so the scrub cross-dissolves a hair over
 * each boundary. Posters and clips remain as the no-canvas fallback.
 */
export type Scene = {
  /** Section anchor this scene is bound to. */
  id: string;
  /** Asset basename under /public/scenes. */
  slug: string;
  /** Short caption for the chapter rail and frame counter. */
  title: string;
  /** Poster still, shown before the canvas is ready and under reduced motion. */
  poster: string;
  /** Looping clip, played only if the canvas never becomes ready. */
  clip: string;
  /** Inclusive 1-based frame range in the global sequence. */
  range: [number, number];
};

/** The global frame sequence. `count` frames numbered 0001…, in `dir`. */
export const FRAMES = {
  dir: "/frames",
  smallDir: "/frames-sm",
  count: 1017,
  pad: 4,
  ext: "webp",
  /** Source frame rate; only used to derive the timecode readout. */
  fps: 13,
} as const;

export const SCENES: Scene[] = [
  {
    id: "top",
    slug: "00-chariot",
    title: "The chariot",
    poster: "/scenes/00-chariot.jpg",
    clip: "/scenes/00-chariot.mp4",
    range: [1, 170],
  },
  {
    id: "promise",
    slug: "01-counsel",
    title: "The counsel",
    poster: "/scenes/01-counsel.jpg",
    clip: "/scenes/01-counsel.mp4",
    range: [171, 339],
  },
  {
    id: "practice",
    slug: "02-bow",
    title: "The bow",
    poster: "/scenes/02-bow.jpg",
    clip: "/scenes/02-bow.mp4",
    range: [340, 509],
  },
  {
    id: "room",
    slug: "03-assembly",
    title: "The assembly",
    poster: "/scenes/03-assembly.jpg",
    clip: "/scenes/03-assembly.mp4",
    range: [510, 679],
  },
  {
    id: "fund",
    slug: "04-raigad",
    title: "Raigad",
    poster: "/scenes/04-raigad.jpg",
    clip: "/scenes/04-raigad.mp4",
    range: [680, 848],
  },
  {
    id: "apply",
    slug: "05-conch",
    title: "The conch",
    poster: "/scenes/05-conch.jpg",
    clip: "/scenes/05-conch.mp4",
    range: [849, 1017],
  },
];

/**
 * The chariot opens the site by itself. On load the stage plays frames
 * 1 → INTRO_HOLD (the wide shot dollying in to Krishna), the hero copy is
 * revealed as the playhead passes INTRO_REVEAL, and scrolling the hero
 * section then carries the last frames of the scene to the cut.
 */
export const INTRO_HOLD = 168;
export const INTRO_REVEAL = 158;
/** Dispatched on `window` the moment the hero copy is allowed to appear. */
export const HERO_REVEAL_EVENT = "hero:reveal";

export const frameUrl = (n: number, small = false) =>
  `${small ? FRAMES.smallDir : FRAMES.dir}/${String(n).padStart(FRAMES.pad, "0")}.${FRAMES.ext}`;

/**
 * Frame number (1-based) for a timeline position in [0, SCENES.length], where
 * the integer part is the scene and the fraction is progress through it.
 * Scene 0 starts at INTRO_HOLD: the frames before it belong to the opening.
 */
export function frameAt(timeline: number): number {
  const last = SCENES.length - 1;
  const clamped = Math.max(0, Math.min(timeline, last + 0.999999));
  const scene = Math.min(Math.floor(clamped), last);
  const p = clamped - scene;
  const [first, end] = SCENES[scene].range;
  const start = scene === 0 ? INTRO_HOLD : first;
  return start + Math.round(p * (end - start));
}

export const EMAIL = "ishanpanchaal@theunreallab.com";
