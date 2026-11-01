// Create the first "owner" account for the admin panel.
//   npm run create-admin
//   npm run create-admin -- --email you@example.com --name "Your Name"   (password is asked for)

import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDb } from '../db.js';
import User from '../models/User.js';
import { hashPassword, passwordProblem } from '../services/passwords.js';
import { args, ask } from './_cli.js';

const a = args();
await connectDb(env.MONGODB_URI, { attempts: 2 });

const name = (a.name && String(a.name)) || await ask('Full name: ');
const email = String((a.email && String(a.email)) || await ask('Email: ')).trim().toLowerCase();
if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('✖ Please give a name and a valid email.');
  process.exit(1);
}
if (await User.exists({ email })) {
  console.error(`✖ ${email} already has an account. To give it a new password use:  npm run reset-password`);
  process.exit(1);
}

const password = process.env.ADMIN_PASSWORD || await ask('Password (at least 10 characters, hidden): ', { hidden: true });
const problem = passwordProblem(password, { email, name });
if (problem) {
  console.error(`✖ ${problem}`);
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD) {
  const again = await ask('Type the password again: ', { hidden: true });
  if (again !== password) {
    console.error('✖ The two passwords are different. Nothing was created.');
    process.exit(1);
  }
}

await User.create({ name, email, role: 'owner', passwordHash: await hashPassword(password) });
console.log(`\n✓ Owner account created for ${email}. Sign in at <your website>/admin\n`);
await mongoose.disconnect();
