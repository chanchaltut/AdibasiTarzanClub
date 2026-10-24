import { useState } from 'react';
import { Link, useLang } from '../../i18n';
import { CLUB, SQUAD } from '../../data/club';
import Icon from '../ui/Icon';
import { Crest } from '../ui/Art';
import Trophies from '../ui/Trophies';
import { SITE } from '../../seo/meta';

const byPos = (pos) => SQUAD.filter((p) => p.pos === pos).map((p) => ({ player: p, href: '/squad' }));

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
  const { t, name } = useLang();
  return (
    <footer className="footer">
      <div className="wrapper">
        <Trophies />

        <div className="footer__partners">
          <div className="footer__partners-head"><span>{t('Main Partners')}</span></div>
          <p className="footer__partners-copy">
            <span className="script">{t('Your name here')}</span>
            {t('Stand beside a club that has served S. Akhanagar since 1981.')}
          </p>
          <Link to="/contact#partners" className="btn btn--ghost">{t('Become a Partner')}</Link>
        </div>

        <div className="footer__social">
          <p className="footer__label">{t('Follow Adibasi Tarzan Club')}</p>
          <ul>
            {Object.entries(CLUB.socials).map(([k, v]) => (
              <li key={k}>
                <a href={v} target="_blank" rel="noopener noreferrer" className={`social social--${k}`} aria-label={k}>
                  <Icon name={k} size={22} />
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${CLUB.email}`} className="social" aria-label={t('Email')}><Icon name="mail" size={22} /></a>
            </li>
          </ul>
        </div>

        <nav className="sitemap" aria-label={t('Footer')}>
          {SITEMAP.map((g, i) => (
            <div className={`sitemap__group ${open === i ? 'is-open' : ''}`} key={g.title}>
              <button className="sitemap__title" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {t(g.title)}
                <Icon name="chevron-down" size={16} />
              </button>
              <ul>
                {g.links.map((l) => {
                  const label = l.player ? name(l.player) : t(l.label);
                  return <li key={label}><Link to={l.href}>{label}</Link></li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="corporate">
          <div className="corporate__brand">
            <Crest size={52} alt="" />
            <div>
              <p className="corporate__name">{t('Adibasi Tarzan Club')}</p>
              <p className="corporate__addr">{CLUB.address.map((l) => t(l)).join(' · ')}</p>
            </div>
          </div>
          <ul className="corporate__links">
            <li><Link to="/club#faq">{t('FAQ')}</Link></li>
            <li><Link to="/contact">{t('Contact Us')}</Link></li>
            <li><Link to="/membership">{t('Membership')}</Link></li>
            <li><Link to="/contact#partners">{t('Partners')}</Link></li>
          </ul>
          <div className="corporate__base">
            <p className="corporate__copy">© {new Date().getFullYear()} {t('Adibasi Tarzan Club. Official website of the club.')}</p>
            <p className="credit">
              <span className="credit__by script">{t('Crafted by')}</span>
              <a href={SITE.agency.url} target="_blank" rel="noopener" className="credit__link" title="Code Hyphen — website design & development">
                {SITE.agency.name}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="footer__mark" aria-hidden="true">
        <span className="display">Tarzan</span>
        <span className="script">{t('since 1981')}</span>
      </div>
    </footer>
  );
}
