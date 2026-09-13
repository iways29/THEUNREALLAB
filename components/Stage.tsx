import { SCENES } from "@/lib/scenes";

/**
 * The fixed background stage: one layer per scene, each holding a full-bleed
 * looping clip over its poster, with a film-grain overlay on top.
 * Opacity, scale and playback are driven by SceneEngine.
 */
export default function Stage() {
  return (
    <div className="stage" aria-hidden="true">
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
      <div className="grain" />
    </div>
  );
}
