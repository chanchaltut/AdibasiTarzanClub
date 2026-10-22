import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CLUB, NAV_LEFT, NAV_RIGHT } from '../../data/club';
import Icon from '../ui/Icon';
import { Crest } from '../ui/Art';

const SECTIONS = [...NAV_RIGHT, ...NAV_LEFT].map((s) => ({
  ...s,
  links: s.items || (s.mega ? s.mega.flatMap((c) => c.links.map((l) => ({ ...l, label: `${c.title} · ${l.label}` }))) : null),
}));

export default function MobileMenu({ open, onClose, onSearch }) {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <div className={`m-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} role="dialog" aria-label="Menu">
      <div className="m-menu__top">
        <Link to="/" className="m-menu__crest" onClick={onClose}><Crest size={40} alt="Home" /></Link>
        <button className="m-menu__search" onClick={onSearch}>
          <Icon name="search" size={18} /> Search the club
        </button>
        <button className="m-menu__close" onClick={onClose} aria-label="Close menu"><Icon name="close" size={22} /></button>
      </div>

      <nav className="m-menu__body" aria-label="Main">
        <ul>
          {SECTIONS.map((s, i) => (
            <li key={s.label} className={`m-menu__item ${expanded === i ? 'is-open' : ''}`}>
              {s.links ? (
                <>
                  <button className="m-menu__head" onClick={() => setExpanded(expanded === i ? null : i)} aria-expanded={expanded === i}>
                    {s.label}
                    <Icon name={expanded === i ? 'minus' : 'plus'} size={18} />
                  </button>
                  <ul className="m-menu__sub">
                    {s.links.map((l) => (
                      <li key={l.label}><Link to={l.href} onClick={onClose}>{l.label}</Link></li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link to={s.href} className="m-menu__head" onClick={onClose}>
                  {s.label} <Icon name="chevron-right" size={18} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-menu__foot">
        <Link to="/membership" className="btn btn--lg" onClick={onClose}>Become a Member</Link>
        <div className="m-menu__socials">
          {Object.entries(CLUB.socials).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener noreferrer" aria-label={k}><Icon name={k} size={20} /></a>
          ))}
        </div>
        <p className="m-menu__note"><span className="script">Since</span> 1981 · S. Akhanagar, Kaliyaganj</p>
      </div>
    </div>
  );
}
