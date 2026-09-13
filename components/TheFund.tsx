import Verse from "@/components/Verse";
import SplitText from "@/components/reactbits/SplitText";
import ScrambledText from "@/components/reactbits/ScrambledText";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

const STAGES = [
  { when: "Now", name: "Studio", note: "Build, advise, back with hours." },
  { when: "Next", name: "Portfolio", note: "Founders who took off from nothing." },
  { when: "Then", name: "Fund", note: "Limited partners, first cheques, same seat." },
];

export default function TheFund() {
  return (
    <section id="fund" data-scene="4" className="section">
      <div className="pin pin--center">
        <div className="container">
          <div style={{ maxWidth: 800 }}>
            <ScrambledText as="div" className="label">IV · The fund</ScrambledText>
            <SplitText as="h2" className="h2" style={{ maxWidth: "13ch" }} at="scroll">
              Swarajya was not declared. It was built, one fort at a time.
            </SplitText>
            <ScrollReveal className="prose prose--wide">
              Shivaji Maharaj did not begin with an empire. He began with a hill, a few loyal people, and the discipline to hold each fort before reaching for the next. Speed where the incumbents were slow. Strongholds where they had none. Loyalty to the people he served above all.
            </ScrollReveal>
            <ScrollReveal className="prose prose--wide" style={{ marginBottom: 34 }}>
              That is our path. Today, a studio that builds and backs a handful of founders with hours instead of cheques. Next, a portfolio that speaks for itself. Then, a venture fund with limited partners who want to be early to the founders no one else has met yet. We are looking for our first LPs now.
            </ScrollReveal>
            <div className="grid grid--stages">
              {STAGES.map((stage) => (
                <SpotlightCard className="card card--stage" key={stage.when}>
                  <div className="card__stage-label">{stage.when}</div>
                  <div className="card__stage-name">{stage.name}</div>
                  <div className="card__stage-note">{stage.note}</div>
                </SpotlightCard>
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
      </div>
    </section>
  );
}
