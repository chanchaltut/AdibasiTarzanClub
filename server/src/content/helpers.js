// Shared bits for the admin routes: media details, "where is this used?", reference checks.

import FileAsset from '../models/FileAsset.js';
import Media from '../models/Media.js';
import Single from '../models/Single.js';
import { contentModel } from '../models/content.js';
import { COLLECTIONS, COLLECTION_MAP, SINGLE_MAP, titleOf } from './schemas.js';
import { fileIdsIn, mediaIdsIn } from './validate.js';
import { fileUrls, urlPattern } from '../services/storage.js';
import { badRequest } from '../utils/http.js';

/** What the admin panel knows about a photo. */
export function mediaPublic(m) {
  return {
    id: String(m._id),
    url: urlPattern(m),
    width: m.width,
    height: m.height,
    bytes: m.bytes,
    originalBytes: m.originalBytes,
    originalName: m.originalName,
    alt: m.alt,
    color: m.color,
    lqip: m.lqip,
    hasAlpha: m.hasAlpha,
    createdAt: m.createdAt,
  };
}

/** Media records for every photo an item uses, keyed by id. */
export async function mediaFor(value) {
  const ids = [...mediaIdsIn(value)];
  if (!ids.length) return {};
  const docs = await Media.find({ _id: { $in: ids } }).lean();
  return Object.fromEntries(docs.map((m) => [String(m._id), mediaPublic(m)]));
}

/** What the admin panel and website know about an uploaded PDF. */
export function filePublic(f) {
  return {
    id: String(f._id),
    ...fileUrls(f),
    bytes: f.bytes,
    pages: f.pages || 0,
    width: f.width || 0,
    height: f.height || 0,
    originalName: f.originalName,
    createdAt: f.createdAt,
  };
}

/** Throw a friendly error if an item points at photos or files that were deleted meanwhile. */
export async function assertMediaExist(value) {
  const ids = [...mediaIdsIn(value)];
  if (ids.length) {
    const found = await Media.countDocuments({ _id: { $in: ids } });
    if (found !== ids.length) throw badRequest('One of the photos was deleted from the library. Please choose it again.');
  }
  const files = [...fileIdsIn(value)];
  if (files.length) {
    const found = await FileAsset.countDocuments({ _id: { $in: files } });
    if (found !== files.length) throw badRequest('The PDF file could not be found. Please upload it again.');
  }
}

/** Titles of referenced items (e.g. team names for matches). */
export async function refTitles(def) {
  const out = {};
  const targets = [...new Set(def.fields.filter((f) => f.type === 'ref').map((f) => f.to))];
  await Promise.all(targets.map(async (to) => {
    const docs = await contentModel(to).find().lean();
    out[to] = Object.fromEntries(docs.map((d) => [String(d._id), { ...d, _title: titleOf(COLLECTION_MAP[to], d) }]));
  }));
  return out;
}

/** Make sure referenced items exist; returns per-field errors. */
export async function checkRefs(def, data) {
  const errors = {};
  await Promise.all(def.fields.filter((f) => f.type === 'ref' && data[f.name]).map(async (f) => {
    const exists = await contentModel(f.to).exists({ _id: data[f.name] });
    if (!exists) errors[f.name] = 'This was deleted — please choose again';
  }));
  return errors;
}

/** Which items point at this one (e.g. matches using a team)? */
export async function incomingRefs(type, id) {
  const hits = [];
  for (const def of COLLECTIONS) {
    const fields = def.fields.filter((f) => f.type === 'ref' && f.to === type);
    if (!fields.length) continue;
    const n = await contentModel(def.key).countDocuments({ $or: fields.map((f) => ({ [f.name]: id })) });
    if (n) hits.push({ area: def.key, label: def.label, singular: def.singular, count: n });
  }
  return hits;
}

/** Every place each photo is used: Map<mediaId, [{area, label, id, title}]> */
export async function mediaUsageMap() {
  const usage = new Map();
  const add = (mid, entry) => {
    if (!usage.has(mid)) usage.set(mid, []);
    usage.get(mid).push(entry);
  };
  await Promise.all(COLLECTIONS.map(async (def) => {
    const docs = await contentModel(def.key).find().lean();
    const refs = def.fields.some((f) => f.type === 'ref') ? await refTitles(def) : {};
    docs.forEach((d) => {
      mediaIdsIn(d).forEach((mid) => add(mid, { area: def.key, label: def.label, id: String(d._id), title: titleOf(def, d, refs), kind: 'collection' }));
    });
  }));
  const singles = await Single.find().lean();
  singles.forEach((s) => {
    const def = SINGLE_MAP[s.key];
    if (!def) return;
    mediaIdsIn(s.data).forEach((mid) => add(mid, { area: s.key, label: def.label, id: s.key, title: def.label, kind: 'single' }));
  });
  return usage;
}

/** Small preview address for a list row. */
export function thumbFor(def, doc, mediaMap) {
  if (!def.imageField) return null;
  if (def.fields.find((f) => f.name === def.imageField)?.type === 'youtube') {
    const id = /[?&]v=([A-Za-z0-9_-]{11})/.exec(doc[def.imageField] || '')?.[1];
    return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
  }
  const v = doc[def.imageField];
  if (!v) return null;
  if (v.media) {
    const m = mediaMap.get(String(v.media));
    return m ? urlPattern(m, v.crop).replace('{w}', '320') : null;
  }
  return v.src || null;
}
