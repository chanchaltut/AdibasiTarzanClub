// ─────────────────────────────────────────────────────────────
// Fills an empty database with the website's current content
// (client/src/data/defaults.js), so the admin panel starts full.
//
//   npm run seed            → only if the database has no content yet
//   npm run seed -- --force → wipe ALL content and start again
//                             (people and uploaded photos are kept)
// ─────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDb } from '../db.js';
import { contentModel } from '../models/content.js';
import Single from '../models/Single.js';
import { COLLECTION_MAP, SINGLE_MAP } from '../content/schemas.js';
import { defaultsFor, validateFields } from '../content/validate.js';
import { args } from './_cli.js';

const { default: D } = await import('../../../client/src/data/defaults.js');
const force = Boolean(args().force);

/** "/photos/x.webp?v=2" or { url, pos } → stored image value */
function img(v) {
  if (!v) return undefined;
  const url = typeof v === 'string' ? v : v.url;
  const out = { src: url.split('?')[0] };
  const pos = typeof v === 'object' && v.pos ? /^([\d.]+)%\s+([\d.]+)%$/.exec(v.pos) : null;
  if (pos) out.focal = { x: Number(pos[1]), y: Number(pos[2]) };
  return out;
}

function check(key, doc, fields) {
  const { errors } = validateFields(fields, doc);
  if (errors) {
    console.error(`\n✖ Default content for "${key}" doesn't pass the admin rules:`, errors, doc);
    process.exit(1);
  }
}

async function insert(key, docs) {
  const def = COLLECTION_MAP[key];
  docs.forEach((d) => check(key, d, def.fields));
  const withOrder = docs.map((d, i) => ({ ...d, order: d.order ?? i }));
  const created = await contentModel(key).insertMany(withOrder);
  console.log(`  ✓ ${def.label}: ${created.length}`);
  return created;
}

await connectDb(env.MONGODB_URI, { attempts: 2 });

const existing = await Promise.all(Object.keys(COLLECTION_MAP).map((k) => contentModel(k).estimatedDocumentCount()));
const hasContent = existing.some((n) => n > 0) || (await Single.estimatedDocumentCount()) > 0;
if (hasContent && !force) {
  console.log('\nThe database already has content, so nothing was changed.');
  console.log('To wipe all content and start again from the defaults, run:  npm run seed -- --force\n');
  await mongoose.disconnect();
  process.exit(0);
}
if (force) {
  await Promise.all([...Object.keys(COLLECTION_MAP).map((k) => contentModel(k).deleteMany({})), Single.deleteMany({})]);
  console.log('Old content removed.');
}

console.log('\nAdding the starting content…');

// Settings
const C = D.CLUB;
const settings = {
  name: C.name, short: C.short, founded: C.founded, motto: C.motto, address: C.address, ground: C.ground,
  lat: C.coords.lat, lng: C.coords.lng, clubLat: C.clubCoords?.lat, clubLng: C.clubCoords?.lng, mapsClub: C.maps.club, mapsGround: C.maps.ground,
  email: C.email, phone: C.phone || undefined,
  facebook: C.socials.facebook, instagram: C.socials.instagram, youtube: C.socials.youtube,
  ribbonOn: D.RIBBON.enabled !== false, ribbonText: D.RIBBON.text, ribbonCta: D.RIBBON.cta, ribbonLink: D.RIBBON.href,
};
check('settings', settings, SINGLE_MAP.settings.fields);
await Single.create({ key: 'settings', data: validateFields(SINGLE_MAP.settings.fields, settings).data });

const pages = {};
for (const [k, p] of Object.entries(D.PAGES)) {
  pages[`${k}Photo`] = img(p.photo);
  pages[`${k}Script`] = p.script;
  pages[`${k}Intro`] = p.intro;
}
for (const [k, v] of Object.entries(D.SLOTS)) pages[k] = img(v);
check('pages', pages, SINGLE_MAP.pages.fields);
await Single.create({ key: 'pages', data: validateFields(SINGLE_MAP.pages.fields, pages).data });

const L = D.LEGACY;
const legacy = {
  on: true, kicker: L.kicker, title: L.title, tagline: L.tagline, years: L.years, yearsLabel: L.yearsLabel,
  intro: L.intro.join('\n\n'), occasion: L.occasion, photo: L.photo ? img(L.photo) : undefined,
  sideA: L.sides[0].name, sideANote: L.sides[0].note, sideB: L.sides[1].name, sideBNote: L.sides[1].note,
  winners: L.winners,
};
check('legacy', legacy, SINGLE_MAP.legacy.fields);
await Single.create({ key: 'legacy', data: validateFields(SINGLE_MAP.legacy.fields, legacy).data });
await Single.create({ key: 'lettering', data: defaultsFor(SINGLE_MAP.lettering.fields) });
console.log('  ✓ Club details, page banners and Our Legacy');

// Teams first: matches point at them.
const codes = Object.keys(D.TEAMS);
const teams = await insert('teams', codes.map((code) => {
  const t = D.TEAMS[code];
  return { name: t.name, short: t.short, crest: img(t.crest), color1: t.colors?.[0], color2: t.colors?.[1] };
}));
const teamId = Object.fromEntries(codes.map((code, i) => [code, teams[i]._id]));
await contentModel('teams').updateMany({ _id: { $in: codes.filter((c) => D.TEAMS[c].isClub).map((c) => teamId[c]) } }, { $set: { isClub: true, locked: true } });

await insert('matches', [...D.FIXTURES, ...D.RESULTS].map((m) => ({
  home: String(teamId[m.home]), away: String(teamId[m.away]), date: m.date, comp: m.comp, round: m.round, venue: m.venue, entry: m.entry,
  homeScore: m.score?.[0], awayScore: m.score?.[1], published: true,
})));
await insert('events', D.EVENTS.map((e) => ({ title: e.title, kind: e.kind, date: e.date, venue: e.venue, desc: e.desc, photo: img(e.photo), published: true })));
await insert('news', D.NEWS.map((n) => ({
  title: n.title, slug: n.slug, desc: n.desc, tag: n.tag, date: n.date, photo: img(n.photo), body: n.body.join('\n\n'), featured: Boolean(n.featured), published: true,
})));
await insert('promos', D.PROMOS.map((p) => (p.paper
  ? { title: p.title, link: p.href, style: 'paper', paperScript: p.paper.script, paperBig: p.paper.big, paperNote: p.paper.note, paperTone: p.paper.tone || 'light', published: true }
  : { title: p.title, link: p.href, style: 'photo', photo: img(p.photo), published: true })));
await insert('stories', D.STORIES.map((s) => ({
  title: s.title, cover: img(s.cover), published: true,
  slides: s.slides.map((sl) => (sl.letter ? { kind: 'letter', text: sl.letter } : { kind: 'photo', photo: img(sl.photo), text: sl.text })),
})));
await insert('explore', D.EXPLORE.map((e) => ({ title: e.title, desc: e.desc, photo: img(e.photo), art: e.art, cta: e.cta, link: e.href, published: true })));
await insert('players', D.SQUAD.map((p) => ({
  first: p.first, last: p.last, no: p.no, pos: p.pos, squad: p.squad || 'first-team', captain: Boolean(p.captain), featured: Boolean(p.featured), photo: img(p.photo), published: true,
})));
await insert('committee', D.COMMITTEE.map((c) => ({ role: c.role, name: c.name, photo: img(c.photo), published: true })));
await insert('honours', D.HONOURS.map((h) => ({ comp: h.comp, count: h.count, unit: h.unit, icon: h.icon })));
await insert('timeline', D.TIMELINE.map((t) => ({ year: t.year, title: t.title, text: t.text })));
await insert('faqs', [
  ...D.FAQ.map((f) => ({ q: f.q, a: f.a, page: 'club', published: true })),
  ...D.MEMBER_FAQ.map((f) => ({ q: f.q, a: f.a, page: 'membership', published: true })),
]);
await insert('tiers', D.MEMBERSHIP_TIERS.map((t) => ({ name: t.name, price: t.price, perks: t.perks, featured: Boolean(t.featured) })));
await insert('gallery', D.GALLERY.map((g) => ({ photo: img(g.photo), caption: g.cap, album: g.album, published: true })));

console.log('\n✓ Done. Next: create your admin account with  npm run create-admin\n');
await mongoose.disconnect();
