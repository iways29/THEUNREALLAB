"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: "28px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
        background: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <Link href="/" style={{
        fontSize: 15, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--text)", textDecoration: "none",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 22, height: 22, background: "var(--accent)",
          borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="#080808" />
          </svg>
        </div>
        The Unreal Lab
      </Link>

      <ul style={{ display: "flex", gap: 40, listStyle: "none" }}>
        {[["#products", "Products"], ["#about", "About"], ["mailto:ceo@mumba.ai", "Contact"]].map(([href, label]) => (
          <li key={label}>
            <a href={href} style={{
              fontSize: 13, color: "var(--muted)", textDecoration: "none",
              letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <a href="#products" style={{
        fontSize: 13, fontWeight: 600, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--bg)", background: "var(--accent)",
        padding: "10px 22px", borderRadius: 4, textDecoration: "none",
        transition: "opacity 0.2s, transform 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Explore →
      </a>
    </nav>
  );
}
