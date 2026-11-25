// End-to-end tests: a real MongoDB (in memory), the real seed script, the real HTTP server.
// Run with:  npm test

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import sharp from 'sharp';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.DEPLOY_HOOK_URL = '';

const ORIGIN = 'http://localhost:3000';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = promisify(execFile);

let mongo; let server; let base; let mongoose; let User; let hashPassword;

/** Tiny cookie-keeping client. */
function client() {
  let cookie = '';
  const call = async (method, url, body, { origin = ORIGIN, headers = {}, raw = false } = {}) => {
    const h = { ...headers };
    if (origin) h.origin = origin;
    if (cookie) h.cookie = cookie;
    let payload = body;
    if (body && !(body instanceof FormData)) { h['content-type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(base + url, { method, headers: h, body: payload, redirect: 'manual' });
    const set = res.headers.getSetCookie?.() || [];
    set.forEach((c) => {
      const [pair] = c.split(';');
      if (pair.startsWith('atc_admin=')) cookie = pair.endsWith('=') ? '' : pair;
    });
    if (raw) return res;
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, body: json, headers: res.headers };
  };
  return {
    get: (u, o) => call('GET', u, undefined, o),
    post: (u, b, o) => call('POST', u, b, o),
    put: (u, b, o) => call('PUT', u, b, o),
    patch: (u, b, o) => call('PATCH', u, b, o),
    del: (u, o) => call('DELETE', u, undefined, o),
    hasCookie: () => Boolean(cookie),
  };
}

/** Local-storage photo URLs name the default port; point them at the test server. */
const local = (url, w) => url.replace('{w}', String(w)).replace(/^https?:\/\/[^/]+/, base);

async function jpeg(width, height, color = { r: 120, g: 70, b: 30 }) {
  return sharp({ create: { width, height, channels: 3, background: color } })
    .composite([{ input: Buffer.from(`<svg width="${width}" height="${height}"><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 3}" fill="#d99a2b"/></svg>`) }])
    .jpeg({ quality: 95 }).withMetadata({ exif: { IFD0: { Copyright: 'test', Artist: 'GPS-should-be-removed' } } }).toBuffer();
}

async function upload(c, buffers) {
  const form = new FormData();
  buffers.forEach(([buf, name, type = 'image/jpeg']) => form.append('files', new Blob([buf], { type }), name));
  return c.post('/api/admin/media', form);
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();

  // The real seed script, as the developer will run it.
  await run(process.execPath, ['src/scripts/seed.js'], { cwd: root, env: { ...process.env, NODE_ENV: 'development' } });

  const db = await import('../src/db.js');
  await db.connectDb(mongo.getUri());
  mongoose = (await import('mongoose')).default;
  User = (await import('../src/models/User.js')).default;
  ({ hashPassword } = await import('../src/services/passwords.js'));
  await User.syncIndexes();
  for (const name of mongoose.modelNames()) await mongoose.model(name).syncIndexes();
  await User.create({ name: 'Club Owner', email: 'owner@atc.test', role: 'owner', passwordHash: await hashPassword('brown and gold forever') });

  const { createApp } = await import('../src/app.js');
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await mongoose?.disconnect();
  await mongo?.stop();
});

describe('public website content', () => {
  test('seeded content comes back in the shape the site reads', async () => {
    const c = client();
    const { status, body, headers } = await c.get('/api/public/content', { origin: null });
    assert.equal(status, 200);
    assert.equal(headers.get('access-control-allow-origin'), '*');
    for (const k of ['CLUB', 'RIBBON', 'PAGES', 'SLOTS', 'TEAMS', 'FIXTURES', 'RESULTS', 'EVENTS', 'PROMOS', 'STORIES', 'EXPLORE', 'NEWS', 'SQUAD', 'COMMITTEE', 'MEMBERS', 'HONOURS', 'TIMELINE', 'FAQ', 'MEMBER_FAQ', 'MEMBERSHIP_TIERS', 'GALLERY', 'VIDEOS', 'DOCUMENTS', 'LEGACY', 'PARTNERS', 'I18N', 'version']) {
      assert.ok(k in body, `missing ${k}`);
    }
    assert.equal(body.NEWS.length, 8);
    assert.equal(body.NEWS[0].slug, 'annual-cup-2026-registration');
    assert.ok(Array.isArray(body.NEWS[0].body) && body.NEWS[0].body.length === 4);
    assert.equal(body.SQUAD.length, 16);
    assert.equal(body.SQUAD[0].no, 10, 'home slider order kept');
    assert.equal(body.RESULTS.length, 3);
    assert.deepEqual(body.RESULTS[0].score, [3, 1]);
    const club = Object.values(body.TEAMS).find((t) => t.isClub);
    assert.equal(club.short, 'ATC');
    assert.equal(body.PAGES.gallery.photo.pos, '50% 70%');
    assert.equal(body.MEMBER_FAQ.length, 3);
    assert.equal(body.STORIES[2].slides[1].letter.startsWith('Sixteen teams'), true);
    assert.equal(body.LEGACY.title, 'Our Legacy');
    assert.deepEqual(body.LEGACY.sides.map((x) => x.name), ['Married Boys', 'Unmarried Boys']);
    assert.ok(body.LEGACY.intro.length >= 2);
    assert.deepEqual(body.DOCUMENTS, []);

    const again = await c.get('/api/public/content', { origin: null, headers: { 'if-none-match': headers.get('etag') } });
    assert.equal(again.status, 304);
  });

  test('health check', async () => {
    const { status, body } = await client().get('/api/public/health');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });
});

describe('signing in and security', () => {
  test('admin API needs a session', async () => {
    const { status } = await client().get('/api/admin/schema');
    assert.equal(status, 401);
    const session = await client().get('/api/auth/session');
    assert.equal(session.status, 200);
    assert.equal(session.body.user, null);
  });

  test('changes from other websites are refused', async () => {
    const c = client();
    const r1 = await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' }, { origin: 'https://evil.example' });
    assert.equal(r1.status, 403);
    const r2 = await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' }, { origin: null });
    assert.equal(r2.status, 403);
  });

  test('wrong password gives one vague message; right one signs in', async () => {
    const c = client();
    const bad = await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'nope nope nope' });
    assert.equal(bad.status, 401);
    const unknown = await c.post('/api/auth/login', { email: 'nobody@atc.test', password: 'nope nope nope' });
    assert.equal(unknown.body.error, bad.body.error);
    const ok = await c.post('/api/auth/login', { email: 'OWNER@atc.test ', password: 'brown and gold forever' });
    assert.equal(ok.status, 200);
    assert.ok(c.hasCookie());
    assert.equal(ok.body.user.role, 'owner');
    assert.equal(ok.body.user.passwordHash, undefined);
  });

  test('account locks after repeated wrong passwords', async () => {
    await User.create({ name: 'Locky', email: 'lock@atc.test', passwordHash: await hashPassword('correct horse battery') });
    const c = client();
    let last;
    for (let i = 0; i < 8; i++) last = await c.post('/api/auth/login', { email: 'lock@atc.test', password: `wrong-${i}-xxxxx` });
    assert.match(last.body.error, /locked/);
    const right = await c.post('/api/auth/login', { email: 'lock@atc.test', password: 'correct horse battery' });
    assert.equal(right.status, 429);
  });

  test('"$" keys in a request are stripped', async () => {
    const c = client();
    const r = await c.post('/api/auth/login', { email: { $ne: '' }, password: { $ne: '' } });
    assert.equal(r.status, 400);
  });
});

describe('content editing', () => {
  const c = client();
  let photo;

  before(async () => {
    await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' });
  });

  test('schema lists every section with layman labels', async () => {
    const { status, body } = await c.get('/api/admin/schema');
    assert.equal(status, 200);
    assert.ok(body.collections.find((x) => x.key === 'news').fields.find((f) => f.name === 'photo').help);
    assert.ok(body.singles.find((s) => s.key === 'pages'));
  });

  test('photo upload: shrunk, straightened, cleaned and saved as WebP', async () => {
    const big = await jpeg(4000, 3000);
    const r = await upload(c, [[big, 'IMG_2041.JPG']]);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    [photo] = r.body.items;
    assert.equal(photo.width, 2560);
    assert.equal(photo.height, 1920);
    assert.ok(photo.bytes < big.length, 'smaller than the original');
    assert.equal(photo.originalBytes, big.length);
    assert.match(photo.lqip, /^data:image\/webp;base64,/);
    assert.match(photo.color, /^#[0-9a-f]{6}$/);

    // The stored file really is WebP, with no EXIF left in it.
    const file = await fetch(local(photo.url, 2560));
    assert.equal(file.headers.get('content-type'), 'image/webp');
    const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.exif, undefined);
  });

  test('non-images and fake images are refused with a clear message', async () => {
    const r = await upload(c, [[Buffer.from('<script>alert(1)</script>'), 'cute.jpg']]);
    assert.equal(r.status, 400);
    assert.match(r.body.failed[0].error, /not a photo/i);
    const svg = await upload(c, [[Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'), 'logo.svg', 'image/svg+xml']]);
    assert.equal(svg.status, 400);
    assert.match(svg.body.failed[0].error, /SVG/);
  });

  test('a batch with one bad file still saves the good ones', async () => {
    const r = await upload(c, [[await jpeg(800, 600), 'good.jpg'], [Buffer.from('nope'), 'bad.jpg']]);
    assert.equal(r.status, 201);
    assert.equal(r.body.items.length, 1);
    assert.equal(r.body.failed.length, 1);
  });

  test('required fields come back as plain-English errors per field', async () => {
    const r = await c.post('/api/admin/c/news', { desc: '', title: '' });
    assert.equal(r.status, 400);
    assert.equal(r.body.details.title, 'This is required');
    assert.equal(r.body.details.photo, 'Please choose a photo');
  });

  test('unsafe links are refused', async () => {
    const r = await c.post('/api/admin/c/promos', { title: 'x', link: 'javascript:alert(1)', style: 'paper', paperBig: 'Hi' });
    assert.equal(r.status, 400);
    assert.ok(r.body.details.link);
  });

  let newsId; let updatedAt;
  test('news with a cropped photo and focus point reaches the website', async () => {
    const r = await c.post('/api/admin/c/news', {
      title: 'Floodlights switched on at last',
      desc: 'The new lights are up.',
      tag: 'Club',
      date: '2026-10-30T18:00:00+05:30',
      photo: { media: photo.id, crop: { x: 10, y: 20, w: 50, h: 40 }, focal: { x: 30, y: 25 }, alt: 'Lights' },
      body: 'First paragraph.\n\n\n\nSecond paragraph\nwith a line break.',
      featured: true,
      published: true,
      sneaky: 'dropped',
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.item.slug, 'floodlights-switched-on-at-last');
    assert.equal(r.body.item.sneaky, undefined);
    assert.ok(r.body.media[photo.id]);
    newsId = r.body.item._id;
    updatedAt = r.body.item.updatedAt;

    const { body } = await client().get('/api/public/content');
    const n = body.NEWS.find((x) => x.id === newsId);
    assert.ok(n);
    assert.deepEqual(n.body, ['First paragraph.', 'Second paragraph with a line break.']);
    assert.equal(n.photo.pos, '30% 25%');
    assert.equal(n.photo.w, 1280);
    assert.equal(n.photo.h, 768);
    assert.match(n.photo.url, /c=256,384,1280,768/);
    assert.equal(n.photo.lqip, undefined, 'no blurred preview of the uncropped photo');

    // The crop really is applied when the photo is fetched.
    const file = await fetch(local(n.photo.url, 640));
    const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    assert.equal(meta.width, 640);
    assert.equal(meta.height, 384);
  });

  test('same headline twice gets its own web address', async () => {
    const r = await c.post('/api/admin/c/news', { title: 'Floodlights switched on at last', desc: 'again', tag: 'Club', date: new Date().toISOString(), photo: { media: photo.id }, published: false });
    assert.equal(r.status, 201);
    assert.equal(r.body.item.slug, 'floodlights-switched-on-at-last-2');
    const pub = await client().get('/api/public/content');
    assert.ok(!pub.body.NEWS.some((x) => x.id === r.body.item._id), 'hidden items stay off the website');
  });

  test('two people editing: the second, older save is stopped', async () => {
    const first = await c.get(`/api/admin/c/news/${newsId}`);
    const item = { ...first.body.item, _updatedAt: updatedAt, title: 'Edited once' };
    const ok = await c.put(`/api/admin/c/news/${newsId}`, item);
    assert.equal(ok.status, 200);
    const stale = await c.put(`/api/admin/c/news/${newsId}`, { ...item, title: 'Edited from an old tab' });
    assert.equal(stale.status, 409);
    assert.equal(stale.body.code, 'STALE');
  });

  test('a photo in use can’t be deleted; once unused it can', async () => {
    const blocked = await c.del(`/api/admin/media/${photo.id}`);
    assert.equal(blocked.status, 409);
    assert.ok(blocked.body.details.usedIn.length >= 1);

    const list = await c.get('/api/admin/c/news?limit=500');
    for (const n of list.body.items.filter((x) => x.photo?.media === photo.id)) {
      const { body } = await c.get(`/api/admin/c/news/${n._id}`);
      const put = await c.put(`/api/admin/c/news/${n._id}`, { ...body.item, _updatedAt: body.item.updatedAt, photo: { src: '/photos/hero.webp' } });
      assert.equal(put.status, 200, JSON.stringify(put.body));
    }
    const ok = await c.del(`/api/admin/media/${photo.id}`);
    assert.equal(ok.status, 200);
  });

  test('teams used in matches, and our own club, can’t be deleted', async () => {
    const { body } = await c.get('/api/admin/c/teams');
    const ours = body.items.find((t) => t.isClub);
    const r1 = await c.del(`/api/admin/c/teams/${ours._id}`);
    assert.equal(r1.status, 409);
    const other = body.items.find((t) => t.short === 'Raiganj');
    const r2 = await c.del(`/api/admin/c/teams/${other._id}`);
    assert.equal(r2.status, 409);
    assert.match(r2.body.error, /match/);
  });

  test('editing our club keeps it marked as our club', async () => {
    const { body } = await c.get('/api/admin/c/teams');
    const ours = body.items.find((t) => t.isClub);
    const full = await c.get(`/api/admin/c/teams/${ours._id}`);
    const r = await c.put(`/api/admin/c/teams/${ours._id}`, { ...full.body.item, _updatedAt: full.body.item.updatedAt, short: 'ATC' });
    assert.equal(r.status, 200);
    assert.equal(r.body.item.isClub, true);
  });

  test('match rules: no team plays itself, both scores or none', async () => {
    const { body } = await c.get('/api/admin/c/teams');
    const [a, b] = body.items;
    const same = await c.post('/api/admin/c/matches', { home: a._id, away: a._id, date: '2026-12-01T15:00:00+05:30', comp: 'Friendly', venue: 'X' });
    assert.ok(same.body.details.away);
    const half = await c.post('/api/admin/c/matches', { home: a._id, away: b._id, date: '2026-12-01T15:00:00+05:30', comp: 'Friendly', venue: 'X', homeScore: 2 });
    assert.ok(half.body.details.awayScore);
    const ok = await c.post('/api/admin/c/matches', { home: a._id, away: b._id, date: '2025-12-01T15:00:00+05:30', comp: 'Friendly', venue: 'X', homeScore: 2, awayScore: 0 });
    assert.equal(ok.status, 201);
  });

  test('re-ordering moves an item to the top', async () => {
    const { body } = await c.get('/api/admin/c/committee');
    const last = body.items.at(-1);
    const r = await c.post(`/api/admin/c/committee/${last._id}/move`, { to: 'top' });
    assert.equal(r.status, 200);
    const after = await c.get('/api/admin/c/committee');
    assert.equal(after.body.items[0]._id, last._id);
  });

  test('YouTube links in all their shapes', async () => {
    const { parseYouTubeId } = await import('../src/services/youtube.js');
    for (const u of ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10', 'youtube.com/shorts/dQw4w9WgXcQ', 'https://m.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ']) {
      assert.equal(parseYouTubeId(u), 'dQw4w9WgXcQ', u);
    }
    assert.equal(parseYouTubeId('https://vimeo.com/123'), null);
    const r = await c.post('/api/admin/c/videos', { url: 'https://youtu.be/dQw4w9WgXcQ?si=x', title: 'Highlights', published: true });
    assert.equal(r.status, 201);
    const pub = await client().get('/api/public/content');
    assert.equal(pub.body.VIDEOS[0].youtubeId, 'dQw4w9WgXcQ');
  });

  test('settings pages save and validate', async () => {
    const { body } = await c.get('/api/admin/s/settings');
    const bad = await c.put('/api/admin/s/settings', { ...body.item, email: 'not-an-email' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details.email);
    const ok = await c.put('/api/admin/s/settings', { ...body.item, ribbonText: 'New message on top' });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    const pub = await client().get('/api/public/content');
    assert.equal(pub.body.RIBBON.text, 'New message on top');
  });

  test('club office and ground each get their own map pin', async () => {
    const { body } = await c.get('/api/admin/s/settings');
    const half = await c.put('/api/admin/s/settings', { ...body.item, clubLat: 25.61 });
    assert.equal(half.status, 400);
    assert.ok(half.body.details.clubLng);
    const ok = await c.put('/api/admin/s/settings', { ...body.item, lat: 25.6293, lng: 88.2028, clubLat: 25.611, clubLng: 88.199 });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    let pub = await client().get('/api/public/content');
    assert.deepEqual(pub.body.CLUB.coords, { lat: 25.6293, lng: 88.2028 });
    assert.deepEqual(pub.body.CLUB.clubCoords, { lat: 25.611, lng: 88.199 });
    const { clubLat, clubLng, ...rest } = ok.body.item;
    const cleared = await c.put('/api/admin/s/settings', rest);
    assert.equal(cleared.status, 200, JSON.stringify(cleared.body));
    pub = await client().get('/api/public/content');
    assert.equal(pub.body.CLUB.clubCoords, undefined);
  });

  test('fonts & lettering: only offered fonts, sent to the website', async () => {
    const { body } = await c.get('/api/admin/s/lettering');
    assert.equal(body.item.handFont, 'homemade-apple');
    const bad = await c.put('/api/admin/s/lettering', { ...body.item, handFont: 'comic-sans' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details.handFont);
    assert.equal(body.item.displayFont, 'barlow-condensed');
    const ok = await c.put('/api/admin/s/lettering', {
      ...body.item, handFont: 'caveat', handBold: true, scriptFont: 'great-vibes', nameStyle: 'serif', nameSize: 'large', nameBold: true,
      displayFont: 'oswald', serifFont: 'eb-garamond', serifSize: 'large', memberNameStyle: 'hand', playerNameSize: 'xl',
    });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    const pub = await client().get('/api/public/content');
    const { sized, ...serif } = pub.body.LETTERING.serif;
    assert.deepEqual({ ...pub.body.LETTERING, serif }, {
      display: { family: 'ATC Oswald' },
      body: { family: 'Barlow' },
      serif: { family: 'ATC EB Garamond' },
      script: { family: 'ATC Great Vibes', boldWeight: 400, bold: false },
      hand: { family: 'ATC Caveat', boldWeight: 700, bold: true },
      names: { style: 'serif', size: 'large', bold: true },
      playerNames: { style: 'display', size: 'xl', bold: false },
      memberNames: { style: 'hand', size: 'normal', bold: false },
    });
    // A font at any size but "Normal" comes with its files, to be redrawn at that size.
    assert.equal(sized.adjust, 114.5);
    assert.ok(sized.faces.some(([file, , style]) => file === 'eb-garamond-400-italic-latin.woff2' && style === 'italic'));
  });

  test('translations appear on the website', async () => {
    const list = await c.get('/api/admin/translations');
    assert.ok(list.body.items.some((i) => i.en === 'New message on top'));
    const r = await c.put('/api/admin/translations', { en: 'New message on top', hi: 'शीर्ष पर नया संदेश', bn: '' });
    assert.equal(r.status, 200);
    const pub = await client().get('/api/public/content');
    assert.equal(pub.body.I18N.hi['New message on top'], 'शीर्ष पर नया संदेश');
  });

  test('Notice Board: a PDF letter is uploaded, saved and offered on the website', async () => {
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Page >> endobj\n%%EOF\n', 'latin1');
    const fake = new FormData();
    fake.append('file', new Blob([Buffer.from('not really a pdf')], { type: 'application/pdf' }), 'letter.pdf');
    const refused = await c.post('/api/admin/files', fake);
    assert.equal(refused.status, 400);
    assert.match(refused.body.error, /not a PDF/);

    const form = new FormData();
    form.append('file', new Blob([pdf], { type: 'application/pdf' }), 'Invitation 2026.pdf');
    const up = await c.post('/api/admin/files', form);
    assert.equal(up.status, 201, JSON.stringify(up.body));
    assert.equal(up.body.item.pages, 1);
    assert.equal(up.body.item.originalName, 'Invitation 2026.pdf');

    const missing = await c.post('/api/admin/c/documents', { title: 'Invitation', kind: 'Invitation', date: '2026-10-01T10:00:00Z', format: 'pdf' });
    assert.equal(missing.status, 400);
    assert.ok(missing.body.details.file);

    const made = await c.post('/api/admin/c/documents', {
      title: 'Invitation — Married vs Unmarried, Dussehra 2026', kind: 'Invitation', date: '2026-10-01T10:00:00Z',
      format: 'pdf', file: { file: up.body.item.id }, photo: { media: photo?.id }, pinned: true, published: true,
    });
    assert.equal(made.status, 201, JSON.stringify(made.body));
    assert.equal(made.body.item.photo, undefined, 'the hidden photo field is not stored');

    const pub = await client().get('/api/public/content');
    const doc = pub.body.DOCUMENTS[0];
    assert.equal(doc.title, 'Invitation — Married vs Unmarried, Dussehra 2026');
    assert.equal(doc.pdf.pages, 1);
    const open = await fetch(local(doc.pdf.url));
    assert.equal(open.headers.get('content-type'), 'application/pdf');
    assert.ok((await open.text()).startsWith('%PDF-'));
    const dl = await fetch(local(doc.pdf.download));
    assert.match(dl.headers.get('content-disposition'), /attachment/);
  });

  test('Our Legacy saves, validates past results and can be hidden', async () => {
    const { body } = await c.get('/api/admin/s/legacy');
    const bad = await c.put('/api/admin/s/legacy', { ...body.item, winners: [{ year: '25', winner: 'a' }] });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details['winners.0.year']);
    const ok = await c.put('/api/admin/s/legacy', { ...body.item, winners: [{ year: '2024', winner: 'b', score: '2–1' }, { year: '2025', winner: 'a' }] });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    let pub = await client().get('/api/public/content');
    assert.deepEqual(pub.body.LEGACY.winners.map((w) => w.year), ['2025', '2024']);
    await c.put('/api/admin/s/legacy', { ...ok.body.item, on: false });
    pub = await client().get('/api/public/content');
    assert.equal(pub.body.LEGACY, null);
  });

  test('dashboard summarises everything', async () => {
    const { status, body } = await c.get('/api/admin/dashboard');
    assert.equal(status, 200);
    assert.equal(body.counts.news, 10);
    assert.ok(body.recent.length > 0);
    assert.ok(body.translations.total > 0);
    assert.ok(Array.isArray(body.translations.untranslated));
  });
});

describe('events & participations, gallery sections, members', () => {
  const c = client();
  const soon = (days) => new Date(Date.now() + days * 864e5).toISOString();
  let eventId; let programmeId; let tournamentId;

  before(async () => {
    await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' });
    const ev = await c.post('/api/admin/c/events', { title: 'Sports Day test', kind: 'Sports Day', date: soon(10), venue: 'S. Akhanagar Ground', signup: true, published: true });
    assert.equal(ev.status, 201, JSON.stringify(ev.body));
    eventId = ev.body.item._id;
    const pg = await c.post('/api/admin/c/programmes', { title: 'Youth coaching test', desc: 'Mornings at the ground.', signup: true, published: true });
    assert.equal(pg.status, 201, JSON.stringify(pg.body));
    programmeId = pg.body.item._id;
    const teams = (await c.get('/api/admin/c/teams/options')).body.options;
    const tm = await c.post('/api/admin/c/tournaments', {
      name: 'ATC Annual Cup Test', comp: 'ATC Annual Cup', start: soon(20), end: soon(40), venue: 'S. Akhanagar Ground', signup: true, published: true,
      schedule: [{ stage: 'Final', from: soon(40) }, { stage: 'Opening match', from: soon(20) }],
      teams: [{ team: teams[0].value, group: 'Group A' }, { team: teams[1].value, group: 'Group A' }],
    });
    assert.equal(tm.status, 201, JSON.stringify(tm.body));
    tournamentId = tm.body.item._id;
  });

  test('seeded sections reach the website: match info, tournaments, programmes, gallery sections', async () => {
    const { body } = await client().get('/api/public/content');
    assert.ok(body.MATCH_INFO.length >= 2);
    assert.ok(body.MATCH_INFO.some((x) => x.match && body.FIXTURES.some((f) => f.id === x.match)), 'match updates link to their fixture');
    assert.ok(body.FIXTURES.some((f) => f.status === 'postponed' && f.statusNote));
    assert.ok(body.FIXTURES.some((f) => f.reporting));
    assert.ok(body.PROGRAMMES.length >= 3);
    const cup = body.TOURNAMENTS.find((x) => x.id === tournamentId);
    assert.deepEqual(cup.schedule.map((st) => st.stage), ['Opening match', 'Final'], 'stages sorted by date');
    assert.equal(cup.teams.length, 2);
    assert.ok(body.GALLERY.every((g) => ['football', 'celebrations', 'heritage', 'family'].includes(g.section)));
    for (const k of ['football', 'celebrations', 'heritage', 'family', 'tournaments', 'register', 'crest']) assert.ok(k in body.PAGES || ['football', 'celebrations', 'heritage', 'family'].includes(k));
    assert.ok(!('REGISTRATIONS' in body) && !JSON.stringify(body).includes('kindOf'), 'sign-ups are never public');
  });

  test('gallery photos from before the sections get a section and the new album name', async () => {
    const Gallery = mongoose.model('C_gallery');
    const photo = { src: '/photos/match-action.webp' };
    const { insertedId } = await Gallery.collection.insertOne({ photo, caption: 'Old photo', album: 'Heritage Night', published: true, order: 99 });
    const opened = await c.get(`/api/admin/c/gallery/${insertedId}`);
    assert.deepEqual([opened.body.item.section, opened.body.item.album], ['heritage', 'Cultural Programme'], 'opens in the admin already placed');
    const bad = await c.post('/api/admin/c/gallery', { photo, caption: 'No section', section: 'nowhere' });
    assert.equal(bad.status, 400);
    const ok = await c.post('/api/admin/c/gallery', { photo, caption: 'Kali Puja night', section: 'celebrations', album: 'Kali Puja', published: true });
    assert.equal(ok.status, 201, JSON.stringify(ok.body));
    const { body } = await client().get('/api/public/content');
    const old = body.GALLERY.find((g) => g.cap === 'Old photo');
    assert.equal(old.section, 'heritage');
    assert.equal(old.album, 'Cultural Programme');
    const puja = body.GALLERY.find((g) => g.cap === 'Kali Puja night');
    assert.deepEqual([puja.section, puja.album], ['celebrations', 'Kali Puja']);
  });

  test('members remembered In Memoriam are marked, with their years', async () => {
    const r = await c.post('/api/admin/c/members', { name: 'Founder Test', kind: 'Founding Member', memoriam: true, years: '1950 – 2018', tribute: 'One of the first', published: true });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    const a = await c.post('/api/admin/c/members', { name: 'Active Test', kind: 'Member', years: 'ignored', published: true });
    assert.equal(a.status, 201);
    const { body } = await client().get('/api/public/content');
    const f = body.MEMBERS.find((m) => m.name === 'Founder Test');
    assert.deepEqual([f.memoriam, f.years, f.tribute], [true, '1950 – 2018', 'One of the first']);
    const m = body.MEMBERS.find((x) => x.name === 'Active Test');
    assert.equal(m.memoriam, undefined);
    assert.equal(m.years, undefined, 'years only kept for members in memoriam');
  });

  test('a visitor signs up for an event; it lands in Sign-ups, never on the website', async () => {
    const visitor = client();
    const r = await visitor.post('/api/public/register', { kindOf: 'event', targetId: eventId, name: 'Rina Murmu', phone: '98765 43210', place: 'S. Akhanagar', people: 3 });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.target, 'Sports Day test');
    assert.equal(r.headers.get('access-control-allow-origin'), ORIGIN);
    const list = await c.get('/api/admin/c/registrations');
    const item = list.body.items.find((x) => x.name === 'Rina Murmu');
    assert.ok(item);
    assert.deepEqual([item.status, item.kindOf, item.target, item.people], ['new', 'event', 'Sports Day test', 3]);
    const dash = await c.get('/api/admin/dashboard');
    assert.ok(dash.body.newSignups >= 1);
  });

  test('sign-ups: programmes, tournaments need a team name, closed or unknown targets are refused', async () => {
    const v = client();
    const p = await v.post('/api/public/register', { kindOf: 'programme', targetId: programmeId, name: 'Young Player', phone: '+91 90000 00000', age: 12 });
    assert.equal(p.status, 201, JSON.stringify(p.body));
    const noTeam = await v.post('/api/public/register', { kindOf: 'tournament', targetId: tournamentId, name: 'Manager', phone: '90000 00001' });
    assert.equal(noTeam.status, 400);
    assert.ok(noTeam.body.details.team);
    const team = await v.post('/api/public/register', { kindOf: 'tournament', targetId: tournamentId, name: 'Manager', phone: '90000 00001', team: 'Kunore Sporting' });
    assert.equal(team.status, 201, JSON.stringify(team.body));
    const badPhone = await v.post('/api/public/register', { kindOf: 'event', targetId: eventId, name: 'X', phone: 'call me' });
    assert.equal(badPhone.status, 400);
    assert.ok(badPhone.body.details.phone);
    await c.patch(`/api/admin/c/events/${eventId}`, { published: false });
    const hidden = await v.post('/api/public/register', { kindOf: 'event', targetId: eventId, name: 'Late', phone: '90000 00002' });
    assert.equal(hidden.status, 400);
    assert.ok(hidden.body.details.targetId);
    const wrongKind = await v.post('/api/public/register', { kindOf: 'event', targetId: programmeId, name: 'Mixed', phone: '90000 00003' });
    assert.equal(wrongKind.status, 400);
  });

  test('sign-ups from other websites are refused; bots filling the hidden box are ignored', async () => {
    const other = await client().post('/api/public/register', { kindOf: 'programme', targetId: programmeId, name: 'Spam', phone: '90000 00009' }, { origin: 'https://evil.example' });
    assert.equal(other.status, 403);
    const before = (await c.get('/api/admin/c/registrations')).body.total;
    const bot = await client().post('/api/public/register', { kindOf: 'programme', targetId: programmeId, name: 'Bot', phone: '90000 00010', website: 'http://spam' });
    assert.equal(bot.status, 201);
    assert.equal((await c.get('/api/admin/c/registrations')).body.total, before);
    const preflight = await fetch(`${base}/api/public/register`, { method: 'OPTIONS', headers: { origin: ORIGIN, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });
    assert.equal(preflight.headers.get('access-control-allow-origin'), ORIGIN);
  });

  test('match ref options name the teams and date', async () => {
    const { body } = await c.get('/api/admin/c/matches/options');
    assert.ok(body.options.length > 0);
    assert.ok(body.options.every((o) => !o.label.includes('?')), JSON.stringify(body.options[0]));
    assert.match(body.options[0].label, / vs .+ · \d{1,2} \w{3} \d{4}$/);
  });
});

describe('people and permissions', () => {
  const owner = client();
  const editor = client();

  before(async () => {
    await owner.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' });
  });

  test('owner adds an editor with a temporary password', async () => {
    const weak = await owner.post('/api/admin/users', { name: 'Ed', email: 'ed@atc.test', password: '123' });
    assert.equal(weak.status, 400);
    const r = await owner.post('/api/admin/users', { name: 'Ed Itor', email: 'ed@atc.test', role: 'editor', password: 'temporary pass 2026' });
    assert.equal(r.status, 201);
    assert.equal(r.body.item.mustChangePassword, true);
  });

  test('editor must choose a password first, and cannot manage people', async () => {
    await editor.post('/api/auth/login', { email: 'ed@atc.test', password: 'temporary pass 2026' });
    const blocked = await editor.get('/api/admin/schema');
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.code, 'PASSWORD_CHANGE_REQUIRED');
    const changed = await editor.post('/api/auth/password', { current: 'temporary pass 2026', next: 'my own secret phrase' });
    assert.equal(changed.status, 200, JSON.stringify(changed.body));
    assert.equal((await editor.get('/api/admin/schema')).status, 200);
    assert.equal((await editor.get('/api/admin/users')).status, 403);
  });

  test('the last owner can’t remove themselves', async () => {
    const me = await owner.get('/api/auth/me');
    const r = await owner.del(`/api/admin/users/${me.body.user.id}`);
    assert.equal(r.status, 400);
  });

  test('switching someone off signs them out immediately', async () => {
    const list = await owner.get('/api/admin/users');
    const ed = list.body.items.find((u) => u.email === 'ed@atc.test');
    await owner.patch(`/api/admin/users/${ed.id}`, { active: false });
    assert.equal((await editor.get('/api/admin/schema')).status, 401);
  });

  test('sign out clears the session', async () => {
    const c = client();
    await c.post('/api/auth/login', { email: 'owner@atc.test', password: 'brown and gold forever' });
    await c.post('/api/auth/logout', {});
    assert.equal((await c.get('/api/admin/schema')).status, 401);
  });
});
