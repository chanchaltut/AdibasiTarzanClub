// ─────────────────────────────────────────────────────────────
// The website's content, as one shared object.
//
// Filled once at start-up (see load.js) from the server, a saved copy,
// or the built-in defaults — and replaced if fresher content arrives.
// Components read it with useContent(); plain functions (SEO, calendar
// export) read it with getContent().
// ─────────────────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';
import { setRuntimeTranslations } from '../i18n';

const LISTS = ['FIXTURES', 'RESULTS', 'EVENTS', 'PROMOS', 'STORIES', 'EXPLORE', 'NEWS', 'SQUAD', 'COMMITTEE', 'HONOURS', 'TIMELINE', 'FAQ', 'MEMBER_FAQ', 'MEMBERSHIP_TIERS', 'GALLERY', 'VIDEOS', 'DOCUMENTS', 'PARTNERS'];

let current = null;
const listeners = new Set();

/** Never let a missing section crash a page: every list exists, every map exists. */
function normalise(c) {
  const out = { ...c };
  LISTS.forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
  ['TEAMS', 'PAGES', 'SLOTS'].forEach((k) => { out[k] = out[k] && typeof out[k] === 'object' ? out[k] : {}; });
  out.CLUB = { address: [], socials: {}, maps: {}, coords: { lat: 25.6293, lng: 88.2028 }, ...(out.CLUB || {}) };
  out.RIBBON = out.RIBBON || { enabled: false };
  out.LEGACY = out.LEGACY && Array.isArray(out.LEGACY.intro) ? out.LEGACY : null;
  out.I18N = out.I18N || { hi: {}, bn: {} };
  return out;
}

export function setContent(content) {
  current = normalise(content);
  setRuntimeTranslations(current.I18N);
  listeners.forEach((fn) => fn());
}

export function getContent() {
  if (!current) throw new Error('Content used before it was loaded');
  return current;
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** The current content; the component re-renders when it changes. */
export function useContent() {
  return useSyncExternalStore(subscribe, getContent, getContent);
}

/** The club's own team code/id (for "is this a home match?"). */
export const isClubTeam = (code) => Boolean(getContent().TEAMS[code]?.isClub);
