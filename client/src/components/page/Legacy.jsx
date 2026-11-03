import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import Icon from '../ui/Icon';
import { Photo, WaxSeal } from '../ui/Art';
import { tornClip } from '../../utils/helpers';

/** The two sides of the Dussehra match, facing each other on a paper card. */
function Versus({ sides }) {
  const { t } = useLang();
  const [a = {}, b = {}] = sides || [];
  return (
    <div className="versus paper">
      <span className="tape" style={{ top: -12, left: '44%', transform: 'rotate(-3deg)' }} />
      <div className="versus__side">
        <span className="versus__name display">{t(a.name)}</span>
        {a.note && <span className="versus__note">{t(a.note)}</span>}
      </div>
      <span className="versus__vs" aria-label={t('versus')}><WaxSeal size={74} label="VS" /></span>
      <div className="versus__side">
        <span className="versus__name display">{t(b.name)}</span>
        {b.note && <span className="versus__note">{t(b.note)}</span>}
      </div>
    </div>
  );
}

function Heading({ L, id }) {
  const { t } = useLang();
  return (
    <>
      {L.kicker && <p className="kicker">{t(L.kicker)}</p>}
      <h2 className="h2 display legacy__title" id={id}>
        {t(L.title)}
        {L.tagline && <span className="legacy__tagline script">{t(L.tagline)}</span>}
      </h2>
    </>
  );
}

function Occasion({ L }) {
  const { t } = useLang();
  if (!L.occasion && !L.years) return null;
  return (
    <ul className="legacy__facts">
      {L.years && <li><span className="display">{L.years}</span>{t(L.yearsLabel || 'Years of tradition')}</li>}
      {L.occasion && <li className="legacy__occasion"><Icon name="calendar" size={20} />{t(L.occasion)}</li>}
    </ul>
  );
}

/** Club page: the full story, both teams and the record of past years. */
export default function Legacy() {
  const { t, ta } = useLang();
  const { LEGACY: L } = useContent();
  if (!L) return null;
  const sideName = (w) => (w === 'a' ? L.sides?.[0]?.name : w === 'b' ? L.sides?.[1]?.name : null);
  return (
    <section className="section legacy bg-bark" id="legacy" aria-labelledby="legacy-title">
      <div className="wrapper">
        <div className="legacy__grid">
          <div className="legacy__text" data-reveal>
            <Heading L={L} id="legacy-title" />
            <Occasion L={L} />
            {L.intro.map((p, i) => <p key={i} className={i === 0 ? 'lead serif' : 'legacy__para'}>{t(p)}</p>)}
            <div className="legacy__ctas">
              <Link to="/schedule?tab=notices" className="btn">{t('Invitation & letters')}</Link>
              <Link to="/gallery" className="btn btn--ghost">{t('See the photos')}</Link>
            </div>
          </div>
          <div className="legacy__art" data-reveal>
            {L.photo && <span className="legacy__photo" style={{ clipPath: tornClip(83, 7) }}><Photo src={L.photo} sizes="(max-width: 840px) 100vw, 45vw" /></span>}
            <Versus sides={L.sides} />
          </div>
        </div>

        {L.winners?.length > 0 && (
          <div className="legacy__record" data-reveal>
            <h3 className="legacy__record-title display">{ta('Year by *year*')}</h3>
            <ol className="legacy__years">
              {L.winners.map((w) => (
                <li key={w.year} className={`legacy__year legacy__year--${w.winner}`}>
                  <span className="legacy__year-n display">{w.year}</span>
                  <span className="legacy__year-win">{w.winner === 'draw' ? t('Shared') : t(sideName(w.winner))}</span>
                  {(w.score || w.note) && <span className="legacy__year-note">{[w.score, w.note && t(w.note)].filter(Boolean).join(' · ')}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

/** Home page: a short version that leads to the Club page. */
export function LegacyTeaser() {
  const { t } = useLang();
  const { LEGACY: L } = useContent();
  if (!L) return null;
  return (
    <section className="section legacy legacy--teaser bg-bark" aria-labelledby="legacy-teaser-title">
      <div className="wrapper legacy__grid">
        <div className="legacy__text" data-reveal>
          <Heading L={L} id="legacy-teaser-title" />
          <Occasion L={L} />
          {L.intro[0] && <p className="lead serif">{t(L.intro[0])}</p>}
          <Link to="/club#legacy" className="btn">{t('Read our legacy')} <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="legacy__art" data-reveal>
          <Versus sides={L.sides} />
        </div>
      </div>
    </section>
  );
}
