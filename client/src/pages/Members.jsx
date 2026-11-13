import { useState } from 'react';
import { Link, useLang } from '../i18n';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { Crest, Photo } from '../components/ui/Art';

const ALL = 'All';

export default function Members() {
  const { t, ta } = useLang();
  const { MEMBERS, PAGES, LETTERING } = useContent();
  const [kind, setKind] = useState(ALL);

  // Same lettering as the names on the Committee page (Fonts & lettering).
  const names = LETTERING?.names || {};
  const nameClass = [
    'member-card__name',
    ['hand', 'script', 'serif', 'print'].includes(names.style) ? names.style : 'hand',
    names.bold ? 'is-bold' : '',
  ].filter(Boolean).join(' ');

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
                {shown.map((m, i) => (
                  <li key={m.id || `${m.name}-${i}`} className="member-card paper paper--sm" style={{ '--tilt': `${(i % 3 - 1) * 0.7}deg` }}>
                    <span className={`member-card__photo ${m.photo ? 'member-card__photo--img' : ''}`}>{m.photo ? <Photo src={m.photo} sizes="92px" alt={`${t(m.name)} — ${t(m.kind || 'Member')}, ${t('Adibasi Tarzan Club')}`} /> : <Crest size={64} alt="" />}</span>
                    <span className={nameClass}>{t(m.name)}</span>
                    {m.kind && <span className="member-card__kind">{t(m.kind)}</span>}
                    {m.since && <span className="member-card__since">{t('Since {year}', { year: m.since })}</span>}
                  </li>
                ))}
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
