// Uploading documents (PDF letters, invitations, calendars) for the Notice Board.

import { Router } from 'express';
import multer from 'multer';
import env from '../../config/env.js';
import FileAsset from '../../models/FileAsset.js';
import { filePublic } from '../../content/helpers.js';
import { uploadLimiter } from '../../middleware/security.js';
import { record } from '../../services/audit.js';
import { isPdf, putPdf } from '../../services/storage.js';
import { badRequest, isObjectId, notFound } from '../../utils/http.js';

const router = Router();
// Cloudinary's free plan stores files up to 10 MB.
const MAX_MB = Math.min(env.MAX_UPLOAD_MB, 10);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1, fields: 2, parts: 3 },
});

const single = (req, res, next) => upload.single('file')(req, res, (err) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return next(badRequest(`This file is larger than ${MAX_MB} MB. Please save a smaller copy (for example with “Reduce file size” when exporting the PDF).`));
  return next(err);
});

router.post('/', uploadLimiter, single, async (req, res) => {
  const file = req.file;
  if (!file) throw badRequest('Please choose a PDF file.');
  if (!isPdf(file.buffer)) throw badRequest('This is not a PDF file. For a photo of a letter, choose “Photo” as the file type instead.');
  const name = String(file.originalname || 'document.pdf').normalize('NFC').replace(/[^\p{L}\p{N} ._()-]/gu, '').slice(0, 200) || 'document.pdf';
  const stored = await putPdf(file.buffer);
  const doc = await FileAsset.create({ ...stored, bytes: file.size, originalName: name, uploadedBy: req.user._id });
  file.buffer = null;
  record(req, { action: 'uploaded a PDF', area: 'documents', areaLabel: 'Notice Board', itemTitle: name });
  res.status(201).json({ item: filePublic(doc) });
});

router.get('/:id', async (req, res) => {
  if (!isObjectId(req.params.id)) throw notFound();
  const doc = await FileAsset.findById(req.params.id).lean();
  if (!doc) throw notFound('This file no longer exists. Please upload it again.');
  res.json({ item: filePublic(doc) });
});

export default router;
