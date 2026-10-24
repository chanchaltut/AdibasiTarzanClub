// ─────────────────────────────────────────────────────────────
// Search, social and answer-engine metadata for every route.
//
// One source of truth: the browser uses it to update <head> on
// navigation, and the build uses it to prerender each page, the
// sitemap and llms.txt. Copy here should stay factual — answer
// engines quote it word for word.
// ─────────────────────────────────────────────────────────────

import {
  CLUB, EVENTS, FAQ, FIXTURES, HONOURS, MEMBERSHIP_TIERS, NEWS, PHOTO, RESULTS, SQUAD, TEAMS, TIMELINE,
} from '../data/club';
import { LANG_CODES, LANGS, langFromPath, localePath, stripLang, translate } from '../i18n';

export const SITE = {
  url: 'https://www.adibasitarzanclub.in',
  name: CLUB.name,
  lang: 'en-IN',
  image: { src: '/brand/og-image.jpg', width: 1200, height: 630, alt: 'Adibasi Tarzan Club crest — S. Akhanagar, Kaliyaganj, since 1981' },
  logo: '/brand/icon-512.png',
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

const GEO = { '@type': 'GeoCoordinates', latitude: CLUB.coords.lat, longitude: CLUB.coords.lng };

const SUMMARY = `${CLUB.name} (ATC) is a community football and cultural club founded in ${CLUB.founded} in S. Akhanagar, Kaliyaganj, Uttar Dinajpur district, West Bengal, India. It fields a first team in the District League, runs a youth football programme, hosts the ATC Annual Cup tournament and keeps Adibasi heritage alive through its cultural wing.`;

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
    description: 'Upcoming Adibasi Tarzan Club fixtures, latest results and club events — District League, the ATC Annual Cup, Heritage Night and more at S. Akhanagar Ground.',
    crumb: 'Schedule',
    type: 'CollectionPage',
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
  '/gallery': {
    title: 'Photo Gallery',
    description: 'Photos from Adibasi Tarzan Club matchdays, youth sessions, floodlit training and club life at S. Akhanagar Ground, Kaliyaganj.',
    crumb: 'Gallery',
    type: 'ImageGallery',
  },
  '/membership': {
    title: 'Membership — Join the Club',
    description: 'Join Adibasi Tarzan Club as a Supporter, Member or Life Member. Vote at the AGM, get priority seats at the Annual Cup final and stand with S. Akhanagar.',
    crumb: 'Membership',
    type: 'WebPage',
  },
  '/contact': {
    title: 'Contact & Partnerships',
    description: 'Contact Adibasi Tarzan Club in S. Akhanagar, Kaliyaganj, Uttar Dinajpur. Write to the club, register a team for the Annual Cup or become a club partner.',
    crumb: 'Contact',
    type: 'ContactPage',
  },
};

export const STATIC_PATHS = Object.keys(PAGES);
export const ARTICLE_PATHS = NEWS.map((n) => `/news/${n.slug}`);

// ─── Schema.org nodes ─────────────────────────────────────────
const organization = () => ({
  '@type': ['SportsClub', 'SportsOrganization'],
  '@id': ID.org,
  name: CLUB.name,
  alternateName: SITE.altNames,
  url: abs('/'),
  logo: { '@type': 'ImageObject', url: abs(SITE.logo), width: 512, height: 512 },
  image: abs(SITE.image.src),
  description: SUMMARY,
  slogan: CLUB.motto,
  foundingDate: String(CLUB.founded),
  foundingLocation: { '@type': 'Place', name: 'S. Akhanagar, Kaliyaganj, West Bengal' },
  sport: 'Football',
  email: CLUB.email,
  address: ADDRESS,
  geo: GEO,
  hasMap: `https://www.google.com/maps?q=${CLUB.coords.lat},${CLUB.coords.lng}`,
  location: { '@id': ID.ground },
  areaServed: [
    { '@type': 'City', name: 'Kaliyaganj' },
    { '@type': 'AdministrativeArea', name: 'Uttar Dinajpur district' },
    { '@type': 'State', name: 'West Bengal' },
  ],
  knowsAbout: ['Football', 'Youth football coaching', 'Adivasi culture and heritage', 'Community sport', 'Football tournaments'],
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
  geo: GEO,
  hasMap: `https://www.google.com/maps?q=${CLUB.coords.lat},${CLUB.coords.lng}`,
});

const website = () => ({
  '@type': 'WebSite',
  '@id': ID.site,
  url: abs('/'),
  name: CLUB.name,
  alternateName: SITE.altNames,
  description: SUMMARY,
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

const team = (withPlayers) => ({
  '@type': 'SportsTeam',
  '@id': ID.team,
  name: `${CLUB.name} First Team`,
  alternateName: 'ATC',
  sport: 'Football',
  gender: 'Male',
  parentOrganization: { '@id': ID.org },
  location: { '@id': ID.ground },
  logo: abs(SITE.logo),
  ...(withPlayers && {
    athlete: SQUAD.map((p) => ({
      '@type': 'Person',
      name: `${p.first} ${p.last}`,
      jobTitle: p.captain ? `${p.pos} (Captain)` : p.pos,
      memberOf: { '@id': ID.team },
    })),
  }),
});

const teamRef = (code) => (code === 'ATC'
  ? { '@id': ID.team }
  : { '@type': 'SportsTeam', name: TEAMS[code].name, sport: 'Football' });

const place = (venue, tr) => (venue === CLUB.ground
  ? { '@id': ID.ground }
  : { '@type': 'Place', name: tr(venue), address: { '@type': 'PostalAddress', addressRegion: 'West Bengal', addressCountry: 'IN' } });

const plus2h = (iso) => new Date(new Date(iso).getTime() + 2 * 36e5).toISOString();

const matchEvent = (m, tr, url) => {
  const home = tr(TEAMS[m.home].name);
  const away = tr(TEAMS[m.away].name);
  return {
    '@type': 'SportsEvent',
    name: `${home} vs ${away} — ${tr(m.comp)}`,
    description: `${tr(m.comp)}, ${tr(m.round)}${m.score ? `. ${m.score[0]}–${m.score[1]}.` : '.'}`,
    sport: 'Football',
    startDate: m.date,
    endDate: plus2h(m.date),
    eventStatus: 'https://schema.org/EventScheduled',
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
  description: tr(e.desc),
  startDate: e.date,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: e.venue === CLUB.ground ? { '@id': ID.ground } : { '@type': 'Place', name: `${tr(e.venue)}, ${tr('S. Akhanagar')}`, address: ADDRESS },
  organizer: { '@id': ID.org },
  image: abs(SITE.image.src),
  url: `${url}?tab=events`,
});

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
          mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: tr(f.q), acceptedAnswer: { '@type': 'Answer', text: tr(f.a) } })),
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
    case '/squad':
      return { page: { mainEntity: { '@id': ID.team } }, nodes: [team(true)] };
    case '/gallery':
      return {
        page: {
          image: Object.values(PHOTO).map((src) => ({ '@type': 'ImageObject', contentUrl: abs(src), creditText: CLUB.name, copyrightNotice: `© ${CLUB.name}` })),
        },
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
  const description = tr(page.description);
  const nodes = [
    ...baseNodes(),
    ...(path === '/' ? [team(false)] : []),
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
      articleBody: n.body.map(tr).join('\n\n'),
      wordCount: n.body.map(tr).join(' ').split(/\s+/).length,
      image: [abs(n.photo), abs(SITE.image.src)],
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
    jsonLd: graph(nodes),
  };
}

/** The <head> tags for a page, as plain data both the browser and the build can render. */
export function headTags(meta) {
  const url = meta.path ? abs(meta.path) : null;
  const img = abs(SITE.image.src);
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
    ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
    ['meta', { property: 'og:image:width', content: String(SITE.image.width) }],
    ['meta', { property: 'og:image:height', content: String(SITE.image.height) }],
    ['meta', { property: 'og:image:alt', content: SITE.image.alt }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: meta.title }],
    ['meta', { name: 'twitter:description', content: meta.description }],
    ['meta', { name: 'twitter:image', content: img }],
    ['meta', { name: 'twitter:image:alt', content: SITE.image.alt }],
  );
  if (meta.article) {
    tags.push(
      ['meta', { property: 'article:published_time', content: meta.article.published }],
      ['meta', { property: 'article:modified_time', content: meta.article.published }],
      ['meta', { property: 'article:section', content: meta.article.section }],
      ['meta', { property: 'article:publisher', content: CLUB.socials.facebook }],
    );
  }
  if (meta.jsonLd) tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(meta.jsonLd)]);
  return tags;
}

// ─── Build-time files ─────────────────────────────────────────
export function sitemapXml(buildDate) {
  const today = buildDate.slice(0, 10);
  const pages = [
    ...STATIC_PATHS.map((p) => ({ path: p, lastmod: today, images: p === '/' ? [SITE.image.src] : [] })),
    ...NEWS.map((n) => ({ path: `/news/${n.slug}`, lastmod: n.date.slice(0, 10), images: [n.photo] })),
  ];
  const body = pages.flatMap((pg) => LANG_CODES.map((code) => [
    '  <url>',
    `    <loc>${abs(localePath(code, pg.path))}</loc>`,
    `    <lastmod>${pg.lastmod}</lastmod>`,
    ...alternates(pg.path).map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pg.path)}"/>`,
    ...pg.images.map((src) => `    <image:image><image:loc>${abs(src)}</image:loc></image:image>`),
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
  const h = TEAMS[m.home].name;
  const a = TEAMS[m.away].name;
  const vs = m.score ? `${h} ${m.score[0]}–${m.score[1]} ${a}` : `${h} vs ${a}`;
  return `- ${fmtDate(m.date)}${m.score ? '' : `, ${fmtTime(m.date)} IST`}: ${vs} — ${m.comp}, ${m.round}, ${m.venue}${m.entry ? ` (${m.entry})` : ''}`;
};

const KEY_FACTS = () => [
  `- Name: ${CLUB.name} (also written Adivasi Tarzan Club; short name ATC)`,
  `- Founded: ${CLUB.founded}, in S. Akhanagar, Kaliyaganj`,
  `- Location: ${CLUB.address.join(', ')}`,
  `- Home ground: ${CLUB.ground}`,
  '- Sport: football (soccer), plus a cultural / heritage wing and community work',
  `- Motto: "${CLUB.motto}"`,
  `- Email: ${CLUB.email}`,
  `- Official website: ${SITE.url}`,
  `- Social: ${Object.values(CLUB.socials).join(', ')}`,
];

export function llmsTxt() {
  const page = (p, label) => `- [${label}](${abs(p)}): ${PAGES[p].description}`;
  return `# ${CLUB.name}

> ${SUMMARY}

## Key facts

${KEY_FACTS().join('\n')}

## Pages

${page('/', 'Home')}
${page('/club', 'About the club')}
${page('/schedule', 'Fixtures, results & events')}
${page('/squad', 'First team squad')}
${page('/news', 'News')}
${page('/membership', 'Membership')}
${page('/committee', 'Committee')}
${page('/gallery', 'Gallery')}
${page('/contact', 'Contact & partnerships')}

## Latest news

${NEWS.map((n) => `- [${n.title}](${abs(`/news/${n.slug}`)}): ${n.desc}`).join('\n')}

## Optional

- [Full text for language models](${abs('/llms-full.txt')}): fixtures, results, squad, history, FAQ and news in one file
- [Sitemap](${abs('/sitemap.xml')})
- The site is also available in Hindi (${abs('/hi')}) and Bengali (${abs('/bn')}).

Website designed and developed by ${SITE.agency.name} (${SITE.agency.url}).
`;
}

export function llmsFullTxt(buildDate) {
  return `# ${CLUB.name} — full reference

> ${SUMMARY}

Source: ${SITE.url} · Updated ${buildDate.slice(0, 10)}

## Key facts

${KEY_FACTS().join('\n')}

## History

${TIMELINE.map((t) => `- ${t.year} — ${t.title}: ${t.text}`).join('\n')}

## Honours

${HONOURS.map((h) => `- ${h.comp}: ${h.count} ${h.unit.toLowerCase()}`).join('\n')}

## Upcoming fixtures

${FIXTURES.map(matchLine).join('\n')}

## Recent results

${RESULTS.map(matchLine).join('\n')}

## Club events

${EVENTS.map((e) => `- ${fmtDate(e.date)}, ${fmtTime(e.date)} IST — ${e.title} (${e.venue}): ${e.desc}`).join('\n')}

## First team squad

${['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos) => `- ${pos}s: ${SQUAD.filter((p) => p.pos === pos).map((p) => `${p.first} ${p.last} (#${p.no}${p.captain ? ', captain' : ''})`).join(', ')}`).join('\n')}

## Membership

${MEMBERSHIP_TIERS.map((t) => `- ${t.name} (${t.price}): ${t.perks.join('; ')}`).join('\n')}

## Frequently asked questions

${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## News

${NEWS.map((n) => `### ${n.title}\n\n${fmtDate(n.date)} · ${n.tag} · ${abs(`/news/${n.slug}`)}\n\n${n.desc}\n\n${n.body.join('\n\n')}`).join('\n\n')}

---

Website designed and developed by ${SITE.agency.name} (${SITE.agency.url}).
`;
}
