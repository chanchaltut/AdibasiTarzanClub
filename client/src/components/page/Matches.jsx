import { useState } from 'react';
import { TeamBadge } from '../ui/Art';
import Icon from '../ui/Icon';
import { dayMonth, downloadIcs, kickoff, team } from '../../utils/helpers';
import { useLang } from '../../i18n';

export function DateStamp({ iso }) {
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

const STATUS = { postponed: 'Postponed', cancelled: 'Cancelled' };

/** One fixture or result. Postponed / cancelled fixtures and the team's reporting instructions show underneath. */
export function MatchRow({ m, result }) {
  const [hs, as] = m.score || [];
  const home = team(m.home) || {};
  const away = team(m.away) || {};
  const won = result && ((home.isClub && hs > as) || (away.isClub && as > hs));
  const drew = result && hs === as;
  const [showInfo, setShowInfo] = useState(false);
  const { t } = useLang();
  const off = !result && STATUS[m.status];
  return (
    <li className={`match-row ${off ? 'match-row--off' : ''}`} id={`match-${m.id}`}>
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
          <span className="match-row__time display">{off ? '—' : kickoff(m.date)}</span>
        )}
        <span className="match-row__team"><TeamBadge code={m.away} size={40} />{t(away.short)}</span>
      </div>
      <div className="match-row__venue"><Icon name="pin" size={14} />{t(m.venue)}</div>
      <div className="match-row__action">
        {result ? (
          <span className={`result-pill ${won ? 'is-win' : drew ? 'is-draw' : 'is-loss'}`}>{t(won ? 'Won' : drew ? 'Draw' : 'Lost')}</span>
        ) : off ? (
          <span className="result-pill is-off">{t(off)}</span>
        ) : (
          <button className="btn btn--ghost btn--sm" onClick={() => downloadIcs([m])}><Icon name="calendar" size={15} /> {t('Add')}</button>
        )}
      </div>
      {!result && (m.statusNote || m.reporting) && (
        <div className="match-row__info">
          {off && m.statusNote && <p className="match-row__note"><Icon name="clock" size={15} /> {t(m.statusNote)}</p>}
          {m.reporting && (
            <>
              <button type="button" className="match-row__toggle" aria-expanded={showInfo} onClick={() => setShowInfo(!showInfo)}>
                <Icon name={showInfo ? 'minus' : 'plus'} size={14} /> {t('Team reporting instructions')}
              </button>
              {showInfo && <p className="match-row__reporting serif">{t(m.reporting)}</p>}
            </>
          )}
        </div>
      )}
    </li>
  );
}
