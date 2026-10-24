// ─────────────────────────────────────────────────────────────
// Languages: English at "/", Hindi at "/hi/…", Bengali at "/bn/…".
//
// Text is translated with t('English text'). The English is the key,
// so anything without a translation simply shows in English. When you
// add or change English copy, add the same key to hi.js and bn.js —
// `npm run build` lists every key still missing.
// ─────────────────────────────────────────────────────────────

import { Fragment, forwardRef, useMemo } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import hi from './hi';
import bn from './bn';

export const LANGS = {
  en: { code: 'en', label: 'English', short: 'EN', prefix: '', hreflang: 'en-IN', ogLocale: 'en_IN', dateLocale: 'en-GB' },
  hi: {
    code: 'hi', label: 'हिन्दी', short: 'हि', prefix: '/hi', hreflang: 'hi-IN', ogLocale: 'hi_IN', dateLocale: 'hi-IN',
    // Devanagari partners for Barlow Condensed / Barlow / IM Fell / the script faces
    fonts: 'https://fonts.googleapis.com/css2?family=Anek+Devanagari:wdth,wght@75..100,500..800&family=Hind:wght@400;500;600&family=Tiro+Devanagari+Hindi:ital@0;1&family=Kalam:wght@400;700&display=swap',
  },
  bn: {
    code: 'bn', label: 'বাংলা', short: 'বা', prefix: '/bn', hreflang: 'bn-IN', ogLocale: 'bn_IN', dateLocale: 'bn-IN-u-nu-latn',
    fonts: 'https://fonts.googleapis.com/css2?family=Anek+Bangla:wdth,wght@75..100,500..800&family=Hind+Siliguri:wght@400;500;600&family=Tiro+Bangla:ital@0;1&family=Galada&family=Atma:wght@400;500&display=swap',
  },
};
export const LANG_CODES = Object.keys(LANGS);

const DICT = { hi, bn };

/** Keys asked for but not translated, per language — reported by the prerender build. */
export const missing = { hi: new Set(), bn: new Set() };

export function translate(lang, text, vars) {
  if (text == null || text === '') return text;
  let out = text;
  if (lang !== 'en') {
    const hit = DICT[lang][text];
    if (hit) out = hit;
    else if (/[A-Za-z]/.test(text)) missing[lang].add(text);
  }
  return vars ? out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : out;
}

export const langFromPath = (pathname) => {
  const seg = pathname.split('/')[1];
  return seg === 'hi' || seg === 'bn' ? seg : 'en';
};

/** "/hi/club" → "/club" */
export const stripLang = (pathname) => (langFromPath(pathname) === 'en' ? pathname : pathname.slice(3) || '/');

/** "/club#faq" → "/hi/club#faq" for Hindi. Leaves external and relative links alone. */
export const localePath = (lang, to) => {
  const { prefix } = LANGS[lang];
  if (!prefix || typeof to !== 'string' || !to.startsWith('/')) return to;
  return to === '/' ? prefix : /^\/[?#]/.test(to) ? prefix + to.slice(1) : prefix + to;
};

/** "*word*" → script-font accent, "[words]" → link(words). Lets each language place them where its grammar wants. */
function rich(text, link) {
  return text.split(/(\*[^*]+\*|\[[^\]]+\])/).filter(Boolean).map((part, i) => {
    if (part[0] === '*') return <span className="script" key={i}>{part.slice(1, -1)}</span>;
    if (part[0] === '[' && link) return <Fragment key={i}>{link(part.slice(1, -1))}</Fragment>;
    return part;
  });
}

const apis = {};
function api(lang) {
  if (apis[lang]) return apis[lang];
  const { dateLocale } = LANGS[lang];
  const t = (text, vars) => translate(lang, text, vars);
  const date = (iso, opts) => new Date(iso).toLocaleDateString(dateLocale, { timeZone: 'Asia/Kolkata', ...opts });
  apis[lang] = {
    lang,
    info: LANGS[lang],
    t,
    /** Translate text that carries *accent* or [link] markup (see rich()). */
    ta: (text, link) => rich(t(text), link),
    to: (path) => localePath(lang, path),
    /** Full player name in the page language. */
    name: (p) => `${t(p.first)} ${t(p.last)}`,
    date,
    shortDate: (iso) => date(iso, { day: 'numeric', month: 'short', year: '2-digit' }),
    longDate: (iso) => date(iso, { weekday: 'long', day: 'numeric', month: 'long' }),
    timeAgo: (iso) => {
      const diff = Date.now() - new Date(iso).getTime();
      const hrs = Math.floor(diff / 36e5);
      if (diff >= 0 && hrs < 1) return t('Just now');
      if (diff >= 0 && hrs < 24) return t(hrs === 1 ? '{n} hr ago' : '{n} hrs ago', { n: hrs });
      return date(iso, { day: 'numeric', month: 'short', year: '2-digit' });
    },
  };
  return apis[lang];
}

/** Current language, translator and locale-aware helpers. */
export function useLang() {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  return useMemo(() => api(lang), [lang]);
}

/** Drop-in for react-router's Link that keeps the visitor in their language. */
export const Link = forwardRef(function Link({ to, ...rest }, ref) {
  const { to: local } = useLang();
  return <RouterLink ref={ref} to={local(to)} {...rest} />;
});

export const NavLink = forwardRef(function NavLink({ to, ...rest }, ref) {
  const { to: local } = useLang();
  return <RouterNavLink ref={ref} to={local(to)} {...rest} />;
});

/** Links to the current page in every language (for the switcher). */
export function useLangSwitch() {
  const { pathname, search, hash } = useLocation();
  const base = stripLang(pathname);
  return LANG_CODES.map((code) => ({ ...LANGS[code], href: localePath(code, base) + search + hash }));
}
