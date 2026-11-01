import { Router } from 'express';
import Translation from '../../models/Translation.js';
import { contentUpdated, translatableStrings } from '../../content/bundle.js';
import { record } from '../../services/audit.js';
import { badRequest } from '../../utils/http.js';

const router = Router();

router.get('/', async (req, res) => {
  const [strings, saved] = await Promise.all([translatableStrings(), Translation.find().lean()]);
  const byEn = new Map(saved.map((t) => [t.en, t]));
  res.json({
    items: strings.map((s) => ({ ...s, hi: byEn.get(s.en)?.hi || '', bn: byEn.get(s.en)?.bn || '' })),
  });
});

router.put('/', async (req, res) => {
  const en = typeof req.body?.en === 'string' ? req.body.en.trim() : '';
  const clean = (v) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, 20000) : '');
  const hi = clean(req.body?.hi);
  const bn = clean(req.body?.bn);
  if (!en || en.length > 20000) throw badRequest('Missing the English text.');

  if (!hi && !bn) await Translation.deleteOne({ en });
  else await Translation.updateOne({ en }, { $set: { hi, bn, updatedBy: req.user._id } }, { upsert: true });
  record(req, { action: 'translated', area: 'translations', areaLabel: 'Translations', itemTitle: en.slice(0, 120) });
  contentUpdated();
  res.json({ item: { en, hi, bn } });
});

export default router;
