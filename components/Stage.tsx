"use client";

import { useRef } from "react";
import SceneEngine from "@/components/SceneEngine";
import { SCENES } from "@/lib/scenes";

/**
 * The fixed background stage.
 *
 * Two renderers share it: a canvas that scrubs frame sequences against scroll
 * (Phase 2), and six video layers that loop each scene's clip (Phase 1). The
 * videos carry the stage until the canvas has a first frame for every scene,
 * and under prefers-reduced-motion they stay put showing static posters.
 * The film grain sits over whichever is live.
 *
 * SceneEngine drives both, and lives here so it can be handed the canvas ref
 * directly rather than hunting for the element in the DOM.
 */
export default function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      <div className="stage" aria-hidden="true">
        <div className="stage__videos">
          {SCENES.map((scene, i) => (
            <div
              key={scene.slug}
              className="stage__layer"
              data-scene-layer={i}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <video
                className="stage__video"
                data-scene-video={i}
                poster={scene.poster}
                src={scene.clip}
                muted
                loop
                playsInline
                preload="none"
                tabIndex={-1}
                style={{ backgroundImage: `url(${scene.poster})` }}
              />
            </div>
          ))}
        </div>
        <canvas ref={canvasRef} className="stage__canvas" data-scene-canvas />
        <div className="grain" />
      </div>
      <SceneEngine canvasRef={canvasRef} />
    </>
  );
}
