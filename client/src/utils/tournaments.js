import { getContent } from '../content/store';

const DAY = 864e5;

/**
 * A tournament's matches: those with its competition name, played from a day
 * before it starts to a day after it ends (or within its year, without an end date).
 */
export function tournamentMatches(x, content = getContent()) {
  const from = new Date(x.start).getTime() - DAY;
  const to = x.end ? new Date(x.end).getTime() + DAY : new Date(new Date(x.start).getFullYear() + 1, 0, 1).getTime();
  const inside = (m) => m.comp === x.comp && new Date(m.date).getTime() >= from && new Date(m.date).getTime() <= to;
  return {
    fixtures: content.FIXTURES.filter(inside),
    results: content.RESULTS.filter(inside),
  };
}

/** Is this club event still taking sign-ups on the website? */
export const eventOpen = (e) => Boolean(e?.signup) && new Date(e.signupBy || e.date).getTime() > Date.now();

/** Is the tournament taking team entries on the website right now? */
export const tournamentOpen = (x) => Boolean(x?.signup) && new Date(x.signupBy || x.end || x.start).getTime() > Date.now();
