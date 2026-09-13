# Scene assets

Six scenes, one per section, in scroll order. Posters and entry clips are
generated in Higgsfield and self-hosted here; they are the **fallback** stage,
used only until the frame scrub is ready (or under `prefers-reduced-motion`).

| # | slug | section | poster | clip | frames |
|---|------|---------|--------|------|--------|
| 0 | chariot  | `#top`      | `00-chariot.jpg`  | `00-chariot.mp4`  | 1–170    |
| 1 | counsel  | `#promise`  | `01-counsel.jpg`  | `01-counsel.mp4`  | 171–339  |
| 2 | bow      | `#practice` | `02-bow.jpg`      | `02-bow.mp4`      | 340–509  |
| 3 | assembly | `#room`     | `03-assembly.jpg` | `03-assembly.mp4` | 510–679  |
| 4 | raigad   | `#fund`     | `04-raigad.jpg`   | `04-raigad.mp4`   | 680–848  |
| 5 | conch    | `#apply`    | `05-conch.jpg`    | `05-conch.mp4`    | 849–1017 |

The `-exit.mp4` clips are superseded by the merged film and no longer
referenced; they can be deleted.

## The frame scrub

The stage is **one 1017-frame sequence** extracted at 13 fps from the merged
78 s film (`~/Downloads/TheUnREAL.mp4`, 1280×720). Frame ranges per scene are
declared in `lib/scenes.ts`; every boundary above is a hard cut in the
footage, which `lib/useFrameScrub.ts` dissolves over the last 9% of the
outgoing scene.

Frames live in `public/frames/0001.webp … 1017.webp` (1280×720, WebP q82,
unsharp-masked) with a mobile set in `public/frames-sm/` (640×360). They are
**git-ignored** — ~90 MB is more than this connection can push — so they need
a CDN or Git LFS before deploy. Without them the site falls back to the
posters and clips above.

To regenerate from the exported JPGs:

```python
# python3, Pillow
from PIL import Image, ImageFilter
im = Image.open("frame_001.jpg").convert("RGB")
im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=65, threshold=2)) \
  .save("public/frames/0001.webp", "WEBP", quality=82, method=4)
im.resize((640, 360), Image.LANCZOS) \
  .filter(ImageFilter.UnsharpMask(radius=0.8, percent=40, threshold=2)) \
  .save("public/frames-sm/0001.webp", "WEBP", quality=78, method=4)
```

The frames are native 720p and get upscaled ~2.5× on a Retina display; the
only real fix for softness is a higher-resolution source (an ML upscale of
the merged film to 4K, then re-extract).
