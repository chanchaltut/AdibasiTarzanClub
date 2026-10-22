import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLUB, SQUAD } from '../../data/club';
import Icon from '../ui/Icon';
import { Crest } from '../ui/Art';
import Trophies from '../ui/Trophies';

const byPos = (pos) => SQUAD.filter((p) => p.pos === pos).map((p) => ({ label: `${p.first} ${p.last}`, href: '/squad' }));

const SITEMAP = [
  { title: 'Goalkeepers', links: byPos('Goalkeeper') },
  { title: 'Defenders', links: byPos('Defender') },
  { title: 'Midfielders', links: byPos('Midfielder') },
  { title: 'Forwards', links: byPos('Forward') },
  { title: 'The Club', links: [
    { label: 'About ATC', href: '/club' },
    { label: 'Committee', href: '/committee' },
    { label: 'Our Ground', href: '/club#ground' },
    { label: 'Membership', href: '/membership' },
    { label: 'Partner With Us', href: '/contact#partners' },
    { label: 'Contact', href: '/contact' },
  ] },
  { title: 'History', links: [
    { label: '1981 — A club is born', href: '/club#history' },
    { label: 'The first cup', href: '/club#history' },
    { label: 'Heritage wing', href: '/club#heritage' },
    { label: 'Honours', href: '/club#honours' },
    { label: 'Gallery', href: '/gallery' },
  ] },
];

export default function Footer() {
  const [open, setOpen] = useState(null);
  return (
    <footer className="footer">
      <div className="wrapper">
        <Trophies />

        <div className="footer__partners">
          <div className="footer__partners-head"><span>Main Partners</span></div>
          <p className="footer__partners-copy">
            <span className="script">Your name here</span>
            Stand beside a club that has served S. Akhanagar since 1981.
          </p>
          <Link to="/contact#partners" className="btn btn--ghost">Become a Partner</Link>
        </div>

        <div className="footer__social">
          <p className="footer__label">Follow Adibasi Tarzan Club</p>
          <ul>
            {Object.entries(CLUB.socials).map(([k, v]) => (
              <li key={k}>
                <a href={v} target="_blank" rel="noopener noreferrer" className={`social social--${k}`} aria-label={k}>
                  <Icon name={k} size={22} />
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${CLUB.email}`} className="social" aria-label="Email"><Icon name="mail" size={22} /></a>
            </li>
          </ul>
        </div>

        <nav className="sitemap" aria-label="Footer">
          {SITEMAP.map((g, i) => (
            <div className={`sitemap__group ${open === i ? 'is-open' : ''}`} key={g.title}>
              <button className="sitemap__title" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {g.title}
                <Icon name="chevron-down" size={16} />
              </button>
              <ul>
                {g.links.map((l) => <li key={l.label}><Link to={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>

        <div className="corporate">
          <div className="corporate__brand">
            <Crest size={52} alt="" />
            <div>
              <p className="corporate__name">Adibasi Tarzan Club</p>
              <p className="corporate__addr">{CLUB.address.join(' · ')}</p>
            </div>
          </div>
          <ul className="corporate__links">
            <li><Link to="/club#faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/membership">Membership</Link></li>
            <li><Link to="/contact#partners">Partners</Link></li>
          </ul>
          <p className="corporate__copy">© {new Date().getFullYear()} Adibasi Tarzan Club. Official website of the club.</p>
        </div>
      </div>
      <div className="footer__mark" aria-hidden="true">
        <span className="display">Tarzan</span>
        <span className="script">since 1981</span>
      </div>
    </footer>
  );
}
