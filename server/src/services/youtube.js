// YouTube links in every shape people paste them: watch?v=, youtu.be/, shorts/, live/, embed/,
// mobile and music links, links with extra tracking parameters, or just the 11-character id.

const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim();
  if (ID.test(s)) return s;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '').toLowerCase();
  let id = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (m) id = m[1];
    }
  }
  return id && ID.test(id) ? id : null;
}

/**
 * Title and thumbnail from YouTube's public oEmbed endpoint (no API key needed).
 * Returns null fields rather than throwing when YouTube is unreachable.
 */
export async function lookupYouTube(input, { timeoutMs = 6000 } = {}) {
  const id = parseYouTubeId(input);
  if (!id) return { ok: false, reason: 'invalid' };
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/json' },
    });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'private', id, thumbnail };
    if (res.status === 404 || res.status === 400) return { ok: false, reason: 'missing', id, thumbnail };
    if (!res.ok) return { ok: true, id, url: watch, thumbnail, title: '' };
    const data = await res.json();
    return {
      ok: true,
      id,
      url: watch,
      thumbnail,
      title: typeof data.title === 'string' ? data.title.slice(0, 140) : '',
      channel: typeof data.author_name === 'string' ? data.author_name : '',
    };
  } catch {
    // Offline or slow: the link is still valid, the admin types the title.
    return { ok: true, id, url: watch, thumbnail, title: '' };
  }
}
