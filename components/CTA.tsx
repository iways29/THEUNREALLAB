"use client";

export default function CTA() {
  return (
    <section style={{
      padding: "100px 48px 140px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,255,71,0.04) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      <div className="reveal" style={{
        maxWidth: 900, margin: "0 auto",
        border: "1px solid var(--border)",
        borderRadius: 16, padding: 80,
        position: "relative",
        background: "var(--bg2)",
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 28,
        }}>
          Get Involved
        </div>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800,
          letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: 20,
        }}>
          Ready to try the future?
        </h2>

        <p style={{
          fontSize: 16, color: "#666", marginBottom: 44,
          maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6,
        }}>
          Explore Mumba.ai and experience what AI conversations should feel like.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}>
          <a
            href="https://mumba.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
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
            Launch Mumba.ai
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href="mailto:ceo@mumba.ai"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "#888", fontSize: 14, fontWeight: 500,
              letterSpacing: "0.04em", textDecoration: "none",
              transition: "color 0.2s", padding: "16px 0",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "#888"}
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
