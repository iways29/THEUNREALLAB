/** One scene per section, in scroll order. Assets live in /public/scenes. */
export type Scene = {
  /** Section anchor this scene is bound to. */
  id: string;
  /** Asset basename under /public/scenes. */
  slug: string;
  /** Poster still, shown before the clip plays and under prefers-reduced-motion. */
  poster: string;
  /** Looping entry clip (Phase 1). */
  clip: string;
  /**
   * Phase 2: continuation clip that picks up on the entry clip's last frame and
   * carries the camera into the next scene. Null until the render lands.
   */
  exitClip: string | null;
  /**
   * Phase 2: scrubbable frame sequence. `count` frames numbered from 0001;
   * the entry clip's frames run first, the exit clip's continue the count.
   */
  frames: { dir: string; count: number } | null;
};

export const SCENES: Scene[] = [
  {
    id: "top",
    slug: "00-chariot",
    poster: "/scenes/00-chariot.jpg",
    clip: "/scenes/00-chariot.mp4",
    exitClip: "/scenes/00-chariot-exit.mp4",
    frames: { dir: "/frames/00-chariot", count: 41 },
  },
  {
    id: "promise",
    slug: "01-counsel",
    poster: "/scenes/01-counsel.jpg",
    clip: "/scenes/01-counsel.mp4",
    exitClip: "/scenes/01-counsel-exit.mp4",
    frames: { dir: "/frames/01-counsel", count: 41 },
  },
  {
    id: "practice",
    slug: "02-bow",
    poster: "/scenes/02-bow.jpg",
    clip: "/scenes/02-bow.mp4",
    exitClip: "/scenes/02-bow-exit.mp4",
    frames: { dir: "/frames/02-bow", count: 65 },
  },
  {
    id: "room",
    slug: "03-assembly",
    poster: "/scenes/03-assembly.jpg",
    clip: "/scenes/03-assembly.mp4",
    exitClip: "/scenes/03-assembly-exit.mp4",
    frames: { dir: "/frames/03-assembly", count: 45 },
  },
  {
    id: "fund",
    slug: "04-raigad",
    poster: "/scenes/04-raigad.jpg",
    clip: "/scenes/04-raigad.mp4",
    exitClip: "/scenes/04-raigad-exit.mp4",
    frames: { dir: "/frames/04-raigad", count: 38 },
  },
  {
    id: "apply",
    slug: "05-conch",
    poster: "/scenes/05-conch.jpg",
    clip: "/scenes/05-conch.mp4",
    exitClip: "/scenes/05-conch-exit.mp4",
    frames: { dir: "/frames/05-conch", count: 44 },
  },
];

export const EMAIL = "ishanpanchaal@theunreallab.com";
