import { useSearchParams } from 'react-router-dom';
import { EVENTS, FIXTURES, PHOTO, RESULTS } from '../data/club';
import PageHero from '../components/page/PageHero';
import { TeamBadge, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { dayMonth, downloadIcs, kickoff, team } from '../utils/helpers';
import { useLang } from '../i18n';

const TABS = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'results', label: 'Results' },
  { id: 'events', label: 'Club Events' },
];

function DateStamp({ iso }) {
  const { info } = useLang();
  const d = dayMonth(iso, info.dateLocale);
  return (
    <span className="date-stamp">
      <span className="date-stamp__wd">{d.weekday}</span>
      <span className="date-stamp__day display">{d.day}</span>
      <span className="date-stamp__mon">{d.month}</span>
    </span>
  );
}

function MatchRow({ m, result }) {
  const [hs, as] = m.score || [];
  const won = result && ((m.home === 'ATC' && hs > as) || (m.away === 'ATC' && as > hs));
  const drew = result && hs === as;
  const { t } = useLang();
  return (
    <li className="match-row">
      <DateStamp iso={m.date} />
      <div className="match-row__comp">
        <span className="match-row__comp-name">{t(m.comp)}</span>
        <span>{t(m.round)}</span>
      </div>
      <div className="match-row__teams">
        <span className="match-row__team match-row__team--home">{t(team(m.home).short)}<TeamBadge code={m.home} size={40} /></span>
        {result ? (
          <span className="match-row__score display">{hs}<i>–</i>{as}</span>
        ) : (
          <span className="match-row__time display">{kickoff(m.date)}</span>
        )}
        <span className="match-row__team"><TeamBadge code={m.away} size={40} />{t(team(m.away).short)}</span>
      </div>
      <div className="match-row__venue"><Icon name="pin" size={14} />{t(m.venue)}</div>
      <div className="match-row__action">
        {result ? (
          <span className={`result-pill ${won ? 'is-win' : drew ? 'is-draw' : 'is-loss'}`}>{t(won ? 'Won' : drew ? 'Draw' : 'Lost')}</span>
        ) : (
          <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs([m])}><Icon name="calendar" size={15} /> {t('Add')}</button>
        )}
      </div>
    </li>
  );
}

export default function Schedule() {
  const [params, setParams] = useSearchParams();
  const { t, ta } = useLang();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'fixtures';
  const upcoming = FIXTURES.filter((f) => new Date(f.date) > Date.now());

  return (
    <>
      <PageHero
        title="Schedule"
        script="Matchday"
        intro="Fixtures, results and club events. All times are Indian Standard Time."
        photo={PHOTO.night}
        crumbs={[{ label: 'First Team', href: '/squad' }, { label: 'Schedule' }]}
        tabs={TABS}
        active={tab}
        onTab={(id) => setParams(id === 'fixtures' ? {} : { tab: id })}
      />

      <section className="section bg-bark">
        <div className="wrapper">
          {tab === 'fixtures' && (
            <>
              <div className="widget-header">
                <h2 className="widget-title">{ta('Upcoming *fixtures*')}</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(upcoming)}><Icon name="sync" size={16} /> {t('Sync all')}</button>
              </div>
              <ul className="match-list">{upcoming.map((m) => <MatchRow key={m.id} m={m} />)}</ul>
              {!upcoming.length && <p className="empty">{t("The season's fixtures will be published soon.")}</p>}
            </>
          )}

          {tab === 'results' && (
            <>
              <div className="widget-header"><h2 className="widget-title">{ta('Latest *results*')}</h2></div>
              <ul className="match-list">{RESULTS.map((m) => <MatchRow key={m.id} m={m} result />)}</ul>
            </>
          )}

          {tab === 'events' && (
            <>
              <div className="widget-header">
                <h2 className="widget-title">{ta('Club *events*')}</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(EVENTS)}><Icon name="sync" size={16} /> {t('Sync all')}</button>
              </div>
              <ul className="event-grid">
                {EVENTS.map((e, i) => (
                  <li key={e.id} className="event-card paper" style={{ '--tilt': `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
                    <div className="event-card__top">
                      <DateStamp iso={e.date} />
                      <span className="tag tag--ink">{t(e.kind)}</span>
                    </div>
                    <h3 className="event-card__title display">{t(e.title)}</h3>
                    <p className="event-card__desc">{t(e.desc)}</p>
                    <p className="event-card__venue"><Icon name="pin" size={14} />{t(e.venue)} · {kickoff(e.date)} {t('IST')}</p>
                    <button className="event-card__add link-arrow" onClick={() => downloadIcs([e])}>{t('Add to calendar')} <Icon name="calendar" size={16} /></button>
                    {i === 0 && <WaxSeal size={70} className="event-card__seal" />}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
