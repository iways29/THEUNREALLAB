# Scene assets

Six scenes, one per section, in scroll order. Generated in Higgsfield and
self-hosted here (see `design_handoff/README.md` for the original URLs).

| # | slug | section | poster | entry clip | exit clip |
|---|------|---------|--------|-----------|-----------|
| 0 | chariot  | `#top`      | `00-chariot.jpg`  | `00-chariot.mp4`  | `00-chariot-exit.mp4`  |
| 1 | counsel  | `#promise`  | `01-counsel.jpg`  | `01-counsel.mp4`  | `01-counsel-exit.mp4`  |
| 2 | bow      | `#practice` | `02-bow.jpg`      | `02-bow.mp4`      | `02-bow-exit.mp4`      |
| 3 | assembly | `#room`     | `03-assembly.jpg` | `03-assembly.mp4` | `03-assembly-exit.mp4` |
| 4 | raigad   | `#fund`     | `04-raigad.jpg`   | `04-raigad.mp4`   | `04-raigad-exit.mp4`   |
| 5 | conch    | `#apply`    | `05-conch.jpg`    | `05-conch.mp4`    | `05-conch-exit.mp4`    |

Posters are the original PNGs re-encoded to JPEG q82 (1344x752, ~400KB each
instead of ~1.9MB). Phase 1 uses poster + entry clip only.

## Exit clips

Each `-exit.mp4` was produced with Seedance 2.5 in `video_extension / forward`
mode from the entry clip itself, not from a still — so the camera move, light
and cloud drift continue across the join and the scene ends on a frame that
leads into the next one. They are registered in `lib/scenes.ts` as
`Scene.exitClip` and are not played in Phase 1.

## Exporting frames for Phase 2

The frame-scrub engine wants one continuous sequence per scene: the entry
clip's frames first, the exit clip's continuing the same count.

```bash
# entry clip -> 0001...
ffmpeg -i 00-chariot.mp4 -vf fps=15,scale=1920:1080 -q:v 4 \
  frames/00-chariot/%04d.jpg

# exit clip -> continues the numbering (adjust -start_number to entry count + 1)
ffmpeg -i 00-chariot-exit.mp4 -vf fps=15,scale=1920:1080 -q:v 4 \
  -start_number 121 frames/00-chariot/%04d.jpg
```

Then set `Scene.frames = { dir: "/frames/00-chariot", count: <total> }` in
`lib/scenes.ts` and implement `lib/useFrameScrub.ts`, which carries the full
Phase 2 checklist.
