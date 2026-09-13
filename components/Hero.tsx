import Arrow from "@/components/Arrow";

const WORDS = ["Every ", "Arjuna ", "needs ", "a "];

export default function Hero() {
  return (
    <section id="top" data-scene="0" className="section section--bottom">
      <div className="scrim scrim--up" />
      <div className="container container--hero">
        <div>
          <div className="eyebrow" data-intro="eyebrow">
            <span className="eyebrow__rule" />
            <span className="eyebrow__text">The Unreal Lab · venture studio</span>
          </div>
          <h1 className="h1">
            {WORDS.map((word) => (
              <span key={word} className="hero__word" data-word>
                {word}
              </span>
            ))}
            <span className="hero__word hero__word--gold" data-word>
              Krishna.
            </span>
          </h1>
          <p className="hero__sub" data-intro="sub">
            We build AI products of our own. We advise companies on AI that has to
            actually work. And we ride beside founders who are too early for
            everyone else, from nothing to the field. Not a fund yet. A charioteer
            first.
          </p>
          <div className="hero__cta" data-intro="cta">
            <a href="#apply" className="button">
              Enter the field
              <Arrow />
            </a>
            <div className="scroll-hint">
              <span className="scroll-hint__text">Scroll</span>
              <span className="scroll-hint__line" />
            </div>
          </div>
        </div>
        <div className="verse-card" data-reveal>
          <div className="verse-card__deva">
            यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः ।
            <br />
            तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम ॥
          </div>
          <div className="verse-card__gloss">
            Where Krishna and Arjuna stand together, there follow fortune,
            victory, prosperity and firm resolve.
          </div>
          <div className="verse-card__source">Bhagavad Gita · 18.78</div>
        </div>
      </div>
    </section>
  );
}
