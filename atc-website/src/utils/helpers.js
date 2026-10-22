import { useCallback, useEffect, useRef, useState } from 'react';
import { CLUB, TEAMS } from '../data/club';

const TZ = 'Asia/Kolkata';

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 36e5);
  if (diff >= 0 && hrs < 1) return 'Just now';
  if (diff >= 0 && hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return shortDate(iso);
}

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', timeZone: TZ });

export const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });

export const kickoff = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });

export const dayMonth = (iso) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: TZ }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: TZ }),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: TZ }),
  };
};

export const team = (code) => TEAMS[code];

// Deterministic pseudo-random so torn edges are stable between renders.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** A clip-path polygon with ragged, hand-torn edges. `amp` is the tear depth in px. */
export function tornClip(seed = 1, amp = 6, steps = 26, edges = 'trbl') {
  const r = rng(seed);
  const pts = [];
  const j = (on) => (on ? (r() * amp).toFixed(1) : 0);
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${j(edges.includes('t'))}px`);
  for (let i = 1; i <= steps; i++) pts.push(`calc(100% - ${j(edges.includes('r'))}px) ${(i / steps) * 100}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${(i / steps) * 100}% calc(100% - ${j(edges.includes('b'))}px)`);
  for (let i = steps - 1; i > 0; i--) pts.push(`${j(edges.includes('l'))}px ${(i / steps) * 100}%`);
  return `polygon(${pts.join(',')})`;
}

/** SVG path for a torn horizontal strip, used between page sections. */
export function tornStripPath(seed = 7, w = 1440, h = 28, step = 14) {
  const r = rng(seed);
  let d = `M0 ${h} L0 ${(h * 0.5).toFixed(1)}`;
  for (let x = step; x <= w; x += step) {
    const y = h * 0.15 + r() * h * 0.7 + (r() > 0.85 ? -h * 0.12 : 0);
    d += ` L${x} ${Math.max(0, y).toFixed(1)}`;
  }
  return `${d} L${w} ${h} Z`;
}

// ─── Hooks ────────────────────────────────────────────────────
export function useScroller() {
  const ref = useRef(null);
  const [state, setState] = useState({ prev: false, next: true, progress: 0, thumb: 1 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft < max - 4,
      progress: max > 0 ? el.scrollLeft / max : 0,
      thumb: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const go = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return { ref, ...state, goPrev: () => go(-1), goNext: () => go(1) };
}

export function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(target).getTime() - now);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    done: ms === 0,
    days: pad(Math.floor(ms / 864e5)),
    hours: pad(Math.floor(ms / 36e5) % 24),
    mins: pad(Math.floor(ms / 6e4) % 60),
    secs: pad(Math.floor(ms / 1e3) % 60),
  };
}

/** Adds `is-in` to elements with [data-reveal] as they scroll into view. */
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Calendar export ──────────────────────────────────────────
export function downloadIcs(matches) {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Adibasi Tarzan Club//Fixtures//EN', 'CALSCALE:GREGORIAN'];
  matches.forEach((m) => {
    const start = new Date(m.date);
    const end = new Date(start.getTime() + 2 * 36e5);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${m.id}@adibasitarzanclub.com`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(start.toISOString())}`,
      `DTEND:${stamp(end.toISOString())}`,
      `SUMMARY:${m.title || `${TEAMS[m.home].name} vs ${TEAMS[m.away].name}`}`,
      `LOCATION:${m.venue}`,
      `DESCRIPTION:${m.comp ? `${m.comp} — ${m.round}` : m.desc || ''}`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = matches.length === 1 ? 'atc-match.ics' : 'atc-fixtures.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function mailtoLetter({ name, place, contact, message }) {
  const body = `Dear ATC,\n\n${message}\n\nWith regards,\n${name}${place ? `\n${place}` : ''}${contact ? `\n${contact}` : ''}`;
  return `mailto:${CLUB.email}?subject=${encodeURIComponent(`A letter from ${name || 'a friend of the club'}`)}&body=${encodeURIComponent(body)}`;
}
