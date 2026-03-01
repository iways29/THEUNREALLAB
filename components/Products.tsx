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

        {/* Coming soon 1 */}
        <ProductCard style={{
          padding: 56, display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column",
          textAlign: "center", minHeight: 320,
        }}>
          <div style={{
            width: 64, height: 64, border: "1px solid var(--border-bright)",
            borderRadius: 12, display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 24, opacity: 0.5,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#444", marginBottom: 8 }}>Next Product</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase" }}>In the lab · 2025</div>
        </ProductCard>

        {/* Coming soon 2 */}
        <ProductCard style={{
          padding: 56, display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column",
          textAlign: "center", minHeight: 320,
        }}>
          <div style={{
            width: 64, height: 64, border: "1px solid var(--border-bright)",
            borderRadius: 12, display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 24, opacity: 0.5,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#444", marginBottom: 8 }}>Something Unreal</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Classified · TBD</div>
        </ProductCard>
      </div>
    </section>
  );
}
