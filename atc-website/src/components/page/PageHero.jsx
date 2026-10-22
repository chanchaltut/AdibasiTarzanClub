import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Photo } from '../ui/Art';
import Icon from '../ui/Icon';

/** Inner-page masthead with breadcrumb and an optional sticky section bar. */
export default function PageHero({ title, script, intro, photo, crumbs = [], tabs, active, onTab, position }) {
  const [spy, setSpy] = useState(tabs?.[0]?.id);

  useEffect(() => {
    document.title = `${title} — Adibasi Tarzan Club`;
  }, [title]);

  // Highlight the in-page section currently on screen
  useEffect(() => {
    if (!tabs || onTab || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSpy(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    tabs.forEach((t) => { const el = document.getElementById(t.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [tabs, onTab]);

  const current = onTab ? active : spy;

  return (
    <>
      <section className="page-hero">
        {photo && <Photo src={photo} className="page-hero__bg" eager position={position} />}
        <span className="page-hero__shade" aria-hidden="true" />
        <div className="wrapper page-hero__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {crumbs.map((c) => (
              <span key={c.label}><Icon name="chevron-right" size={12} />{c.href ? <Link to={c.href}>{c.label}</Link> : c.label}</span>
            ))}
          </nav>
          {script && <p className="page-hero__script script">{script}</p>}
          <h1 className="page-hero__title display">{title}</h1>
          {intro && <p className="page-hero__intro">{intro}</p>}
        </div>
      </section>

      {tabs && (
        <nav className="sub-nav" aria-label={`${title} sections`}>
          <div className="wrapper">
            <ul className="sub-nav__list">
              {tabs.map((t) => {
                const isActive = current === t.id;
                return (
                  <li key={t.id}>
                    {onTab ? (
                      <button className={`sub-nav__link ${isActive ? 'is-active' : ''}`} onClick={() => onTab(t.id)} aria-current={isActive ? 'page' : undefined}>
                        {t.label}
                      </button>
                    ) : (
                      <a href={`#${t.id}`} className={`sub-nav__link ${isActive ? 'is-active' : ''}`}>{t.label}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
