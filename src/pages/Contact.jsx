import { CLUB, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import LetterForm from '../components/home/LetterForm';
import { MapCard } from './Club';
import { TornEdge, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';

const PARTNER_TIERS = [
  { name: 'Main Partner', text: 'Your name on the shirt, the ground boards and every match poster for the season.' },
  { name: 'Annual Cup Partner', text: 'Title the ATC Annual Cup — the biggest football weekend in Kaliyaganj.' },
  { name: 'Community Supporter', text: 'Back the youth programme, Heritage Night or a welfare drive.' },
];

export default function Contact() {
  return (
    <>
      <PageHero
        title="Contact"
        script="Write to us"
        intro="The club office is open most evenings at the ground. Letters, calls and visits are all welcome."
        photo={PHOTO.ball}
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="section bg-parchment">
        <div className="wrapper">
          <ul className="contact-cards">
            <li className="contact-card paper paper--sm">
              <Icon name="pin" size={26} />
              <span className="contact-card__label">Visit</span>
              <address>{CLUB.address.map((l) => <span key={l}>{l}</span>)}</address>
            </li>
            <li className="contact-card paper paper--sm">
              <Icon name="mail" size={26} />
              <span className="contact-card__label">Write</span>
              <a href={`mailto:${CLUB.email}`}>{CLUB.email}</a>
            </li>
            <li className="contact-card paper paper--sm">
              <Icon name="globe" size={26} />
              <span className="contact-card__label">Follow</span>
              <span className="contact-card__socials">
                {Object.entries(CLUB.socials).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" aria-label={k}><Icon name={k} size={22} /></a>
                ))}
              </span>
            </li>
          </ul>
          <MapCard />
        </div>
      </section>

      <section className="section bg-bark partners" id="partners">
        <TornEdge position="top" seed={83} />
        <div className="wrapper">
          <div className="partners__head">
            <p className="kicker">Partner with ATC</p>
            <h2 className="h2 display">Stand beside <span className="script">the club</span></h2>
            <p>Since 1981 the club has run on the generosity of local businesses and families. Partner with us and put your name in front of the whole of Kaliyaganj.</p>
          </div>
          <ul className="partner-tiers">
            {PARTNER_TIERS.map((p, i) => (
              <li key={p.name} className="partner-tier">
                <span className="partner-tier__n display">0{i + 1}</span>
                <span className="partner-tier__name display">{p.name}</span>
                <span className="partner-tier__text">{p.text}</span>
              </li>
            ))}
          </ul>
          <div className="partners__cta">
            <WaxSeal size={64} />
            <a className="btn btn--lg" href={`mailto:${CLUB.email}?subject=${encodeURIComponent('Partnership enquiry')}`}>Enquire about partnership</a>
          </div>
        </div>
      </section>

      <LetterForm id="letter" />
    </>
  );
}
