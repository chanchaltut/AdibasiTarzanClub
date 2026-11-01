/** An error whose message is safe and friendly enough to show in the admin panel. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    if (details) this.details = details;
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details);
export const notFound = (msg = 'This item no longer exists. It may have been deleted.') => new HttpError(404, msg);
export const forbidden = (msg = 'You do not have permission to do this.') => new HttpError(403, msg);
export const conflict = (msg, details) => new HttpError(409, msg, details);

export const log = {
  info: (...a) => console.log(new Date().toISOString(), '·', ...a),
  warn: (...a) => console.warn(new Date().toISOString(), '⚠', ...a),
  error: (...a) => console.error(new Date().toISOString(), '✖', ...a),
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;
export const isObjectId = (v) => typeof v === 'string' && OBJECT_ID.test(v);

/** Escape user text before it goes into a RegExp search. */
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const slugify = (s) => String(s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[–—]/g, '-')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80)
  .replace(/-+$/g, '');
