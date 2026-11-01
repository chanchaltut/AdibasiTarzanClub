import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import env from './config/env.js';
import { errorHandler, notFoundApi } from './middleware/error.js';
import { checkOrigin, isAllowedOrigin, stripDangerousKeys } from './middleware/security.js';
import adminRoutes from './routes/admin/index.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import { serveLocal } from './services/storage.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('etag', false); // we set our own, meaningful ETags
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet({
    contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  }));
  app.use(compression());

  app.get('/', (req, res) => res.json({ name: 'Adibasi Tarzan Club API', ok: true }));
  app.use('/api/public', publicRoutes);
  app.get('/api/health', (req, res) => res.redirect(307, '/api/public/health'));

  // Photos stored on this server (only when Cloudinary is not configured, i.e. local development).
  if (!env.cloudinary) app.get('/uploads/:file', serveLocal);

  // Everything below is for the admin panel: allow-listed origins, cookies, and forgery protection.
  const privateCors = cors({
    origin: (origin, cb) => cb(null, !origin || isAllowedOrigin(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
    maxAge: 600,
  });
  app.use(['/api/auth', '/api/admin'], privateCors, (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(stripDangerousKeys);
  app.use(['/api/auth', '/api/admin'], checkOrigin);

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', notFoundApi);
  app.use(notFoundApi);
  app.use(errorHandler);
  return app;
}
