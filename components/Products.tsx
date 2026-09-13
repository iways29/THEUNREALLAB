import SpecimenCanvas from "./SpecimenCanvas";

function FigRing() {
  return (
    <div className="fig-ring" aria-hidden="true">
      <i /><i /><i /><i />
    </div>
  );
}

export default function Products() {
  return (
    <div id="specimens">
      {/* ── Specimen 01 · Mumba.ai ─────────────────────────── */}
      <section id="mumba" className="specimen" aria-label="Specimen 01 — Mumba.ai">
        <div className="specimen-text">
          <div className="specimen-no">Specimen 01 — Live</div>
          <h2 className="specimen-title vA">Mumba.ai</h2>
          <p className="specimen-body vB">
            Conversation was never a straight line. Mumba is a chat interface
            built as a living tree — every reply can branch, every branch
            keeps its context, and nothing you said gets lost on the way down.
          </p>
          <a
            className="pill"
            href="https://mumba.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dot" aria-hidden="true" />
            Open Mumba.ai
          </a>
        </div>
        <figure className="specimen-fig" style={{ margin: 0 }}>
          <FigRing />
          <SpecimenCanvas variant="tree" />
          <figcaption className="fig-caption vA-label">
            Fig. 01 — A conversation, grown · live render · drag
          </figcaption>
        </figure>
      </section>

      {/* ── Specimen 02 · ASHVAA ───────────────────────────── */}
      <section
        id="ashvaa"
        className="specimen specimen--flip"
        aria-label="Specimen 02 — ASHVAA"
      >
        <div className="specimen-text">
          <div className="specimen-no">Specimen 02 — Open source</div>
          <h2 className="specimen-title vA">ASHVAA</h2>
          <p className="specimen-body vB">
            Point it at any repository and ASHVAA draws the map — the
            dependency graph, the dead code, the security holes, and{" "}
            <span className="ember">the one node that&apos;s going to hurt
            you</span>, explained in plain language.
          </p>
          <a
            className="pill"
            href="https://github.com/iways29/ASHVAA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dot" aria-hidden="true" />
            Read the source
          </a>
        </div>
        <figure className="specimen-fig" style={{ margin: 0 }}>
          <FigRing />
          <SpecimenCanvas variant="graph" />
          <figcaption className="fig-caption vA-label">
            Fig. 02 — 88 modules, 1 finding · live render · drag
          </figcaption>
        </figure>
      </section>

      {/* ── Specimen 03 · the empty vitrine ────────────────── */}
      <section id="lab" className="specimen" aria-label="Specimen 03 — Unnamed">
        <div className="specimen-text">
          <div className="specimen-no">Specimen 03 — In the lab</div>
          <h2 className="specimen-title vA">Unnamed</h2>
          <p className="specimen-body vB">
            The third instrument doesn&apos;t have a name yet. It ships when
            it&apos;s ready — and not a day before.
          </p>
        </div>
        <div className="specimen-fig" aria-hidden="true">
          <div className="vitrine">
            <span className="vA-label">Exhibit pending</span>
          </div>
          <div className="fig-caption vA-label">Fig. 03 — Withheld</div>
        </div>
      </section>
    </div>
  );
}
