import { useState } from 'react';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { MatchRow } from '../components/page/Matches';
import { Photo, TeamBadge, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { Link, useLang } from '../i18n';
import { tournamentMatches, tournamentOpen } from '../utils/tournaments';

const TABS = [
  { id: 'about', label: 'ATC Annual Cup' },
  { id: 'schedule', label: 'Tournament Schedule' },
  { id: 'teams', label: 'Participating Teams' },
  { id: 'fixtures', label: 'Tournament Fixtures' },
];

function Dates({ from, to }) {
  const { date } = useLang();
  const fmt = (iso) => date(iso, { day: 'numeric', month: 'short', year: 'numeric' });
  return <>{fmt(from)}{to && fmt(to) !== fmt(from) ? ` – ${fmt(to)}` : ''}</>;
}

function Teams({ x }) {
  const { t } = useLang();
  const { TEAMS } = useContent();
  const groups = [...new Set(x.teams.map((tm) => tm.group || ''))];
  return groups.map((g) => (
    <div key={g || 'all'} className="cup-teams__group">
      {g && <h3 className="cup-teams__title display">{t(g)}</h3>}
      <ul className="cup-teams">
        {x.teams.filter((tm) => (tm.group || '') === g).map((tm) => (
          <li key={tm.team} className={`cup-team ${TEAMS[tm.team]?.isClub ? 'is-club' : ''}`}>
            <TeamBadge code={tm.team} size={48} />
            <span className="cup-team__name">{t(TEAMS[tm.team]?.name)}</span>
            {x.winner === tm.team && <span className="tag tag--gold">{t('Winner')}</span>}
            {x.runnerUp === tm.team && <span className="tag tag--ink">{t('Runner-up')}</span>}
          </li>
        ))}
      </ul>
    </div>
  ));
}

export default function Tournaments() {
  const { t, ta, longDate } = useLang();
  const { TOURNAMENTS, TEAMS, PAGES } = useContent();
  const [pickedId, setPickedId] = useState(null);
  const x = TOURNAMENTS.find((tm) => tm.id === pickedId) || TOURNAMENTS[0];
  const past = TOURNAMENTS.filter((tm) => tm !== x);
  const banner = PAGES.tournaments || {};
  const { fixtures, results } = x ? tournamentMatches(x) : { fixtures: [], results: [] };

  return (
    <>
      <PageHero
        title="ATC Tournaments"
        script={banner.script || 'Matches & Tournaments'}
        intro={banner.intro}
        photo={banner.photo || PAGES.schedule?.photo}
        crumbs={[{ label: 'Events & Participations', href: '/schedule' }, { label: 'ATC Tournaments' }]}
        tabs={x ? TABS : undefined}
      />

      {!x ? (
        <section className="section bg-bark">
          <div className="wrapper"><p className="empty">{t('The next ATC Annual Cup will be announced here.')}</p></div>
        </section>
      ) : (
        <>
          <section className="section bg-parchment" id="about">
            <div className="wrapper split">
              <div className="split__text">
                <p className="kicker kicker--ink">{t('ATC Tournaments')}</p>
                <h2 className="h2 display">{t(x.name)}</h2>
                <ul className="cup-facts">
                  <li><Icon name="calendar" size={18} /><Dates from={x.start} to={x.end} /></li>
                  <li><Icon name="pin" size={18} />{t(x.venue)}</li>
                  {x.teams.length > 0 && <li><Icon name="shirt" size={18} />{t(x.teams.length === 1 ? '{n} team' : '{n} teams', { n: x.teams.length })}</li>}
                </ul>
                {x.about?.map((p, i) => <p key={i} className={i === 0 ? 'lead serif' : undefined}>{t(p)}</p>)}
                {x.winner && TEAMS[x.winner] && (
                  <p className="cup-winner"><Icon name="ball" size={18} /> {t('Winner')}: <strong>{t(TEAMS[x.winner].name)}</strong>{x.runnerUp && TEAMS[x.runnerUp] ? ` · ${t('Runner-up')}: ${t(TEAMS[x.runnerUp].name)}` : ''}</p>
                )}
                <div className="legacy__ctas">
                  {tournamentOpen(x) && <Link to={`/register?for=tournament:${x.id}`} className="btn btn--ink">{t('Enter a team')}</Link>}
                  <a href="#fixtures" className="btn btn--outline-ink">{t('Fixtures & results')}</a>
                </div>
              </div>
              <div className="split__art">
                {x.photo ? (
                  <span className="cup-photo"><Photo src={x.photo} sizes="(max-width: 840px) 100vw, 45vw" /></span>
                ) : (
                  <div className="founding paper">
                    <WaxSeal size={120} label="CUP" />
                    <p className="founding__line script">{t(x.comp)}</p>
                    <p className="founding__place serif">{t('S. Akhanagar · Kaliyaganj · Uttar Dinajpur')}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section bg-kraft" id="schedule">
            <div className="wrapper">
              <div className="widget-header"><h2 className="widget-title">{ta('Tournament *schedule*')}</h2></div>
              {x.schedule?.length ? (
                <ol className="cup-schedule">
                  {x.schedule.map((st) => (
                    <li key={`${st.stage}-${st.from}`} className={`cup-stage paper paper--sm ${new Date(st.to || st.from) < Date.now() ? 'is-done' : ''}`}>
                      <span className="cup-stage__date display"><Dates from={st.from} to={st.to} /></span>
                      <span className="cup-stage__name">{t(st.stage)}</span>
                      {st.note && <span className="cup-stage__note">{t(st.note)}</span>}
                    </li>
                  ))}
                </ol>
              ) : <p className="empty empty--ink">{t('The tournament schedule will be published soon.')}</p>}
            </div>
          </section>

          <section className="section bg-parchment" id="teams">
            <div className="wrapper">
              <div className="widget-header"><h2 className="widget-title">{ta('Participating *teams*')}</h2></div>
              {x.teams.length ? <Teams x={x} /> : <p className="empty empty--ink">{t('Participating teams will be listed once entries close.')}</p>}
            </div>
          </section>

          <section className="section bg-bark" id="fixtures">
            <div className="wrapper">
              <div className="widget-header"><h2 className="widget-title">{ta('Tournament *fixtures*')}</h2></div>
              {fixtures.length > 0 && <ul className="match-list">{fixtures.map((m) => <MatchRow key={m.id} m={m} />)}</ul>}
              {results.length > 0 && (
                <>
                  <h3 className="cup-sub display">{t('Results')}</h3>
                  <ul className="match-list">{results.map((m) => <MatchRow key={m.id} m={m} result />)}</ul>
                </>
              )}
              {!fixtures.length && !results.length && <p className="empty">{t('Tournament fixtures will be published after the draw.')}</p>}
              <p className="cup-note">{t('All times are Indian Standard Time.')} {x.start && `${t('Starts')} ${longDate(x.start)}.`}</p>
            </div>
          </section>

          {past.length > 0 && (
            <section className="section bg-bark-deep">
              <div className="wrapper">
                <div className="widget-header"><h2 className="widget-title">{t('Other editions')}</h2></div>
                <ul className="cup-past">
                  {past.map((p) => (
                    <li key={p.id}>
                      <button type="button" className="cup-past__btn" onClick={() => { setPickedId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <span className="display">{t(p.name)}</span>
                        <span><Dates from={p.start} to={p.end} />{p.winner && TEAMS[p.winner] ? ` · ${t('Winner')}: ${t(TEAMS[p.winner].name)}` : ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
