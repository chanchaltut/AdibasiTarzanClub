// Turns the client build into one static HTML file per route, so every URL
// works on refresh with any static host and crawlers (including AI bots that
// don't run JavaScript) see the full page. Also writes sitemap.xml, llms.txt
// and content.json (the saved copy the site falls back to if the server is slow).
//
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx --outDir .ssr`.
//
// Content comes from the server (ATC_API_URL, else VITE_API_URL). When a server
// address is set but can't be reached, the build STOPS rather than publish old
// sample content — Vercel then keeps the previous version of the site live.
// With no server address at all (first local build) the built-in defaults are used.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, '.ssr');

const fileEnv = loadEnv(process.env.NODE_ENV === 'development' ? 'development' : 'production', root, '');
const API = (process.env.ATC_API_URL || process.env.VITE_API_URL || fileEnv.ATC_API_URL || fileEnv.VITE_API_URL || '').replace(/\/+$/, '');
const allowDefaults = (process.env.ALLOW_DEFAULT_CONTENT || fileEnv.ALLOW_DEFAULT_CONTENT) === '1';

const {
  render, setContent, getPageMeta, headTags, STATIC_PATHS, articlePaths, LANGS, localePath, missing, sitemapXml, llmsTxt, llmsFullTxt,
} = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

async function fetchContent() {
  // A sleeping free-tier server can take ~a minute to wake, so be patient and retry.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API}/api/public/content`, { signal: AbortSignal.timeout(90_000), headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`server answered ${res.status}`);
      const data = await res.json();
      if (!data?.CLUB || !Array.isArray(data.NEWS)) throw new Error('the answer was not website content');
      return data;
    } catch (err) {
      console.warn(`⚠ Content fetch ${attempt}/3 from ${API} failed: ${err.message}`);
      if (attempt < 3) await new Promise((r) => { setTimeout(r, 5000 * attempt); });
    }
  }
  return null;
}

let content = API ? await fetchContent() : null;
if (!content) {
  if (API && !allowDefaults) {
    throw new Error(`Could not load content from ${API}. Stopping the build so the live site isn't replaced with sample content. (Set ALLOW_DEFAULT_CONTENT=1 to build with the defaults anyway.)`);
  }
  console.warn(API ? '⚠ Building with the built-in default content (ALLOW_DEFAULT_CONTENT=1).' : 'ℹ No VITE_API_URL / ATC_API_URL set — building with the built-in default content.');
  content = (await import(pathToFileURL(path.join(root, 'src/data/defaults.js')).href)).default;
} else {
  console.log(`✓ Content loaded from ${API} (version ${content.version})`);
}
setContent(content);
await fs.writeFile(path.join(dist, 'content.json'), JSON.stringify(content));

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

const routes = Object.keys(LANGS).flatMap((code) => [...STATIC_PATHS, ...articlePaths()].map((p) => localePath(code, p)));
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
console.log(`prerendered ${routes.length} routes + 404, sitemap.xml, llms.txt, llms-full.txt, content.json`);

// Copy that showed in English on a Hindi/Bengali page because no translation exists yet.
for (const [code, keys] of Object.entries(missing)) {
  if (!keys.size) continue;
  console.warn(`\n⚠ ${keys.size} untranslated ${LANGS[code].label} string(s) — add them in the admin panel (Translations) or src/i18n/${code}.js:`);
  [...keys].slice(0, 40).forEach((k) => console.warn(`  ${JSON.stringify(k.length > 90 ? `${k.slice(0, 90)}…` : k)}`));
  if (keys.size > 40) console.warn(`  …and ${keys.size - 40} more`);
}
