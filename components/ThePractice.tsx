import Verse from "@/components/Verse";
import SplitText from "@/components/reactbits/SplitText";
import ScrambledText from "@/components/reactbits/ScrambledText";
import BentoCard from "@/components/reactbits/BentoCard";
import BlurText from "@/components/reactbits/BlurText";
import CountUp from "@/components/reactbits/CountUp";

const WAYS = [
  {
    label: "We build",
    body: (
      <>
        Our own AI products, shipped and live.{" "}
        <a href="https://mumba.ai" target="_blank" rel="noopener noreferrer">
          Mumba.ai
        </a>
        , a tree-based conversation interface.{" "}
        <a href="https://github.com/iways29/ASHVAA" target="_blank" rel="noopener noreferrer">
          ASHVAA
        </a>
        , open-source codebase intelligence. The next one is unnamed.
      </>
    ),
  },
  {
    label: "We advise",
    body: "Enterprise AI that is not allowed to misbehave: governance, evaluation, agent platforms. Hands-on experience from inside a Fortune 500 build, brought to companies that need it to work.",
  },
  {
    label: "We partner",
    body: "We are building relationships with product companies now, with an eye toward deploying the right ones inside the enterprises our partners serve. The architects in the room when it has to ship.",
  },
  {
    label: "We back",
    body: "Founders at the very beginning, before there is a deck or a company. Architecture, people, introductions, launch, hours. A small agreed stake. Capital as the portfolio earns it.",
  },
];

export default function ThePractice() {
  return (
    <section id="practice" data-scene="2" className="section">
      <div className="pin pin--center">
        <div className="container container--end">
          <div style={{ maxWidth: 820, width: "100%" }}>
            <ScrambledText as="div" className="label">II · The practice</ScrambledText>
            <SplitText
              as="h2"
              className="h2 h2--tight"
              style={{ maxWidth: "14ch", marginBottom: 38 }}
              at="scroll"
            >
              Four ways we draw the bow.
            </SplitText>
            <div className="grid grid--practice">
              {WAYS.map((way, i) => (
                <BentoCard className="card" key={way.label}>
                  <CountUp to={i + 1} delay={i * 0.12} className="card__number" />
                  <div className="card__label">{way.label}</div>
                  <BlurText as="p" className="card__body">
                    {way.body}
                  </BlurText>
                </BentoCard>
              ))}
            </div>
            <div style={{ marginTop: 30 }}>
              <Verse
                lines={["कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।"]}
                gloss="Your right is to the work alone, never to its fruits."
                source="Bhagavad Gita · 2.47"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
