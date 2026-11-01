// Building photo addresses in the panel, the same way the server builds them for the website.

/** Crop in % → pixels of the stored photo. */
export function cropPx(media, crop) {
  if (!crop || !media?.width) return null;
  const x = Math.round((crop.x / 100) * media.width);
  const y = Math.round((crop.y / 100) * media.height);
  return {
    x, y,
    w: Math.max(1, Math.min(media.width - x, Math.round((crop.w / 100) * media.width))),
    h: Math.max(1, Math.min(media.height - y, Math.round((crop.h / 100) * media.height))),
  };
}

/** Address of a stored photo, cropped, about `width` pixels wide. */
export function mediaUrl(media, { crop, width = 800 } = {}) {
  if (!media?.url) return '';
  const px = cropPx(media, crop);
  let url = media.url;
  if (px) {
    url = url.includes('/c_limit,w_{w}/')
      ? url.replace('/c_limit,w_{w}/', `/c_crop,x_${px.x},y_${px.y},w_${px.w},h_${px.h}/c_limit,w_{w}/`)
      : `${url}&c=${px.x},${px.y},${px.w},${px.h}`;
  }
  return url.replace('{w}', String(width));
}

/** Preview address for an image field value ({ media } or { src }). */
export function valueUrl(value, mediaMap, width = 800) {
  if (!value) return '';
  if (value.media) return mediaUrl(mediaMap?.[value.media], { crop: value.crop, width });
  return value.src || '';
}

export const focalCss = (value) => (value?.focal ? `${value.focal.x}% ${value.focal.y}%` : '50% 50%');

/**
 * Big phone photos are shrunk in the browser before uploading, so uploads on mobile data
 * are quick. The server does the real conversion, so this only trims what no screen needs.
 */
export async function shrinkForUpload(file, { maxEdge = 3200, minBytes = 5 * 1024 * 1024 } = {}) {
  if (file.size < minBytes || !/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
    if (scale === 1) { bmp.close?.(); return file; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((r) => { canvas.toBlob(r, type, 0.93); });
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, type === 'image/png' ? '.png' : '.jpg'), { type });
  } catch {
    return file;
  }
}

const OK_TYPES = /^image\/(jpeg|png|webp|avif|gif|tiff|heic|heif)$/;
export function checkFile(file, maxMb = 25) {
  if (!OK_TYPES.test(file.type) && !/\.(jpe?g|png|webp|avif|gif|tiff?|heic|heif)$/i.test(file.name)) {
    return `“${file.name}” is not a photo. Please choose JPG, PNG or WebP pictures.`;
  }
  if (/svg/i.test(file.type)) return `“${file.name}” is an SVG drawing — please export it as PNG.`;
  if (file.size > maxMb * 1024 * 1024) return `“${file.name}” is larger than ${maxMb} MB. Please choose a smaller copy.`;
  return null;
}
