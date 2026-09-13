import { FRAMES, SCENES } from "@/lib/scenes";

/**
 * Two floating instruments, both driven by SceneEngine each frame.
 *
 * The chapter rail sits at the right edge: one tick per scene, a gold diamond
 * that slides along the track with the stage. The frame counter sits at the
 * bottom left and reads out the film frame under the scroll position.
 */
export default function Rail() {
  return (
    <>
      <nav className="rail" data-rail aria-label="Chapters">
        <div className="rail__track" aria-hidden="true">
          <span className="rail__dot" />
        </div>
        {SCENES.map((scene, i) => (
          <a
            key={scene.id}
            href={`#${scene.id}`}
            className={`rail__item${i === 0 ? " is-active" : ""}`}
            data-rail-item
            data-cursor="Go"
          >
            <span className="rail__name">{scene.title}</span>
            <span className="rail__tick" aria-hidden="true" />
          </a>
        ))}
      </nav>
      <div className="frame-counter" aria-hidden="true">
        <span className="frame-counter__scene" data-counter-scene>
          00 · {SCENES[0].title}
        </span>
        <span className="frame-counter__num">
          <b data-counter-frame>0001</b> / {FRAMES.count}
        </span>
        <span className="frame-counter__time" data-counter-time>
          00:00
        </span>
      </div>
    </>
  );
}
