// ─────────────────────────────────────────────────────────────
// Keeping the website's search-engine copy fresh.
//
// Visitors see changes straight away (the site reads the latest
// content when it opens). Google, WhatsApp link previews and AI
// assistants read the pre-built pages instead, so a few minutes after
// the last change we ask Vercel to rebuild them. Many edits in a row
// lead to one rebuild, not one each, and continuous editing still
// triggers a rebuild at least every 15 minutes.
// ─────────────────────────────────────────────────────────────

import env from '../config/env.js';
import State from '../models/State.js';
import { log } from '../utils/http.js';

const KEY = 'website-rebuild';
const MAX_WAIT_MS = 15 * 60_000;

const state = {
  configured: Boolean(env.DEPLOY_HOOK_URL),
  pending: false,
  firstChangeAt: null,
  dueAt: null,
  lastRunAt: null,
  lastOk: null,
  lastError: null,
};
let timer = null;

const persist = () => State.updateOne({ key: KEY }, { $set: { value: { ...state } } }, { upsert: true })
  .catch((err) => log.warn('Could not save rebuild state:', err.message));

function schedule(ms) {
  clearTimeout(timer);
  timer = setTimeout(() => { run().catch(() => {}); }, Math.max(1000, ms));
  timer.unref?.();
}

export function contentChanged() {
  if (!state.configured) return;
  const now = Date.now();
  state.pending = true;
  state.firstChangeAt ||= now;
  const due = Math.min(now + env.REBUILD_DELAY_MINUTES * 60_000, state.firstChangeAt + MAX_WAIT_MS);
  state.dueAt = new Date(due).toISOString();
  schedule(due - now);
  persist();
}

export async function run() {
  if (!state.configured) return { ok: false, error: 'Automatic website refresh is not set up yet (DEPLOY_HOOK_URL).' };
  clearTimeout(timer);
  state.lastRunAt = new Date().toISOString();
  try {
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST', signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`Vercel answered ${res.status}`);
    Object.assign(state, { pending: false, firstChangeAt: null, dueAt: null, lastOk: true, lastError: null });
    log.info('Website rebuild requested');
  } catch (err) {
    Object.assign(state, { lastOk: false, lastError: err.message });
    log.warn('Website rebuild request failed:', err.message);
    // Try again in 10 minutes rather than giving up.
    state.dueAt = new Date(Date.now() + 10 * 60_000).toISOString();
    schedule(10 * 60_000);
  }
  await persist();
  return { ok: state.lastOk, error: state.lastError };
}

export function rebuildStatus() {
  return { ...state };
}

/** After a restart, carry on with a rebuild that was waiting. */
export async function restoreRebuild() {
  if (!state.configured) return;
  const saved = await State.findOne({ key: KEY }).lean().catch(() => null);
  if (!saved?.value) return;
  const { pending, firstChangeAt, lastRunAt, lastOk, lastError } = saved.value;
  Object.assign(state, { lastRunAt, lastOk, lastError });
  if (pending) {
    state.pending = true;
    state.firstChangeAt = firstChangeAt || Date.now();
    state.dueAt = new Date(Date.now() + 60_000).toISOString();
    schedule(60_000);
  }
}
