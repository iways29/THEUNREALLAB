import Arrow from "@/components/Arrow";
import { EMAIL } from "@/lib/scenes";

const FOUNDER_MAILTO = `mailto:${EMAIL}?subject=Founder%20application%20%E2%80%94%20The%20Unreal%20Lab`;
const PARTNER_MAILTO = `mailto:${EMAIL}?subject=LP%20%2F%20partner%20conversation%20%E2%80%94%20The%20Unreal%20Lab`;

export default function TheConch() {
  const year = new Date().getFullYear();

  return (
    <section id="apply" data-scene="5" className="section section--column">
      <div className="scrim scrim--conch" />
      <div className="container container--conch">
        <div data-reveal>
          <div className="label">V · The conch</div>
          <h2 className="h2 h2--conch">
            Sound the conch. Tell us what you are building.
          </h2>
          <div className="grid grid--conch">
            <a className="conch-card" href={FOUNDER_MAILTO}>
              <div className="conch-card__label">Founders</div>
              <div className="conch-card__title">
                Apply for a seat in the chariot
              </div>
              <p className="conch-card__body">
                One email. No deck required. Tell us what you are making and what
                is in your way. Every application is read; when the model fits we
                answer within a week.
              </p>
              <div className="conch-card__action">
                Send the application
                <Arrow />
              </div>
            </a>
            <a className="conch-card" href={PARTNER_MAILTO}>
              <div className="conch-card__label">LPs, companies and partners</div>
              <div className="conch-card__title">Be early with us</div>
              <p className="conch-card__body">
                If you want to back founders before anyone else has met them, need
                enterprise AI that actually works, or have a product that belongs
                inside the enterprise, start a conversation.
              </p>
              <div className="conch-card__action">
                Start the conversation
                <Arrow />
              </div>
            </a>
          </div>
        </div>
        <footer className="footer">
          <div>
            <div className="footer__mark">
              <span className="diamond" />
              <span className="wordmark">The Unreal Lab</span>
            </div>
            <div className="footer__line">We make the unreal real.</div>
          </div>
          <div className="footer__links">
            <a href="https://mumba.ai" target="_blank" rel="noopener noreferrer">
              Mumba.ai
            </a>
            <a
              href="https://github.com/iways29/ASHVAA"
              target="_blank"
              rel="noopener noreferrer"
            >
              ASHVAA
            </a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
          <div className="footer__copy">© {year} The Unreal Lab</div>
        </footer>
      </div>
    </section>
  );
}
