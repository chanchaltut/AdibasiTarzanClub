import { Router } from 'express';
import Media from '../../models/Media.js';
import { contentModel } from '../../models/content.js';
import { COLLECTION_MAP, titleOf } from '../../content/schemas.js';
import { defaultsFor, mediaIdsIn, validateFields } from '../../content/validate.js';
import { contentUpdated, sortFor } from '../../content/bundle.js';
import { assertMediaExist, checkRefs, incomingRefs, mediaFor, refTitles, thumbFor } from '../../content/helpers.js';
import { record } from '../../services/audit.js';
import { HttpError, badRequest, conflict, escapeRegex, isObjectId, notFound, slugify } from '../../utils/http.js';

const router = Router();

function defFor(req) {
  const def = COLLECTION_MAP[req.params.type];
  if (!def) throw notFound('This section does not exist.');
  return def;
}

async function loadDoc(def, id) {
  if (!isObjectId(id)) throw notFound();
  const doc = await contentModel(def.key).findById(id);
  if (!doc) throw notFound();
  return doc;
}

const plain = (doc) => {
  const o = doc.toObject ? doc.toObject({ versionKey: false }) : { ...doc };
  o._id = String(o._id);
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object' && v._bsontype === 'ObjectId') o[k] = String(v);
  }
  return o;
};

/** Rules that involve more than one field. */
function crossChecks(def, data, errors) {
  if (def.key === 'matches') {
    if (data.home && data.away && data.home === data.away) errors.away = 'A team can’t play itself';
    const hs = data.homeScore; const as = data.awayScore;
    if ((hs === undefined) !== (as === undefined)) {
      errors[hs === undefined ? 'homeScore' : 'awayScore'] = 'Fill in both scores, or leave both empty';
    }
  }
}

/** Pick a unique web address for a news story. */
async function uniqueSlug(def, data, { selfId, userTyped }) {
  const slugField = def.fields.find((f) => f.type === 'slug');
  if (!slugField) return null;
  const Model = contentModel(def.key);
  let base = data[slugField.name] || slugify(data[slugField.from]);
  if (!base) base = `${def.key}-${Date.now().toString(36)}`;
  const taken = async (s) => Model.exists({ slug: s, ...(selfId && { _id: { $ne: selfId } }) });
  if (!(await taken(base))) return base;
  if (userTyped) throw badRequest('Another item already uses this web address.', { [slugField.name]: 'Already used by another item — please change it' });
  for (let i = 2; i < 200; i++) {
    const s = `${base.slice(0, 74)}-${i}`;
    if (!(await taken(s))) return s;
  }
  return `${base.slice(0, 60)}-${Date.now().toString(36)}`;
}

async function validateOrThrow(def, body, { selfId, existing } = {}) {
  const { data, unset, errors: found } = validateFields(def.fields, body);
  const errors = { ...(found || {}) };
  crossChecks(def, data, errors);
  Object.assign(errors, await checkRefs(def, data));
  if (Object.keys(errors).length) throw badRequest('Some details need attention — they are marked in red.', errors);
  await assertMediaExist(data);

  const slugField = def.fields.find((f) => f.type === 'slug');
  if (slugField) {
    const typed = Boolean(body[slugField.name]) && body[slugField.name] !== existing?.[slugField.name];
    data[slugField.name] = await uniqueSlug(def, data, { selfId, userTyped: typed });
    const i = unset.indexOf(slugField.name);
    if (i >= 0) unset.splice(i, 1);
  }
  return { data, unset };
}

// ─── List ────────────────────────────────────────────────────
router.get('/:type', async (req, res) => {
  const def = defFor(req);
  const Model = contentModel(def.key);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 500);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';

  const filter = {};
  if (q && def.searchable?.length) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = def.searchable.map((f) => ({ [f]: rx }));
  }
  const [docs, total] = await Promise.all([
    Model.find(filter).sort(sortFor(def)).skip((page - 1) * limit).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);

  const refs = def.fields.some((f) => f.type === 'ref') ? await refTitles(def) : {};
  const mediaIds = [...mediaIdsIn(docs.map((d) => (def.imageField ? d[def.imageField] : null)))];
  const media = mediaIds.length ? await Media.find({ _id: { $in: mediaIds } }).lean() : [];
  const mediaMap = new Map(media.map((m) => [String(m._id), m]));

  res.json({
    items: docs.map((d) => ({ ...plain(d), _title: titleOf(def, d, refs), _thumb: thumbFor(def, d, mediaMap) })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    refs: Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([id, d]) => [id, d._title]))])),
  });
});

/** Choices for a "pick another item" field, e.g. teams for a match. */
router.get('/:type/options', async (req, res) => {
  const def = defFor(req);
  const docs = await contentModel(def.key).find().sort(sortFor(def)).limit(1000).lean();
  res.json({ options: docs.map((d) => ({ value: String(d._id), label: titleOf(def, d) })) });
});

router.get('/:type/new', async (req, res) => {
  const def = defFor(req);
  res.json({ item: defaultsFor(def.fields), media: {} });
});

router.get('/:type/:id', async (req, res) => {
  const def = defFor(req);
  const doc = await loadDoc(def, req.params.id);
  const item = plain(doc);
  res.json({ item, media: await mediaFor(item), title: titleOf(def, item, def.refs ? await refTitles(def) : {}) });
});

// ─── Create ──────────────────────────────────────────────────
router.post('/:type', async (req, res) => {
  const def = defFor(req);
  const Model = contentModel(def.key);
  const { data } = await validateOrThrow(def, req.body);

  if (def.orderable) {
    const edge = await Model.findOne().sort({ order: def.newFirst ? 1 : -1 }).select('order').lean();
    data.order = edge ? edge.order + (def.newFirst ? -1 : 1) : 0;
  }
  const doc = await Model.create({ ...data, createdBy: req.user._id, updatedBy: req.user._id });
  const refs = def.refs ? await refTitles(def) : {};
  record(req, { action: 'added', area: def.key, areaLabel: def.label, itemId: doc._id, itemTitle: titleOf(def, doc, refs) });
  contentUpdated();
  const item = plain(doc);
  res.status(201).json({ item, media: await mediaFor(item) });
});

// ─── Update ──────────────────────────────────────────────────
router.put('/:type/:id', async (req, res) => {
  const def = defFor(req);
  const doc = await loadDoc(def, req.params.id);

  // Two people editing the same thing: don't let the second save silently wipe the first.
  const seen = req.body?._updatedAt;
  if (seen && doc.updatedAt && new Date(seen).getTime() !== doc.updatedAt.getTime()) {
    const err = conflict(`Someone else saved changes to this ${def.singular} while you were editing. Copy anything you need, then reload the page to see their version.`);
    err.code = 'STALE';
    throw err;
  }

  const { data, unset } = await validateOrThrow(def, req.body, { selfId: doc._id, existing: doc });
  unset.forEach((k) => doc.set(k, undefined));
  doc.set({ ...data, updatedBy: req.user._id });
  await doc.save();
  const refs = def.refs ? await refTitles(def) : {};
  record(req, { action: 'edited', area: def.key, areaLabel: def.label, itemId: doc._id, itemTitle: titleOf(def, doc, refs) });
  contentUpdated();
  const item = plain(doc);
  res.json({ item, media: await mediaFor(item) });
});

/** Quick switches from the list (show/hide). */
router.patch('/:type/:id', async (req, res) => {
  const def = defFor(req);
  const doc = await loadDoc(def, req.params.id);
  if (!def.publishable || typeof req.body?.published !== 'boolean') throw badRequest('Nothing to change.');
  doc.published = req.body.published;
  doc.updatedBy = req.user._id;
  await doc.save();
  record(req, { action: doc.published ? 'showed' : 'hid', area: def.key, areaLabel: def.label, itemId: doc._id, itemTitle: titleOf(def, doc, def.refs ? await refTitles(def) : {}) });
  contentUpdated();
  res.json({ item: plain(doc) });
});

// ─── Re-order ────────────────────────────────────────────────
router.post('/:type/:id/move', async (req, res) => {
  const def = defFor(req);
  if (!def.orderable) throw badRequest('This list is sorted automatically.');
  const to = req.body?.to;
  if (!['up', 'down', 'top', 'bottom'].includes(to)) throw badRequest('Unknown direction.');
  const Model = contentModel(def.key);
  const all = await Model.find().sort(sortFor(def)).select('_id order').lean();
  const from = all.findIndex((d) => String(d._id) === req.params.id);
  if (from < 0) throw notFound();
  const [item] = all.splice(from, 1);
  const target = { up: Math.max(0, from - 1), down: Math.min(all.length, from + 1), top: 0, bottom: all.length }[to];
  all.splice(target, 0, item);
  const ops = all.map((d, i) => (d.order === i ? null : { updateOne: { filter: { _id: d._id }, update: { $set: { order: i } } } })).filter(Boolean);
  if (ops.length) await Model.bulkWrite(ops);
  contentUpdated();
  res.json({ ok: true, order: all.map((d) => String(d._id)) });
});

// ─── Delete ──────────────────────────────────────────────────
router.delete('/:type/:id', async (req, res) => {
  const def = defFor(req);
  const doc = await loadDoc(def, req.params.id);
  if (doc.locked) throw new HttpError(409, `This ${def.singular} is part of the website and can’t be deleted. You can still edit it.`);
  const used = await incomingRefs(def.key, doc._id);
  if (used.length) {
    const list = used.map((u) => `${u.count} ${u.count === 1 ? u.singular : u.label.toLowerCase()}`).join(' and ');
    throw conflict(`This ${def.singular} is used in ${list}. Change or delete those first.`, { usedIn: used });
  }
  const refs = def.refs ? await refTitles(def) : {};
  const title = titleOf(def, doc, refs);
  await doc.deleteOne();
  record(req, { action: 'deleted', area: def.key, areaLabel: def.label, itemId: doc._id, itemTitle: title });
  contentUpdated();
  res.json({ ok: true });
});

export default router;
