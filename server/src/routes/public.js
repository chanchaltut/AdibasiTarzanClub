import { Router } from 'express';
import { getBundle } from '../content/bundle.js';
import { dbReady } from '../db.js';
import { publicLimiter } from '../middleware/security.js';
import { HttpError } from '../utils/http.js';

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

export default router;
