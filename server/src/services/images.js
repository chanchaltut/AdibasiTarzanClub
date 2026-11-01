// ─────────────────────────────────────────────────────────────
// Photo processing — every upload goes through here before storage.
//
//  1. Reject anything that is not really an image (checked from the
//     file's contents, not its name) and "decompression bombs".
//  2. Turn it the right way up (phone photos store rotation in EXIF).
//  3. Remove hidden data (EXIF/GPS location, camera serials).
//  4. Shrink to at most 2560 px on the long side — sharper than any
//     screen the site is shown on — never enlarging small photos.
//  5. Save as WebP at quality 86 with full-resolution colour: visually
//     identical to the original at a fraction of the size.
//  6. Make a tiny blurred preview and the main colour, shown while the
//     real photo loads.
// ─────────────────────────────────────────────────────────────

import sharp from 'sharp';
import { badRequest } from '../utils/http.js';

sharp.cache(false);
sharp.concurrency(2);

const ACCEPTED = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff']);
export const MAX_EDGE = 2560;
const MAX_INPUT_PIXELS = 120_000_000; // ~ a 12000 × 10000 photo

export const ACCEPT_HINT = 'JPG, PNG, WebP, AVIF, GIF or TIFF';

export async function processImage(buffer) {
  if (!buffer?.length) throw badRequest('The file is empty.');

  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw badRequest(`This file is not a photo we can read. Please use ${ACCEPT_HINT}.`);
  }
  if (!ACCEPTED.has(meta.format)) {
    throw badRequest(meta.format === 'svg'
      ? 'SVG drawings are not accepted for safety reasons. Please export it as PNG.'
      : `This file type (${meta.format || 'unknown'}) is not supported. Please use ${ACCEPT_HINT}.`);
  }
  if ((meta.width || 0) < 40 || (meta.height || 0) < 40) throw badRequest('This picture is too small to use (under 40 pixels).');

  const base = () => sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });

  const hasAlpha = Boolean(meta.hasAlpha);
  let out;
  try {
    out = await base()
      .webp(hasAlpha
        ? { quality: 90, alphaQuality: 100, effort: 5, smartSubsample: true }
        : { quality: 86, effort: 5, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    if (/HEIF|heic|compression format/i.test(err.message)) {
      throw badRequest('This looks like an iPhone HEIC photo that can’t be read here. On the iPhone choose Settings → Camera → Formats → “Most Compatible”, or share the photo as JPG.');
    }
    throw badRequest('This photo seems damaged and could not be read. Please try another copy of it.');
  }

  const [lqip, stats] = await Promise.all([
    base().resize({ width: 24, height: 24, fit: 'inside' }).webp({ quality: 40 }).toBuffer(),
    sharp(out.data).stats(),
  ]);
  const { r, g, b } = stats.dominant;
  const hex = (n) => n.toString(16).padStart(2, '0');

  return {
    buffer: out.data,
    width: out.info.width,
    height: out.info.height,
    bytes: out.info.size,
    format: 'webp',
    hasAlpha,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    color: `#${hex(r)}${hex(g)}${hex(b)}`,
  };
}
