// Photos come in two shapes:
//   "/photos/hero.webp"                         — a file shipped with the site
//   { url: "https://…/c_limit,w_{w}/…", w, h, pos, alt, color, lqip } — uploaded in the admin
// "{w}" is replaced by the width each screen needs, so phones never download desktop-sized photos.

const WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 2048, 2560];

export function toImg(v) {
  if (!v) return null;
  if (typeof v === 'string') return { url: v };
  return typeof v.url === 'string' ? v : null;
}

/** A single address for a photo at about this width. */
export function imgUrl(v, width = 1280) {
  const i = toImg(v);
  return i ? i.url.replace('{w}', String(width)) : '';
}

export function srcSet(i) {
  if (!i?.url.includes('{w}')) return undefined;
  const max = i.w || 2560;
  const widths = WIDTHS.filter((w) => w < max);
  widths.push(Math.min(max, 2560));
  return [...new Set(widths)].map((w) => `${i.url.replace('{w}', String(w))} ${w}w`).join(', ');
}
