import SplitText from "@/components/reactbits/SplitText";
import ScrambledText from "@/components/reactbits/ScrambledText";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import FlowingRows from "@/components/reactbits/FlowingRows";

const ROWS = [
  { name: "Enterprise buyers", note: "Who decide if you are real" },
  { name: "Operators and engineers", note: "Who have shipped before" },
  { name: "Launch", note: "Your first hundred users, on purpose" },
  { name: "Capital", note: "Angels and funds, when you are ready" },
];

export default function TheRoom() {
  return (
    <section id="room" data-scene="3" className="section">
      <div className="pin pin--center">
        <div className="container container--room">
          <div>
            <ScrambledText as="div" className="label">III · The room</ScrambledText>
            <SplitText
              as="h2"
              className="h2"
              style={{ maxWidth: "12ch", marginBottom: 0 }}
              at="scroll"
            >
              We put you in rooms you would have waited years to enter.
            </SplitText>
          </div>
          <div>
            <ScrollReveal className="prose" style={{ marginBottom: 30 }}>
              Krishna’s strength at Kurukshetra was never the weapon. It was the alliances gathered long before the first arrow. Access is the advantage no term sheet lists, so we make it the first thing we give.
            </ScrollReveal>
            <FlowingRows rows={ROWS} />
          </div>
        </div>
      </div>
    </section>
  );
}
