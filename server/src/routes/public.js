import cors from 'cors';
import express, { Router } from 'express';
import { getBundle } from '../content/bundle.js';
import { COLLECTION_MAP, PUBLIC_SIGNUP_FIELDS } from '../content/schemas.js';
import { validateFields } from '../content/validate.js';
import { dbReady } from '../db.js';
import { contentModel } from '../models/content.js';
import { isAllowedOrigin, publicLimiter, signupLimiter, stripDangerousKeys } from '../middleware/security.js';
import { HttpError, badRequest, isObjectId, log } from '../utils/http.js';

const router = Router();

/** Everything the website shows. Cheap to revalidate: unchanged content answers "304 Not Modified". */
router.get('/content', publicLimiter, async (req, res) => {
  if (!dbReady()) throw new HttpError(503, 'Content is temporarily unavailable.');
  const bundle = await getBundle();
  const etag = `"${bundle.version}"`;
  res.set({
    ETag: etag,
    'Cache-Control': 'public, no-cache',
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  if (req.get('if-none-match') === etag) return res.status(304).end();
  return res.json(bundle);
});

router.get('/health', (req, res) => {
  const ok = dbReady();
  res.status(ok ? 200 : 503).json({ ok, db: ok ? 'connected' : 'not connected', time: new Date().toISOString() });
});

// ─── Sign-ups from the website's Registration page ────────────
// Only the club's own website may send them (CORS allow-list + origin check),
// a few per connection, and bots that fill the hidden "website" box are
// quietly thanked and ignored. They land in the admin panel under Sign-ups.

const signupCors = cors({
  origin: (origin, cb) => cb(null, Boolean(origin) && isAllowedOrigin(origin)),
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600,
});

const originOf = (req) => {
  const origin = req.get('origin');
  if (origin) return origin;
  try { return new URL(req.get('referer')).origin; } catch { return null; }
};

const open = { published: { $ne: false }, signup: { $ne: false } };
const later = (d) => d && new Date(d).getTime() > Date.now();

/** The event, programme or tournament being signed up for — only if it is taking sign-ups right now. */
async function findTarget(kindOf, id) {
  if (!isObjectId(id)) return null;
  if (kindOf === 'event') {
    const e = await contentModel('events').findOne({ _id: id, ...open, signup: true }).lean();
    return e && (e.signupBy ? later(e.signupBy) : later(e.date)) ? e.title : null;
  }
  if (kindOf === 'programme') {
    const p = await contentModel('programmes').findOne({ _id: id, ...open }).lean();
    return p ? p.title : null;
  }
  if (kindOf === 'tournament') {
    const x = await contentModel('tournaments').findOne({ _id: id, ...open, signup: true }).lean();
    return x && (x.signupBy ? later(x.signupBy) : later(x.end || x.start)) ? x.name : null;
  }
  return null;
}

router.options('/register', signupCors);
router.post('/register', signupCors, signupLimiter, express.json({ limit: '20kb' }), stripDangerousKeys, async (req, res) => {
  if (!isAllowedOrigin(originOf(req))) throw new HttpError(403, 'Please use the sign-up form on the club website.');
  if (!dbReady()) throw new HttpError(503, 'Sign-ups are closed for a moment. Please try again in a few minutes.');
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (body.website) return res.status(201).json({ ok: true });

  const def = COLLECTION_MAP.registrations;
  const fields = def.fields.filter((f) => PUBLIC_SIGNUP_FIELDS.includes(f.name));
  const { data, errors: found } = validateFields(fields, body);
  const errors = { ...(found || {}) };
  const target = await findTarget(data.kindOf, typeof body.targetId === 'string' ? body.targetId : '');
  if (!target) errors.targetId = 'Please choose an event, programme or tournament that is open for sign-ups';
  if (data.kindOf === 'tournament' && !data.team) errors.team = 'Please write your team’s name';
  if (Object.keys(errors).length) throw badRequest('Some details need attention.', errors);

  await contentModel('registrations').create({ ...data, target, targetId: body.targetId, status: 'new' });
  log.info(`sign-up: ${data.kindOf} · ${target}`);
  return res.status(201).json({ ok: true, target });
});

export default router;
