import mongoose from 'mongoose';
import env from './config/env.js';
import { log } from './utils/http.js';

mongoose.set('strictQuery', true);
// Never build indexes on every boot in production; they are synced once by `npm run seed`/start-up below.
mongoose.set('autoIndex', !env.isProd);

/** Connect, retrying a few times so a slow Atlas wake-up doesn't crash the server. */
export async function connectDb(uri = env.MONGODB_URI, { attempts = 5 } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: 10 });
      log.info('MongoDB connected');
      return mongoose.connection;
    } catch (err) {
      log.warn(`MongoDB connection attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  return null;
}

export const dbReady = () => mongoose.connection.readyState === 1;

export async function disconnectDb() {
  await mongoose.disconnect();
}
