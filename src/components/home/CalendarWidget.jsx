import { Link, useLang } from '../../i18n';
import { FIXTURES, PHOTO } from '../../data/club';
import { downloadIcs, kickoff, team, useCountdown, useScroller } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Photo, TeamBadge } from '../ui/Art';
import { ScrollMeter, SliderControls } from '../ui/Slider';

export function Countdown({ target, compact = false }) {
  const c = useCountdown(target);
  const { t } = useLang();
  const units = [['days', 'Days'], ['hours', 'Hours'], ['mins', 'Mins'], ['secs', 'Secs']];
  return (
    <div className={`countdown ${compact ? 'countdown--compact' : ''}`} role="timer" aria-label={t('Time until the next match')}>
      <span className="countdown__label">
        <span className="countdown__label-lg">{t('Next Match')}</span>
        <span className="countdown__label-sm">{t('Match Countdown')}</span>
      </span>
      <span className="countdown__clock">
        {units.map(([k, l], i) => (
          <span className="countdown__unit" key={k}>
            <span className="countdown__value">{c[k]}{i < 3 && <i>:</i>}</span>
            <span className="countdown__name">{t(l)}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

export function MatchCard({ m, featured }) {
  const { t, longDate } = useLang();
  const home = team(m.home);
  const away = team(m.away);
  const isHome = m.home === 'ATC';
  return (
    <article className={`match-card ${featured ? 'match-card--featured paper paper--flat' : ''}`}>
      {featured && <p className="match-card__flag">{t('Next Match')}</p>}
      <div className="match-card__teams">
        <div className="match-card__team">
          <TeamBadge code={m.home} size={featured ? 76 : 64} />
          <span>{t(home.short)}</span>
        </div>
        <div className="match-card__comp">
          <Icon name="ball" size={22} />
          <span>{t(m.comp)}</span>
        </div>
        <div className="match-card__team">
          <TeamBadge code={m.away} size={featured ? 76 : 64} />
          <span>{t(away.short)}</span>
        </div>
      </div>
      <div className="match-card__info">
        <p className="match-card__date">{longDate(m.date)}, <time dateTime={m.date}>{kickoff(m.date)} {t('IST')}</time></p>
        <p className="match-card__round">{t(m.comp)}, {t(m.round)}</p>
        <p className="match-card__venue"><Icon name="pin" size={14} />{t(m.venue)}</p>
      </div>
      <div className="match-card__cta">
        <Link to="/schedule" className="match-card__centre"><Icon name="ball" size={15} /> {t('Match Centre')}</Link>
        {isHome && m.entry === 'Tickets' && <Link to="/contact" className="btn btn--sm">{t('Tickets')}</Link>}
        {isHome && m.entry === 'Free entry' && <span className="match-card__free">{t('Free entry')}</span>}
        {!isHome && <button className="match-card__add" onClick={() => downloadIcs([m])}><Icon name="calendar" size={15} /> {t('Add')}</button>}
      </div>
    </article>
  );
}

export default function CalendarWidget() {
  const s = useScroller();
  const { t } = useLang();
  const upcoming = FIXTURES.filter((f) => new Date(f.date) > Date.now());
  const next = upcoming[0];

  return (
    <section className="section calendar bg-bark" aria-labelledby="cal-title">
      <div className="wrapper">
        <div className="widget-header calendar__header">
          <h2 className="widget-title" id="cal-title">{t('Calendar')}</h2>
          {next && <Countdown target={next.date} />}
          <div className="calendar__tools">
            <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(upcoming)}><Icon name="sync" size={16} /> {t('Sync calendar')}</button>
            <SliderControls s={s} label={t('matches')} />
          </div>
        </div>

        <div className="h-scroll calendar__row" ref={s.ref}>
          {upcoming.slice(0, 3).map((m, i) => <MatchCard key={m.id} m={m} featured={i === 0} />)}
          <Link to="/schedule" className="calendar__more">
            <Photo src={PHOTO.ballPitch} />
            <span className="calendar__more-body">
              <span className="script">{t('Next games')}</span>
              <span className="link-arrow">{t('See the calendar')} <Icon name="arrow" size={18} /></span>
            </span>
          </Link>
        </div>
        <ScrollMeter s={s} />

        <div className="calendar__mobile-ctas">
          <Link to="/schedule" className="btn btn--ghost"><Icon name="calendar" size={18} /> {t('Calendar')}</Link>
          <button className="btn btn--ghost" onClick={() => downloadIcs(upcoming)}><Icon name="sync" size={18} /> {t('Sync calendar')}</button>
        </div>
      </div>
    </section>
  );
}
