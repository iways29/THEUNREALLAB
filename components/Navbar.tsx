"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [["#products", "Products"], ["#about", "About"], ["mailto:ishanpanchaal@theunreallab.com", "Contact"]];

  return (
    <>
      <nav
        className="nav-inner"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
          background: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        }}
      >
        <Link href="/" style={{
          fontSize: "clamp(11px, 2vw, 15px)", fontWeight: 700, letterSpacing: "0.10em",
          textTransform: "uppercase", color: "var(--text)", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <img src="/the-unreal-lab-icon.svg" alt="" style={{ width: 24, height: 24, flexShrink: 0 }} />
          <span className="nav-wordmark">The Unreal Lab</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links" style={{ display: "flex", gap: 40, listStyle: "none", margin: 0, padding: 0 }}>
          {links.map(([href, label]) => (
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

        {/* Desktop CTA */}
        <a href="#products" className="nav-links" style={{
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            background: "none", border: "none", cursor: "pointer",
            padding: 8, color: "var(--text)",
          }}
          className="nav-hamburger"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(8,8,8,0.97)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 40,
        }}
          onClick={() => setMenuOpen(false)}
        >
          {links.map(([href, label]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
              fontSize: 28, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--text)", textDecoration: "none",
            }}>
              {label}
            </a>
          ))}
          <a href="#products" onClick={() => setMenuOpen(false)} style={{
            marginTop: 16, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "var(--bg)", background: "var(--accent)",
            padding: "14px 32px", borderRadius: 4, textDecoration: "none",
          }}>
            Explore →
          </a>
        </div>
      )}
    </>
  );
}
