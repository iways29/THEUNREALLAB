import Arrow from "@/components/Arrow";
import SplitText from "@/components/reactbits/SplitText";
import Magnet from "@/components/reactbits/Magnet";
import GlareHover from "@/components/reactbits/GlareHover";
import ScrambledText from "@/components/reactbits/ScrambledText";
import VariableProximity from "@/components/reactbits/VariableProximity";
import CircularText from "@/components/reactbits/CircularText";
import ScrollVelocity from "@/components/reactbits/ScrollVelocity";

export default function Hero() {
  return (
    <section id="top" data-scene="0" className="section section--hero">
      <div className="pin pin--bottom">
        <div className="container container--hero">
          <div className="hero__copy">
            <div className="eyebrow">
              <span className="eyebrow__rule" />
              <ScrambledText className="eyebrow__text">
                The Unreal Lab · venture studio
              </ScrambledText>
            </div>
            <h1 className="h1">
              <SplitText as="span" className="h1__text" at="mount" delay={300} stagger={90}>
                Every Arjuna needs a{" "}
                <span className="hero__word--gold shiny-gold">Krishna.</span>
              </SplitText>
            </h1>
            <VariableProximity className="hero__sub">
              We build AI products of our own. We advise companies on AI that has to actually work. And we ride beside founders who are too early for everyone else, from nothing to the field. Not a fund yet. A charioteer first.
            </VariableProximity>
            <div className="hero__cta">
              <Magnet padding={48} magnetStrength={5}>
                <GlareHover>
                  <a href="#apply" className="button" data-cursor="Enter">
                    Enter the field
                    <Arrow />
                  </a>
                </GlareHover>
              </Magnet>
              <div className="scroll-hint">
                <span className="scroll-hint__text">Scroll</span>
                <span className="scroll-hint__line" />
              </div>
            </div>
          </div>
          <div className="hero__aside">
            <CircularText text="THE UNREAL LAB · VENTURE STUDIO · " spinDuration={44}>
              <span className="diamond" />
            </CircularText>
            <div className="verse-card">
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
        </div>
      </div>
      <ScrollVelocity velocity={36}>
        We build · We advise · We partner · We back ·&nbsp;
      </ScrollVelocity>
    </section>
  );
}
