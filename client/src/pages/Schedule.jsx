import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { Photo, TeamBadge, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { dayMonth, downloadIcs, kickoff, team } from '../utils/helpers';
import { useLang } from '../i18n';
import { DocumentList, sortDocuments } from '../components/home/NoticeBoard';

const TABS = [
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'results', label: 'Results' },
  { id: 'events', label: 'Club Events' },
  { id: 'notices', label: 'Notice Board' },
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
  const home = team(m.home) || {};
  const away = team(m.away) || {};
  const won = result && ((home.isClub && hs > as) || (away.isClub && as > hs));
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
        <span className="match-row__team match-row__team--home">{t(home.short)}<TeamBadge code={m.home} size={40} /></span>
        {result ? (
          <span className="match-row__score display">{hs}<i>–</i>{as}</span>
        ) : (
          <span className="match-row__time display">{kickoff(m.date)}</span>
        )}
        <span className="match-row__team"><TeamBadge code={m.away} size={40} />{t(away.short)}</span>
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
  const { DOCUMENTS, EVENTS, FIXTURES, RESULTS, PAGES } = useContent();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'fixtures';
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
              {!RESULTS.length && <p className="empty">{t('Results will appear here after our first match.')}</p>}
            </>
          )}

          {tab === 'events' && (
            <>
              <div className="widget-header">
                <h2 className="widget-title">{ta('Club *events*')}</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs(events)} disabled={!events.length}><Icon name="sync" size={16} /> {t('Sync all')}</button>
              </div>
              <ul className="event-grid">
                {events.map((e, i) => (
                  <li key={e.id} className="event-card paper" style={{ '--tilt': `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
                    {e.photo && <Photo src={e.photo} className="event-card__photo" sizes="(max-width: 840px) 100vw, 50vw" />}
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
        </div>
      </section>
    </>
  );
}
