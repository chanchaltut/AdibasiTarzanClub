import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useLang, useLangSwitch } from '../../i18n';
import Icon from '../ui/Icon';

/** Same page in English, Hindi or Bengali. */
export default function LangSwitch({ variant = 'menu' }) {
  const { lang, t } = useLang();
  const langs = useLangSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Tap to open on touch screens; closes on outside tap or Escape
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  if (variant === 'pills') {
    return (
      <ul className="lang-pills" aria-label={t('Language')}>
        {langs.map((l) => (
          <li key={l.code}>
            <RouterLink to={l.href} onClick={() => setOpen(false)} hrefLang={l.hreflang} lang={l.hreflang} className={l.code === lang ? 'is-active' : ''} aria-current={l.code === lang ? 'true' : undefined}>
              {l.label}
            </RouterLink>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={`lang lang--${variant} ${open ? 'is-open' : ''}`} ref={ref}>
      <button className="lang__btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={`${t('Language')}: ${langs.find((l) => l.code === lang).label}`}>
        <Icon name="globe" size={15} /> {langs.find((l) => l.code === lang).short} <Icon name="chevron-down" size={12} />
      </button>
      <ul className="lang__menu">
        {langs.map((l) => (
          <li key={l.code} className={l.code === lang ? 'is-active' : ''}>
            <RouterLink to={l.href} hrefLang={l.hreflang} lang={l.hreflang} aria-current={l.code === lang ? 'true' : undefined}>
              {l.label} {l.code === lang && <small>{t('Viewing')}</small>}
            </RouterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
