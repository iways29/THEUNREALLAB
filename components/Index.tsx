const rows = [
  {
    no: "01",
    name: "Mumba.ai",
    role: "Conversation instrument",
    status: "Live",
    href: "#mumba",
  },
  {
    no: "02",
    name: "ASHVAA",
    role: "Codebase instrument",
    status: "Open source",
    href: "#ashvaa",
  },
  {
    no: "03",
    name: "Unnamed",
    role: "Undisclosed",
    status: "In the lab",
    href: "#lab",
  },
];

export default function Index() {
  return (
    <section id="index" className="index" aria-label="Index of instruments">
      <div className="index-head">
        <span className="vA-label">Index — current holdings</span>
        <span className="vA-label">03 entries</span>
      </div>
      {rows.map((r) => (
        <a key={r.no} href={r.href} className="index-row">
          <span className="no">{r.no}</span>
          <span>{r.name}</span>
          <span className="role">{r.role}</span>
          <span className="status">
            <span className="dot" aria-hidden="true" />
            {r.status}
          </span>
        </a>
      ))}
    </section>
  );
}
