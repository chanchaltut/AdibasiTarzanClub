// Checks every outside service the server needs and prints a simple report.
//   npm run check

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import User from '../models/User.js';
import Single from '../models/Single.js';

const rows = [];
const add = (what, ok, note, optional = false) => rows.push({ what, ok, note, optional });

try {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  add('MongoDB database', true, 'Connected');
  const [owners, content] = await Promise.all([User.countDocuments({ role: 'owner', active: true }), Single.estimatedDocumentCount()]);
  add('Starting content', content > 0, content > 0 ? 'Present' : 'Missing — run: npm run seed');
  add('Owner account', owners > 0, owners > 0 ? `${owners} owner(s)` : 'Missing — run: npm run create-admin');
} catch (err) {
  add('MongoDB database', false, `Cannot connect: ${err.message}`);
}

if (env.cloudinary) {
  try {
    await cloudinary.api.ping();
    add('Cloudinary (photos)', true, `Cloud "${env.CLOUDINARY_CLOUD_NAME}", folder "${env.CLOUDINARY_FOLDER}"`);
  } catch (err) {
    add('Cloudinary (photos)', false, `Keys rejected: ${err.error?.message || err.message}`);
  }
} else {
  add('Cloudinary (photos)', !env.isProd, 'Not set — photos are saved on this computer (OK for local testing only)');
}

add('Website address (CLIENT_URL)', Boolean(env.CLIENT_URL), env.CLIENT_URL || 'Missing');
add('Session secret (JWT_SECRET)', env.JWT_SECRET.length >= 32 && !env.JWT_SECRET.startsWith('dev-only'), env.JWT_SECRET.startsWith('dev-only') ? 'Using a development secret — set your own' : 'Set');
add('Auto-refresh for Google (DEPLOY_HOOK_URL)', Boolean(env.DEPLOY_HOOK_URL), env.DEPLOY_HOOK_URL ? 'Set' : 'Not set — optional, but recommended', true);

console.log('\nATC server setup check\n');
rows.forEach((r) => console.log(`  ${r.ok ? '✓' : r.optional ? '–' : '✖'}  ${r.what.padEnd(42)} ${r.note}`));
console.log('');
await mongoose.disconnect().catch(() => {});
process.exit(rows.every((r) => r.ok || r.optional) ? 0 : 1);
