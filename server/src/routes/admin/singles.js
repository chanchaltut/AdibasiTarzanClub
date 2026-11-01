import { Router } from 'express';
import Single from '../../models/Single.js';
import { SINGLE_MAP } from '../../content/schemas.js';
import { validateFields } from '../../content/validate.js';
import { contentUpdated } from '../../content/bundle.js';
import { assertMediaExist, mediaFor } from '../../content/helpers.js';
import { record } from '../../services/audit.js';
import { badRequest, conflict, notFound } from '../../utils/http.js';

const router = Router();

const defFor = (req) => {
  const def = SINGLE_MAP[req.params.key];
  if (!def) throw notFound('This settings page does not exist.');
  return def;
};

router.get('/:key', async (req, res) => {
  const def = defFor(req);
  const doc = await Single.findOne({ key: def.key }).lean();
  const data = doc?.data || {};
  res.json({ item: { ...data, _updatedAt: doc?.updatedAt || null }, media: await mediaFor(data) });
});

router.put('/:key', async (req, res) => {
  const def = defFor(req);
  const current = await Single.findOne({ key: def.key });
  const seen = req.body?._updatedAt;
  if (current && seen && new Date(seen).getTime() !== current.updatedAt.getTime()) {
    const err = conflict('Someone else saved these settings while you were editing. Reload the page to see their version.');
    err.code = 'STALE';
    throw err;
  }
  const { data, errors } = validateFields(def.fields, req.body);
  if (errors) throw badRequest('Some details need attention — they are marked in red.', errors);
  await assertMediaExist(data);

  const doc = await Single.findOneAndUpdate(
    { key: def.key },
    { $set: { data, updatedBy: req.user._id } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).lean();
  record(req, { action: 'edited', area: def.key, areaLabel: def.label, itemTitle: def.label });
  contentUpdated();
  res.json({ item: { ...doc.data, _updatedAt: doc.updatedAt }, media: await mediaFor(doc.data) });
});

export default router;
