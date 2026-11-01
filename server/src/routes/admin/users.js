import { Router } from 'express';
import User from '../../models/User.js';
import { requireOwner } from '../../middleware/auth.js';
import { record } from '../../services/audit.js';
import { hashPassword, passwordProblem } from '../../services/passwords.js';
import { badRequest, conflict, isObjectId, notFound } from '../../utils/http.js';

const router = Router();
router.use(requireOwner);

const ROLES = ['owner', 'editor'];
const cleanName = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 80) : '');
const cleanEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;

async function loadUser(id) {
  if (!isObjectId(id)) throw notFound('This person no longer exists.');
  const user = await User.findById(id);
  if (!user) throw notFound('This person no longer exists.');
  return user;
}

const otherActiveOwners = (id) => User.countDocuments({ _id: { $ne: id }, role: 'owner', active: true });

router.get('/', async (req, res) => {
  const users = await User.find().sort({ role: -1, name: 1 });
  res.json({ items: users.map((u) => u.toSafeJSON()) });
});

router.post('/', async (req, res) => {
  const name = cleanName(req.body?.name);
  const email = cleanEmail(req.body?.email);
  const role = ROLES.includes(req.body?.role) ? req.body.role : 'editor';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const errors = {};
  if (!name) errors.name = 'Please enter their name';
  if (!validEmail(email)) errors.email = 'Please enter a valid email address';
  const problem = passwordProblem(password, { email, name });
  if (problem) errors.password = problem;
  if (Object.keys(errors).length) throw badRequest('Some details need attention.', errors);
  if (await User.exists({ email })) throw conflict('Someone with this email address already exists.', { email: 'Already added' });

  const user = await User.create({ name, email, role, passwordHash: await hashPassword(password), mustChangePassword: true });
  record(req, { action: 'added a person', area: 'users', areaLabel: 'People', itemId: user._id, itemTitle: `${name} (${role})` });
  res.status(201).json({ item: user.toSafeJSON() });
});

router.patch('/:id', async (req, res) => {
  const user = await loadUser(req.params.id);
  const self = String(user._id) === String(req.user._id);
  const { name, role, active } = req.body || {};

  if (name !== undefined) {
    const n = cleanName(name);
    if (!n) throw badRequest('Please enter a name.', { name: 'Required' });
    user.name = n;
  }
  if (role !== undefined && role !== user.role) {
    if (!ROLES.includes(role)) throw badRequest('Unknown role.');
    if (self) throw badRequest('You can’t change your own role. Ask another owner.');
    if (user.role === 'owner' && !(await otherActiveOwners(user._id))) throw badRequest('There must always be at least one owner.');
    user.role = role;
  }
  if (active !== undefined && Boolean(active) !== user.active) {
    if (self) throw badRequest('You can’t switch off your own account.');
    if (!active && user.role === 'owner' && !(await otherActiveOwners(user._id))) throw badRequest('There must always be at least one active owner.');
    user.active = Boolean(active);
    if (!user.active) user.sessionVersion += 1; // signs them out everywhere
  }
  await user.save();
  record(req, { action: 'updated a person', area: 'users', areaLabel: 'People', itemId: user._id, itemTitle: user.name });
  res.json({ item: user.toSafeJSON() });
});

/** Give someone a new temporary password (they must change it when they next sign in). */
router.post('/:id/password', async (req, res) => {
  const user = await loadUser(req.params.id);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const problem = passwordProblem(password, user);
  if (problem) throw badRequest(problem, { password: problem });
  user.passwordHash = await hashPassword(password);
  user.sessionVersion += 1;
  user.failedLogins = 0;
  user.lockedUntil = null;
  user.mustChangePassword = String(user._id) !== String(req.user._id);
  await user.save();
  record(req, { action: 'set a new password for', area: 'users', areaLabel: 'People', itemId: user._id, itemTitle: user.name });
  res.json({ item: user.toSafeJSON() });
});

router.delete('/:id', async (req, res) => {
  const user = await loadUser(req.params.id);
  if (String(user._id) === String(req.user._id)) throw badRequest('You can’t remove yourself.');
  if (user.role === 'owner' && !(await otherActiveOwners(user._id))) throw badRequest('There must always be at least one owner.');
  await user.deleteOne();
  record(req, { action: 'removed a person', area: 'users', areaLabel: 'People', itemId: user._id, itemTitle: user.name });
  res.json({ ok: true });
});

export default router;
