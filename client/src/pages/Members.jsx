import { useState } from 'react';
import { Link, useLang } from '../i18n';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { MemberJersey, Photo } from '../components/ui/Art';

const ALL = 'All';

export default function Members() {
  const { t, ta } = useLang();
  const { MEMBERS, PAGES } = useContent();
  const [kind, setKind] = useState(ALL);

  const kinds = [...new Set(MEMBERS.map((m) => m.kind).filter(Boolean))];
  const active = kinds.includes(kind) ? kind : ALL;
  const shown = active === ALL ? MEMBERS : MEMBERS.filter((m) => m.kind === active);
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
      <section className="section bg-parchment">
        <div className="wrapper">
          {MEMBERS.length ? (
            <>
              <div className="members-head">
                {kinds.length > 1 ? (
                  <div className="chips" role="tablist" aria-label={t('Type of member')}>
                    {[ALL, ...kinds].map((k) => (
                      <button key={k} role="tab" aria-selected={active === k} className={`chip ${active === k ? 'is-active' : ''}`} onClick={() => setKind(k)}>
                        {t(k)}
                      </button>
                    ))}
                  </div>
                ) : <span />}
                <p className="members-count script" aria-live="polite">{t(shown.length === 1 ? '{n} member' : '{n} members', { n: shown.length })}</p>
              </div>
              <ul className="members-grid">
                {shown.map((m, i) => {
                  const name = t(m.name).trim();
                  const cut = name.lastIndexOf(' ');
                  const kindLabel = t(m.kind || 'Member');
                  return (
                    <li key={m.id || `${m.name}-${i}`}>
                      <div className={`player-card member-tile member-tile--${i % 2 ? 'b' : 'a'}`}>
                        <span className="player-card__art">
                          {m.photo ? <Photo src={m.photo} className="player-card__photo" sizes="(max-width: 640px) 50vw, 280px" alt={`${name} — ${kindLabel}, ${t('Adibasi Tarzan Club')}`} /> : <MemberJersey />}
                        </span>
                        <span className="player-card__text">
                          <span className="player-card__name">
                            {cut > 0 && <span className="player-card__first">{name.slice(0, cut)}</span>}
                            <span className="player-card__last">{cut > 0 ? name.slice(cut + 1) : name}</span>
                          </span>
                          {m.kind && <span className="player-card__pos">{kindLabel}</span>}
                          {m.since && <span className="member-tile__since">{t('Since {year}', { year: m.since })}</span>}
                        </span>
                      </div>
                    </li>
                  );
                })}
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
