import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NEWS, SQUAD, EVENTS } from '../../data/club';
import Icon from '../ui/Icon';

const PAGES = [
  { title: 'About the club', href: '/club', type: 'Page' },
  { title: 'History since 1981', href: '/club#history', type: 'Page' },
  { title: 'Schedule & results', href: '/schedule', type: 'Page' },
  { title: 'Squad', href: '/squad', type: 'Page' },
  { title: 'Committee', href: '/committee', type: 'Page' },
  { title: 'Membership', href: '/membership', type: 'Page' },
  { title: 'Gallery', href: '/gallery', type: 'Page' },
  { title: 'Contact & directions', href: '/contact', type: 'Page' },
];

const INDEX = [
  ...PAGES,
  ...NEWS.map((n) => ({ title: n.title, href: `/news/${n.slug}`, type: 'News' })),
  ...SQUAD.map((p) => ({ title: `${p.first} ${p.last} — #${p.no} ${p.pos}`, href: '/squad', type: 'Player' })),
  ...EVENTS.map((e) => ({ title: e.title, href: '/schedule?tab=events', type: 'Event' })),
];

export default function Search({ open, onClose }) {
  const [q, setQ] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setTimeout(() => input.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PAGES;
    return INDEX.filter((i) => i.title.toLowerCase().includes(t)).slice(0, 12);
  }, [q]);

  return (
    <div className={`search ${open ? 'is-open' : ''}`} role="dialog" aria-label="Search" aria-hidden={!open}>
      <div className="search__panel">
        <div className="wrapper">
          <div className="search__bar">
            <Icon name="search" size={24} />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search players, news, events…"
              aria-label="Search"
            />
            <button onClick={onClose} aria-label="Close search" className="search__close"><Icon name="close" size={22} /></button>
          </div>
          <p className="search__hint">{q ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Popular pages'}</p>
          <ul className="search__results">
            {results.map((r) => (
              <li key={r.href + r.title}>
                <Link to={r.href} onClick={onClose}>
                  <span className="search__type">{r.type}</span>
                  <span className="search__title">{r.title}</span>
                  <Icon name="arrow" size={18} />
                </Link>
              </li>
            ))}
            {!results.length && <li className="search__empty">Nothing found for “{q}”.</li>}
          </ul>
        </div>
      </div>
      <button className="search__scrim" onClick={onClose} aria-label="Close search" tabIndex={-1} />
    </div>
  );
}
