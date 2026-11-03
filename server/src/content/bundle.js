// ─────────────────────────────────────────────────────────────
// The public "content bundle": everything the website shows, in one
// small JSON file, in the shape the React site reads. Built from the
// database once and kept in memory until something changes, so
// visitors never wait on the database.
// ─────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import FileAsset from '../models/FileAsset.js';
import Media from '../models/Media.js';
import Single from '../models/Single.js';
import Translation from '../models/Translation.js';
import { contentModel } from '../models/content.js';
import { COLLECTIONS, SINGLES } from './schemas.js';
import { fileIdsIn, mediaIdsIn } from './validate.js';
import { cropPixels, fileUrls, shareImageUrl, urlPattern } from '../services/storage.js';
import { contentChanged } from '../services/rebuild.js';

export function sortFor(def) {
  if (def.sort) return { ...def.sort, _id: 1 };
  if (def.orderable) return { order: 1, createdAt: 1, _id: 1 };
  return { createdAt: 1, _id: 1 };
}

const iso = (d) => (d ? new Date(d).toISOString() : null);
const paragraphs = (s) => String(s || '').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** Load every published item and the media they use. */
export async function loadAll({ includeHidden = false } = {}) {
  const lists = {};
  await Promise.all(COLLECTIONS.map(async (def) => {
    const filter = def.publishable && !includeHidden ? { published: { $ne: false } } : {};
    lists[def.key] = await contentModel(def.key).find(filter).sort(sortFor(def)).lean();
  }));
  const singleDocs = await Single.find().lean();
  const singles = Object.fromEntries(singleDocs.map((s) => [s.key, s.data || {}]));

  const ids = new Set();
  Object.values(lists).forEach((docs) => mediaIdsIn(docs, ids));
  mediaIdsIn(Object.values(singles), ids);
  const fileIds = fileIdsIn([...Object.values(lists), ...Object.values(singles)]);
  const [media, files] = await Promise.all([
    Media.find({ _id: { $in: [...ids] } }).lean(),
    fileIds.size ? FileAsset.find({ _id: { $in: [...fileIds] } }).lean() : [],
  ]);
  const mediaMap = new Map(media.map((m) => [String(m._id), m]));
  const fileMap = new Map(files.map((f) => [String(f._id), f]));
  const updatedAt = [...singleDocs, ...Object.values(lists).flat()]
    .reduce((max, d) => (d.updatedAt && d.updatedAt > max ? d.updatedAt : max), new Date(0));
  return { lists, singles, mediaMap, fileMap, updatedAt };
}

/** Stored image value → what the site's <Photo> needs. */
export function makeImage(mediaMap) {
  return (v) => {
    if (!v) return null;
    const pos = v.focal ? `${v.focal.x}% ${v.focal.y}%` : undefined;
    if (v.media) {
      const m = mediaMap.get(String(v.media));
      if (!m) return null;
      const px = cropPixels(m, v.crop);
      return compact({
        url: urlPattern(m, v.crop),
        w: px ? px.w : m.width,
        h: px ? px.h : m.height,
        pos,
        alt: v.alt || m.alt || undefined,
        color: m.color || undefined,
        // The blurred preview shows the whole photo, so it's skipped for cropped ones.
        lqip: v.crop ? undefined : m.lqip || undefined,
      });
    }
    if (v.src) return compact({ url: v.src, pos, alt: v.alt || undefined });
    return null;
  };
}

/** Stored file value → what the site needs to show, open and download a PDF. */
function makeFile(fileMap) {
  return (v) => {
    const f = v?.file && fileMap.get(String(v.file));
    if (!f) return null;
    const u = fileUrls(f);
    return compact({
      url: u.url,
      download: u.download,
      thumb: u.thumb && f.width ? { url: u.thumb, w: f.width, h: f.height } : undefined,
      pages: f.pages || undefined,
      bytes: f.bytes,
    });
  };
}

function buildLegacy(l, img) {
  if (!l || l.on === false || !l.title || !l.intro) return null;
  return compact({
    kicker: l.kicker,
    title: l.title,
    tagline: l.tagline,
    years: l.years,
    yearsLabel: l.yearsLabel,
    intro: paragraphs(l.intro),
    occasion: l.occasion,
    photo: img(l.photo),
    sides: [compact({ name: l.sideA, note: l.sideANote }), compact({ name: l.sideB, note: l.sideBNote })],
    winners: (l.winners || [])
      .filter((w) => w.year && w.winner)
      .map((w) => compact({ year: w.year, winner: w.winner, score: w.score, note: w.note }))
      .sort((a, b) => b.year.localeCompare(a.year)),
  });
}

export async function buildBundle() {
  const { lists, singles, mediaMap, fileMap, updatedAt } = await loadAll();
  const img = makeImage(mediaMap);
  const file = makeFile(fileMap);
  const s = singles.settings || {};
  const p = singles.pages || {};
  const id = (d) => String(d._id);

  const TEAMS = Object.fromEntries(lists.teams.map((t) => [id(t), compact({
    name: t.name, short: t.short, crest: img(t.crest), colors: [t.color1 || '#2F4A3A', t.color2 || '#D8C9A3'], isClub: Boolean(t.isClub),
  })]));

  const matches = lists.matches
    .filter((m) => TEAMS[String(m.home)] && TEAMS[String(m.away)])
    .map((m) => compact({
      id: id(m),
      home: String(m.home),
      away: String(m.away),
      date: iso(m.date),
      comp: m.comp,
      round: m.round,
      venue: m.venue,
      entry: m.entry,
      score: Number.isFinite(m.homeScore) && Number.isFinite(m.awayScore) ? [m.homeScore, m.awayScore] : undefined,
    }));

  const pageBanner = (key) => compact({ photo: img(p[`${key}Photo`]), script: p[`${key}Script`], intro: p[`${key}Intro`] });

  const bundle = {
    CLUB: {
      name: s.name || 'Adibasi Tarzan Club',
      short: s.short || 'ATC',
      founded: s.founded || 1981,
      motto: s.motto || '',
      address: s.address || [],
      ground: s.ground || '',
      email: s.email || '',
      phone: s.phone || '',
      coords: { lat: s.lat ?? 25.6293, lng: s.lng ?? 88.2028 },
      maps: compact({ club: s.mapsClub, ground: s.mapsGround }),
      socials: compact({ facebook: s.facebook, instagram: s.instagram, youtube: s.youtube }),
    },
    RIBBON: { enabled: s.ribbonOn !== false && Boolean(s.ribbonText), text: s.ribbonText || '', cta: s.ribbonCta || '', href: s.ribbonLink || '/' },
    PAGES: Object.fromEntries(['club', 'schedule', 'news', 'squad', 'committee', 'gallery', 'membership', 'contact'].map((k) => [k, pageBanner(k)])),
    SLOTS: compact({
      homeMembership: img(p.homeMembership),
      homeCalendar: img(p.homeCalendar),
      homeGallery: img(p.homeGallery),
      homeVideo: img(p.homeVideo),
      clubHeritage: img(p.clubHeritage),
      clubCommunity: img(p.clubCommunity),
    }),
    TEAMS,
    FIXTURES: matches.filter((m) => !m.score).sort((a, b) => a.date.localeCompare(b.date)),
    RESULTS: matches.filter((m) => m.score).sort((a, b) => b.date.localeCompare(a.date)),
    EVENTS: lists.events.map((e) => compact({ id: id(e), title: e.title, kind: e.kind, date: iso(e.date), venue: e.venue, desc: e.desc, photo: img(e.photo) })),
    PROMOS: lists.promos.map((x) => compact({
      id: id(x),
      title: x.title,
      href: x.link || '/',
      photo: x.style === 'photo' ? img(x.photo) : undefined,
      paper: x.style === 'paper' ? compact({ script: x.paperScript, big: x.paperBig, note: x.paperNote, tone: x.paperTone }) : undefined,
    })).filter((x) => x.photo || x.paper),
    STORIES: lists.stories.map((st) => ({
      id: id(st),
      title: st.title,
      cover: img(st.cover),
      slides: (st.slides || []).map((sl) => (sl.kind === 'letter' ? { letter: sl.text } : compact({ photo: img(sl.photo), text: sl.text })))
        .filter((sl) => sl.letter || sl.photo),
    })).filter((st) => st.slides.length && st.cover),
    EXPLORE: lists.explore.map((e) => compact({ id: id(e), title: e.title, desc: e.desc, href: e.link || '/', photo: img(e.photo), art: e.art || 'crest', cta: e.cta })),
    NEWS: lists.news.map((n) => compact({
      id: id(n),
      slug: n.slug,
      title: n.title,
      desc: n.desc,
      tag: n.tag,
      date: iso(n.date),
      updatedAt: iso(n.updatedAt),
      photo: img(n.photo),
      ogImage: n.photo?.media && mediaMap.has(String(n.photo.media)) ? shareImageUrl(mediaMap.get(String(n.photo.media)), n.photo.crop) : undefined,
      body: paragraphs(n.body),
      featured: n.featured || undefined,
    })).filter((n) => n.slug),
    SQUAD: lists.players.map((pl) => compact({
      id: id(pl), no: pl.no, first: pl.first, last: pl.last, pos: pl.pos, squad: pl.squad || 'first-team', captain: pl.captain || undefined, featured: pl.featured || undefined, photo: img(pl.photo),
    })),
    COMMITTEE: lists.committee.map((c) => compact({ id: id(c), role: c.role, name: c.name, photo: img(c.photo) })),
    HONOURS: lists.honours.map((h) => ({ comp: h.comp, count: h.count, unit: h.unit, icon: h.icon || 'cup' })),
    TIMELINE: lists.timeline.map((t) => ({ year: t.year, title: t.title, text: t.text })),
    FAQ: lists.faqs.filter((f) => f.page !== 'membership').map((f) => ({ q: f.q, a: f.a })),
    MEMBER_FAQ: lists.faqs.filter((f) => f.page === 'membership').map((f) => ({ q: f.q, a: f.a })),
    MEMBERSHIP_TIERS: lists.tiers.map((t) => compact({ name: t.name, price: t.price, perks: t.perks || [], featured: t.featured || undefined })),
    GALLERY: lists.gallery.map((g) => compact({ id: id(g), photo: img(g.photo), cap: g.caption, album: g.album })).filter((g) => g.photo),
    VIDEOS: lists.videos.map((v) => {
      const yt = /[?&]v=([A-Za-z0-9_-]{11})/.exec(v.url || '')?.[1];
      return yt && compact({ id: id(v), youtubeId: yt, title: v.title, desc: v.desc, date: iso(v.date), thumb: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` });
    }).filter(Boolean),
    DOCUMENTS: lists.documents.map((d) => compact({
      id: id(d),
      title: d.title,
      kind: d.kind,
      date: iso(d.date),
      desc: d.desc,
      pinned: d.pinned || undefined,
      pdf: d.format === 'pdf' ? file(d.file) : undefined,
      photo: d.format === 'photo' ? img(d.photo) : undefined,
    })).filter((d) => d.pdf || d.photo),
    LEGACY: buildLegacy(singles.legacy, img),
    PARTNERS: lists.partners.map((x) => compact({ id: id(x), name: x.name, logo: img(x.logo), url: x.url, level: x.level })).filter((x) => x.logo),
    I18N: await translationMaps(),
    updatedAt: iso(updatedAt),
  };

  bundle.version = createHash('sha1').update(JSON.stringify(bundle)).digest('hex').slice(0, 16);
  return bundle;
}

async function translationMaps() {
  const rows = await Translation.find({ $or: [{ hi: { $ne: '' } }, { bn: { $ne: '' } }] }).lean();
  const hi = {};
  const bn = {};
  rows.forEach((r) => {
    if (r.hi) hi[r.en] = r.hi;
    if (r.bn) bn[r.en] = r.bn;
  });
  return { hi, bn };
}

// ─── Cache ────────────────────────────────────────────────────
let cached = null;
let building = null;

export async function getBundle() {
  if (cached) return cached;
  if (!building) {
    building = buildBundle()
      .then((b) => { cached = b; return b; })
      .finally(() => { building = null; });
  }
  return building;
}

/** Call after any change to content, settings, media or translations. */
export function contentUpdated() {
  cached = null;
  contentChanged();
}

/** For the Translations screen: every English sentence the site shows from the database. */
export async function translatableStrings() {
  const { lists, singles } = await loadAll({ includeHidden: true });
  const found = new Map();
  const add = (text, where) => {
    if (typeof text !== 'string') return;
    const s = text.trim();
    if (!s || !/[A-Za-z]/.test(s)) return;
    if (!found.has(s)) found.set(s, new Set());
    found.get(s).add(where);
  };
  const walk = (fields, data, where) => {
    for (const f of fields) {
      const v = data?.[f.name];
      if (v == null) continue;
      if (f.type === 'list' && f.fields) (Array.isArray(v) ? v : []).forEach((item) => walk(f.fields, item, where));
      else if (!f.t) continue;
      else if (f.type === 'list') (Array.isArray(v) ? v : []).forEach((x) => add(x, where));
      else if (f.type === 'longtext') paragraphs(v).forEach((x) => add(x, where));
      else add(v, where);
    }
  };
  for (const def of COLLECTIONS) {
    for (const doc of lists[def.key]) {
      const title = typeof def.titleField === 'string' ? doc[def.titleField] : '';
      walk(def.fields, doc, `${def.label}${title ? ` · ${String(title).slice(0, 50)}` : ''}`);
    }
  }
  for (const single of SINGLES) walk(single.fields, singles[single.key], single.label);
  return [...found.entries()].map(([en, where]) => ({ en, where: [...where].slice(0, 3) }));
}
