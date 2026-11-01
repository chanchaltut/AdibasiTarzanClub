import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import { useScroller } from '../../utils/helpers';
import { Jersey, Photo } from '../ui/Art';
import { ScrollMeter, SliderControls } from '../ui/Slider';

export function PlayerCard({ p, i = 0 }) {
  const { t } = useLang();
  return (
    <Link to="/squad" className={`player-card player-card--${i % 2 ? 'b' : 'a'}`}>
      <span className="player-card__art">
        <span className="player-card__bignum" aria-hidden="true">{p.no}</span>
        {p.photo ? <Photo src={p.photo} className="player-card__photo" sizes="280px" alt={`${t(p.first)} ${t(p.last)}`} /> : <Jersey name={p.last} number={p.no} />}
      </span>
      <span className="player-card__text">
        <span className="player-card__no">{p.no}</span>
        <span className="player-card__name">
          <span className="player-card__first">{t(p.first)}</span>
          <span className="player-card__last">{t(p.last)}{p.captain && <abbr title={t('Captain')}>C</abbr>}</span>
        </span>
        <span className="player-card__pos">{t(p.pos)}</span>
      </span>
    </Link>
  );
}

export default function PlayerSlider() {
  const s = useScroller();
  const { t } = useLang();
  const { SQUAD } = useContent();
  const players = SQUAD.filter((p) => p.featured);
  if (!players.length) return null;
  return (
    <section className="section players bg-bark" aria-labelledby="players-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="players-title">{t('Players')}</h2>
          <SliderControls s={s} label={t('players')} />
        </div>
        <ul className="h-scroll players__row" ref={s.ref}>
          {players.map((p, i) => <li key={p.id || p.no}><PlayerCard p={p} i={i} /></li>)}
        </ul>
        <ScrollMeter s={s} />
      </div>
    </section>
  );
}
