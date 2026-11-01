// Passwords are stored as scrypt hashes (memory-hard, built into Node — no native add-ons).
// Format: scrypt$N$r$p$salt$hash

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 96 * 1024 * 1024;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [kind, n, r, p, saltB64, hashB64] = stored.split('$');
  if (kind !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A hash to compare against when the email doesn't exist, so both cases take the same time. */
let dummy = null;
export async function dummyVerify(password) {
  dummy ||= await hashPassword('not-a-real-password-just-for-timing');
  await verifyPassword(String(password || ''), dummy);
  return false;
}

const COMMON = new Set(['password', 'password1', 'password123', '1234567890', '12345678910', 'qwertyuiop', 'iloveyou12', 'football12', 'adibasi123', 'tarzanclub', 'admin12345', 'welcome123', 'abc1234567']);

/** Plain-English reason a new password isn't good enough, or null when it's fine. */
export function passwordProblem(password, { email = '', name = '' } = {}) {
  if (typeof password !== 'string' || password.length < 10) return 'Use at least 10 characters. A short sentence you will remember works well.';
  if (password.length > 200) return 'That password is too long (200 characters at most).';
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password) || /^(0123456789|1234567890|abcdefghij)/.test(lower)) return 'That password is too easy to guess. Please choose another.';
  const local = email.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return 'Please don’t use your email address in the password.';
  if (name && name.length >= 4 && lower.includes(name.toLowerCase())) return 'Please don’t use your name in the password.';
  return null;
}
