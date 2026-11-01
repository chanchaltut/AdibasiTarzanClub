// ─────────────────────────────────────────────────────────────
// Where photo files live.
//
// Production: Cloudinary. Files are stored once; every size the site
// needs (phone, tablet, desktop) and every crop is made by Cloudinary
// on request from the same file, then cached worldwide. Crops are never
// "baked in", so a photo can be re-cropped later without re-uploading.
//
// Development without Cloudinary keys: files go to server/uploads and
// this server resizes/crops them itself, so everything still works.
// ─────────────────────────────────────────────────────────────

import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import env from '../config/env.js';
import { HttpError, log } from '../utils/http.js';

export const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

if (env.cloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const storageKind = () => (env.cloudinary ? 'cloudinary' : 'local');

/** Save a processed WebP. Returns what the Media record needs to rebuild URLs later. */
export async function putImage(buffer) {
  if (env.cloudinary) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: env.CLOUDINARY_FOLDER,
        resource_type: 'image',
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      }, (err, res) => (err ? reject(err) : resolve(res)));
      stream.end(buffer);
    }).catch((err) => {
      log.error('Cloudinary upload failed:', err.message || err);
      throw new HttpError(502, 'The photo could not be saved to the image service. Please try again in a minute.');
    });
    return { storage: 'cloudinary', publicId: result.public_id, version: result.version, format: result.format || 'webp' };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomBytes(12).toString('hex');
  await fs.writeFile(path.join(UPLOAD_DIR, `${id}.webp`), buffer);
  return { storage: 'local', publicId: id, version: 1, format: 'webp' };
}

export async function removeImage(media) {
  try {
    if (media.storage === 'cloudinary') {
      if (!env.cloudinary) return;
      await cloudinary.uploader.destroy(media.publicId, { invalidate: true, resource_type: 'image' });
    } else if (/^[a-f0-9]{24}$/.test(media.publicId)) {
      await fs.rm(path.join(UPLOAD_DIR, `${media.publicId}.webp`), { force: true });
    }
  } catch (err) {
    // The record is removed either way; an orphaned file only costs a little space.
    log.warn(`Could not delete stored file ${media.publicId}: ${err.message}`);
  }
}

/** Crop (stored in % of the photo) → whole pixels of the stored file. */
export function cropPixels(media, crop) {
  if (!crop) return null;
  const x = Math.round((crop.x / 100) * media.width);
  const y = Math.round((crop.y / 100) * media.height);
  const w = Math.max(1, Math.min(media.width - x, Math.round((crop.w / 100) * media.width)));
  const h = Math.max(1, Math.min(media.height - y, Math.round((crop.h / 100) * media.height)));
  return { x, y, w, h };
}

/**
 * URL pattern for a photo with "{w}" where the width goes, so the website
 * can ask for exactly the size each screen needs (srcset).
 */
export function urlPattern(media, crop) {
  const px = cropPixels(media, crop);
  if (media.storage === 'cloudinary') {
    const parts = [];
    if (px) parts.push(`c_crop,x_${px.x},y_${px.y},w_${px.w},h_${px.h}`);
    parts.push('c_limit,w_{w}', 'f_auto,q_auto:good');
    return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${parts.join('/')}/v${media.version}/${media.publicId}.${media.format || 'webp'}`;
  }
  const c = px ? `&c=${px.x},${px.y},${px.w},${px.h}` : '';
  return `${env.PUBLIC_URL}/uploads/${media.publicId}.webp?w={w}${c}`;
}

/**
 * A 1200 × 630 JPEG for link previews (WhatsApp, Facebook, Google). Cloudinary picks the
 * most interesting part of the photo to fill the frame. Only available with Cloudinary.
 */
export function shareImageUrl(media, crop) {
  if (media.storage !== 'cloudinary') return null;
  const px = cropPixels(media, crop);
  const parts = [];
  if (px) parts.push(`c_crop,x_${px.x},y_${px.y},w_${px.w},h_${px.h}`);
  parts.push('c_fill,g_auto,w_1200,h_630', 'f_jpg,q_auto:good');
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${parts.join('/')}/v${media.version}/${media.publicId}.${media.format || 'webp'}`;
}

/** Space used on Cloudinary, for the dashboard. */
export async function storageUsage() {
  if (!env.cloudinary) return null;
  try {
    const u = await cloudinary.api.usage();
    return {
      plan: u.plan,
      creditsUsed: u.credits?.usage ?? null,
      creditsLimit: u.credits?.limit ?? null,
      percent: u.credits?.used_percent ?? null,
      storageBytes: u.storage?.usage ?? null,
      bandwidthBytes: u.bandwidth?.usage ?? null,
    };
  } catch (err) {
    log.warn('Cloudinary usage lookup failed:', err.message || err);
    return null;
  }
}

// ─── Local development file server (only used without Cloudinary) ───
const resized = new Map(); // tiny in-memory cache
const ALLOWED_WIDTHS = new Set([64, 160, 320, 480, 640, 800, 960, 1200, 1600, 2000, 2560]);

export async function serveLocal(req, res) {
  const m = /^([a-f0-9]{24})\.webp$/.exec(req.params.file || '');
  if (!m) return res.status(404).end();
  const want = Number(req.query.w) || 1200;
  const w = [...ALLOWED_WIDTHS].find((x) => x >= want) || 2560;
  const c = typeof req.query.c === 'string' && /^\d+,\d+,\d+,\d+$/.test(req.query.c) ? req.query.c.split(',').map(Number) : null;
  const key = `${m[1]}|${w}|${c || ''}`;
  try {
    let buf = resized.get(key);
    if (!buf) {
      let img = sharp(await fs.readFile(path.join(UPLOAD_DIR, `${m[1]}.webp`)));
      if (c) img = img.extract({ left: c[0], top: c[1], width: c[2], height: c[3] });
      buf = await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      if (resized.size > 300) resized.delete(resized.keys().next().value);
      resized.set(key, buf);
    }
    res.set({ 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=86400', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    return res.end(buf);
  } catch {
    return res.status(404).end();
  }
}
