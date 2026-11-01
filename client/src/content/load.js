// ─────────────────────────────────────────────────────────────
// Getting the content when the website opens.
//
// Pages arrive already drawn (prerendered), so visitors see them at
// once. Meanwhile we ask the server for the latest content:
//   • if it answers quickly, the site starts with it;
//   • otherwise the site starts from the copy saved at the last build
//     (/content.json) and swaps to the server's content when it comes;
//   • if both are unavailable, the built-in defaults are used.
// ─────────────────────────────────────────────────────────────

import { getContent, setContent } from './store';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const apiUrl = (path) => `${API}${path}`;

async function getJSON(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit', headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!data || typeof data !== 'object' || !data.CLUB) throw new Error('not content');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });

export async function bootContent() {
  const live = getJSON(apiUrl('/api/public/content'), 10_000).catch(() => null);
  const quick = await Promise.race([live, wait(1200).then(() => undefined)]);
  if (quick) {
    setContent(quick);
    return;
  }
  const saved = await getJSON('/content.json', 5000).catch(() => null);
  setContent(saved || (await import('../data/defaults.js')).default);
  live.then((fresh) => {
    if (fresh && fresh.version !== getContent().version) setContent(fresh);
  });
}
