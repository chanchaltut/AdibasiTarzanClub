// ─────────────────────────────────────────────────────────────
// Checks and cleans what the admin panel sends, using the field
// definitions in schemas.js. Unknown keys are dropped, text is
// trimmed, links are made safe, and every problem comes back as a
// plain-English message next to the field it belongs to.
// ─────────────────────────────────────────────────────────────

import { isObjectId, slugify } from '../utils/http.js';
import { parseYouTubeId } from '../services/youtube.js';

const DEFAULT_MAX = { text: 200, textarea: 1000, longtext: 20000, combo: 100, link: 500, url: 500, email: 200 };

const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const clamp01 = (n) => Math.min(100, Math.max(0, n));
const num = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);

/** Only https/http addresses, mail/phone links, or paths on this site. Blocks javascript: and friends. */
export function safeLink(value, { allowRelative = true } = {}) {
  const v = String(value).trim();
  if (allowRelative && /^\/(?!\/)[^\s]*$/.test(v)) return v;
  if (/^(mailto:|tel:)[^\s]+$/i.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
  } catch { /* not a URL */ }
  return null;
}

/** True when a `when` rule hides the field for this item. Hidden fields are not required and are not stored. */
export function isHidden(field, data) {
  if (!field.when) return false;
  const other = data?.[field.when.field];
  return other !== field.when.is;
}

function cleanImage(v) {
  if (!v || typeof v !== 'object') return { error: 'Please choose a photo' };
  const out = {};
  if (v.media) {
    if (!isObjectId(String(v.media))) return { error: 'This photo is not valid — please choose it again' };
    out.media = String(v.media);
  } else if (typeof v.src === 'string' && /^\/[\w\-./]+$/.test(v.src) && !v.src.includes('..')) {
    out.src = v.src;
  } else {
    return { error: 'Please choose a photo' };
  }
  if (typeof v.alt === 'string' && v.alt.trim()) out.alt = v.alt.trim().slice(0, 200);
  if (v.crop && typeof v.crop === 'object') {
    const c = { x: num(v.crop.x), y: num(v.crop.y), w: num(v.crop.w), h: num(v.crop.h) };
    if ([c.x, c.y, c.w, c.h].every(Number.isFinite) && c.w > 0.5 && c.h > 0.5) {
      c.x = clamp01(c.x); c.y = clamp01(c.y);
      c.w = Math.min(c.w, 100 - c.x); c.h = Math.min(c.h, 100 - c.y);
      // A crop of (almost) the whole picture is no crop at all.
      if (!(c.x < 0.2 && c.y < 0.2 && c.w > 99.6 && c.h > 99.6)) {
        out.crop = Object.fromEntries(Object.entries(c).map(([k, n]) => [k, Math.round(n * 1000) / 1000]));
      }
    }
  }
  if (v.focal && typeof v.focal === 'object') {
    const fx = num(v.focal.x); const fy = num(v.focal.y);
    if (Number.isFinite(fx) && Number.isFinite(fy)) out.focal = { x: Math.round(clamp01(fx) * 10) / 10, y: Math.round(clamp01(fy) * 10) / 10 };
  }
  return { value: out };
}

/** Clean one value. Returns { value } or { error }. */
function cleanValue(f, v) {
  const max = f.max ?? DEFAULT_MAX[f.type];
  switch (f.type) {
    case 'text': case 'textarea': case 'longtext': case 'combo': {
      if (typeof v !== 'string' && typeof v !== 'number') return { error: 'Please write some text here' };
      let s = String(v).replace(/\r\n?/g, '\n');
      s = f.type === 'longtext' ? s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
        : f.type === 'textarea' ? s.trim() : s.replace(/\s+/g, ' ').trim();
      if (max && s.length > max) return { error: `Too long — please keep it under ${max} characters (now ${s.length})` };
      if (f.pattern && s && !new RegExp(f.pattern).test(s)) return { error: f.patternHelp || 'This is not in the right format' };
      return { value: s };
    }
    case 'slug': {
      const s = slugify(v);
      return { value: s };
    }
    case 'select': {
      const opts = (f.options || []).map((o) => (typeof o === 'string' ? o : o.value));
      const s = v == null ? '' : String(v);
      if (!opts.includes(s)) return { error: 'Please choose one of the options' };
      return { value: s };
    }
    case 'number': {
      const n = num(v);
      if (!Number.isFinite(n)) return { error: 'Please enter a number' };
      if (f.integer && !Number.isInteger(n)) return { error: 'Please enter a whole number' };
      if (f.min != null && n < f.min) return { error: `The smallest allowed is ${f.min}` };
      if (f.max != null && n > f.max) return { error: `The largest allowed is ${f.max}` };
      return { value: n };
    }
    case 'boolean':
      return { value: v === true || v === 'true' || v === 1 || v === '1' };
    case 'datetime': {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return { error: 'Please choose a date and time' };
      if (d.getUTCFullYear() < 1900 || d.getUTCFullYear() > 2200) return { error: 'Please check the year' };
      return { value: d };
    }
    case 'color': {
      const s = String(v).trim();
      if (!/^#[0-9a-f]{6}$/i.test(s)) return { error: 'Please pick a colour' };
      return { value: s.toUpperCase() };
    }
    case 'link': {
      const s = safeLink(v);
      if (!s) return { error: 'Use a page of this site (starting with /) or a full web address (https://…)' };
      if (s.length > max) return { error: 'This link is too long' };
      return { value: s };
    }
    case 'url': {
      const s = safeLink(v, { allowRelative: false });
      if (!s || !/^https?:/i.test(s)) return { error: 'Please paste a full web address starting with https://' };
      if (s.length > max) return { error: 'This link is too long' };
      return { value: s };
    }
    case 'email': {
      const s = String(v).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || s.length > max) return { error: 'Please enter a valid email address' };
      return { value: s };
    }
    case 'youtube': {
      const id = parseYouTubeId(String(v));
      if (!id) return { error: 'This doesn’t look like a YouTube link. Copy it from the Share button on YouTube.' };
      return { value: `https://www.youtube.com/watch?v=${id}` };
    }
    case 'image':
      return cleanImage(v);
    case 'ref': {
      const s = typeof v === 'object' && v?._id ? String(v._id) : String(v);
      if (!isObjectId(s)) return { error: 'Please choose one' };
      return { value: s };
    }
    default:
      return { error: 'Unknown field' };
  }
}

/**
 * Validate a whole item.
 * @returns {{ data: object, errors: Record<string,string> | null }}
 * Errors in list items are keyed like "slides.2.text".
 */
export function validateFields(fields, input, { partial = false, prefix = '' } = {}) {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const data = {};
  const unset = [];
  const errors = {};

  for (const f of fields) {
    // Headings store nothing; hidden fields (order, isClub) are managed by the server only.
    if (f.type === 'heading' || f.hidden) continue;
    const key = prefix + f.name;
    const has = Object.prototype.hasOwnProperty.call(src, f.name);
    if (partial && !has) continue;

    if (isHidden(f, src)) { unset.push(f.name); continue; }
    let v = src[f.name];

    if (f.type === 'list') {
      if (isEmpty(v)) {
        if (f.required) errors[key] = `Please add at least one ${(f.itemLabel || 'item').toLowerCase()}`;
        else unset.push(f.name);
        continue;
      }
      if (!Array.isArray(v)) { errors[key] = 'This should be a list'; continue; }
      if (f.max && v.length > f.max) { errors[key] = `At most ${f.max} ${(f.itemLabel || 'item').toLowerCase()}s, please`; continue; }
      if (f.of === 'text') {
        const items = [];
        v.forEach((item, i) => {
          const s = typeof item === 'string' ? item.replace(/\s+/g, ' ').trim() : '';
          if (!s) return; // quietly drop empty lines
          if (f.itemMax && s.length > f.itemMax) errors[`${key}.${i}`] = `Too long — under ${f.itemMax} characters, please`;
          items.push(s);
        });
        if (!items.length && f.required) errors[key] = `Please add at least one ${(f.itemLabel || 'item').toLowerCase()}`;
        if (items.length) data[f.name] = items; else unset.push(f.name);
      } else {
        const items = [];
        v.forEach((item, i) => {
          const r = validateFields(f.fields, item, { prefix: `${key}.${i}.` });
          if (r.errors) Object.assign(errors, r.errors);
          items.push(r.data);
        });
        data[f.name] = items;
      }
      continue;
    }

    if (isEmpty(v) || (f.type === 'image' && v && !v.media && !v.src)) {
      if (f.required) {
        errors[key] = f.type === 'image' ? 'Please choose a photo'
          : ['select', 'ref', 'datetime'].includes(f.type) ? 'Please choose one'
            : 'This is required';
      } else if (f.type === 'boolean') {
        data[f.name] = false;
      } else {
        unset.push(f.name);
      }
      continue;
    }

    const r = cleanValue(f, v);
    if (r.error) errors[key] = r.error;
    else if (r.value === '' && f.required) errors[key] = 'This is required';
    else if (r.value === '') unset.push(f.name);
    else data[f.name] = r.value;
  }

  return { data, unset, errors: Object.keys(errors).length ? errors : null };
}

/** Fill in defaults for a brand-new item. */
export function defaultsFor(fields) {
  const out = {};
  for (const f of fields) {
    if (f.default === undefined || f.type === 'heading') continue;
    out[f.name] = f.default === 'now' ? new Date().toISOString() : f.default;
  }
  return out;
}

/** Every media id an item points at (deep), for "where is this photo used?". */
export function mediaIdsIn(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => mediaIdsIn(v, out));
  else if (value && typeof value === 'object') {
    if (value.media && (typeof value.media === 'string' || value.media._bsontype || value.media.toHexString)) out.add(String(value.media));
    for (const [k, v] of Object.entries(value)) if (k !== 'media' && v && typeof v === 'object' && !(v instanceof Date) && !v._bsontype) mediaIdsIn(v, out);
  }
  return out;
}
