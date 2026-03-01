"use client";

const items = [
  "AI-Native Products",
  "Conversational Intelligence",
  "Context-Aware Systems",
  "Human-Centered Design",
  "Enterprise-Grade AI",
  "Tree-Based Architecture",
  "The Unreal Lab",
];

export default function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      overflow: "hidden",
      padding: "18px 0",
      background: "var(--bg2)",
    }}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "0 40px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}>
            {item}
            <span style={{
              width: 4, height: 4, borderRadius: "50%",
              background: "var(--accent)", opacity: 0.6, flexShrink: 0,
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}
