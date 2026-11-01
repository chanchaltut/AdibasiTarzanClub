import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const COOKIE = 'atc_admin';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd || env.COOKIE_SAMESITE === 'none',
  sameSite: env.COOKIE_SAMESITE,
  path: '/api',
  ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
});

export function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user._id), v: user.sessionVersion }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${env.SESSION_DAYS}d`,
  });
  res.cookie(COOKIE, token, { ...cookieOptions(), maxAge: env.SESSION_DAYS * 864e5 });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, cookieOptions());
}

export function readSession(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
