import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { useSchema } from './schema';
import { Icon } from './ui';

const GROUP_ORDER = ['Website content', 'People', 'Home page', 'Club information', 'Settings'];

function SideNav({ onNavigate }) {
  const schema = useSchema();
  const { user } = useAuth();
  const groups = GROUP_ORDER.map((g) => ({
    title: g,
    items: [
      ...schema.collections.filter((c) => c.group === g).map((c) => ({ to: `/c/${c.key}`, label: c.label, icon: c.icon })),
      ...schema.singles.filter((s) => s.group === g).map((s) => ({ to: `/s/${s.key}`, label: s.label, icon: s.icon })),
    ],
  })).filter((g) => g.items.length);

  const tools = [
    { to: '/media', label: 'Photo library', icon: 'images' },
    { to: '/translations', label: 'Translations', icon: 'translate' },
    { to: '/activity', label: 'Activity log', icon: 'activity' },
    ...(user.role === 'owner' ? [{ to: '/users', label: 'People & access', icon: 'key' }] : []),
    { to: '/help', label: 'Help & tips', icon: 'help' },
  ];

  const link = (it) => (
    <li key={it.to}>
      <NavLink to={it.to} end={it.to === '/'} className={({ isActive }) => `a-nav__link ${isActive ? 'is-active' : ''}`} onClick={onNavigate}>
        <Icon name={it.icon} size={19} />
        <span>{it.label}</span>
      </NavLink>
    </li>
  );

  return (
    <nav className="a-nav" aria-label="Admin sections">
      <ul>{link({ to: '/', label: 'Dashboard', icon: 'home' })}</ul>
      {groups.map((g) => (
        <div className="a-nav__group" key={g.title}>
          <p className="a-nav__title">{g.title}</p>
          <ul>{g.items.map(link)}</ul>
        </div>
      ))}
      <div className="a-nav__group">
        <p className="a-nav__title">Tools</p>
        <ul>{tools.map(link)}</ul>
      </div>
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { siteUrl } = useSchema();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    document.body.classList.toggle('a-noscroll', open);
    return () => document.body.classList.remove('a-noscroll');
  }, [open]);

  const site = siteUrl || window.location.origin;

  return (
    <div className="a-shell">
      <aside className={`a-side ${open ? 'is-open' : ''}`}>
        <div className="a-side__brand">
          <img src="/brand/crest.webp?v=2" alt="" width="40" height="40" />
          <div>
            <p className="a-side__name">Adibasi Tarzan Club</p>
            <p className="a-side__sub">Website management</p>
          </div>
        </div>
        <SideNav onNavigate={() => setOpen(false)} />
      </aside>
      {open && <button type="button" className="a-side__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="a-main">
        <header className="a-top">
          <button type="button" className="a-top__burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
          <a className="a-top__site" href={site} target="_blank" rel="noopener noreferrer">
            <Icon name="globe" size={18} /><span>View website</span><Icon name="external" size={14} />
          </a>
          <div className="a-top__user">
            <button type="button" className="a-top__me" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
              <span className="a-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="a-top__name">{user.name}</span>
              <Icon name="down" size={16} />
            </button>
            {menu && (
              <div className="a-menu" role="menu">
                <p className="a-menu__who">{user.email}<br /><span>{user.role === 'owner' ? 'Owner' : 'Editor'}</span></p>
                <NavLink to="/account" role="menuitem"><Icon name="person" size={18} />My account & password</NavLink>
                <button type="button" role="menuitem" onClick={logout}><Icon name="logout" size={18} />Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className="a-content" id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
