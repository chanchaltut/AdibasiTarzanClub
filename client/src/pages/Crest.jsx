import { useState } from 'react';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { Sprig, TornEdge, WaxSeal } from '../components/ui/Art';
import { Link, useLang } from '../i18n';
import { FaqList } from './Club';
import { CREST_FAQ, CREST_IMAGE, CREST_INTRO, CREST_MESSAGE, CREST_PARTS } from '../data/crest';

const num = (i) => String(i + 1).padStart(2, '0');

/** The crest with a numbered marker on each part; the markers and the list below light each other up. */
function CrestMap({ active, onPick }) {
  const { t } = useLang();
  return (
    <figure className="crest-map">
      <div className="crest-map__frame">
        <img
          src={CREST_IMAGE.src}
          width={CREST_IMAGE.width}
          height={CREST_IMAGE.height}
          alt={t('The crest of Adibasi Tarzan Club: Tarzan holding a football in front of the jungle with a bow, arrows and quiver, the Tumdak and Tamak drums, the Bengali inscription, ATC, “Estd. 1981” and S. Akhanagar, Kaliyaganj, U/D on a shield')}
          loading="eager"
          decoding="async"
        />
        {CREST_PARTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`crest-spot ${active === p.id ? 'is-active' : ''}`}
            style={{ left: `${p.spot.x}%`, top: `${p.spot.y}%` }}
            onClick={() => onPick(p.id, true)}
            onMouseEnter={() => onPick(p.id)}
            onFocus={() => onPick(p.id)}
            aria-label={`${num(i)} — ${t(p.label)}`}
          >
            {num(i)}
          </button>
        ))}
      </div>
      <figcaption className="crest-map__cap serif">{t('Tap a number to read about that part of the crest.')}</figcaption>
    </figure>
  );
}

export default function Crest() {
  const { t, ta } = useLang();
  const { PAGES } = useContent();
  const [active, setActive] = useState(CREST_PARTS[0].id);
  const banner = PAGES.crest || {};

  const pick = (id, scroll = false) => {
    setActive(id);
    if (scroll) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <PageHero
        title="Our Crest"
        script={banner.script || 'Since 1981'}
        intro={banner.intro}
        photo={banner.photo || PAGES.club?.photo}
        crumbs={[{ label: 'Club', href: '/club' }, { label: 'Our Crest' }]}
      />

      <section className="section bg-parchment crest-intro">
        <div className="wrapper crest-intro__inner">
          <p className="kicker kicker--ink">{t(CREST_INTRO.kicker)}</p>
          <h2 className="h2 display">{t(CREST_INTRO.title)}</h2>
          <p className="crest-intro__est">{t(CREST_INTRO.established)}</p>
          {CREST_INTRO.body.map((p, i) => <p key={i} className={i === 0 ? 'lead serif' : 'crest-intro__p'}>{t(p)}</p>)}
        </div>
      </section>

      <section className="section bg-bark crest-story" aria-label={t('The parts of the crest')}>
        <div className="wrapper crest-story__grid">
          <div className="crest-story__map">
            <CrestMap active={active} onPick={pick} />
          </div>
          <ol className="crest-parts">
            {CREST_PARTS.map((p, i) => (
              <li
                key={p.id}
                id={p.id}
                className={`crest-part ${active === p.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(p.id)}
              >
                <h3 className="crest-part__head">
                  <span className="crest-part__n display">{num(i)}</span>
                  <span className="crest-part__label display">{t(p.label)}</span>
                  <span className="crest-part__title script">{t(p.title)}</span>
                </h3>
                {p.body.map((para, j) => <p key={j} className="crest-part__p">{t(para)}</p>)}
                {p.colours && (
                  <ul className="crest-colours">
                    {p.colours.map((c) => (
                      <li key={c.name} className="crest-colour">
                        <span className="crest-colour__swatch" style={{ background: c.hex }} aria-hidden="true" />
                        <span className="crest-colour__name display">{t(c.name)} <em>— {t(c.meaning)}</em></span>
                        <span className="crest-colour__text">{t(c.text)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {p.after && <p className="crest-part__p">{t(p.after)}</p>}
                {p.quote && <blockquote className="crest-part__quote serif">{t(p.quote)}</blockquote>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-kraft crest-message">
        <TornEdge position="top" seed={61} />
        <div className="wrapper">
          <article className="crest-message__sheet paper">
            <span className="tape" style={{ top: -12, left: '42%', transform: 'rotate(-3deg)' }} />
            <h2 className="h2 display">{t(CREST_MESSAGE.title)}</h2>
            {CREST_MESSAGE.body.map((p, i) => <p key={i} className={i === 0 ? 'lead serif' : 'crest-message__p'}>{t(p)}</p>)}
            <p className="crest-message__closing display">{t(CREST_MESSAGE.closing)}</p>
            <WaxSeal size={86} className="crest-message__seal" />
            <Sprig className="crest-message__sprig" />
          </article>
        </div>
      </section>

      <section className="section bg-parchment" id="faq">
        <div className="wrapper faq-wrap">
          <div>
            <p className="kicker kicker--ink">{t('Questions')}</p>
            <h2 className="h2 display">{ta('About *the crest*')}</h2>
            <p className="faq-wrap__aside">{ta('Read the [story of the club] since 1981.', (label) => <Link to="/club#history">{label}</Link>)}</p>
          </div>
          <FaqList items={CREST_FAQ} />
        </div>
      </section>
    </>
  );
}
