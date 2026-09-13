import Verse from "@/components/Verse";

const STAGES = [
  { when: "Now", name: "Studio", note: "Build, advise, back with hours." },
  { when: "Next", name: "Portfolio", note: "Founders who took off from nothing." },
  { when: "Then", name: "Fund", note: "Limited partners, first cheques, same seat." },
];

export default function TheFund() {
  return (
    <section id="fund" data-scene="4" className="section section--center">
      <div className="scrim scrim--fund" />
      <div className="container">
        <div style={{ maxWidth: 800 }} data-reveal>
          <div className="label">IV · The fund</div>
          <h2 className="h2" style={{ maxWidth: "13ch" }}>
            Swarajya was not declared. It was built, one fort at a time.
          </h2>
          <p className="prose prose--wide">
            Shivaji Maharaj did not begin with an empire. He began with a hill, a
            few loyal people, and the discipline to hold each fort before reaching
            for the next. Speed where the incumbents were slow. Strongholds where
            they had none. Loyalty to the people he served above all.
          </p>
          <p className="prose prose--wide" style={{ marginBottom: 34 }}>
            That is our path. Today, a studio that builds and backs a handful of
            founders with hours instead of cheques. Next, a portfolio that speaks
            for itself. Then, a venture fund with limited partners who want to be
            early to the founders no one else has met yet. We are looking for our
            first LPs now.
          </p>
          <div className="grid grid--stages">
            {STAGES.map((stage) => (
              <div className="card card--stage" key={stage.when}>
                <div className="card__stage-label">{stage.when}</div>
                <div className="card__stage-name">{stage.name}</div>
                <div className="card__stage-note">{stage.note}</div>
              </div>
            ))}
          </div>
          <Verse
            lines={[
              "प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।",
              "शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥",
            ]}
            gloss="Like the new moon, this seal of Shivaji, son of Shahaji, grows and is honoured by the world. It shines for the welfare of all."
            source="Rajmudra of Chhatrapati Shivaji Maharaj"
          />
        </div>
      </div>
    </section>
  );
}
