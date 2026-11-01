import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LANGS } from '../i18n';
import { getPageMeta, headTags } from './meta';

/**
 * Keeps <head> in step with the route. Prerendered pages already ship these tags;
 * this swaps the ones that change on navigation and leaves identical ones (like the
 * language font stylesheet) alone so nothing re-downloads or flashes.
 */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    const head = document.head;
    document.documentElement.lang = LANGS[meta.lang].hreflang;

    const next = [];
    headTags(meta).forEach(([tag, attrs, text]) => {
      if (tag === 'title') { document.title = text; return; }
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (text) el.textContent = text;
      el.setAttribute('data-seo', '');
      next.push(el);
    });

    head.querySelectorAll('[data-seo]').forEach((el) => {
      const same = next.findIndex((n) => n && n.isEqualNode(el));
      if (same >= 0) next[same] = null;
      else el.remove();
    });
    const anchor = head.querySelector('meta[name="viewport"]')?.nextSibling || null;
    next.forEach((el) => el && head.insertBefore(el, anchor));
  }, [pathname]);

  return null;
}
