import env from './config/env.js';
import { connectDb, disconnectDb } from './db.js';
import { createApp } from './app.js';
import { restoreRebuild } from './services/rebuild.js';
import { log } from './utils/http.js';
import { COLLECTIONS } from './content/schemas.js';
import { contentModel } from './models/content.js';
import Media from './models/Media.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import Translation from './models/Translation.js';
import Single from './models/Single.js';
import State from './models/State.js';

async function main() {
  await connectDb();
  // Make sure indexes (unique emails, unique news addresses…) exist.
  await Promise.all([User, Media, Activity, Translation, Single, State, ...COLLECTIONS.map((c) => contentModel(c.key))]
    .map((M) => M.syncIndexes().catch((err) => log.warn(`Index sync for ${M.modelName}: ${err.message}`))));
  await restoreRebuild();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    log.info(`ATC API listening on port ${env.PORT} (${env.NODE_ENV}, images: ${env.cloudinary ? 'Cloudinary' : 'local folder'})`);
    if (!env.cloudinary) log.warn('Cloudinary is not set up — photos are saved in server/uploads (fine for local testing only).');
    if (!env.DEPLOY_HOOK_URL) log.warn('DEPLOY_HOOK_URL is not set — the pre-built pages for Google will not refresh by themselves.');
  });
  server.requestTimeout = 120_000;

  const stop = async (signal) => {
    log.info(`${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDb().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('unhandledRejection', (err) => log.error('Unhandled promise rejection:', err));
}

main().catch((err) => {
  log.error('Server failed to start:', err.message);
  process.exit(1);
});
