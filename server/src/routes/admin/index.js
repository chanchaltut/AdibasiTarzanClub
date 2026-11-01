import { Router } from 'express';
import Activity from '../../models/Activity.js';
import Media from '../../models/Media.js';
import Translation from '../../models/Translation.js';
import User from '../../models/User.js';
import { contentModel } from '../../models/content.js';
import { COLLECTIONS, schemaForAdmin } from '../../content/schemas.js';
import { refTitles } from '../../content/helpers.js';
import { translatableStrings } from '../../content/bundle.js';
import { requireAuth, requirePasswordChosen } from '../../middleware/auth.js';
import { adminLimiter } from '../../middleware/security.js';
import { rebuildStatus, run as runRebuild } from '../../services/rebuild.js';
import { storageKind, storageUsage } from '../../services/storage.js';
import { lookupYouTube } from '../../services/youtube.js';
import { record } from '../../services/audit.js';
import env from '../../config/env.js';
import collections from './collections.js';
import singles from './singles.js';
import media from './media.js';
import translations from './translations.js';
import users from './users.js';

const router = Router();
router.use(adminLimiter, requireAuth, requirePasswordChosen);

router.get('/schema', (req, res) => {
  res.set('Cache-Control', 'private, max-age=300');
  res.json({ ...schemaForAdmin(), storage: storageKind(), siteUrl: env.CLIENT_URL });
});

router.get('/dashboard', async (req, res) => {
  const now = new Date();
  const [counts, mediaAgg, recent, strings, saved, users, needScore, nextMatch] = await Promise.all([
    Promise.all(COLLECTIONS.map(async (def) => [def.key, await contentModel(def.key).estimatedDocumentCount()])),
    Media.aggregate([{ $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$bytes' }, original: { $sum: '$originalBytes' } } }]),
    Activity.find().sort({ at: -1 }).limit(12).lean(),
    translatableStrings(),
    Translation.find().lean(),
    User.countDocuments({ active: true }),
    contentModel('matches').find({ date: { $lt: new Date(now - 2 * 36e5) }, homeScore: { $exists: false }, published: { $ne: false } }).sort({ date: -1 }).limit(10).lean(),
    contentModel('matches').findOne({ date: { $gt: now }, published: { $ne: false } }).sort({ date: 1 }).lean(),
  ]);
  const done = new Map(saved.map((t) => [t.en, t]));
  // The panel also knows the translations built into the website and finishes the count.
  const untranslated = strings
    .map((s) => ({ en: s.en, hi: Boolean(done.get(s.en)?.hi), bn: Boolean(done.get(s.en)?.bn) }))
    .filter((s) => !s.hi || !s.bn);
  const teams = (await refTitles(COLLECTIONS.find((c) => c.key === 'matches'))).teams || {};
  const matchTitle = (m) => `${teams[String(m.home)]?.short || '?'} vs ${teams[String(m.away)]?.short || '?'}`;

  res.json({
    counts: Object.fromEntries(counts),
    media: { count: mediaAgg[0]?.count || 0, bytes: mediaAgg[0]?.bytes || 0, originalBytes: mediaAgg[0]?.original || 0 },
    recent,
    users,
    translations: { total: strings.length, untranslated },
    needScore: needScore.map((m) => ({ id: String(m._id), title: matchTitle(m), date: m.date })),
    nextMatch: nextMatch ? { id: String(nextMatch._id), title: matchTitle(nextMatch), date: nextMatch.date } : null,
    website: rebuildStatus(),
  });
});

/** Cloudinary usage — separate because it calls an outside service and can be slow. */
router.get('/storage', async (req, res) => {
  res.json({ storage: storageKind(), usage: await storageUsage() });
});

router.get('/activity', async (req, res) => {
  const limit = 50;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const [items, total] = await Promise.all([
    Activity.find().sort({ at: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Activity.estimatedDocumentCount(),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/website', (req, res) => res.json(rebuildStatus()));
router.post('/website/rebuild', async (req, res) => {
  const result = await runRebuild();
  record(req, { action: 'refreshed the website', area: 'website', areaLabel: 'Website' });
  res.status(result.ok ? 200 : 502).json({ ...rebuildStatus(), ...(result.ok ? {} : { error: result.error || 'The refresh request failed.' }) });
});

router.get('/youtube', async (req, res) => {
  const info = await lookupYouTube(String(req.query.url || ''));
  if (!info.ok) {
    const msg = { invalid: 'This doesn’t look like a YouTube link.', private: 'This video is private, so it can’t be shown on the website. On YouTube, set it to Public or Unlisted.', missing: 'YouTube says this video doesn’t exist. Please check the link.' }[info.reason];
    return res.status(400).json({ error: msg, ...info });
  }
  return res.json(info);
});

router.use('/c', collections);
router.use('/s', singles);
router.use('/media', media);
router.use('/translations', translations);
router.use('/users', users);

export default router;
