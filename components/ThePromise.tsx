import Verse from "@/components/Verse";
import SplitText from "@/components/reactbits/SplitText";
import ScrambledText from "@/components/reactbits/ScrambledText";
import ScrollReveal from "@/components/reactbits/ScrollReveal";

export default function ThePromise() {
  return (
    <section id="promise" data-scene="1" className="section">
      <div className="pin pin--center">
        <div className="container">
          <div style={{ maxWidth: 760 }}>
            <ScrambledText as="div" className="label">I · The promise</ScrambledText>
            <SplitText as="h2" className="h2" style={{ maxWidth: "14ch" }} at="scroll">
              You already hold the bow. You are only doubting your right to draw it.
            </SplitText>
            <ScrollReveal className="prose">
              Arjuna did not lack skill on the morning of Kurukshetra. He lacked someone beside him who had seen the whole field. That is the seat we take.
            </ScrollReveal>
            <ScrollReveal className="prose" style={{ marginBottom: 36 }}>
              Founders who come through here stop trading depth for speed, stop waiting for permission, and become the people other founders call first. Not because they raised. Because what they built worked, and the right people saw who built it.
            </ScrollReveal>
            <Verse
              lines={["क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते ।"]}
              gloss="Do not yield to weakness, Partha. It does not become you."
              source="Bhagavad Gita · 2.3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
