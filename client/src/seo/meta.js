// ─────────────────────────────────────────────────────────────
// Search, social and answer-engine metadata for every route.
//
// One source of truth: the browser uses it to update <head> on
// navigation, and the build uses it to prerender each page, the
// sitemap and llms.txt. Copy here should stay factual — answer
// engines quote it word for word.
// ─────────────────────────────────────────────────────────────

import { getContent } from '../content/store';
import { imgUrl } from '../content/image';
import { localFaq } from './localFaq';
import { CREST_FAQ, CREST_IMAGE, CREST_INTRO, CREST_MESSAGE, CREST_PARTS } from '../data/crest';
import { GALLERY_SECTIONS, sectionOf } from '../data/gallery';
import { eventOpen, tournamentMatches, tournamentOpen } from '../utils/tournaments';
import { LANG_CODES, LANGS, langFromPath, localePath, stripLang, translate } from '../i18n';

// The content these functions describe. Every exported function calls sync() first, so it
// always works from whatever the site currently shows (server content, saved copy or defaults).
let CLUB; let EVENTS; let FAQ; let FIXTURES; let HONOURS; let MEMBERSHIP_TIERS; let NEWS; let RESULTS; let SQUAD; let TEAMS; let TIMELINE; let GALLERY; let COMMITTEE; let MEMBERS;
let MATCH_INFO; let TOURNAMENTS; let PROGRAMMES;
function sync() {
  ({
    CLUB, EVENTS, FAQ, FIXTURES, HONOURS, MEMBERSHIP_TIERS, NEWS, RESULTS, SQUAD, TEAMS, TIMELINE, GALLERY, COMMITTEE, MEMBERS, MATCH_INFO, TOURNAMENTS, PROGRAMMES,
  } = getContent());
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const photoUrl = (p) => (p ? abs(imgUrl(p, 1600)) : null);

export const SITE = {
  url: 'https://www.adibasitarzanclub.in',
  name: 'Adibasi Tarzan Club',
  lang: 'en-IN',
  image: { src: '/brand/og-image.jpg?v=2', width: 1200, height: 630, alt: 'Adibasi Tarzan Club crest between the club motto, Rooted in the soil. United in spirit. — S. Akhanagar, Kaliyaganj, since 1981' },
  logo: '/brand/icon-512.png?v=2',
  // Names people actually type, including the common "Adivasi" spelling and Bengali.
  altNames: ['ATC', 'Adivasi Tarzan Club', 'Tarzan Club Kaliyaganj', 'ATC Kaliyaganj', 'আদিবাসী টারজান ক্লাব'],
  agency: { name: 'Code Hyphen', url: 'https://www.codehyphen.in' },
};

export const abs = (path = '/') => (/^https?:/.test(path) ? path : `${SITE.url}${path === '/' ? '/' : path}`);

const ID = {
  org: `${SITE.url}/#organization`,
  team: `${SITE.url}/#first-team`,
  site: `${SITE.url}/#website`,
  ground: `${SITE.url}/#ground`,
  agency: `${SITE.agency.url}/#organization`,
};

const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'S. Akhanagar',
  addressLocality: 'Kaliyaganj',
  addressRegion: 'West Bengal',
  postalCode: '733129',
  addressCountry: 'IN',
};

const geo = (c = CLUB.coords) => ({ '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng });

const summary = () => `${CLUB.name} (ATC) is a community football and cultural club founded in ${CLUB.founded} in S. Akhanagar, Kaliyaganj, Uttar Dinajpur district, West Bengal, India. It fields a first team in the District League, runs a youth football programme, hosts the ATC Annual Cup tournament and keeps Adibasi heritage alive through its cultural wing.`;

// ─── Pages ────────────────────────────────────────────────────
// `crumb` is the breadcrumb label; `type` the schema.org page type.
const PAGES = {
  '/': {
    title: 'Adibasi Tarzan Club — Kaliyaganj Football Club Since 1981',
    description: 'Official site of Adibasi Tarzan Club (ATC), the football and heritage club of S. Akhanagar, Kaliyaganj, Uttar Dinajpur since 1981. Fixtures, news, squad and membership.',
    type: 'WebPage',
  },
  '/club': {
    title: 'About the Club — History, Ground & Honours',
    description: 'The story of Adibasi Tarzan Club: founded in 1981 in S. Akhanagar, Kaliyaganj. Club history, home ground, honours, heritage wing, community work and FAQs.',
    crumb: 'Club',
    type: ['AboutPage', 'FAQPage'],
  },
  '/schedule': {
    title: 'Fixtures, Results & Club Events',
    description: 'Adibasi Tarzan Club fixtures, results, match updates and postponements, team reporting instructions and club events — Sports Day, Heritage Night and Prize Distribution at S. Akhanagar Ground, Kaliyaganj.',
    crumb: 'Schedule',
    type: 'CollectionPage',
  },
  '/tournaments': {
    title: 'ATC Annual Cup — Football Tournament in Kaliyaganj',
    description: 'The ATC Annual Cup football tournament hosted by Adibasi Tarzan Club at S. Akhanagar Ground, Kaliyaganj, Uttar Dinajpur: tournament schedule, participating teams, fixtures and results.',
    crumb: 'ATC Tournaments',
    type: 'CollectionPage',
  },
  '/register': {
    title: 'Registration & Participation — Sign Up for Club Events',
    description: 'Sign up for Adibasi Tarzan Club events and programmes in S. Akhanagar, Kaliyaganj — Sports Day, youth football coaching, the cultural troupe, volunteering and ATC Annual Cup team entries.',
    crumb: 'Registration & Participation',
    type: 'WebPage',
  },
  '/news': {
    title: 'Latest News',
    description: 'Match reports, club announcements, youth football and heritage news from Adibasi Tarzan Club, S. Akhanagar, Kaliyaganj, Uttar Dinajpur.',
    crumb: 'News',
    type: 'CollectionPage',
  },
  '/squad': {
    title: 'First Team Squad & Players',
    description: 'Meet the Adibasi Tarzan Club first team — goalkeepers, defenders, midfielders and forwards wearing the brown and gold for S. Akhanagar, Kaliyaganj.',
    crumb: 'Players',
    type: 'CollectionPage',
  },
  '/committee': {
    title: 'Committee & Office-Bearers',
    description: 'The elected committee and office-bearers who run Adibasi Tarzan Club — president, secretary, treasurer, sports and cultural secretaries and head coach.',
    crumb: 'Committee',
    type: 'WebPage',
  },
  '/members': {
    title: 'Club Members & In Memoriam',
    description: 'The members of Adibasi Tarzan Club, S. Akhanagar, Kaliyaganj — the founding members remembered In Memoriam, and the active life members, members, patrons and well-wishers who stand behind the club.',
    crumb: 'Members',
    type: 'WebPage',
  },
  '/gallery': {
    title: 'Gallery — Moments to Memories',
    description: 'Photos of Adibasi Tarzan Club, S. Akhanagar, Kaliyaganj: the football arena and Dashami Dhamaka, Kali Puja and club events, Baha and Sohrai Parab and Adibasi heritage, and the ATC family.',
    crumb: 'Gallery',
    type: 'ImageGallery',
  },
  '/membership': {
    title: 'Membership — Join the Club',
    description: 'Join Adibasi Tarzan Club as a Supporter, Member or Life Member. Vote at the AGM, get priority seats at the Annual Cup final and stand with S. Akhanagar.',
    crumb: 'Membership',
    type: 'WebPage',
  },
  '/crest': {
    title: 'Our Crest — The Story Behind the ATC Crest',
    description: 'What every part of the Adibasi Tarzan Club crest means: Estd. 1981, the jungle, Tarzan, the bow and arrows, the Tumdak and Tamak, the Bengali inscription, the football, ATC, the shield and the maroon and blue colours.',
    crumb: 'Our Crest',
    type: ['AboutPage', 'FAQPage'],
  },
  '/contact': {
    title: 'Contact & Partnerships',
    description: 'Contact Adibasi Tarzan Club in S. Akhanagar, Kaliyaganj, Uttar Dinajpur. Write to the club, register a team for the Annual Cup or become a club partner.',
    crumb: 'Contact',
    type: 'ContactPage',
  },
};

export const STATIC_PATHS = Object.keys(PAGES);
export function articlePaths() {
  sync();
  return NEWS.map((n) => `/news/${n.slug}`);
}

// ─── Local search ─────────────────────────────────────────────
// What people nearby actually type. Used as organisation keywords and in llms.txt.
const LOCAL_KEYWORDS = [
  'football club in Kaliyaganj',
  'football club in Uttar Dinajpur',
  'football club near Raiganj',
  'football club in S. Akhanagar',
  'Adibasi football club in West Bengal',
  'youth football training in Kaliyaganj',
  'football tournament in Kaliyaganj',
  'football tournament in Uttar Dinajpur',
  'ATC Annual Cup Kaliyaganj',
  'Adibasi culture in Kaliyaganj',
  'Sohrai and Baha Parab in Uttar Dinajpur',
  'Kali Puja in S. Akhanagar',
];

// ─── People ───────────────────────────────────────────────────
// Every player, office-bearer and member is published as a person who belongs to the
// club, so a search for "<name> Adibasi Tarzan Club" finds them here.
const named = (name) => Boolean(name) && name !== 'To be announced';
const squadOf = (p) => p.squad || 'first-team';

function personNode({ name, role, photo, url, team: inTeam }, tr) {
  return {
    '@type': 'Person',
    name,
    ...(role && { jobTitle: role }),
    description: tr('{name} — {role}, Adibasi Tarzan Club (ATC), S. Akhanagar, Kaliyaganj.', { name, role: role || tr('Member') }),
    ...(photoUrl(photo) && { image: photoUrl(photo) }),
    url,
    affiliation: { '@id': ID.org },
    memberOf: inTeam ? [{ '@id': ID.team }, { '@id': ID.org }] : { '@id': ID.org },
  };
}

const playerNode = (p, tr, url) => personNode({
  name: `${tr(p.first)} ${tr(p.last)}`,
  role: [tr(p.pos), p.captain && tr('Captain'), squadOf(p) === 'youth' && tr('Youth (U-17)'), squadOf(p) === 'veterans' && tr('Veterans')].filter(Boolean).join(', '),
  photo: p.photo,
  url,
  team: squadOf(p) === 'first-team',
}, tr);
const officerNode = (c, tr, url) => personNode({ name: tr(c.name), role: tr(c.role), photo: c.photo, url }, tr);
const memberNode = (m, tr, url) => {
  const node = personNode({ name: tr(m.name), role: tr(m.kind || 'Member'), photo: m.photo, url }, tr);
  if (m.memoriam) node.description = tr('{name} — {role}, Adibasi Tarzan Club (ATC), S. Akhanagar, Kaliyaganj. Remembered by the club: In Memoriam.', { name: node.name, role: tr(m.kind || 'Member') });
  return node;
};

const peopleList = (name, people) => ({
  '@type': 'ItemList',
  name,
  numberOfItems: people.length,
  itemListElement: people.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
});

// ─── Schema.org nodes ─────────────────────────────────────────
const organization = () => ({
  '@type': ['SportsClub', 'SportsOrganization'],
  '@id': ID.org,
  name: CLUB.name,
  alternateName: SITE.altNames,
  url: abs('/'),
  logo: { '@type': 'ImageObject', url: abs(SITE.logo), width: 512, height: 512 },
  image: abs(SITE.image.src),
  description: summary(),
  slogan: CLUB.motto,
  foundingDate: String(CLUB.founded),
  foundingLocation: { '@type': 'Place', name: 'S. Akhanagar, Kaliyaganj, West Bengal' },
  sport: 'Football',
  ...(CLUB.email && { email: CLUB.email }),
  ...(CLUB.phone && { telephone: CLUB.phone }),
  address: ADDRESS,
  geo: geo(CLUB.clubCoords || CLUB.coords),
  ...(CLUB.maps.club && { hasMap: CLUB.maps.club }),
  location: { '@id': ID.ground },
  areaServed: [
    { '@type': 'City', name: 'Kaliyaganj' },
    { '@type': 'City', name: 'Raiganj' },
    { '@type': 'City', name: 'Hemtabad' },
    { '@type': 'AdministrativeArea', name: 'Uttar Dinajpur district' },
    { '@type': 'State', name: 'West Bengal' },
  ],
  keywords: LOCAL_KEYWORDS.join(', '),
  knowsAbout: ['Football', 'Youth football coaching', 'Adivasi culture and heritage', 'Community sport', 'Football tournaments', 'Baha Parab', 'Sohrai Parab', 'Tumdak and Tamak drums'],
  contactPoint: {
    '@type': 'ContactPoint', contactType: 'customer support', email: CLUB.email, areaServed: 'IN', availableLanguage: ['English', 'Bengali'],
  },
  sameAs: Object.values(CLUB.socials),
});

const ground = () => ({
  '@type': ['StadiumOrArena', 'SportsActivityLocation'],
  '@id': ID.ground,
  name: CLUB.ground,
  address: ADDRESS,
  geo: geo(),
  ...(CLUB.maps.ground && { hasMap: CLUB.maps.ground }),
});

const website = () => ({
  '@type': 'WebSite',
  '@id': ID.site,
  url: abs('/'),
  name: CLUB.name,
  alternateName: SITE.altNames,
  description: summary(),
  inLanguage: SITE.lang,
  publisher: { '@id': ID.org },
  creator: { '@id': ID.agency },
});

const agency = () => ({
  '@type': 'Organization',
  '@id': ID.agency,
  name: SITE.agency.name,
  url: SITE.agency.url,
  description: 'Website design and development agency.',
});

const team = (athletes) => ({
  '@type': 'SportsTeam',
  '@id': ID.team,
  name: `${CLUB.name} First Team`,
  alternateName: 'ATC',
  sport: 'Football',
  gender: 'Male',
  parentOrganization: { '@id': ID.org },
  location: { '@id': ID.ground },
  logo: abs(SITE.logo),
  ...(athletes && { athlete: athletes }),
});

const teamRef = (code) => (TEAMS[code]?.isClub
  ? { '@id': ID.team }
  : { '@type': 'SportsTeam', name: TEAMS[code]?.name || 'Opponent', sport: 'Football' });

const place = (venue, tr) => (venue === CLUB.ground
  ? { '@id': ID.ground }
  : { '@type': 'Place', name: tr(venue), address: { '@type': 'PostalAddress', addressRegion: 'West Bengal', addressCountry: 'IN' } });

const plus2h = (iso) => new Date(new Date(iso).getTime() + 2 * 36e5).toISOString();

const matchEvent = (m, tr, url) => {
  const home = tr(TEAMS[m.home]?.name || '');
  const away = tr(TEAMS[m.away]?.name || '');
  return {
    '@type': 'SportsEvent',
    name: `${home} vs ${away} — ${tr(m.comp)}`,
    description: `${tr(m.comp)}${m.round ? `, ${tr(m.round)}` : ''}${m.score ? `. ${m.score[0]}–${m.score[1]}.` : '.'}`,
    sport: 'Football',
    startDate: m.date,
    endDate: plus2h(m.date),
    eventStatus: `https://schema.org/${{ postponed: 'EventPostponed', cancelled: 'EventCancelled' }[m.status] || 'EventScheduled'}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: place(m.venue, tr),
    homeTeam: teamRef(m.home),
    awayTeam: teamRef(m.away),
    competitor: [teamRef(m.home), teamRef(m.away)],
    organizer: { '@id': ID.org },
    image: abs(SITE.image.src),
    url,
    ...(m.entry === 'Free entry' && {
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url },
    }),
  };
};

const clubEvent = (e, tr, url) => ({
  '@type': e.kind === 'Football' ? 'SportsEvent' : 'Event',
  name: tr(e.title),
  description: tr(e.desc || e.title),
  startDate: e.date,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: e.venue === CLUB.ground ? { '@id': ID.ground } : { '@type': 'Place', name: `${tr(e.venue)}, ${tr('S. Akhanagar')}`, address: ADDRESS },
  organizer: { '@id': ID.org },
  image: photoUrl(e.photo) || abs(SITE.image.src),
  url: `${url}?tab=events`,
  ...(eventOpen(e) && { offers: { '@type': 'Offer', url: abs('/register'), availability: 'https://schema.org/InStock', ...(e.signupBy && { validThrough: e.signupBy }) } }),
});

/** A tournament, its matches as sub-events and its teams as competitors. */
const tournamentEvent = (x, tr, url) => {
  const { fixtures, results } = tournamentMatches(x, getContent());
  return {
    '@type': 'SportsEvent',
    '@id': `${abs('/tournaments')}#${x.id}`,
    name: tr(x.name),
    description: (x.about || []).map(tr).join(' ') || tr('Football tournament hosted by Adibasi Tarzan Club at S. Akhanagar Ground, Kaliyaganj.'),
    sport: 'Football',
    startDate: x.start,
    ...(x.end && { endDate: x.end }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: place(x.venue, tr),
    organizer: { '@id': ID.org },
    image: photoUrl(x.photo) || abs(SITE.image.src),
    url,
    ...(x.teams.length && { competitor: x.teams.map((tm) => teamRef(tm.team)) }),
    ...([...fixtures, ...results].length && { subEvent: [...fixtures, ...results].map((m) => matchEvent(m, tr, url)) }),
    ...(tournamentOpen(x) && { offers: { '@type': 'Offer', name: tr('Team entry'), url: abs('/register'), availability: 'https://schema.org/InStock', ...(x.signupBy && { validThrough: x.signupBy }) } }),
  };
};

const programmeNode = (x, tr) => ({
  '@type': 'Service',
  name: tr(x.title),
  description: tr(x.desc),
  provider: { '@id': ID.org },
  areaServed: [{ '@type': 'City', name: 'Kaliyaganj' }, { '@type': 'AdministrativeArea', name: 'Uttar Dinajpur district' }],
  ...(x.venue && { availableChannel: { '@type': 'ServiceChannel', serviceLocation: place(x.venue, tr) } }),
  ...(x.photo && { image: photoUrl(x.photo) }),
  url: abs('/register'),
});

const faqEntities = (items) => items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }));

const breadcrumb = (url, trail, lang) => ({
  '@type': 'BreadcrumbList',
  '@id': `${url}#breadcrumb`,
  itemListElement: [{ name: translate(lang, 'Home'), path: '/' }, ...trail].map((c, i) => ({
    '@type': 'ListItem', position: i + 1, name: c.name, item: abs(localePath(lang, c.path)),
  })),
});

// Extra nodes or page properties per route.
function pageExtras(path, lang) {
  const tr = (text, vars) => translate(lang, text, vars);
  const url = abs(localePath(lang, path));
  switch (path) {
    case '/club':
      return {
        page: {
          mainEntity: [
            ...FAQ.map((f) => ({ q: tr(f.q), a: tr(f.a) })),
            ...localFaq(getContent(), tr),
          ].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
        nodes: [{
          '@type': 'ItemList',
          name: 'Adibasi Tarzan Club history timeline',
          itemListElement: TIMELINE.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `${t.year} — ${tr(t.title)}`, description: tr(t.text) })),
        }, {
          '@type': 'ItemList',
          name: 'Adibasi Tarzan Club honours',
          itemListElement: HONOURS.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: `${tr(h.comp)}: ${h.count} ${tr(h.unit)}` })),
        }],
      };
    case '/schedule':
      return {
        page: {
          mainEntity: {
            '@type': 'ItemList',
            name: 'Adibasi Tarzan Club fixtures, results and events',
            itemListElement: [...FIXTURES, ...RESULTS].map((m) => matchEvent(m, tr, url)).concat(EVENTS.map((e) => clubEvent(e, tr, url)))
              .map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
          },
        },
      };
    case '/news':
      return {
        page: {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: NEWS.map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(localePath(lang, `/news/${n.slug}`)), name: tr(n.title) })),
          },
        },
      };
    case '/squad': {
      const others = SQUAD.filter((p) => squadOf(p) !== 'first-team');
      return {
        page: { mainEntity: { '@id': ID.team } },
        nodes: [
          team(SQUAD.filter((p) => squadOf(p) === 'first-team').map((p) => playerNode(p, tr, url))),
          ...(others.length ? [peopleList('Adibasi Tarzan Club youth and veterans players', others.map((p) => playerNode(p, tr, url)))] : []),
        ],
      };
    }
    case '/committee': {
      const officers = COMMITTEE.filter((c) => named(c.name));
      return officers.length
        ? { page: { mainEntity: peopleList('Adibasi Tarzan Club committee and office-bearers', officers.map((c) => officerNode(c, tr, url))) } }
        : {};
    }
    case '/members': {
      const remembered = MEMBERS.filter((m) => m.memoriam);
      const active = MEMBERS.filter((m) => !m.memoriam);
      return MEMBERS.length
        ? {
          page: {
            mainEntity: [
              ...(remembered.length ? [peopleList('Adibasi Tarzan Club — In Memoriam, founding members', remembered.map((m) => memberNode(m, tr, `${url}#in-memoriam`)))] : []),
              ...(active.length ? [peopleList('Adibasi Tarzan Club members (active)', active.map((m) => memberNode(m, tr, `${url}#club-members`)))] : []),
            ],
          },
        }
        : {};
    }
    case '/gallery': {
      const image = (g) => ({
        '@type': 'ImageObject',
        contentUrl: photoUrl(g.photo),
        caption: [tr(g.cap), g.album && tr(g.album)].filter(Boolean).join(' — '),
        creditText: CLUB.name,
        copyrightNotice: `© ${CLUB.name}`,
        contentLocation: { '@type': 'Place', name: 'S. Akhanagar, Kaliyaganj, Uttar Dinajpur, West Bengal' },
      });
      return {
        page: {
          hasPart: GALLERY_SECTIONS.map((sec) => {
            const shots = GALLERY.filter((g) => sectionOf(g) === sec.id);
            return {
              '@type': 'ImageGallery',
              name: `${tr(sec.title)} — ${tr(CLUB.name)}`,
              description: tr(sec.blurb),
              url: abs(localePath(lang, `/gallery?section=${sec.id}`)),
              keywords: sec.albums.map(tr).join(', '),
              ...(shots.length && { image: shots.slice(0, 30).map(image) }),
            };
          }),
        },
      };
    }
    case '/tournaments':
      return TOURNAMENTS.length
        ? { page: { mainEntity: { '@type': 'ItemList', name: 'ATC tournaments', itemListElement: TOURNAMENTS.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: tournamentEvent(x, tr, url) })) } } }
        : {};
    case '/register': {
      const items = [
        ...EVENTS.filter(eventOpen).map((e) => clubEvent(e, tr, abs(localePath(lang, '/schedule')))),
        ...PROGRAMMES.filter((x) => x.signup).map((x) => programmeNode(x, tr)),
        ...TOURNAMENTS.filter(tournamentOpen).map((x) => tournamentEvent(x, tr, abs(localePath(lang, '/tournaments')))),
      ];
      return items.length
        ? { page: { mainEntity: { '@type': 'ItemList', name: 'Open for sign-ups at Adibasi Tarzan Club', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })) } } }
        : {};
    }
    case '/crest':
      return {
        page: {
          mainEntity: faqEntities(CREST_FAQ.map((f) => ({ q: tr(f.q), a: tr(f.a) }))),
          primaryImageOfPage: { '@id': `${url}#crest` },
        },
        nodes: [{
          '@type': 'ImageObject',
          '@id': `${url}#crest`,
          contentUrl: abs(CREST_IMAGE.src),
          width: CREST_IMAGE.width,
          height: CREST_IMAGE.height,
          name: tr(CREST_INTRO.title),
          caption: tr('The crest of Adibasi Tarzan Club, S. Akhanagar, Kaliyaganj — established 1981'),
          description: CREST_PARTS.map((p) => `${tr(p.label)}: ${tr(p.title)}`).join('; '),
          creditText: CLUB.name,
          copyrightNotice: `© ${CLUB.name}`,
          about: { '@id': ID.org },
        }, {
          '@type': 'ItemList',
          name: 'Parts of the Adibasi Tarzan Club crest and what they mean',
          itemListElement: CREST_PARTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${tr(p.label)} — ${tr(p.title)}`, description: tr(p.body[0]), url: `${url}#${p.id}` })),
        }],
      };
    case '/membership':
      return {
        page: {
          mainEntity: {
            '@type': 'OfferCatalog',
            name: 'Adibasi Tarzan Club membership',
            itemListElement: MEMBERSHIP_TIERS.map((t) => ({
              '@type': 'Offer',
              name: tr(t.name),
              description: t.perks.map((p) => tr(p)).join('; '),
              offeredBy: { '@id': ID.org },
              ...(t.price === 'Free' && { price: 0, priceCurrency: 'INR' }),
            })),
          },
        },
      };
    case '/contact':
      return { page: { mainEntity: { '@id': ID.org } } };
    default:
      return {};
  }
}

const graph = (nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

const baseNodes = () => [organization(), ground(), website(), agency()];

// ─── Public API ───────────────────────────────────────────────
const alternates = (base) => LANG_CODES.map((code) => ({ hreflang: LANGS[code].hreflang, href: abs(localePath(code, base)) }));

/** Everything <head> needs for a pathname, in the language its prefix names. Unknown paths return 404 meta. */
export function getPageMeta(pathname) {
  sync();
  const lang = langFromPath(pathname);
  const tr = (text, vars) => translate(lang, text, vars);
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const path = stripLang(clean);

  const article = path.startsWith('/news/') && NEWS.find((n) => `/news/${n.slug}` === path);
  if (article) return articleMeta(article, path, lang);

  const page = PAGES[path];
  if (!page) {
    return {
      lang,
      title: `${tr('Page not found')} — ${tr(CLUB.name)}`,
      description: tr('This page could not be found. Head back to the Adibasi Tarzan Club home page for fixtures, news and club information.'),
      path: null,
      noindex: true,
      jsonLd: null,
    };
  }

  const url = abs(localePath(lang, path));
  const extras = pageExtras(path, lang);
  const title = path === '/' ? tr(page.title) : `${tr(page.title)} | ${tr(CLUB.name)}`;
  // Name the office-bearers in the search snippet itself.
  const officers = path === '/committee'
    ? COMMITTEE.filter((c) => named(c.name)).slice(0, 4).map((c) => `${tr(c.role)}: ${tr(c.name)}`).join(' · ')
    : '';
  const description = officers ? `${tr(page.description)} ${officers}.` : tr(page.description);
  const nodes = [
    ...baseNodes(),
    ...(path === '/' ? [team()] : []),
    {
      '@type': page.type,
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: LANGS[lang].hreflang,
      isPartOf: { '@id': ID.site },
      about: { '@id': ID.org },
      primaryImageOfPage: { '@type': 'ImageObject', url: abs(SITE.image.src), width: SITE.image.width, height: SITE.image.height },
      ...(page.crumb && { breadcrumb: { '@id': `${url}#breadcrumb` } }),
      ...(path === '/' && { speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero__title', '.hero__desc'] } }),
      ...extras.page,
    },
    ...(page.crumb ? [breadcrumb(url, [{ name: tr(page.crumb), path }], lang)] : []),
    ...(extras.nodes || []),
  ];

  return { lang, title, description, path: localePath(lang, path), alternates: alternates(path), type: 'website', jsonLd: graph(nodes) };
}

function articleMeta(n, path, lang) {
  const tr = (text) => translate(lang, text);
  const url = abs(localePath(lang, path));
  const headline = tr(n.title);
  const title = `${headline} | ${tr(CLUB.name)}`;
  const nodes = [
    ...baseNodes(),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description: tr(n.desc),
      inLanguage: LANGS[lang].hreflang,
      isPartOf: { '@id': ID.site },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.article-hero__title', '.article-sheet__lead'] },
    },
    {
      '@type': 'NewsArticle',
      '@id': `${url}#article`,
      headline,
      description: tr(n.desc),
      articleSection: tr(n.tag),
      articleBody: (n.body || []).map(tr).join('\n\n'),
      wordCount: (n.body || []).map(tr).join(' ').split(/\s+/).filter(Boolean).length,
      image: [n.ogImage, photoUrl(n.photo), abs(SITE.image.src)].filter(Boolean),
      datePublished: n.date,
      dateModified: n.date,
      inLanguage: LANGS[lang].hreflang,
      author: { '@id': ID.org },
      publisher: { '@id': ID.org },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      about: { '@id': ID.org },
      contentLocation: { '@type': 'Place', name: 'Kaliyaganj, Uttar Dinajpur, West Bengal, India' },
    },
    breadcrumb(url, [{ name: tr('News'), path: '/news' }, { name: headline, path }], lang),
  ];
  return {
    lang,
    title,
    description: tr(n.desc),
    path: localePath(lang, path),
    alternates: alternates(path),
    type: 'article',
    article: { published: n.date, section: tr(n.tag) },
    ...(n.ogImage && { image: { src: n.ogImage, width: 1200, height: 630, alt: headline, type: 'image/jpeg' } }),
    jsonLd: graph(nodes),
  };
}

/** The <head> tags for a page, as plain data both the browser and the build can render. */
export function headTags(meta) {
  sync();
  const url = meta.path ? abs(meta.path) : null;
  const image = meta.image || { ...SITE.image, type: 'image/jpeg' };
  const img = abs(image.src);
  const lang = LANGS[meta.lang || 'en'];
  const tags = [
    ['title', {}, meta.title],
    ['meta', { name: 'description', content: meta.description }],
    ['meta', { name: 'robots', content: meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
  ];
  if (url) {
    tags.push(
      ['link', { rel: 'canonical', href: url }],
      ...meta.alternates.map((a) => ['link', { rel: 'alternate', hreflang: a.hreflang, href: a.href }]),
      ['link', { rel: 'alternate', hreflang: 'x-default', href: meta.alternates[0].href }],
      ['meta', { property: 'og:url', content: url }],
    );
  }
  if (lang.fonts) tags.push(['link', { rel: 'stylesheet', href: lang.fonts }]);
  tags.push(
    ['meta', { property: 'og:type', content: meta.type || 'website' }],
    ['meta', { property: 'og:site_name', content: translate(lang.code, SITE.name) }],
    ['meta', { property: 'og:locale', content: lang.ogLocale }],
    ...LANG_CODES.filter((c) => c !== lang.code).map((c) => ['meta', { property: 'og:locale:alternate', content: LANGS[c].ogLocale }]),
    ['meta', { property: 'og:title', content: meta.title }],
    ['meta', { property: 'og:description', content: meta.description }],
    ['meta', { property: 'og:image', content: img }],
    ['meta', { property: 'og:image:secure_url', content: img }],
    ['meta', { property: 'og:image:type', content: image.type }],
    ['meta', { property: 'og:image:width', content: String(image.width) }],
    ['meta', { property: 'og:image:height', content: String(image.height) }],
    ['meta', { property: 'og:image:alt', content: image.alt }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: meta.title }],
    ['meta', { name: 'twitter:description', content: meta.description }],
    ['meta', { name: 'twitter:image', content: img }],
    ['meta', { name: 'twitter:image:alt', content: image.alt }],
  );
  if (meta.article) {
    tags.push(
      ['meta', { property: 'article:published_time', content: meta.article.published }],
      ['meta', { property: 'article:modified_time', content: meta.article.published }],
      ['meta', { property: 'article:section', content: meta.article.section }],
    );
    if (CLUB.socials.facebook) tags.push(['meta', { property: 'article:publisher', content: CLUB.socials.facebook }]);
  }
  if (meta.jsonLd) tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(meta.jsonLd)]);
  return tags;
}

// ─── Build-time files ─────────────────────────────────────────
export function sitemapXml(buildDate) {
  sync();
  const today = buildDate.slice(0, 10);
  const pages = [
    ...STATIC_PATHS.map((p) => ({ path: p, lastmod: today, images: p === '/' ? [SITE.image.src] : [] })),
    ...NEWS.map((n) => ({ path: `/news/${n.slug}`, lastmod: (n.updatedAt || n.date).slice(0, 10), images: [imgUrl(n.photo, 1600)].filter(Boolean) })),
  ];
  const body = pages.flatMap((pg) => LANG_CODES.map((code) => [
    '  <url>',
    `    <loc>${abs(localePath(code, pg.path))}</loc>`,
    `    <lastmod>${pg.lastmod}</lastmod>`,
    ...alternates(pg.path).map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pg.path)}"/>`,
    ...pg.images.map((src) => `    <image:image><image:loc>${xml(abs(src))}</image:loc></image:image>`),
    '  </url>',
  ].join('\n'))).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

const IST = { timeZone: 'Asia/Kolkata' };
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { ...IST, weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { ...IST, hour: '2-digit', minute: '2-digit', hour12: false });
const matchLine = (m) => {
  const h = TEAMS[m.home]?.name || '?';
  const a = TEAMS[m.away]?.name || '?';
  const vs = m.score ? `${h} ${m.score[0]}–${m.score[1]} ${a}` : `${h} vs ${a}`;
  return `- ${fmtDate(m.date)}${m.score ? '' : `, ${fmtTime(m.date)} IST`}: ${vs} — ${[m.comp, m.round, m.venue].filter(Boolean).join(', ')}${m.entry ? ` (${m.entry})` : ''}`;
};

const KEY_FACTS = () => [
  `- Name: ${CLUB.name} (also written Adivasi Tarzan Club; short name ATC)`,
  `- Founded: ${CLUB.founded}, in S. Akhanagar, Kaliyaganj`,
  `- Location: ${CLUB.address.join(', ')}`,
  `- Home ground: ${CLUB.ground}`,
  '- Area: Kaliyaganj, Uttar Dinajpur district, West Bengal — near Raiganj and Hemtabad',
  '- Sport: football (soccer), plus a cultural / heritage wing and community work',
  `- Motto: "${CLUB.motto}"`,
  ...(CLUB.email ? [`- Email: ${CLUB.email}`] : []),
  ...(CLUB.phone ? [`- Phone: ${CLUB.phone}`] : []),
  `- Official website: ${SITE.url}`,
  `- Social: ${Object.values(CLUB.socials).join(', ')}`,
];

const squadLine = (players) => ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  .map((pos) => [pos, players.filter((p) => p.pos === pos).sort((a, b) => a.no - b.no)])
  .filter(([, list]) => list.length)
  .map(([pos, list]) => `- ${pos}s: ${list.map((p) => `${p.first} ${p.last} (#${p.no}${p.captain ? ', captain' : ''})`).join(', ')}`)
  .join('\n');

const committeeLines = () => COMMITTEE.filter((c) => named(c.name)).map((c) => `- ${c.role}: ${c.name}`);
const memberLines = () => MEMBERS.filter((m) => !m.memoriam).map((m) => `- ${m.name} — ${m.kind || 'Member'}${m.since ? `, since ${m.since}` : ''}`);
const memoriamLines = () => MEMBERS.filter((m) => m.memoriam).map((m) => `- ${m.name} — ${m.kind || 'Member'}${m.years ? ` (${m.years})` : ''}${m.tribute ? `: ${m.tribute}` : ''}`);

const tournamentLines = () => TOURNAMENTS.map((x) => {
  const { fixtures, results } = tournamentMatches(x, getContent());
  return [
    `### ${x.name}`,
    '',
    `${fmtDate(x.start)}${x.end ? ` to ${fmtDate(x.end)}` : ''} · ${x.venue} · ${abs('/tournaments')}`,
    ...(x.about?.length ? ['', ...x.about] : []),
    ...(x.schedule?.length ? ['', 'Schedule:', ...x.schedule.map((st) => `- ${st.stage}: ${fmtDate(st.from)}${st.to ? ` to ${fmtDate(st.to)}` : ''}${st.note ? ` (${st.note})` : ''}`)] : []),
    ...(x.teams.length ? ['', `Participating teams: ${x.teams.map((tm) => `${TEAMS[tm.team]?.name}${tm.group ? ` (${tm.group})` : ''}`).join(', ')}`] : []),
    ...(x.winner ? ['', `Winner: ${TEAMS[x.winner]?.name}${x.runnerUp ? `; runner-up: ${TEAMS[x.runnerUp]?.name}` : ''}`] : []),
    ...([...fixtures, ...results].length ? ['', 'Matches:', ...[...fixtures, ...results].map(matchLine)] : []),
  ].join('\n');
}).join('\n\n');

/** Short "who is at the club" lines for llms.txt. */
function peopleSummary() {
  const first = SQUAD.filter((p) => squadOf(p) === 'first-team');
  const captain = first.find((p) => p.captain);
  return [
    ...committeeLines(),
    ...(first.length ? [`- First team: ${first.length} players${captain ? `, captained by ${captain.first} ${captain.last}` : ''} — ${abs('/squad')}`] : []),
    ...(MEMBERS.some((m) => !m.memoriam) ? [`- Members: ${MEMBERS.filter((m) => !m.memoriam).length} named active club members — ${abs('/members')}`] : []),
    ...(MEMBERS.some((m) => m.memoriam) ? [`- In Memoriam: ${MEMBERS.filter((m) => m.memoriam).map((m) => m.name).join(', ')} — remembered founding members, ${abs('/members#in-memoriam')}`] : []),
    `- Everyone listed on ${abs('/squad')}, ${abs('/committee')} and ${abs('/members')} belongs to ${CLUB.name}.`,
  ];
}

const section = (title, body) => (body ? `## ${title}\n\n${body}\n\n` : '');

export function llmsTxt() {
  sync();
  const page = (p, label) => `- [${label}](${abs(p)}): ${PAGES[p].description}`;
  return `# ${CLUB.name}

> ${summary()}

## Key facts

${KEY_FACTS().join('\n')}

## Pages

${page('/', 'Home')}
${page('/club', 'About the club')}
${page('/schedule', 'Events & participations: fixtures, results, match information & club events')}
${page('/tournaments', 'ATC Tournaments — the ATC Annual Cup')}
${page('/register', 'Registration & participation')}
${page('/squad', 'First team squad')}
${page('/news', 'News')}
${page('/membership', 'Membership')}
${page('/committee', 'Committee')}
${page('/members', 'Members')}
${page('/gallery', 'Gallery — Moments to Memories')}
${page('/crest', 'The story behind our crest')}
${page('/contact', 'Contact & partnerships')}

## People

${peopleSummary().join('\n')}

## Often searched as

${LOCAL_KEYWORDS.map((k) => `- ${k}`).join('\n')}

## Latest news

${NEWS.map((n) => `- [${n.title}](${abs(`/news/${n.slug}`)}): ${n.desc}`).join('\n')}

## Optional

- [Full text for language models](${abs('/llms-full.txt')}): fixtures, results, tournaments, squad, members, crest story, history, FAQ and news in one file
- [Sitemap](${abs('/sitemap.xml')})
- The site is also available in Hindi (${abs('/hi')}) and Bengali (${abs('/bn')}).

Website designed and developed by ${SITE.agency.name} (${SITE.agency.url}).
`;
}

export function llmsFullTxt(buildDate) {
  sync();
  return `# ${CLUB.name} — full reference

> ${summary()}

Source: ${SITE.url} · Updated ${buildDate.slice(0, 10)}

## Key facts

${KEY_FACTS().join('\n')}

## History

${TIMELINE.map((t) => `- ${t.year} — ${t.title}: ${t.text}`).join('\n')}

## Honours

${HONOURS.map((h) => `- ${h.comp}: ${h.count} ${h.unit.toLowerCase()}`).join('\n')}

## Our crest

${CREST_INTRO.body[0]} (${abs('/crest')})

${CREST_PARTS.map((p, i) => `${i + 1}. ${p.label} — ${p.title}: ${p.body[0]}${p.colours ? ` ${p.colours.map((c) => `${c.name} — ${c.meaning}.`).join(' ')}` : ''}`).join('\n')}

${CREST_MESSAGE.closing}

## Upcoming fixtures

${FIXTURES.map((m) => `${matchLine(m)}${m.status ? ` — ${m.status.toUpperCase()}${m.statusNote ? `: ${m.statusNote}` : ''}` : ''}`).join('\n')}

## Recent results

${RESULTS.map(matchLine).join('\n')}

${section('Match information', MATCH_INFO.map((x) => `- ${fmtDate(x.date)} — ${x.kind}: ${x.title}. ${x.text}`).join('\n'))}## Club events

${EVENTS.map((e) => `- ${fmtDate(e.date)}, ${fmtTime(e.date)} IST — ${e.title} (${e.venue})${e.desc ? `: ${e.desc}` : ''}${eventOpen(e) ? ` Sign up: ${abs('/register')}` : ''}`).join('\n')}

${section('ATC tournaments', tournamentLines())}${section('Club programmes (sign up at /register)', PROGRAMMES.map((x) => `- ${x.title}${x.when ? ` (${x.when})` : ''}${x.who ? ` — ${x.who}` : ''}: ${x.desc}`).join('\n'))}## Gallery sections

${GALLERY_SECTIONS.map((g) => `- ${g.title}: ${g.albums.join(', ')} — ${abs(`/gallery?section=${g.id}`)}`).join('\n')}

## First team squad

${squadLine(SQUAD.filter((p) => squadOf(p) === 'first-team'))}

${section('Youth (U-17) squad', squadLine(SQUAD.filter((p) => squadOf(p) === 'youth')))}${section('Veterans squad', squadLine(SQUAD.filter((p) => squadOf(p) === 'veterans')))}${section('Committee and office-bearers', committeeLines().join('\n'))}${section('In Memoriam — founding members, forever remembered', memoriamLines().join('\n'))}${section(`Members of ${CLUB.name} (active)`, memberLines().join('\n'))}## Membership

${MEMBERSHIP_TIERS.map((t) => `- ${t.name} (${t.price}): ${t.perks.join('; ')}`).join('\n')}

## Frequently asked questions

${[...FAQ, ...localFaq(getContent(), (text, vars) => translate('en', text, vars)), ...CREST_FAQ].map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## News

${NEWS.map((n) => `### ${n.title}\n\n${fmtDate(n.date)} · ${n.tag} · ${abs(`/news/${n.slug}`)}\n\n${n.desc}\n\n${(n.body || []).join('\n\n')}`).join('\n\n')}

---

Website designed and developed by ${SITE.agency.name} (${SITE.agency.url}).
`;
}
