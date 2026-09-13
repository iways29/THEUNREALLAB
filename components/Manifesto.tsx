import Statement from "./Statement";

export default function Manifesto() {
  return (
    <section id="studio" className="statement-wrap" aria-label="The studio">
      <div className="index-head">
        <span className="vA-label">The studio</span>
        <span className="vA-label">Est. 2025</span>
      </div>
      <Statement text="Anyone can demo the future. We built a system that ships it." />
      <div className="studio-body">
        <div>
          <p className="vB">
            The Unreal Lab is not a pile of experiments. It&apos;s a
            production line for products that aren&apos;t supposed to be
            possible — research goes in one end, a shipped instrument comes
            out the other.
          </p>
          <p className="vB">
            Mumba came off that line. ASHVAA came off that line. The line is
            still running.
          </p>
        </div>
      </div>
    </section>
  );
}
