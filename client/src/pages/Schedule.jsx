import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { DateStamp, MatchRow } from '../components/page/Matches';
import { Photo, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { downloadIcs, kickoff, team } from '../utils/helpers';
import { Link, useLang } from '../i18n';
import { DocumentList, sortDocuments } from '../components/home/NoticeBoard';
import { eventOpen } from '../utils/tournaments';

const TABS = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'results', label: 'Results' },
  { id: 'info', label: 'Match Info' },
  { id: 'events', label: 'Club Events' },
  { id: 'notices', label: 'Notice Board' },
];

/** Match updates, postponements and reporting instructions — pinned first, then newest. */
function MatchInfo() {
  const { t, longDate, timeAgo } = useLang();
  const { MATCH_INFO, FIXTURES, RESULTS } = useContent();
  const all = [...FIXTURES, ...RESULTS];
  const items = [...MATCH_INFO].sort((a, b) => (Boolean(b.pinned) - Boolean(a.pinned)) || String(b.date).localeCompare(String(a.date)));
  const changed = FIXTURES.filter((m) => m.status && new Date(m.date) > Date.now() - 864e5 * 30);
  return (
    <>
      <div className="widget-header"><h2 className="widget-title">{t('Match information')}</h2></div>
      {changed.length > 0 && (
        <ul className="match-list match-list--compact">{changed.map((m) => <MatchRow key={m.id} m={m} />)}</ul>
      )}
      <ul className="info-list">
        {items.map((x) => {
          const m = x.match && all.find((f) => f.id === x.match);
          return (
            <li key={x.id} className={`info-card ${x.pinned ? 'is-pinned' : ''}`}>
              <div className="info-card__meta">
                <span className={`tag ${/postpone/i.test(x.kind) ? 'tag--wax' : 'tag--gold'}`}>{t(x.kind)}</span>
                <time dateTime={x.date}>{timeAgo(x.date)}</time>
                {x.pinned && <span className="info-card__pin"><Icon name="seal" size={14} /> {t('Pinned')}</span>}
              </div>
              <h3 className="info-card__title display">{t(x.title)}</h3>
              <p className="info-card__text">{t(x.text)}</p>
              {m && (
                <p className="info-card__match">
                  <Icon name="ball" size={15} />
                  {t(team(m.home)?.short)} {t('vs')} {t(team(m.away)?.short)} · {longDate(m.date)}, {kickoff(m.date)} · {t(m.venue)}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {!items.length && !changed.length && <p className="empty">{t('Match updates, postponements and team reporting instructions will be posted here.')}</p>}
    </>
  );
}

export default function Schedule() {
  const [params, setParams] = useSearchParams();
  const { t, ta } = useLang();
  const { DOCUMENTS, EVENTS, FIXTURES, RESULTS, PAGES } = useContent();
  const tab = TABS.some((x) => x.id === params.get('tab')) ? params.get('tab') : 'fixtures';
  const upcoming = FIXTURES.filter((f) => new Date(f.date) > Date.now());
  // Events stay listed until the end of the day they happen.
  const events = EVENTS.filter((e) => new Date(e.date).getTime() > Date.now() - 18 * 36e5);

  return (
    <>
      <PageHero
        title="Schedule"
        script={PAGES.schedule?.script}
        intro={PAGES.schedule?.intro}
        photo={PAGES.schedule?.photo}
        crumbs={[{ label: 'Events & Participations' }, { label: 'Schedule' }]}
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
                <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(upcoming.filter((m) => !m.status))}><Icon name="sync" size={16} /> {t('Sync all')}</button>
              </div>
              <ul className="match-list">{upcoming.map((m) => <MatchRow key={m.id} m={m} />)}</ul>
              {!upcoming.length && <p className="empty">{t("The season's fixtures will be published soon.")}</p>}
            </>
          )}

          {tab === 'results' && (
            <>
              <div className="widget-header"><h2 className="widget-title">{ta('Latest *results*')}</h2></div>
              <ul className="match-list">{RESULTS.map((m) => <MatchRow key={m.id} m={m} result />)}</ul>
              {!RESULTS.length && <p className="empty">{t('Results will appear here after our first match.')}</p>}
            </>
          )}

          {tab === 'info' && <MatchInfo />}

          {tab === 'events' && (
            <>
              <div className="widget-header">
                <h2 className="widget-title">{ta('Club *events*')}</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(events)} disabled={!events.length}><Icon name="sync" size={16} /> {t('Sync all')}</button>
              </div>
              <ul className="event-grid">
                {events.map((e, i) => (
                  <li key={e.id} id={`event-${e.id}`} className="event-card paper" style={{ '--tilt': `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
                    {e.photo && <Photo src={e.photo} className="event-card__photo" sizes="(max-width: 840px) 100vw, 50vw" />}
                    <div className="event-card__top">
                      <DateStamp iso={e.date} />
                      <span className="tag tag--ink">{t(e.kind)}</span>
                    </div>
                    <h3 className="event-card__title display">{t(e.title)}</h3>
                    <p className="event-card__desc">{t(e.desc)}</p>
                    <p className="event-card__venue"><Icon name="pin" size={14} />{t(e.venue)} · {kickoff(e.date)} {t('IST')}</p>
                    <div className="event-card__actions">
                      {eventOpen(e) && <Link to={`/register?for=event:${e.id}`} className="btn btn--ink btn--sm">{t('Sign up')}</Link>}
                      <button className="event-card__add link-arrow" onClick={() => downloadIcs([e])}>{t('Add to calendar')} <Icon name="calendar" size={16} /></button>
                    </div>
                    {i === 0 && <WaxSeal size={70} className="event-card__seal" />}
                  </li>
                ))}
              </ul>
              {!events.length && <p className="empty">{t('New club events will be announced here soon.')}</p>}
            </>
          )}

          {tab === 'notices' && (
            <>
              <div className="widget-header"><h2 className="widget-title">{ta('Letters, invitations & *calendar*')}</h2></div>
              <DocumentList docs={sortDocuments(DOCUMENTS)} />
              {!DOCUMENTS.length && <p className="empty">{t('Official letters, invitations and the club calendar will be posted here.')}</p>}
            </>
          )}

          <ul className="take-part">
            <li>
              <Link to="/tournaments" className="take-part__card">
                <span className="kicker">{t('Matches & Tournaments')}</span>
                <span className="take-part__title display">{t('ATC Tournaments')}</span>
                <span className="take-part__text">{t('The ATC Annual Cup: tournament schedule, participating teams and fixtures.')}</span>
                <Icon name="arrow" size={20} />
              </Link>
            </li>
            <li>
              <Link to="/register" className="take-part__card">
                <span className="kicker">{t('Club Events')}</span>
                <span className="take-part__title display">{t('Registration & Participation')}</span>
                <span className="take-part__text">{t('Sign up for an upcoming club event or a club programme.')}</span>
                <Icon name="arrow" size={20} />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
