// Turns the client build into one static HTML file per route, so every URL
// works on refresh with any static host and crawlers (including AI bots that
// don't run JavaScript) see the full page. Also writes sitemap.xml and llms.txt.
//
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx --outDir .ssr`.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, '.ssr');

const {
  render, getPageMeta, headTags, STATIC_PATHS, ARTICLE_PATHS, LANGS, localePath, missing, sitemapXml, llmsTxt, llmsFullTxt,
} = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Keep "</script>" from closing the JSON-LD block early.
const escJson = (s) => s.replace(/</g, '\\u003c');

function renderHead(tags) {
  return tags.map(([tag, attrs, text]) => {
    const a = Object.entries(attrs).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
    if (tag === 'title') return `<title>${esc(text)}</title>`;
    if (tag === 'script') return `<script data-seo${a}>${escJson(text)}</script>`;
    return `<${tag} data-seo${a} />`;
  }).join('\n    ');
}

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo:start-->') || !template.includes('<div id="root"></div>') || !template.includes('<html lang="en-IN">')) {
  throw new Error('dist/index.html is missing the <!--seo:start--> markers, the empty #root or <html lang="en-IN">');
}

function page(url) {
  const meta = getPageMeta(url);
  return template
    .replace('<html lang="en-IN">', `<html lang="${LANGS[meta.lang].hreflang}">`)
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, renderHead(headTags(meta)))
    .replace('<div id="root"></div>', `<div id="root">${render(url)}</div>`);
}

// "/club" → club.html, served at /club via cleanUrls; "/" → index.html.
const fileFor = (url) => (url === '/' ? 'index.html' : `${url.slice(1)}.html`);

const routes = Object.keys(LANGS).flatMap((code) => [...STATIC_PATHS, ...ARTICLE_PATHS].map((p) => localePath(code, p)));
for (const url of routes) {
  const out = path.join(dist, fileFor(url));
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, page(url));
}
// Static hosts serve this with a real 404 status; it still boots the app.
await fs.writeFile(path.join(dist, '404.html'), page('/404'));

const now = new Date().toISOString();
await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemapXml(now));
await fs.writeFile(path.join(dist, 'llms.txt'), llmsTxt());
await fs.writeFile(path.join(dist, 'llms-full.txt'), llmsFullTxt(now));

await fs.rm(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${routes.length} routes + 404, sitemap.xml, llms.txt, llms-full.txt`);

// Copy that showed in English on a Hindi/Bengali page because no translation exists yet.
for (const [code, keys] of Object.entries(missing)) {
  if (!keys.size) continue;
  console.warn(`\n⚠ ${keys.size} untranslated ${LANGS[code].label} string(s) — add them to src/i18n/${code}.js:`);
  keys.forEach((k) => console.warn(`  ${JSON.stringify(k)}`));
}
