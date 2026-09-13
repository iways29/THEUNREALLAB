import Verse from "@/components/Verse";
import SplitText from "@/components/reactbits/SplitText";
import ScrambledText from "@/components/reactbits/ScrambledText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

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
              <SpotlightCard className="card">
                <div className="card__number">01</div>
                <div className="card__label">We build</div>
                <p className="card__body">
                  Our own AI products, shipped and live.{" "}
                  <a href="https://mumba.ai" target="_blank" rel="noopener noreferrer">
                    Mumba.ai
                  </a>
                  , a tree-based conversation interface.{" "}
                  <a
                    href="https://github.com/iways29/ASHVAA"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ASHVAA
                  </a>
                  , open-source codebase intelligence. The next one is unnamed.
                </p>
              </SpotlightCard>
              <SpotlightCard className="card">
                <div className="card__number">02</div>
                <div className="card__label">We advise</div>
                <p className="card__body">
                  Enterprise AI that is not allowed to misbehave: governance,
                  evaluation, agent platforms. Hands-on experience from inside a
                  Fortune 500 build, brought to companies that need it to work.
                </p>
              </SpotlightCard>
              <SpotlightCard className="card">
                <div className="card__number">03</div>
                <div className="card__label">We partner</div>
                <p className="card__body">
                  We are building relationships with product companies now, with an
                  eye toward deploying the right ones inside the enterprises our
                  partners serve. The architects in the room when it has to ship.
                </p>
              </SpotlightCard>
              <SpotlightCard className="card">
                <div className="card__number">04</div>
                <div className="card__label">We back</div>
                <p className="card__body">
                  Founders at the very beginning, before there is a deck or a
                  company. Architecture, people, introductions, launch, hours. A
                  small agreed stake. Capital as the portfolio earns it.
                </p>
              </SpotlightCard>
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
