"use client";

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "0 48px",
      textAlign: "center",
      overflow: "hidden",
    }}>
      <div className="hero-grid" />
      <div className="hero-glow" />

      {/* Eyebrow */}
      <div className="animate-fade-up-1" style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11, letterSpacing: "0.25em",
        textTransform: "uppercase", color: "var(--accent)",
        marginBottom: 32,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ width: 40, height: 1, background: "var(--accent)", opacity: 0.5, display: "block" }} />
        Building the future
        <span style={{ width: 40, height: 1, background: "var(--accent)", opacity: 0.5, display: "block" }} />
      </div>

      {/* Title */}
      <h1 className="animate-fade-up-2" style={{
        fontSize: "clamp(64px, 9vw, 130px)",
        fontWeight: 800,
        lineHeight: 0.92,
        letterSpacing: "-0.03em",
        marginBottom: 32,
      }}>
        We Make
        <br />
        <span style={{
          display: "block",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.3)",
        }}>
          The{" "}
          <span style={{ color: "var(--accent)", WebkitTextStroke: "0px" }}>
            Unreal
          </span>
        </span>
        Real
      </h1>

      {/* Subtitle */}
      <p className="animate-fade-up-3" style={{
        maxWidth: 520, fontSize: 17, lineHeight: 1.65,
        color: "#888", fontWeight: 400, marginBottom: 52,
      }}>
        A product studio at the edge of AI and human experience.
        We build tools that shouldn&apos;t exist yet.
      </p>

      {/* CTAs */}
      <div className="animate-fade-up-4" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <a href="#products" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "var(--accent)", color: "var(--bg)",
          fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "16px 32px", borderRadius: 4, textDecoration: "none",
          transition: "transform 0.25s, box-shadow 0.25s",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(232,255,71,0.3)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Explore our products
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="#about" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          color: "#888", fontSize: 14, fontWeight: 500,
          letterSpacing: "0.04em", textDecoration: "none",
          transition: "color 0.2s", padding: "16px 0",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "#888"}
        >
          Our mission
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fade-in-delayed" style={{
        position: "absolute", bottom: 40, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8,
      }}>
        <div className="scroll-line" />
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--muted)", writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}>
          Scroll
        </span>
      </div>
    </section>
  );
}
