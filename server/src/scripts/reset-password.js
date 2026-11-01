// Give any account a new password and unlock it (e.g. the owner forgot theirs).
//   npm run reset-password -- --email you@example.com

import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDb } from '../db.js';
import User from '../models/User.js';
import { hashPassword, passwordProblem } from '../services/passwords.js';
import { args, ask } from './_cli.js';

const a = args();
await connectDb(env.MONGODB_URI, { attempts: 2 });

const email = String((a.email && String(a.email)) || await ask('Email of the account: ')).trim().toLowerCase();
const user = await User.findOne({ email });
if (!user) {
  console.error(`✖ No account found for ${email}.`);
  process.exit(1);
}
const password = process.env.NEW_PASSWORD || await ask('New password (hidden): ', { hidden: true });
const problem = passwordProblem(password, user);
if (problem) {
  console.error(`✖ ${problem}`);
  process.exit(1);
}
user.passwordHash = await hashPassword(password);
user.sessionVersion += 1;
user.failedLogins = 0;
user.lockedUntil = null;
user.active = true;
user.mustChangePassword = false;
await user.save();
console.log(`\n✓ New password set for ${email}. They are signed out everywhere and can sign in again now.\n`);
await mongoose.disconnect();
