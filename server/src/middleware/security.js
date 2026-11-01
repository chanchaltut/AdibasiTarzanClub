import { rateLimit } from 'express-rate-limit';
import env from '../config/env.js';
import { HttpError } from '../utils/http.js';

export const isAllowedOrigin = (origin) => Boolean(origin) && env.allowedOrigins.includes(origin.replace(/\/+$/, ''));

/**
 * Cross-site request forgery guard: any request that changes something must
 * come from the admin panel's own website, never from another page.
 */
export function checkOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  let origin = req.get('origin');
  if (!origin && req.get('referer')) {
    try { origin = new URL(req.get('referer')).origin; } catch { origin = null; }
  }
  if (!isAllowedOrigin(origin)) {
    throw new HttpError(403, 'This request was blocked for safety. Please open the admin panel from the club website and try again.');
  }
  next();
}

/** Remove "$" and "." keys anywhere in the body — they have no business in our data. */
export function stripDangerousKeys(req, res, next) {
  const clean = (v, depth = 0) => {
    if (depth > 20) return undefined;
    if (Array.isArray(v)) return v.map((x) => clean(x, depth + 1));
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      const out = {};
      for (const [k, x] of Object.entries(v)) {
        if (k.startsWith('$') || k.includes('.') || k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        out[k] = clean(x, depth + 1);
      }
      return out;
    }
    return v;
  };
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  next();
}

const limiter = (windowMs, limit, error) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: (req, res) => res.status(429).json({ error }),
});

export const loginLimiter = limiter(15 * 60_000, 20, 'Too many sign-in attempts from this connection. Please wait 15 minutes and try again.');
export const adminLimiter = limiter(60_000, 600, 'Slow down a little — too many actions in one minute.');
export const uploadLimiter = limiter(10 * 60_000, 300, 'Too many uploads in a short time. Please wait a few minutes.');
export const publicLimiter = limiter(60_000, 300, 'Too many requests. Please try again in a minute.');
