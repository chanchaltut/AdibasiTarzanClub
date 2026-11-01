// ─────────────────────────────────────────────────────────────
// Starting content for the website, in exactly the shape the
// website reads from the server (see server/src/content/bundle.js).
//
// It is used in three places:
//   1. `npm run seed` in /server copies it into the database once,
//      so the admin panel starts with everything already filled in.
//   2. The website falls back to it if the server can't be reached
//      and no saved copy exists (e.g. first local run).
//   3. The build falls back to it if the server is offline.
//
// After seeding, edit content in the admin panel — not here.
// Anything marked SAMPLE is placeholder copy.
// ─────────────────────────────────────────────────────────────

const PHOTO = {
  hero: '/photos/hero.webp',
  night: '/photos/night-match.webp',
  action: '/photos/match-action.webp',
  youth: '/photos/youth.webp',
  pitch: '/photos/pitch-line.webp',
  ball: '/photos/ball-grass.webp',
  ballShadow: '/photos/ball-shadow.webp',
  tunnel: '/photos/tunnel.webp',
  boot: '/photos/ball-boot.webp',
  net: '/photos/goal-net.webp',
  training: '/photos/training.webp',
  goalNight: '/photos/goal-night.webp',
  kick: '/photos/player-kick.webp',
  tackle: '/photos/tackle.webp',
  strike: '/photos/strike-sky.webp',
  ballPitch: '/photos/ball-pitch.webp',
  balls: '/photos/balls.webp',
};

const CLUB = {
  name: 'Adibasi Tarzan Club',
  short: 'ATC',
  founded: 1981,
  motto: 'Rooted in the soil. United in spirit.',
  address: ['S. Akhanagar', 'Kaliyaganj, Uttar Dinajpur', 'West Bengal 733129, India'],
  ground: 'S. Akhanagar Ground',
  email: 'info@adibasitarzanclub.in',
  phone: '',
  coords: { lat: 25.6293, lng: 88.2028 },
  maps: {
    club: 'https://maps.app.goo.gl/22gLQ3kt5HcPtH14A',
    ground: 'https://maps.app.goo.gl/CvZEAjx4qfLwv3Sg6',
  },
  socials: {
    facebook: 'https://www.facebook.com/adibasitarzanclub',
    instagram: 'https://www.instagram.com/adibasitarzanclub',
    youtube: 'https://www.youtube.com/@adibasitarzanclub',
  },
};

const RIBBON = {
  enabled: true,
  text: 'ATC Annual Cup 2026 — team registration is open',
  cta: 'Register',
  href: '/news/annual-cup-2026-registration',
};

// ─── Page banners ─────────────────────────────────────────────
const PAGES = {
  club: { photo: PHOTO.pitch, script: 'Since 1981', intro: 'Football, heritage and community from S. Akhanagar, Kaliyaganj — one family for forty-five seasons.' },
  schedule: { photo: PHOTO.night, script: 'Matchday', intro: 'Fixtures, results and club events. All times are Indian Standard Time.' },
  news: { photo: PHOTO.action, script: 'From the touchline', intro: 'Match reports, club announcements and stories from S. Akhanagar.' },
  squad: { photo: PHOTO.tackle, script: 'The first XI', intro: 'The squad wearing the brown and gold in the 2026–27 season.' },
  committee: { photo: PHOTO.ballShadow, script: '2026–27', intro: 'The office-bearers who run the club on behalf of its members.' },
  gallery: { photo: { url: PHOTO.boot, pos: '50% 70%' }, script: 'In pictures', intro: 'Moments from the ground, the training pitch and the club grounds.' },
  membership: { photo: PHOTO.tunnel, script: 'Join the family', intro: 'Stand with the club that has stood for S. Akhanagar since 1981.' },
  contact: { photo: PHOTO.ball, script: 'Write to us', intro: 'The club office is open most evenings at the ground. Letters, calls and visits are all welcome.' },
};

// Fixed photos on the home and club pages.
const SLOTS = {
  homeMembership: PHOTO.tunnel,
  homeCalendar: PHOTO.ballPitch,
  homeGallery: PHOTO.tackle,
  homeVideo: PHOTO.goalNight,
  clubHeritage: PHOTO.night,
  clubCommunity: PHOTO.youth,
};

// ─── Teams (SAMPLE opponents) ─────────────────────────────────
const TEAMS = {
  ATC: { name: 'Adibasi Tarzan Club', short: 'ATC', crest: '/brand/crest.webp', colors: ['#3A1A0B', '#D99A2B'], isClub: true },
  RTF: { name: 'Raiganj Town FC', short: 'Raiganj', colors: ['#2F4A3A', '#D8C9A3'] },
  ITU: { name: 'Itahar United', short: 'Itahar', colors: ['#6B2A1D', '#E5CF9C'] },
  KYC: { name: 'Kaliyaganj Youth Club', short: 'Kaliyaganj YC', colors: ['#1F3550', '#E8D7B0'] },
  HSC: { name: 'Hemtabad SC', short: 'Hemtabad', colors: ['#4C3A1A', '#F0D48A'] },
  BFC: { name: 'Bansihari FC', short: 'Bansihari', colors: ['#3A2440', '#E6CBA0'] },
  KSP: { name: 'Kunore Sporting', short: 'Kunore', colors: ['#24433F', '#EAD8B4'] },
};

// ─── Fixtures & results (SAMPLE) ──────────────────────────────
const FIXTURES = [
  { id: 'f1', home: 'ATC', away: 'RTF', date: '2026-10-26T15:30:00+05:30', comp: 'District League', round: 'Matchday 7', venue: 'S. Akhanagar Ground', entry: 'Free entry' },
  { id: 'f2', home: 'ITU', away: 'ATC', date: '2026-11-02T15:00:00+05:30', comp: 'District League', round: 'Matchday 8', venue: 'Itahar Stadium' },
  { id: 'f3', home: 'ATC', away: 'KYC', date: '2026-11-15T14:00:00+05:30', comp: 'ATC Annual Cup', round: 'Opening match', venue: 'S. Akhanagar Ground', entry: 'Tickets' },
  { id: 'f4', home: 'HSC', away: 'ATC', date: '2026-11-29T14:30:00+05:30', comp: 'District League', round: 'Matchday 9', venue: 'Hemtabad Ground' },
];

const RESULTS = [
  { id: 'r1', home: 'ATC', away: 'BFC', score: [3, 1], date: '2026-10-18T15:30:00+05:30', comp: 'District League', round: 'Matchday 6', venue: 'S. Akhanagar Ground' },
  { id: 'r2', home: 'HSC', away: 'ATC', score: [0, 2], date: '2026-10-11T15:00:00+05:30', comp: 'Friendly', round: 'Pre-cup friendly', venue: 'Hemtabad Ground' },
  { id: 'r3', home: 'ATC', away: 'KSP', score: [1, 1], date: '2026-10-04T15:30:00+05:30', comp: 'District League', round: 'Matchday 5', venue: 'S. Akhanagar Ground' },
];

// ─── Club events (SAMPLE dates) ───────────────────────────────
const EVENTS = [
  { id: 'e1', title: 'ATC Annual Cup 2026', kind: 'Football', date: '2026-11-15T09:00:00+05:30', venue: 'S. Akhanagar Ground', desc: 'Our flagship knockout tournament, open to clubs across Uttar Dinajpur.' },
  { id: 'e2', title: 'Heritage Night', kind: 'Culture', date: '2026-11-22T18:00:00+05:30', venue: 'Club Grounds', desc: 'An evening of traditional music, dance and stories under the lanterns.' },
  { id: 'e3', title: 'Annual General Meeting', kind: 'Club', date: '2026-12-01T10:00:00+05:30', venue: 'Club Hall', desc: 'Accounts, elections and the plan for the year ahead. All members welcome.' },
  { id: 'e4', title: 'Prize Distribution Ceremony', kind: 'Ceremony', date: '2026-12-20T14:00:00+05:30', venue: 'Club Grounds', desc: 'Honouring the players, volunteers and families who carried the season.' },
];

// ─── Home: events & tickets carousel ──────────────────────────
const PROMOS = [
  { id: 'p1', title: "Men's Football", href: '/schedule', photo: PHOTO.action },
  { id: 'p2', title: 'Annual Cup', href: '/schedule?tab=events', paper: { script: 'The', big: 'Annual Cup', note: '15 Nov · S. Akhanagar' } },
  { id: 'p3', title: 'Youth Football', href: '/squad#youth', photo: PHOTO.youth },
  { id: 'p4', title: 'Heritage Night', href: '/schedule?tab=events', paper: { script: 'Heritage', big: 'Night', note: '22 Nov · Club Grounds', tone: 'dark' } },
  { id: 'p5', title: 'Floodlit Cup', href: '/schedule?tab=events', photo: PHOTO.night },
  { id: 'p6', title: 'Prize Day', href: '/schedule?tab=events', paper: { script: 'Prize', big: 'Distribution', note: '20 Dec · Club Grounds' } },
  { id: 'p7', title: 'Sports Day', href: '/schedule?tab=events', photo: PHOTO.training },
  { id: 'p8', title: 'Partner With ATC', href: '/contact#partners', photo: PHOTO.tunnel },
];

// ─── Stories (SAMPLE) ─────────────────────────────────────────
const STORIES = [
  { id: 's1', title: 'Matchday', cover: PHOTO.action, slides: [
    { photo: PHOTO.action, text: 'Three points at home. 3–1 against Bansihari.' },
    { photo: PHOTO.tackle, text: 'Every ball, every tackle, for S. Akhanagar.' },
  ] },
  { id: 's2', title: 'Training', cover: PHOTO.training, slides: [
    { photo: PHOTO.training, text: 'Tuesday drills at 6 am — first touch, then everything else.' },
    { photo: PHOTO.balls, text: 'New balls arrived, thanks to our members.' },
  ] },
  { id: 's3', title: 'Annual Cup', cover: PHOTO.ballPitch, slides: [
    { photo: PHOTO.ballPitch, text: 'Registration for the 2026 Annual Cup is open.' },
    { letter: 'Sixteen teams. One trophy. See you on the 15th of November.' },
  ] },
  { id: 's4', title: 'Youth', cover: PHOTO.youth, slides: [
    { photo: PHOTO.youth, text: 'The next generation of Tarzans.' },
  ] },
  { id: 's5', title: 'Under Lights', cover: PHOTO.goalNight, slides: [
    { photo: PHOTO.goalNight, text: 'Late sessions before the cup.' },
    { photo: PHOTO.night, text: 'The ground never really sleeps.' },
  ] },
  { id: 's6', title: 'Our Ground', cover: PHOTO.pitch, slides: [
    { photo: PHOTO.pitch, text: 'Fresh lines, fresh season.' },
  ] },
  { id: 's7', title: 'Since 1981', cover: PHOTO.ball, slides: [
    { letter: 'In 1981 a handful of friends from S. Akhanagar started a club with one ball and a borrowed field.' },
    { letter: 'Forty-five years later the field is ours, and the family is bigger than ever.' },
  ] },
];

// ─── Home: explore the club ───────────────────────────────────
const EXPLORE = [
  { id: 'x1', title: 'First Team', desc: 'Fixtures, results and the squad wearing the brown and gold.', href: '/squad', photo: PHOTO.tackle, art: 'jersey', cta: 'Meet the squad' },
  { id: 'x2', title: 'Heritage & Culture', desc: 'Dance, music and stories of our Adibasi roots, kept alive every season.', href: '/club#heritage', photo: PHOTO.night, art: 'drum', cta: 'Discover' },
  { id: 'x3', title: 'Community', desc: 'Youth coaching, welfare drives and the bonds that hold S. Akhanagar together.', href: '/club#community', photo: PHOTO.youth, art: 'crest', cta: 'Get involved' },
];

// ─── News (SAMPLE) ────────────────────────────────────────────
const NEWS = [
  {
    id: 'n1', slug: 'annual-cup-2026-registration', title: 'Registration opens for the 2026 ATC Annual Cup',
    desc: 'Clubs from across Uttar Dinajpur can now enter the 45th-anniversary edition of our flagship tournament.',
    tag: 'Club', date: '2026-10-22T08:00:00+05:30', photo: PHOTO.hero,
    body: [
      'The Adibasi Tarzan Club is delighted to open registration for the 2026 ATC Annual Cup, which kicks off at S. Akhanagar Ground on Saturday 15 November.',
      'This year carries special meaning. Forty-five years after the club was founded in 1981, the cup returns as the centrepiece of our anniversary season — sixteen teams, one trophy, and a ground full of families from every village around Kaliyaganj.',
      'Team managers can register by visiting the club office in the evenings or by writing to us through the contact page. Squad lists must be submitted by 1 November.',
      'As always, entry for spectators to the group matches is free. The final will be followed by the Prize Distribution Ceremony later in the season.',
    ],
  },
  {
    id: 'n2', slug: 'atc-3-1-bansihari', title: 'ATC 3–1 Bansihari: a statement at home',
    desc: 'Two second-half goals turn a tight league game into a comfortable win in front of a packed S. Akhanagar crowd.',
    tag: 'First Team', date: '2026-10-18T19:00:00+05:30', photo: PHOTO.action,
    body: [
      'A patient first half gave way to a commanding second as ATC moved up to second in the District League table.',
      'Captain Suraj Soren set the tone at the back, and the front line finally found its rhythm after the break.',
    ],
  },
  {
    id: 'n3', slug: 'heritage-night-2026', title: 'Heritage Night 2026 — programme announced',
    desc: 'Traditional music, dance and stories return to the club grounds on 22 November. Performers and volunteers, sign up now.',
    tag: 'Heritage', date: '2026-10-16T10:00:00+05:30', photo: PHOTO.night,
    body: ['The cultural wing of the club has confirmed the programme for this year\'s Heritage Night, the evening that reminds us where we come from.'],
  },
  {
    id: 'n4', slug: 'youth-programme-begins', title: 'Youth programme begins for the new season',
    desc: 'Morning sessions for under-13 and under-17 players restart at the ground every Tuesday, Thursday and Saturday.',
    tag: 'Youth', date: '2026-10-14T07:00:00+05:30', photo: PHOTO.youth,
    body: ['Coaches will be at the ground from 6:30 am. Bring water, boots if you have them, and a parent\'s signature on the registration form.'],
  },
  {
    id: 'n5', slug: 'hemtabad-0-2-atc', title: 'Hemtabad 0–2 ATC: clean sheet on the road',
    desc: 'A disciplined defensive display and two well-worked goals in a valuable friendly before the cup.',
    tag: 'First Team', date: '2026-10-11T18:30:00+05:30', photo: PHOTO.tackle,
    body: ['The back four held firm for ninety minutes as ATC kept their second clean sheet of the month.'],
  },
  {
    id: 'n6', slug: 'ground-renovation-complete', title: 'Ground renovation complete',
    desc: 'New drainage, fresh lines and repaired goalposts — S. Akhanagar Ground is ready for the busiest month of the year.',
    tag: 'Club', date: '2026-10-08T12:00:00+05:30', photo: PHOTO.pitch,
    body: ['Thank you to every member and volunteer who gave their weekends to the work.'],
  },
  {
    id: 'n7', slug: 'new-committee-inducted', title: 'New committee inducted for 2026–27',
    desc: 'The newly elected office-bearers took charge in a formal ceremony attended by senior members.',
    tag: 'Club', date: '2026-10-02T17:00:00+05:30', photo: PHOTO.ball,
    body: ['The committee thanked the outgoing office-bearers for their years of service.'],
  },
  {
    id: 'n8', slug: 'floodlit-sessions', title: 'Under the lights: evening sessions return',
    desc: 'With the cup approaching, the first team moves to late training sessions twice a week.',
    tag: 'First Team', date: '2026-09-28T20:00:00+05:30', photo: PHOTO.goalNight,
    body: ['Supporters are welcome to watch from the boundary.'],
  },
];

// ─── Squad (SAMPLE names) — in home-page slider order first ───
const SQUAD = [
  { id: 'pl1', no: 1, squad: 'first-team', first: 'Sanjay', last: 'Hembram', pos: 'Goalkeeper' },
  { id: 'pl13', no: 13, squad: 'first-team', first: 'Bablu', last: 'Kisku', pos: 'Goalkeeper' },
  { id: 'pl2', no: 2, squad: 'first-team', first: 'Rohit', last: 'Murmu', pos: 'Defender' },
  { id: 'pl3', no: 3, squad: 'first-team', first: 'Manoj', last: 'Besra', pos: 'Defender' },
  { id: 'pl4', no: 4, squad: 'first-team', first: 'Anil', last: 'Tudu', pos: 'Defender' },
  { id: 'pl5', no: 5, squad: 'first-team', first: 'Suraj', last: 'Soren', pos: 'Defender', captain: true },
  { id: 'pl12', no: 12, squad: 'first-team', first: 'Raju', last: 'Hansda', pos: 'Defender' },
  { id: 'pl6', no: 6, squad: 'first-team', first: 'Prakash', last: 'Marandi', pos: 'Midfielder' },
  { id: 'pl8', no: 8, squad: 'first-team', first: 'Bikash', last: 'Baskey', pos: 'Midfielder' },
  { id: 'pl10', no: 10, squad: 'first-team', first: 'Dilip', last: 'Murmu', pos: 'Midfielder' },
  { id: 'pl14', no: 14, squad: 'first-team', first: 'Ajit', last: 'Tudu', pos: 'Midfielder' },
  { id: 'pl16', no: 16, squad: 'first-team', first: 'Sunil', last: 'Soren', pos: 'Midfielder' },
  { id: 'pl7', no: 7, squad: 'first-team', first: 'Ramesh', last: 'Hembram', pos: 'Forward' },
  { id: 'pl9', no: 9, squad: 'first-team', first: 'Sagar', last: 'Kisku', pos: 'Forward' },
  { id: 'pl11', no: 11, squad: 'first-team', first: 'Amit', last: 'Hansda', pos: 'Forward' },
  { id: 'pl17', no: 17, squad: 'first-team', first: 'Pintu', last: 'Murmu', pos: 'Forward' },
];

// Players shown in the home-page slider, in this order.
const FEATURED = [10, 5, 9, 1, 8, 7, 4, 11, 6];
SQUAD.forEach((p) => { if (FEATURED.includes(p.no)) p.featured = true; });
SQUAD.sort((a, b) => (FEATURED.includes(a.no) ? FEATURED.indexOf(a.no) : 99 + a.no) - (FEATURED.includes(b.no) ? FEATURED.indexOf(b.no) : 99 + b.no));

// ─── Committee (fill in real names) ───────────────────────────
const COMMITTEE = [
  { id: 'c1', role: 'President', name: 'To be announced' },
  { id: 'c2', role: 'Vice President', name: 'To be announced' },
  { id: 'c3', role: 'Secretary', name: 'To be announced' },
  { id: 'c4', role: 'Joint Secretary', name: 'To be announced' },
  { id: 'c5', role: 'Treasurer', name: 'To be announced' },
  { id: 'c6', role: 'Sports Secretary', name: 'To be announced' },
  { id: 'c7', role: 'Cultural Secretary', name: 'To be announced' },
  { id: 'c8', role: 'Head Coach', name: 'To be announced' },
];

// ─── Honours (SAMPLE counts) ──────────────────────────────────
const HONOURS = [
  { comp: 'District League', count: 7, unit: 'Titles', icon: 'shield' },
  { comp: 'ATC Annual Cup', count: 12, unit: 'Trophies', icon: 'cup' },
  { comp: 'Uttar Dinajpur Cup', count: 4, unit: 'Trophies', icon: 'laurel' },
  { comp: 'Since 1981', count: 45, unit: 'Seasons', icon: 'ball' },
];

// ─── History timeline (SAMPLE beyond 1981) ────────────────────
const TIMELINE = [
  { year: '1981', title: 'A club is born', text: 'Friends from S. Akhanagar found the Adibasi Tarzan Club with one ball and a borrowed field.' },
  { year: '1985', title: 'The first cup', text: 'The club organises its first inter-village football tournament.' },
  { year: '1990', title: 'Heritage wing', text: 'The cultural troupe is formed and the first Heritage Night is held.' },
  { year: '1995', title: 'The youth', text: 'Morning coaching for boys and girls of the village begins.' },
  { year: '2010', title: 'District champions', text: 'ATC lifts the District League title in front of a home crowd.' },
  { year: '2020', title: 'Standing together', text: 'Through the pandemic the club turns its hall into a relief centre.' },
  { year: '2026', title: 'Forty-five years', text: 'A new committee, a renovated ground and the same spirit.' },
];

const FAQ = [
  { q: 'What is Adibasi Tarzan Club?', a: 'Adibasi Tarzan Club (ATC) is a community football and cultural club founded in 1981 in S. Akhanagar, Kaliyaganj, Uttar Dinajpur, West Bengal, India. It runs a first team, a youth football programme and the ATC Annual Cup, and keeps Adibasi heritage alive through its cultural wing.' },
  { q: 'When was Adibasi Tarzan Club founded?', a: 'The club was founded in 1981 by a group of friends from S. Akhanagar, Kaliyaganj, who started it with one ball and a borrowed field.' },
  { q: 'Where is the club ground?', a: 'Our home ground is S. Akhanagar Ground in Kaliyaganj, Uttar Dinajpur, West Bengal 733129. See the map on this page for directions.' },
  { q: 'How do I join the club?', a: 'Visit the club office in the evening or send us a letter through the contact page. Membership is open to everyone who shares our values, with Supporter, Member and Life Member options.' },
  { q: 'What is the ATC Annual Cup?', a: 'The ATC Annual Cup is the club\'s flagship knockout football tournament, open to clubs across Uttar Dinajpur and played at S. Akhanagar Ground every season.' },
  { q: 'Can my team play in the Annual Cup?', a: 'Yes. Registration opens each autumn. Write to us with your team name, manager and contact number.' },
  { q: 'Is entry free for spectators?', a: 'Most home league matches and Annual Cup group games are free to watch. Any ticketed match is marked on the Schedule page.' },
  { q: 'Do you train young players?', a: 'Yes. The youth programme runs three mornings a week for under-13 and under-17 players.' },
  { q: 'How can a business partner with ATC?', a: 'Write to the club through the contact page or email info@adibasitarzanclub.in. Partners are recognised on matchdays, at club events and on this website.' },
];

const MEMBER_FAQ = [
  { q: 'Who can become a member?', a: 'Anyone who shares the values of the club — players, supporters, families and friends of S. Akhanagar.' },
  { q: 'How much does membership cost?', a: 'Annual and life membership fees are set at the AGM each year. Please ask the club office for the current rates.' },
  { q: 'Can I vote at the AGM?', a: 'Yes. Members and life members can vote at the Annual General Meeting and stand for the committee.' },
];

const MEMBERSHIP_TIERS = [
  { name: 'Supporter', price: 'Free', perks: ['Club newsletter by WhatsApp', 'Early notice of fixtures & events', 'Name in the supporters’ register'] },
  { name: 'Member', price: 'Annual', featured: true, perks: ['Vote at the Annual General Meeting', 'Priority seating at the Annual Cup final', 'Member card & badge', 'Invitation to Heritage Night'] },
  { name: 'Life Member', price: 'One-time', perks: ['All Member benefits, for life', 'Name on the founders’ board', 'Seat at the Prize Distribution Ceremony'] },
];

// ─── Gallery (SAMPLE captions) ────────────────────────────────
const GALLERY = [
  { id: 'g1', photo: PHOTO.action, cap: 'Matchday, S. Akhanagar', album: 'Matchday' },
  { id: 'g2', photo: PHOTO.youth, cap: 'Youth session', album: 'Youth' },
  { id: 'g3', photo: PHOTO.strike, cap: 'Shooting practice', album: 'Training' },
  { id: 'g4', photo: PHOTO.night, cap: 'Under the lights', album: 'Training' },
  { id: 'g5', photo: PHOTO.tackle, cap: 'Every ball counts', album: 'Matchday' },
  { id: 'g6', photo: PHOTO.kick, cap: 'Warm-up', album: 'Training' },
  { id: 'g7', photo: PHOTO.pitch, cap: 'Fresh lines' },
  { id: 'g8', photo: PHOTO.balls, cap: 'New match balls' },
  { id: 'g9', photo: PHOTO.boot, cap: 'Boots on', album: 'Matchday' },
  { id: 'g10', photo: PHOTO.net, cap: 'Back of the net', album: 'Matchday' },
  { id: 'g11', photo: PHOTO.training, cap: 'First touch', album: 'Training' },
  { id: 'g12', photo: PHOTO.goalNight, cap: 'Late session', album: 'Training' },
];

export default {
  version: 'defaults',
  CLUB,
  RIBBON,
  PAGES,
  SLOTS,
  TEAMS,
  FIXTURES,
  RESULTS,
  EVENTS,
  PROMOS,
  STORIES,
  EXPLORE,
  NEWS,
  SQUAD,
  COMMITTEE,
  HONOURS,
  TIMELINE,
  FAQ,
  MEMBER_FAQ,
  MEMBERSHIP_TIERS,
  GALLERY,
  VIDEOS: [],
  PARTNERS: [],
  I18N: { hi: {}, bn: {} },
};
