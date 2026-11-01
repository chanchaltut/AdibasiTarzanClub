import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/security.js';
import { record } from '../services/audit.js';
import { dummyVerify, hashPassword, passwordProblem, verifyPassword } from '../services/passwords.js';
import { clearSession, issueSession, readSession } from '../services/sessions.js';
import { HttpError, badRequest } from '../utils/http.js';

const router = Router();
const MAX_FAILS = 8;
const LOCK_MINUTES = 15;
const WRONG = 'The email or password is not right. Please check and try again.';

router.post('/login', loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 200) : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 200) : '';
  if (!email || !password) throw badRequest('Please enter your email and password.');

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.active) {
    await dummyVerify(password);
    throw new HttpError(401, WRONG);
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil - Date.now()) / 60_000);
    throw new HttpError(429, `Too many wrong passwords. For safety this account is locked for ${mins} more minute${mins === 1 ? '' : 's'}.`);
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const fails = user.failedLogins + 1;
    const lock = fails >= MAX_FAILS;
    await User.updateOne({ _id: user._id }, {
      $set: lock ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } : { failedLogins: fails },
    });
    throw new HttpError(401, lock ? `Too many wrong passwords. For safety this account is locked for ${LOCK_MINUTES} minutes.` : WRONG);
  }

  user.failedLogins = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save();
  issueSession(res, user);
  req.user = user;
  record(req, { action: 'signed in', area: 'account' });
  res.json({ user: user.toSafeJSON() });
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

/** "Am I signed in?" — answers { user: null } instead of an error, for the panel's first load. */
router.get('/session', async (req, res) => {
  const session = readSession(req);
  const user = session && await User.findById(session.sub);
  if (!user || !user.active || user.sessionVersion !== session.v) {
    if (session) clearSession(res);
    return res.json({ user: null });
  }
  if (Date.now() / 1000 - session.iat > 86_400) issueSession(res, user);
  return res.json({ user: user.toSafeJSON() });
});

router.post('/password', requireAuth, async (req, res) => {
  const { current, next } = req.body || {};
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await verifyPassword(String(current || ''), user.passwordHash))) {
    throw badRequest('Your current password is not right.', { current: 'This is not your current password' });
  }
  const problem = passwordProblem(next, user);
  if (problem) throw badRequest(problem, { next: problem });
  if (await verifyPassword(next, user.passwordHash)) throw badRequest('Please choose a different password from the old one.', { next: 'Same as the old password' });

  user.passwordHash = await hashPassword(next);
  user.sessionVersion += 1;
  user.mustChangePassword = false;
  await user.save();
  issueSession(res, user);
  record(req, { action: 'changed their password', area: 'account' });
  res.json({ user: user.toSafeJSON() });
});

/** Ends every session of this person on every device (e.g. a lost phone). */
router.post('/logout-everywhere', requireAuth, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
  clearSession(res);
  record(req, { action: 'signed out on all devices', area: 'account' });
  res.json({ ok: true });
});

export default router;
