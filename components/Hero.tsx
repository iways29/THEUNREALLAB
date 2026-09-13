import Arrow from "@/components/Arrow";
import SplitText from "@/components/reactbits/SplitText";
import Magnet from "@/components/reactbits/Magnet";
import GlareHover from "@/components/reactbits/GlareHover";
import ScrambledText from "@/components/reactbits/ScrambledText";
import { HERO_REVEAL_EVENT } from "@/lib/scenes";

/**
 * The film opens the page on its own; nothing here is visible until
 * SceneEngine fires the reveal as the chariot settles on Krishna.
 */
export default function Hero() {
  return (
    <section id="top" data-scene="0" className="section section--hero">
      <div className="pin pin--bottom">
        <div className="container container--hero">
          <div className="hero__copy">
            <div className="eyebrow" data-motion-hidden>
              <span className="eyebrow__rule" />
              <ScrambledText className="eyebrow__text" playOn={HERO_REVEAL_EVENT}>
                The Unreal Lab · venture studio
              </ScrambledText>
            </div>
            <h1 className="h1" data-motion-hidden>
              <SplitText
                as="span"
                className="h1__text"
                at="event"
                event={HERO_REVEAL_EVENT}
                stagger={110}
              >
                Every Arjuna needs a{" "}
                <span className="hero__word--gold shiny-gold">Krishna.</span>
              </SplitText>
            </h1>
            <p className="hero__sub" data-motion-hidden>
              We build AI products of our own. We advise companies on AI that
              has to actually work. And we ride beside founders who are too
              early for everyone else. A charioteer first; a fund next, with
              partners who want to be early.
            </p>
            <div className="hero__cta" data-motion-hidden>
              <Magnet padding={48} magnetStrength={5}>
                <GlareHover>
                  <a href="#apply" className="button" data-cursor="Enter">
                    Enter the field
                    <Arrow />
                  </a>
                </GlareHover>
              </Magnet>
              <a href="#fund" className="hero__link" data-cursor="Early">
                Be early with us
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
