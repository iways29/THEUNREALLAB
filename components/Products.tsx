"use client";

import { useRef } from "react";

function ProductCard({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX - rect.left}px`;
      glowRef.current.style.top = `${e.clientY - rect.top}px`;
    }
  };

  return (
    <div className="product-card" onMouseMove={handleMouseMove} style={style}>
      <div ref={glowRef} className="card-glow" />
      {children}
    </div>
  );
}

export default function Products() {
  return (
    <section id="products" style={{ padding: "140px 48px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Section header */}
      <div className="reveal">
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          Our Products
          <span style={{ width: 80, height: 1, background: "var(--border)", display: "block" }} />
        </div>
        <h2 style={{
          fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 800,
          lineHeight: 1.0, letterSpacing: "-0.025em",
          marginBottom: 80, maxWidth: 600,
        }}>
          Tools built to{" "}
          <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>
            change
          </span>{" "}
          the way you think
        </h2>
      </div>

      {/* Grid */}
      <div className="reveal" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        background: "var(--border)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {/* Mumba.ai - full width */}
        <ProductCard style={{ gridColumn: "1 / -1", padding: 56 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40, alignItems: "end",
          }}>
            {/* Left */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--accent)", border: "1px solid rgba(232,255,71,0.2)",
                borderRadius: 2, padding: "4px 10px", marginBottom: 36,
              }}>
                <span className="tag-dot" />
                Live · Flagship
              </div>

              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em",
                marginBottom: 16, lineHeight: 1,
              }}>
                Mumba.ai
              </div>

              <p style={{
                fontSize: 15, color: "#666", lineHeight: 1.6,
                marginBottom: 40, maxWidth: 340,
              }}>
                The world&apos;s first tree-based conversation interface. No more context collapse.
                No more lost threads. Every conversation branches, grows, and stays coherent — forever.
              </p>

              <a
                href="https://mumba.ai"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 13, fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "var(--text)",
                  textDecoration: "none", transition: "gap 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.gap = "14px";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.gap = "8px";
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                Launch App
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Right */}
            <div>
              <div style={{
                display: "flex", gap: 32,
                paddingTop: 32, borderTop: "1px solid var(--border)",
              }}>
                {[["∞", "Context Depth"], ["0%", "Context Lost"], ["AI+", "Powered"]].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>{num}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 28, fontSize: 14, color: "#555", lineHeight: 1.7 }}>
                Conversations aren&apos;t linear — so why should your AI be? Mumba reimagines the chat interface
                as a living tree where ideas branch, connect, and never get lost.
              </p>
            </div>
          </div>
          <div className="product-visual">M</div>
        </ProductCard>

        {/* ASHVAA — full width */}
        <ProductCard style={{ gridColumn: "1 / -1", padding: 56 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 560px", gap: 72, alignItems: "center" }}>
            {/* Left: content */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--accent)", border: "1px solid rgba(232,255,71,0.2)",
                borderRadius: 2, padding: "4px 10px", marginBottom: 28,
              }}>
                <span className="tag-dot" />
                Open Source
              </div>

              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em",
                marginBottom: 14, lineHeight: 1,
              }}>
                ASHVAA
              </div>

              <p style={{
                fontSize: 15, color: "#666", lineHeight: 1.65,
                marginBottom: 40, maxWidth: 420,
              }}>
                Codebase intelligence tool. Point it at any GitHub repo and get an interactive dependency graph, security vulnerability detection, dead code analysis, and AI-powered explanations.
              </p>

              <div style={{ display: "flex", gap: 32, marginBottom: 40, borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                {[["Graph", "Dep. Viz"], ["Scan", "Security"], ["AI", "Insights"]].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.01em" }}>{num}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <a
                href="https://github.com/iways29/ASHVAA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 13, fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "var(--text)",
                  textDecoration: "none", transition: "gap 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.gap = "14px";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.gap = "8px";
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                View on GitHub
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Right: LinkedIn video embed */}
            <div style={{
              borderRadius: 10, overflow: "hidden",
              border: "1px solid var(--border-bright)",
              flexShrink: 0, width: 560,
              aspectRatio: "504 / 399",
              position: "relative",
            }}>
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7469969628975427584?compact=1"
                frameBorder="0"
                allowFullScreen
                title="ASHVAA demo"
                style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}
              />
            </div>
          </div>
        </ProductCard>

        {/* Next product teaser */}
        <ProductCard style={{ padding: 56, minHeight: 320, gridColumn: "1 / -1" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40,
          }}>
            {/* Left */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#444", border: "1px solid #222",
                borderRadius: 2, padding: "4px 10px", marginBottom: 28,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: "#333", flexShrink: 0,
                }} />
                In the lab
              </div>

              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em",
                lineHeight: 1, marginBottom: 16,
                color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.12)",
              }}>
                Something<br />Unreal
              </div>

              <p style={{
                fontSize: 14, color: "#333", lineHeight: 1.65, maxWidth: 340,
              }}>
                The next thing we&apos;re building hasn&apos;t been named yet. It&apos;ll ship when it&apos;s ready — and not a day before.
              </p>
            </div>

            {/* Right: redacted details */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 14,
              opacity: 0.35, flexShrink: 0,
            }}>
              {["████████████ ██████", "███████ ████ ██████████", "██████████████", "█████ ███████ ████"].map((line, i) => (
                <div key={i} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  color: "var(--muted)", letterSpacing: "0.05em",
                  filter: "blur(2px)",
                }}>
                  {line}
                </div>
              ))}
              <div style={{
                marginTop: 8,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#2a2a2a",
              }}>
                CLASSIFIED · ACCESS DENIED
              </div>
            </div>
          </div>
        </ProductCard>
      </div>
    </section>
  );
}
