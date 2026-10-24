// Build-time renderer used by scripts/prerender.js — never shipped to the browser.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from './App';

export { ARTICLE_PATHS, STATIC_PATHS, getPageMeta, headTags, llmsFullTxt, llmsTxt, sitemapXml } from './seo/meta';
export { LANGS, localePath, missing } from './i18n';

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
}
