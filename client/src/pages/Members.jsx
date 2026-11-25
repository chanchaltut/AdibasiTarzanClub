import { useState } from 'react';
import { Link, useLang } from '../i18n';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { MemberJersey, Photo, Sprig } from '../components/ui/Art';
import { CARD_NAME_STYLES, nameClasses } from '../components/layout/Lettering';

const ALL = 'All';

/** One member on a player-style card. Remembered members get the sepia, gold-framed version. */
function MemberTile({ m, i, nameClass }) {
  const { t } = useLang();
  const name = t(m.name).trim();
  const cut = name.lastIndexOf(' ');
  const kindLabel = t(m.kind || 'Member');
  const alt = m.memoriam
    ? `${name} — ${kindLabel}, ${t('Adibasi Tarzan Club')} (${t('In memoriam')})`
    : `${name} — ${kindLabel}, ${t('Adibasi Tarzan Club')}`;
  return (
    <div className={`player-card member-tile member-tile--${i % 2 ? 'b' : 'a'} ${m.memoriam ? 'member-tile--memoriam' : ''}`}>
      <span className="player-card__art">
        {m.photo ? <Photo src={m.photo} className="player-card__photo" sizes="(max-width: 640px) 50vw, 280px" alt={alt} /> : <MemberJersey />}
      </span>
      {m.memoriam && <Sprig className="member-tile__sprig" />}
      <span className="player-card__text">
        <span className={nameClass}>
          {cut > 0 && <span className="player-card__first">{name.slice(0, cut)}</span>}
          <span className="player-card__last">{cut > 0 ? name.slice(cut + 1) : name}</span>
        </span>
        {m.kind && <span className="player-card__pos">{kindLabel}</span>}
        {m.memoriam && m.years && <span className="member-tile__since">{m.years}</span>}
        {!m.memoriam && m.since && <span className="member-tile__since">{t('Since {year}', { year: m.since })}</span>}
        {m.memoriam && m.tribute && <span className="member-tile__tribute">{t(m.tribute)}</span>}
      </span>
    </div>
  );
}

export default function Members() {
  const { t, ta } = useLang();
  const { MEMBERS, PAGES, LETTERING } = useContent();
  const nameClass = `player-card__name ${nameClasses(LETTERING?.memberNames, CARD_NAME_STYLES, 'display')}`;
  const [kind, setKind] = useState(ALL);

  const remembered = MEMBERS.filter((m) => m.memoriam);
  const active = MEMBERS.filter((m) => !m.memoriam);
  const kinds = [...new Set(active.map((m) => m.kind).filter(Boolean))];
  const current = kinds.includes(kind) ? kind : ALL;
  const shown = current === ALL ? active : active.filter((m) => m.kind === current);
  const banner = PAGES.members || {};

  return (
    <>
      <PageHero
        title="Members"
        script={banner.script}
        intro={banner.intro}
        photo={banner.photo || PAGES.committee?.photo}
        crumbs={[{ label: 'Club', href: '/club' }, { label: 'Members' }]}
      />

      {remembered.length > 0 && (
        <section className="section memoriam bg-bark-deep" id="in-memoriam" aria-labelledby="memoriam-title">
          <div className="wrapper">
            <header className="memoriam__head">
              <p className="kicker">{t('Founding Members')}</p>
              <h2 className="h2 display" id="memoriam-title">{t('In Memoriam')}</h2>
              <p className="memoriam__line script">{t('Forever Remembered, Never Forgotten')}</p>
            </header>
            <ul className="members-grid members-grid--memoriam">
              {remembered.map((m, i) => <li key={m.id || `${m.name}-${i}`}><MemberTile m={m} i={i} nameClass={nameClass} /></li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="section bg-parchment" id="club-members" aria-labelledby="club-members-title">
        <div className="wrapper">
          <header className="members-title">
            <h2 className="h2 display" id="club-members-title">{t('Club Members')}</h2>
            <p className="members-title__sub serif">{t('Active Members')}</p>
          </header>
          {active.length ? (
            <>
              <div className="members-head">
                {kinds.length > 1 ? (
                  <div className="chips" role="tablist" aria-label={t('Type of member')}>
                    {[ALL, ...kinds].map((k) => (
                      <button key={k} role="tab" aria-selected={current === k} className={`chip ${current === k ? 'is-active' : ''}`} onClick={() => setKind(k)}>
                        {t(k)}
                      </button>
                    ))}
                  </div>
                ) : <span />}
                <p className="members-count script" aria-live="polite">{t(shown.length === 1 ? '{n} member' : '{n} members', { n: shown.length })}</p>
              </div>
              <ul className="members-grid">
                {shown.map((m, i) => <li key={m.id || `${m.name}-${i}`}><MemberTile m={m} i={i} nameClass={nameClass} /></li>)}
              </ul>
            </>
          ) : (
            <div className="members-empty paper">
              <p>{t('The list of club members will be published here soon.')}</p>
            </div>
          )}
          <p className="committee-note serif">
            {ta('Want your name on this list? [Become a member].', (label) => <Link to="/membership">{label}</Link>)}
          </p>
        </div>
      </section>
    </>
  );
}
