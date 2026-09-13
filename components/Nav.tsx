"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#promise", label: "The Promise" },
  { href: "#practice", label: "The Practice" },
  { href: "#room", label: "The Room" },
  { href: "#fund", label: "The Fund" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="nav">
        <a href="#top" className="nav__mark">
          <span className="diamond" />
          <span className="wordmark">The Unreal Lab</span>
        </a>
        <div className="nav__right">
          <div className="nav__links">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav__link">
                {link.label}
              </a>
            ))}
          </div>
          <a href="#apply" className="nav__cta">
            Apply →
          </a>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>
      {open ? (
        <div className="nav__sheet">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
