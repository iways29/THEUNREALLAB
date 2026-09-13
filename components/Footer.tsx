export default function Footer() {
  const links: [string, string][] = [
    ["https://mumba.ai", "Mumba.ai"],
    ["https://github.com/iways29/ASHVAA", "ASHVAA"],
    ["mailto:ishanpanchaal@theunreallab.com", "Email"],
  ];

  return (
    <footer className="footer">
      <div className="footer-row">
        <span className="vA" style={{ fontSize: "var(--text-sm)" }}>
          The Unreal Lab
        </span>
        <ul className="footer-links">
          {links.map(([href, label]) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <span className="roll">
                  <span data-text={label}>{label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <span className="vA-label credit" style={{ color: "var(--ember)" }}>
          Designed &amp; built by The Unreal Lab — obviously
        </span>
      </div>
      <div className="footer-fine">
        <span className="vA-label">
          Everything on this site is real. The products exist. That is the
          point.
        </span>
        <span className="vA-label">
          © {new Date().getFullYear()} The Unreal Lab
        </span>
      </div>
    </footer>
  );
}
