export default function CTA() {
  return (
    <section className="contact" aria-label="Contact">
      <div className="index-head">
        <span className="vA-label">Contact</span>
        <span className="vA-label">Fig. 04 — You</span>
      </div>
      <h2 className="contact-h vA">The lab is open.</h2>
      <div className="contact-row">
        <p className="contact-body vB">
          For partnerships, products, or proof that any of this is real —
          write to the lab.
        </p>
        {/* the one filled surface on the entire page */}
        <a className="pill pill--solid" href="mailto:ishanpanchaal@theunreallab.com">
          Write to the lab
        </a>
      </div>
    </section>
  );
}
