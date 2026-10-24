import { useEffect, useState } from 'react';
import { Link, useLang } from '../../i18n';
import { Photo } from '../ui/Art';
import Icon from '../ui/Icon';

/** Inner-page masthead with breadcrumb and an optional sticky section bar. */
export default function PageHero({ title, script, intro, photo, crumbs = [], tabs, active, onTab, position }) {
  const [spy, setSpy] = useState(tabs?.[0]?.id);
  const { t } = useLang();

  // Highlight the in-page section currently on screen
  useEffect(() => {
    if (!tabs || onTab || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSpy(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    tabs.forEach((tab) => { const el = document.getElementById(tab.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [tabs, onTab]);

  const current = onTab ? active : spy;

  return (
    <>
      <section className="page-hero">
        {photo && <Photo src={photo} className="page-hero__bg" eager position={position} />}
        <span className="page-hero__shade" aria-hidden="true" />
        <div className="wrapper page-hero__inner">
          <nav className="crumbs" aria-label={t('Breadcrumb')}>
            <Link to="/">{t('Home')}</Link>
            {crumbs.map((c) => (
              <span key={c.label}><Icon name="chevron-right" size={12} />{c.href ? <Link to={c.href}>{t(c.label)}</Link> : t(c.label)}</span>
            ))}
          </nav>
          {script && <p className="page-hero__script script">{t(script)}</p>}
          <h1 className="page-hero__title display">{t(title)}</h1>
          {intro && <p className="page-hero__intro">{t(intro)}</p>}
        </div>
      </section>

      {tabs && (
        <nav className="sub-nav" aria-label={t('{title} sections', { title: t(title) })}>
          <div className="wrapper">
            <ul className="sub-nav__list">
              {tabs.map((tab) => {
                const isActive = current === tab.id;
                return (
                  <li key={tab.id}>
                    {onTab ? (
                      <button className={`sub-nav__link ${isActive ? 'is-active' : ''}`} onClick={() => onTab(tab.id)} aria-current={isActive ? 'page' : undefined}>
                        {t(tab.label)}
                      </button>
                    ) : (
                      <a href={`#${tab.id}`} className={`sub-nav__link ${isActive ? 'is-active' : ''}`}>{t(tab.label)}</a>
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
