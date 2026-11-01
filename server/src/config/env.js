// ─────────────────────────────────────────────────────────────
// Every setting the server reads from the environment, checked once
// at start-up. If something required is missing the server refuses to
// start and says exactly which value to add to server/.env.
// ─────────────────────────────────────────────────────────────

import 'dotenv/config';

const raw = process.env;
const problems = [];

const str = (key, fallback = '') => (raw[key] ?? fallback).toString().trim();
const int = (key, fallback) => {
  const v = str(key);
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) problems.push(`${key} must be a whole number (got "${v}")`);
  return Number.isFinite(n) ? n : fallback;
};
const list = (key) => str(key).split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);

const NODE_ENV = str('NODE_ENV', 'development');
const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const env = {
  NODE_ENV,
  isProd,
  isTest,
  PORT: int('PORT', 4000),

  MONGODB_URI: str('MONGODB_URI'),
  JWT_SECRET: str('JWT_SECRET'),
  SESSION_DAYS: int('SESSION_DAYS', 7),

  /** The public website, e.g. https://www.adibasitarzanclub.in — allowed to call this API. */
  CLIENT_URL: str('CLIENT_URL', isProd ? '' : 'http://localhost:3000').replace(/\/+$/, ''),
  /** Extra allowed origins, comma separated (preview deployments, a second domain…). */
  CORS_ORIGINS: list('CORS_ORIGINS'),
  /** This API's own public address. Only needed for local (non-Cloudinary) image URLs. */
  PUBLIC_URL: str('PUBLIC_URL', `http://localhost:${int('PORT', 4000)}`).replace(/\/+$/, ''),

  /** "lax" when the API sits on a subdomain of the site (recommended); "none" when on a different domain. */
  COOKIE_SAMESITE: str('COOKIE_SAMESITE', 'lax').toLowerCase(),
  COOKIE_DOMAIN: str('COOKIE_DOMAIN'),
  TRUST_PROXY: int('TRUST_PROXY', 1),

  CLOUDINARY_CLOUD_NAME: str('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: str('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: str('CLOUDINARY_API_SECRET'),
  CLOUDINARY_FOLDER: str('CLOUDINARY_FOLDER', 'atc').replace(/^\/+|\/+$/g, ''),

  /** Vercel "Deploy Hook" URL — the site is rebuilt after content changes so search engines see them. */
  DEPLOY_HOOK_URL: str('DEPLOY_HOOK_URL'),
  REBUILD_DELAY_MINUTES: int('REBUILD_DELAY_MINUTES', 3),

  /** Largest photo accepted, in MB. Phones produce 3–15 MB; it is shrunk to a few hundred KB. */
  MAX_UPLOAD_MB: int('MAX_UPLOAD_MB', 25),
};

env.cloudinary = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
env.allowedOrigins = [...new Set([env.CLIENT_URL, ...env.CORS_ORIGINS].filter(Boolean))];
if (!isProd) env.allowedOrigins.push('http://localhost:3000', 'http://localhost:4173', 'http://localhost:5173', 'http://127.0.0.1:3000');

if (!env.MONGODB_URI && !isTest) problems.push('MONGODB_URI is missing — paste the connection string from MongoDB Atlas');
if (!env.JWT_SECRET) {
  if (isProd) problems.push('JWT_SECRET is missing — generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  else env.JWT_SECRET = 'dev-only-secret-change-me-dev-only-secret-change-me';
} else if (env.JWT_SECRET.length < 32) {
  problems.push('JWT_SECRET must be at least 32 characters long');
}
if (isProd && !env.CLIENT_URL) problems.push('CLIENT_URL is missing — set it to the website address, e.g. https://www.adibasitarzanclub.in');
if (isProd && !env.cloudinary) problems.push('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required in production');
if (!['lax', 'none', 'strict'].includes(env.COOKIE_SAMESITE)) problems.push('COOKIE_SAMESITE must be "lax", "strict" or "none"');
if (env.CLIENT_URL && !/^https?:\/\//.test(env.CLIENT_URL)) problems.push('CLIENT_URL must start with https:// (or http:// for local development)');
if (env.DEPLOY_HOOK_URL && !/^https:\/\//.test(env.DEPLOY_HOOK_URL)) problems.push('DEPLOY_HOOK_URL must be an https:// address');

if (problems.length) {
  console.error('\n✖ The server cannot start. Fix these settings in server/.env:\n');
  problems.forEach((p) => console.error(`  • ${p}`));
  console.error('');
  if (!isTest) process.exit(1);
  throw new Error(problems.join('; '));
}

export default env;
