"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links: [string, string][] = [
  ["#index", "Index"],
  ["#specimens", "Specimens"],
  ["#studio", "Studio"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" className="nav-word" aria-label="The Unreal Lab — home">
        <svg width="20" height="20" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50" cy="50" r="38"
            fill="none" stroke="currentColor" strokeWidth="5"
            strokeDasharray="6 8" strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="9" fill="#dc5000" />
        </svg>
        The Unreal Lab
      </Link>

      <ul className="nav-links">
        {links.map(([href, label]) => (
          <li key={label}>
            <a href={href}>
              <span className="roll">
                <span data-text={label}>{label}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <a className="pill" href="mailto:ishanpanchaal@theunreallab.com">
        <span className="dot" aria-hidden="true" />
        Contact
      </a>
    </nav>
  );
}
