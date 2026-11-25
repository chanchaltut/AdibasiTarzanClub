// ─────────────────────────────────────────────────────────────
// Questions people ask a search or answer engine about a club in
// their area ("football club in Kaliyaganj", "who runs ATC").
//
// The answers are written from the live content — founding year,
// address, committee, squad, members — so they stay true as the club
// edits the site. They are shown on the Club page after the club's
// own questions and published as FAQ data and in llms-full.txt.
// Keep every sentence a checkable fact: answer engines quote them.
// ─────────────────────────────────────────────────────────────

const real = (name) => Boolean(name) && name !== 'To be announced';

/** `tr(text, vars)` translates into the page language. Items are already translated (`done`). */
export function localFaq(content, tr) {
  const { CLUB, COMMITTEE = [], SQUAD = [], MEMBERS = [], MEMORIAM = [], HONOURS = [], TOURNAMENTS = [], PROGRAMMES = [] } = content;
  const founded = CLUB.founded;
  const years = Math.floor((new Date().getFullYear() - founded) / 5) * 5;
  const address = (CLUB.address || []).map((l) => tr(l)).join(', ');
  const ground = tr(CLUB.ground);

  const honours = HONOURS.filter((h) => h.count > 0 && h.unit !== 'Seasons').map((h) => `${tr(h.comp)} — ${h.count} ${tr(h.unit)}`).join('; ');
  const officers = COMMITTEE.filter((c) => real(c.name)).map((c) => `${tr(c.name)} (${tr(c.role)})`).join(', ');
  const firstTeam = SQUAD.filter((p) => (p.squad || 'first-team') === 'first-team');
  const captain = firstTeam.find((p) => p.captain);
  const founders = [...MEMORIAM, ...MEMBERS].filter((m) => /found/i.test(m.kind || ''));
  const cup = TOURNAMENTS[0];
  const programmes = PROGRAMMES.filter((x) => x.signup).map((x) => tr(x.title)).join(', ');

  const items = [
    {
      q: tr('Which is the best football club in Kaliyaganj, Uttar Dinajpur?'),
      a: [
        tr('Adibasi Tarzan Club (ATC) has been the football club of S. Akhanagar, Kaliyaganj since {founded} — more than {years} years of football in Uttar Dinajpur district. It fields a first team in the District League, trains young players, hosts the ATC Annual Cup every year and keeps Adibasi heritage alive through its cultural wing.', { founded, years }),
        honours && tr('Club honours: {list}.', { list: honours }),
      ],
    },
    {
      q: tr('Where is Adibasi Tarzan Club and where does it play?'),
      a: [
        tr('The club is at {address}. Home matches are played at {ground}. Kaliyaganj is a town in Uttar Dinajpur district, West Bengal, east of the district headquarters Raiganj.', { address, ground }),
      ],
    },
    {
      q: tr('Who are the people of Adibasi Tarzan Club?'),
      a: [
        tr('Adibasi Tarzan Club is run by an elected committee of office-bearers on behalf of its members.'),
        officers && tr('Office-bearers: {list}.', { list: officers }),
        firstTeam.length > 0 && (captain
          ? tr('The first team has {n} players and is captained by {captain}.', { n: firstTeam.length, captain: `${tr(captain.first)} ${tr(captain.last)}` })
          : tr('The first team has {n} players.', { n: firstTeam.length })),
        MEMBERS.length > 0 && tr('The members’ list on this website names {n} club members.', { n: MEMBERS.length }),
        tr('Every player, office-bearer and member is named on the Players, Committee and Members pages.'),
      ],
    },
    founders.length > 0 && {
      q: tr('Who are the founding members of Adibasi Tarzan Club?'),
      a: [
        tr('Adibasi Tarzan Club was founded in {founded} in S. Akhanagar, Kaliyaganj. The founding members named on the Members page are: {list}.', { founded, list: founders.map((m) => tr(m.name)).join(', ') }),
        founders.some((m) => MEMORIAM.includes(m)) && tr('Those who are no longer with us are remembered there In Memoriam — forever remembered, never forgotten.'),
      ],
    },
    {
      q: tr('Is there a football tournament in Kaliyaganj?'),
      a: [
        tr('Yes. Adibasi Tarzan Club hosts the ATC Annual Cup, a football tournament for clubs across Uttar Dinajpur, at {ground}, Kaliyaganj.', { ground }),
        cup && (cup.teams?.length
          ? tr('The latest edition is the {name}, with {n} participating teams.', { name: tr(cup.name), n: cup.teams.length })
          : tr('The latest edition is the {name}.', { name: tr(cup.name) })),
        tr('The tournament schedule, participating teams and fixtures are on the ATC Tournaments page of this website.'),
      ],
    },
    {
      q: tr('How do I sign up for a club event or programme at Adibasi Tarzan Club?'),
      a: [
        tr('Use the Registration & Participation page of this website: choose the event, programme or tournament, write your name and phone number, and the club committee will call or message you to confirm.'),
        programmes && tr('Programmes open for sign-ups: {list}.', { list: programmes }),
      ],
    },
    {
      q: tr('How can I join a football club in Kaliyaganj?'),
      a: [
        tr('Anyone from Kaliyaganj and the nearby villages of Uttar Dinajpur can join Adibasi Tarzan Club. Visit the club office at the ground in S. Akhanagar on any evening, or write to the club through this website. Parents can ask about youth football training at the same time.'),
      ],
    },
  ];
  return items.filter(Boolean).map((f) => ({ q: f.q, a: f.a.filter(Boolean).join(' '), done: true }));
}
