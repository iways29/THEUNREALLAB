"use client";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "40px 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <a href="/" style={{
        fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--muted)", textDecoration: "none",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <img
          src="/the-unreal-lab-icon.svg"
          alt=""
          style={{ width: 22, height: 22 }}
        />
        The Unreal Lab
      </a>

      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        color: "#333", letterSpacing: "0.08em",
      }}>
        © {new Date().getFullYear()} The Unreal Lab. All rights reserved.
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {[
          ["https://mumba.ai", "Mumba.ai"],
          ["mailto:ceo@mumba.ai", "Contact"],
          ["https://twitter.com/theunreallab", "Twitter"],
        ].map(([href, label]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "#444", textDecoration: "none",
              letterSpacing: "0.05em", transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "#444"}
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
