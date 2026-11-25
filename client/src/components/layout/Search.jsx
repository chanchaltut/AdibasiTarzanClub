import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import { GALLERY_SECTIONS } from '../../data/gallery';
import Icon from '../ui/Icon';

const PAGES = [
  { title: 'About the club', href: '/club', type: 'Page' },
  { title: 'History since 1981', href: '/club#history', type: 'Page' },
  { title: 'Schedule & results', href: '/schedule', type: 'Page' },
  { title: 'Squad', href: '/squad', type: 'Page' },
  { title: 'Committee', href: '/committee', type: 'Page' },
  { title: 'Members', href: '/members', type: 'Page' },
  { title: 'Membership', href: '/membership', type: 'Page' },
  { title: 'Gallery', href: '/gallery', type: 'Page' },
  { title: 'The story behind our crest', href: '/crest', type: 'Page' },
  { title: 'ATC Annual Cup — tournament schedule, teams & fixtures', href: '/tournaments', type: 'Page' },
  { title: 'Registration & participation', href: '/register', type: 'Page' },
  { title: 'Match information', href: '/schedule?tab=info', type: 'Page' },
  { title: 'Contact & directions', href: '/contact', type: 'Page' },
];

export default function Search({ open, onClose }) {
  const [q, setQ] = useState('');
  const input = useRef(null);
  const { t, name, lang } = useLang();
  const { NEWS, SQUAD, MEMBERS, MEMORIAM, EVENTS, VIDEOS, TOURNAMENTS, PROGRAMMES } = useContent();

  useEffect(() => {
    if (!open) return;
    setQ('');
    setTimeout(() => input.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Searchable in the page language and in English, so "Murmu" and "मुर्मू" both work.
  const index = useMemo(() => [
    ...PAGES.map((p) => ({ ...p, title: t(p.title), en: p.title })),
    ...NEWS.map((n) => ({ title: t(n.title), en: n.title, href: `/news/${n.slug}`, type: 'News' })),
    ...SQUAD.map((p) => ({ title: `${name(p)} — #${p.no} ${t(p.pos)}`, en: `${p.first} ${p.last} ${p.pos}`, href: '/squad', type: 'Player' })),
    ...MEMBERS.map((m) => ({ title: `${t(m.name)} — ${t(m.kind || 'Member')}`, en: `${m.name} ${m.kind || 'Member'}`, href: '/members', type: 'Member' })),
    ...MEMORIAM.map((m) => ({ title: `${t(m.name)} — ${t('In Memoriam')}`, en: `${m.name} ${m.kind || ''} In Memoriam late`, href: '/members#in-memoriam', type: 'Member' })),
    ...EVENTS.map((e) => ({ title: t(e.title), en: e.title, href: '/schedule?tab=events', type: 'Event' })),
    ...VIDEOS.map((v) => ({ title: t(v.title), en: v.title, href: '/gallery#videos', type: 'Video' })),
    ...TOURNAMENTS.map((x) => ({ title: t(x.name), en: x.name, href: '/tournaments', type: 'Event' })),
    ...PROGRAMMES.map((x) => ({ title: t(x.title), en: x.title, href: '/register', type: 'Event' })),
    ...GALLERY_SECTIONS.flatMap((g) => [g.title, ...g.albums].map((a) => ({ title: `${t(a)} — ${t('Gallery')}`, en: `${a} gallery photos`, href: `/gallery?section=${g.id}`, type: 'Page' }))),
  ], [lang, NEWS, SQUAD, MEMBERS, MEMORIAM, EVENTS, VIDEOS, TOURNAMENTS, PROGRAMMES]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return index.slice(0, PAGES.length);
    return index.filter((i) => i.title.toLowerCase().includes(s) || i.en.toLowerCase().includes(s)).slice(0, 12);
  }, [q, index]);

  return (
    <div className={`search ${open ? 'is-open' : ''}`} role="dialog" aria-label={t('Search')} aria-hidden={!open}>
      <div className="search__panel">
        <div className="wrapper">
          <div className="search__bar">
            <Icon name="search" size={24} />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search players, news, events…')}
              aria-label={t('Search')}
            />
            <button onClick={onClose} aria-label={t('Close search')} className="search__close"><Icon name="close" size={22} /></button>
          </div>
          <p className="search__hint">{q ? t(results.length === 1 ? '{n} result' : '{n} results', { n: results.length }) : t('Popular pages')}</p>
          <ul className="search__results">
            {results.map((r) => (
              <li key={r.href + r.title}>
                <Link to={r.href} onClick={onClose}>
                  <span className="search__type">{t(r.type)}</span>
                  <span className="search__title">{r.title}</span>
                  <Icon name="arrow" size={18} />
                </Link>
              </li>
            ))}
            {!results.length && <li className="search__empty">{t('Nothing found for “{q}”.', { q })}</li>}
          </ul>
        </div>
      </div>
      <button className="search__scrim" onClick={onClose} aria-label={t('Close search')} tabIndex={-1} />
    </div>
  );
}
