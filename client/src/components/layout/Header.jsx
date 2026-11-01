import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, NavLink, useLang } from '../../i18n';
import { NAV_LEFT, NAV_RIGHT, QUICK_NAV, RIBBON } from '../../data/club';
import Icon from '../ui/Icon';
import { Crest } from '../ui/Art';
import MobileMenu from './MobileMenu';
import Search from './Search';
import LangSwitch from './LangSwitch';

function Ribbon({ className = '' }) {
  const { t } = useLang();
  return (
    <Link to={RIBBON.href} className={`ribbon ${className}`}>
      <span className="ribbon__ball" aria-hidden="true"><Icon name="ball" size={15} /></span>
      <span className="ribbon__text">{t(RIBBON.text)}</span>
      <span className="ribbon__cta">{t(RIBBON.cta)}</span>
    </Link>
  );
}

function NavItem({ item, align }) {
  const { t } = useLang();
  const hasMenu = item.items || item.mega;
  // Only plain section links get an "active" underline; anchors and the mega menu share paths with them
  const LinkTag = item.mega || item.href.includes('#') || item.href.includes('?') ? Link : NavLink;
  return (
    <li className={`nav-item ${hasMenu ? 'nav-item--menu' : ''} ${item.mega ? 'nav-item--mega' : ''}`}>
      <LinkTag to={item.href} className="nav-item__link" aria-haspopup={hasMenu ? 'true' : undefined}>
        {t(item.label)}
        {hasMenu && <Icon name="chevron-down" size={14} className="nav-item__caret" />}
      </LinkTag>

      {item.items && (
        <div className={`nav-drop nav-drop--${align} ${item.columns === 2 ? 'nav-drop--two' : ''}`}>
          <ul className="nav-drop__list">
            {item.items.map((s) => (
              <li key={s.label}><Link to={s.href}>{t(s.label)}</Link></li>
            ))}
          </ul>
        </div>
      )}

      {item.mega && (
        <div className="nav-mega">
          <div className="wrapper nav-mega__inner">
            <div className="nav-mega__title">
              <span className="script">{t('Our')}</span>
              <span className="display">{t(item.label)}</span>
            </div>
            {item.mega.map((col) => (
              <div className="nav-mega__col" key={col.title}>
                <p className="nav-mega__head">{t(col.title)}</p>
                <ul>
                  {col.links.map((l) => <li key={l.label}><Link to={l.href}>{t(l.label)}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        {/* Desktop: slim top bar */}
        <div className="top-bar">
          <div className="wrapper top-bar__inner">
            <Ribbon />
            <div className="top-bar__actions">
              <Link to="/membership" className="top-bar__login"><Icon name="user" size={16} /> {t('Member Area')}</Link>
              <Link to="/membership" className="btn btn--sm top-bar__join"><Crest size={18} alt="" /> {t('Join the Club')}</Link>
              <LangSwitch />
            </div>
          </div>
        </div>

        {/* Mobile/tablet: message ribbon */}
        <Ribbon className="ribbon--mobile" />

        {/* Main navigation */}
        <div className="main-nav">
          <div className="wrapper main-nav__inner">
            <Link to="/" className="main-nav__crest" aria-label={`${t('Adibasi Tarzan Club')} — ${t('Home')}`}>
              <Crest size={64} alt="" />
              <span className="main-nav__wordmark">
                <span className="main-nav__name">{t('Adibasi Tarzan Club')}</span>
                <span className="main-nav__est">{t('Est. 1981 · S. Akhanagar')}</span>
              </span>
            </Link>

            <nav className="nav nav--left" aria-label={t('Club services')}>
              <ul>{NAV_LEFT.map((i) => <NavItem key={i.label} item={i} align="left" />)}</ul>
            </nav>
            <nav className="nav nav--right" aria-label={t('Teams and club')}>
              <ul>{NAV_RIGHT.map((i) => <NavItem key={i.label} item={i} align="right" />)}</ul>
            </nav>
            <button className="main-nav__search" onClick={() => setSearchOpen(true)} aria-label={t('Search')}>
              <Icon name="search" size={22} />
            </button>

            {/* Mobile controls */}
            <div className="m-controls">
              <LangSwitch variant="compact" />
              <Link to="/membership" className="m-controls__members"><Icon name="user" size={16} /> {t('Members')}</Link>
              <button className="burger" onClick={() => setMenuOpen(true)} aria-label={t('Open menu')} aria-expanded={menuOpen}>
                <span className="burger__lines" aria-hidden="true"><i /><i /><i /></span>
                <span className="burger__label">{t('Menu')}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="brand-bar" aria-hidden="true" />
      </header>

      {/* Mobile quick links (scrolls away with the page) */}
      <nav className="quick-nav" aria-label={t('Quick links')}>
        <ul className="quick-nav__list">
          {QUICK_NAV.map((q) => (
            <li key={q.label}>
              <Link to={q.href} className="quick-nav__item">
                <span className="quick-nav__icon"><Icon name={q.icon} size={22} /></span>
                <span>{t(q.label)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
