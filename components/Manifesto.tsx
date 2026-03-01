"use client";

const pills = ["AI Research", "Product Design", "Engineering", "Startups", "Enterprise"];

export default function Manifesto() {
  return (
    <section id="about" style={{
      padding: "140px 48px",
      borderTop: "1px solid var(--border)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1.6fr",
        gap: 120, alignItems: "start",
      }}>
        {/* Left — sticky */}
        <div className="reveal" style={{ position: "sticky", top: 120 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: "0.2em", color: "var(--muted)", marginBottom: 20,
          }}>
            01 / About
          </div>
          <h2 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em",
          }}>
            We build what<br />
            <span style={{ color: "var(--accent)" }}>doesn&apos;t</span> exist yet
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 40 }}>
            {pills.map((p) => (
              <div key={p} className="pill">{p}</div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="reveal" style={{ transitionDelay: "0.15s" }}>
          {[
            <>
              <strong>The Unreal Lab is a product studio obsessed with the edges.</strong> The problems that seem impossible. The interfaces that don&apos;t make sense yet. The AI behaviors that haven&apos;t been named.
            </>,
            <>
              We sit at the intersection of <strong>AI research and product craft</strong> — building things that feel like they&apos;re from five years in the future, shipping them today.
            </>,
            <>
              Our first product, <strong>Mumba.ai</strong>, solves one of the most fundamental problems in human-AI interaction: context collapse. As AI conversations grow, they lose coherence. We built a new architecture to fix that forever.
            </>,
            <>
              This is just the beginning. We have more experiments running in the lab — tools that will change how people think, collaborate, and create with AI.
            </>,
          ].map((content, i) => (
            <p key={i} style={{
              fontSize: 19, lineHeight: 1.8, color: "#777",
              fontWeight: 400, marginBottom: 28,
            }}>
              {content}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
