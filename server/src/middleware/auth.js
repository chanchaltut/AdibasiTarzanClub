import User from '../models/User.js';
import { clearSession, issueSession, readSession } from '../services/sessions.js';
import { HttpError, forbidden } from '../utils/http.js';

/** Only signed-in, active people get past this. Sessions are renewed quietly once a day. */
export async function requireAuth(req, res, next) {
  const session = readSession(req);
  if (!session) throw new HttpError(401, 'Please sign in to continue.');
  const user = await User.findById(session.sub);
  if (!user || !user.active || user.sessionVersion !== session.v) {
    clearSession(res);
    throw new HttpError(401, 'Your session has ended. Please sign in again.');
  }
  req.user = user;
  if (Date.now() / 1000 - session.iat > 86_400) issueSession(res, user);
  next();
}

/** People given a temporary password must choose their own before doing anything else. */
export function requirePasswordChosen(req, res, next) {
  if (req.user?.mustChangePassword) {
    const err = new HttpError(403, 'Please choose your own password first.');
    err.code = 'PASSWORD_CHANGE_REQUIRED';
    throw err;
  }
  next();
}

export const requireOwner = (req, res, next) => {
  if (req.user?.role !== 'owner') throw forbidden('Only the site owner can manage people.');
  next();
};
