import Verse from "@/components/Verse";

export default function ThePromise() {
  return (
    <section id="promise" data-scene="1" className="section">
      <div className="pin pin--center">
        <div className="scrim scrim--right" />
        <div className="container">
          <div style={{ maxWidth: 760 }}>
            <div className="label">I · The promise</div>
            <h2 className="h2" style={{ maxWidth: "14ch" }}>
              You already hold the bow. You are only doubting your right to draw it.
            </h2>
            <p className="prose">
              Arjuna did not lack skill on the morning of Kurukshetra. He lacked
              someone beside him who had seen the whole field. That is the seat we
              take.
            </p>
            <p className="prose" style={{ marginBottom: 36 }}>
              Founders who come through here stop trading depth for speed, stop
              waiting for permission, and become the people other founders call
              first. Not because they raised. Because what they built worked, and
              the right people saw who built it.
            </p>
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
