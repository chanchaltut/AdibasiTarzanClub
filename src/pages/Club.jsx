import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLUB, FAQ, PHOTO, TIMELINE } from '../data/club';
import PageHero from '../components/page/PageHero';
import Trophies from '../components/ui/Trophies';
import { Crest, Drum, Photo, Sprig, TornEdge, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { tornClip, useReveal } from '../utils/helpers';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'history', label: 'History' },
  { id: 'honours', label: 'Honours' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'community', label: 'Community' },
  { id: 'ground', label: 'Our Ground' },
  { id: 'faq', label: 'FAQ' },
];

export function FaqList({ items = FAQ }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="faq">
      {items.map((f, i) => (
        <li key={f.q} className={`faq__item ${open === i ? 'is-open' : ''}`}>
          <button className="faq__q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span>{f.q}</span>
            <Icon name={open === i ? 'minus' : 'plus'} size={20} />
          </button>
          <div className="faq__a"><p>{f.a}</p></div>
        </li>
      ))}
    </ul>
  );
}

export function MapCard() {
  const { lat, lng } = CLUB.coords;
  return (
    <div className="map-card">
      <div className="map-card__frame" style={{ clipPath: tornClip(77, 6) }}>
        <iframe
          title="Map of S. Akhanagar, Kaliyaganj"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="map-card__note paper paper--sm">
        <p className="kicker">Find us</p>
        <p className="map-card__name display">{CLUB.ground}</p>
        <address>{CLUB.address.map((l) => <span key={l}>{l}</span>)}</address>
        <a className="link-arrow" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
          Get directions <Icon name="external" size={16} />
        </a>
      </div>
    </div>
  );
}

export default function Club() {
  useReveal();
  return (
    <>
      <PageHero
        title="The Club"
        script="Since 1981"
        intro="Football, heritage and community from S. Akhanagar, Kaliyaganj — one family for forty-five seasons."
        photo={PHOTO.pitch}
        crumbs={[{ label: 'Club' }]}
        tabs={TABS}
      />

      <section className="section bg-parchment" id="about">
        <div className="wrapper split">
          <div className="split__text" data-reveal>
            <p className="kicker kicker--ink">About ATC</p>
            <h2 className="h2 display">Rooted in the soil. <span className="script">United in spirit.</span></h2>
            <p className="lead serif">
              In 1981 a handful of friends from S. Akhanagar started a club with one ball, a borrowed field and a name
              that told everyone exactly who we were.
            </p>
            <p>
              Adibasi Tarzan Club has grown into a home for footballers, musicians, dancers, volunteers and families from
              across Kaliyaganj. We play hard on Saturdays, celebrate our heritage every season, and look after one another
              the rest of the week.
            </p>
            <ul className="facts">
              <li><span className="display">1981</span>Founded</li>
              <li><span className="display">45</span>Seasons</li>
              <li><span className="display">1</span>Family</li>
            </ul>
          </div>
          <div className="split__art" data-reveal>
            <div className="founding paper">
              <span className="tape" style={{ top: -12, left: '40%', transform: 'rotate(-4deg)' }} />
              <Crest size={160} alt="Adibasi Tarzan Club crest" />
              <p className="founding__line script">Est. 1981</p>
              <p className="founding__place serif">S. Akhanagar · Kaliyaganj · Uttar Dinajpur</p>
              <WaxSeal size={78} className="founding__seal" />
            </div>
          </div>
        </div>
      </section>

      <section className="section history bg-kraft" id="history">
        <TornEdge position="top" seed={41} />
        <div className="wrapper">
          <div className="widget-header">
            <h2 className="widget-title">Our <span className="script">History</span></h2>
          </div>
          <ol className="timeline">
            {TIMELINE.map((t, i) => (
              <li key={t.year} className="timeline__item paper paper--sm" data-reveal style={{ '--tilt': `${(i % 3 - 1) * 1.4}deg` }}>
                <span className="tape" style={{ top: -11, left: '32%', transform: `rotate(${i % 2 ? 3 : -3}deg)` }} />
                <span className="timeline__year display">{t.year}</span>
                <span className="timeline__title">{t.title}</span>
                <span className="timeline__text">{t.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-bark-deep" id="honours">
        <div className="wrapper">
          <div className="widget-header">
            <h2 className="widget-title">Honours</h2>
          </div>
          <Trophies />
        </div>
      </section>

      <section className="section bg-bark feature" id="heritage">
        <div className="wrapper split split--rev">
          <div className="split__media" data-reveal>
            <span className="feature__photo" style={{ clipPath: tornClip(91, 7) }}><Photo src={PHOTO.night} /></span>
            <Drum className="feature__drum" />
          </div>
          <div className="split__text" data-reveal>
            <p className="kicker">Heritage &amp; Culture</p>
            <h2 className="h2 display">The drum <span className="script">beats on</span></h2>
            <p>
              Our cultural troupe keeps the music, dance and stories of our Adibasi roots alive. Heritage Night brings the
              whole village to the club grounds every autumn — madal and dhamsa, lanterns and laughter.
            </p>
            <Link to="/schedule?tab=events" className="btn">Heritage Night 2026</Link>
          </div>
        </div>
      </section>

      <section className="section bg-bark feature" id="community">
        <div className="wrapper split">
          <div className="split__text" data-reveal>
            <p className="kicker">Community</p>
            <h2 className="h2 display">More than <span className="script">a club</span></h2>
            <p>
              Morning coaching for the youngest players. Relief drives when times are hard. A hall that is always open.
              The club belongs to S. Akhanagar — and every member gives a little back.
            </p>
            <Link to="/contact" className="btn btn--ghost">Volunteer with us</Link>
          </div>
          <div className="split__media" data-reveal>
            <span className="feature__photo" style={{ clipPath: tornClip(93, 7) }}><Photo src={PHOTO.youth} /></span>
            <Sprig className="feature__sprig" />
          </div>
        </div>
      </section>

      <section className="section bg-parchment" id="ground">
        <TornEdge position="top" seed={47} />
        <div className="wrapper">
          <div className="widget-header">
            <h2 className="widget-title">Our <span className="script">Ground</span></h2>
          </div>
          <MapCard />
        </div>
      </section>

      <section className="section bg-parchment" id="faq">
        <div className="wrapper faq-wrap">
          <div>
            <p className="kicker kicker--ink">Questions</p>
            <h2 className="h2 display">Frequently <span className="script">asked</span></h2>
            <p className="faq-wrap__aside">Can't find what you need? <Link to="/contact">Write to the club</Link>.</p>
          </div>
          <FaqList />
        </div>
      </section>
    </>
  );
}
