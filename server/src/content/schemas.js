// ─────────────────────────────────────────────────────────────
// THE single description of everything the admin can edit.
//
// From this one file the server builds the database models, checks
// every save, and sends the admin panel the forms to draw — so a field
// added here appears in the panel, is validated, and is stored, with
// no other change. Labels and help text are written for the club's
// office-bearers, not for programmers.
//
// Field types
//   text, textarea, longtext (paragraphs), number, boolean, datetime,
//   select, combo (pick or type), color, link (site page or web
//   address), url, email, image, ref (another item), list, youtube,
//   slug, heading (a sub-title in long forms; stores nothing)
//
// Common options
//   required, help, placeholder, max (characters / value), min,
//   options, t (shown through the site translator, so it appears on
//   the Translations screen), aspect (image shape), when (only show
//   when another field has a value), half (half-width in the form)
// ─────────────────────────────────────────────────────────────

/** Pages of the website, offered as suggestions in every link field. */
export const SITE_LINKS = [
  { value: '/', label: 'Home page' },
  { value: '/news', label: 'News' },
  { value: '/schedule', label: 'Schedule — fixtures' },
  { value: '/schedule?tab=results', label: 'Schedule — results' },
  { value: '/schedule?tab=events', label: 'Schedule — club events' },
  { value: '/squad', label: 'Players' },
  { value: '/squad#youth', label: 'Players — youth' },
  { value: '/committee', label: 'Committee' },
  { value: '/gallery', label: 'Gallery' },
  { value: '/gallery#videos', label: 'Gallery — videos' },
  { value: '/membership', label: 'Membership' },
  { value: '/club', label: 'The Club' },
  { value: '/club#history', label: 'The Club — history' },
  { value: '/club#heritage', label: 'The Club — heritage' },
  { value: '/club#community', label: 'The Club — community' },
  { value: '/club#ground', label: 'The Club — our ground' },
  { value: '/club#faq', label: 'The Club — FAQ' },
  { value: '/contact', label: 'Contact' },
  { value: '/contact#partners', label: 'Contact — partner with us' },
];

/**
 * Image shapes. `ratio` is width / height, used for the crop tool's
 * starting shape and the previews; the website itself always fills its
 * frame and keeps the chosen focus point in view.
 */
export const ASPECTS = {
  banner: { label: 'Wide banner', ratio: 21 / 9 },
  wide: { label: 'Landscape', ratio: 16 / 9 },
  photo: { label: 'Photo (4:3)', ratio: 4 / 3 },
  square: { label: 'Square', ratio: 1 },
  portrait: { label: 'Portrait', ratio: 3 / 4 },
  story: { label: 'Tall (phone story)', ratio: 9 / 16 },
  any: { label: 'Any shape', ratio: null },
};

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const order = { name: 'order', type: 'number', hidden: true };
const published = (label = 'Show on the website') => ({
  name: 'published', type: 'boolean', default: true, label,
  help: 'Switch off to hide it from visitors without deleting it.',
});

// ─── Collections (lists of items) ─────────────────────────────
export const COLLECTIONS = [
  {
    key: 'news',
    label: 'News',
    singular: 'news story',
    icon: 'newspaper',
    group: 'Website content',
    description: 'Match reports, announcements and stories. The newest appear first on the home page.',
    titleField: 'title',
    subtitle: ['tag', 'date'],
    imageField: 'photo',
    sort: { date: -1 },
    publishable: true,
    searchable: ['title', 'desc', 'tag'],
    fields: [
      { name: 'title', label: 'Headline', type: 'text', required: true, max: 140, t: true, placeholder: 'e.g. ATC 3–1 Bansihari: a statement at home' },
      { name: 'slug', label: 'Web address', type: 'slug', from: 'title', help: 'Made from the headline automatically. Only change it if you know why — old links stop working.' },
      { name: 'desc', label: 'Short summary', type: 'textarea', required: true, max: 300, t: true, help: 'One or two sentences shown on the news cards and in Google results.' },
      { name: 'photo', label: 'Main photo', type: 'image', required: true, aspect: 'wide', help: 'Shown at the top of the story and on the news cards.' },
      { name: 'tag', label: 'Category', type: 'combo', required: true, options: ['Club', 'First Team', 'Youth', 'Heritage', 'Community'], default: 'Club', t: true, half: true },
      { name: 'date', label: 'Date & time', type: 'datetime', required: true, default: 'now', half: true },
      { name: 'body', label: 'Full story', type: 'longtext', max: 20000, t: true, help: 'Leave an empty line between paragraphs. The first paragraph gets a large opening letter.' },
      { name: 'featured', label: 'Make this the big story on the home page', type: 'boolean', default: false, help: 'If several are switched on, the newest one is used.' },
      published(),
    ],
  },
  {
    key: 'matches',
    label: 'Matches',
    singular: 'match',
    icon: 'ball',
    group: 'Website content',
    description: 'Fixtures and results. Add the final score after a match and it moves to Results by itself.',
    titleField: (d, refs) => `${refs.teams?.[d.home]?.short || '?'} vs ${refs.teams?.[d.away]?.short || '?'}`,
    subtitle: ['comp', 'date'],
    sort: { date: -1 },
    publishable: true,
    searchable: ['comp', 'round', 'venue'],
    fields: [
      { name: 'home', label: 'Home team', type: 'ref', to: 'teams', required: true, half: true },
      { name: 'away', label: 'Away team', type: 'ref', to: 'teams', required: true, half: true },
      { name: 'date', label: 'Kick-off (India time)', type: 'datetime', required: true },
      { name: 'comp', label: 'Competition', type: 'combo', required: true, options: ['District League', 'ATC Annual Cup', 'Uttar Dinajpur Cup', 'Friendly'], t: true, half: true },
      { name: 'round', label: 'Round', type: 'text', max: 60, placeholder: 'e.g. Matchday 7, Semi-final', t: true, half: true },
      { name: 'venue', label: 'Ground', type: 'combo', required: true, options: ['S. Akhanagar Ground'], default: 'S. Akhanagar Ground', max: 100, t: true },
      { name: 'entry', label: 'Entry for spectators', type: 'select', options: [{ value: '', label: 'Don’t show' }, { value: 'Free entry', label: 'Free entry' }, { value: 'Tickets', label: 'Tickets' }], default: '', help: 'Only shown for home matches.' },
      { name: 'scoreHeading', type: 'heading', label: 'Final score', help: 'Leave empty until the match has been played.' },
      { name: 'homeScore', label: 'Home goals', type: 'number', min: 0, max: 99, integer: true, half: true },
      { name: 'awayScore', label: 'Away goals', type: 'number', min: 0, max: 99, integer: true, half: true },
      published(),
    ],
    refs: ['home', 'away'],
  },
  {
    key: 'events',
    label: 'Club Events',
    singular: 'event',
    icon: 'calendar',
    group: 'Website content',
    description: 'Tournaments, Heritage Night, meetings and ceremonies. Past events hide themselves.',
    titleField: 'title',
    subtitle: ['kind', 'date'],
    imageField: 'photo',
    sort: { date: 1 },
    publishable: true,
    searchable: ['title', 'desc', 'venue'],
    fields: [
      { name: 'title', label: 'Event name', type: 'text', required: true, max: 100, t: true },
      { name: 'kind', label: 'Type', type: 'combo', required: true, options: ['Football', 'Culture', 'Club', 'Ceremony', 'Community'], default: 'Club', t: true, half: true },
      { name: 'date', label: 'Starts (India time)', type: 'datetime', required: true, half: true },
      { name: 'venue', label: 'Where', type: 'combo', required: true, options: ['S. Akhanagar Ground', 'Club Grounds', 'Club Hall'], max: 100, t: true },
      { name: 'desc', label: 'Description', type: 'textarea', max: 400, t: true },
      { name: 'photo', label: 'Photo (optional)', type: 'image', aspect: 'wide' },
      published(),
    ],
  },
  {
    key: 'videos',
    label: 'Videos',
    singular: 'video',
    icon: 'play',
    group: 'Website content',
    description: 'Videos live on YouTube and play inside the website. Upload to YouTube, then paste the link here.',
    titleField: 'title',
    subtitle: ['date'],
    imageField: 'url',
    orderable: true,
    newFirst: true,
    publishable: true,
    searchable: ['title'],
    fields: [
      { name: 'url', label: 'YouTube link', type: 'youtube', required: true, help: 'Open the video on YouTube, press Share → Copy, and paste here. The title fills in by itself.' },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 140, t: true },
      { name: 'desc', label: 'Short description (optional)', type: 'textarea', max: 300, t: true },
      { name: 'date', label: 'Date (optional)', type: 'datetime' },
      published(),
      order,
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    singular: 'photo',
    icon: 'images',
    group: 'Website content',
    description: 'The photo wall on the Gallery page. You can upload many photos at once.',
    titleField: 'caption',
    subtitle: ['album'],
    imageField: 'photo',
    orderable: true,
    newFirst: true,
    publishable: true,
    bulkUpload: { imageField: 'photo', titleField: 'caption' },
    searchable: ['caption', 'album'],
    fields: [
      { name: 'photo', label: 'Photo', type: 'image', required: true, aspect: 'any' },
      { name: 'caption', label: 'Caption', type: 'text', required: true, max: 120, t: true, placeholder: 'e.g. Matchday, S. Akhanagar' },
      { name: 'album', label: 'Album (optional)', type: 'combo', options: ['Matchday', 'Training', 'Youth', 'Heritage Night', 'Annual Cup', 'Community'], max: 60, t: true, help: 'Photos with the same album can be filtered together on the Gallery page.' },
      published(),
      order,
    ],
  },
  {
    key: 'players',
    label: 'Players',
    singular: 'player',
    icon: 'shirt',
    group: 'People',
    description: 'The squad. Players switched on for “home page” appear in the slider at the bottom of the home page, in this order.',
    titleField: (d) => `#${d.no ?? '?'} ${d.first || ''} ${d.last || ''}`.trim(),
    subtitle: ['pos', 'squad'],
    imageField: 'photo',
    orderable: true,
    publishable: true,
    searchable: ['first', 'last', 'pos'],
    fields: [
      { name: 'first', label: 'First name', type: 'text', required: true, max: 40, t: true, half: true },
      { name: 'last', label: 'Surname', type: 'text', required: true, max: 40, t: true, half: true },
      { name: 'no', label: 'Shirt number', type: 'number', required: true, min: 1, max: 99, integer: true, half: true },
      { name: 'pos', label: 'Position', type: 'select', required: true, options: POSITIONS, half: true },
      { name: 'squad', label: 'Squad', type: 'select', required: true, default: 'first-team', options: [{ value: 'first-team', label: 'First Team' }, { value: 'youth', label: 'Youth (U-17)' }, { value: 'veterans', label: 'Veterans' }] },
      { name: 'photo', label: 'Photo (optional)', type: 'image', aspect: 'portrait', help: 'A portrait photo, ideally against a plain background. Without one, the player’s shirt is drawn instead.' },
      { name: 'captain', label: 'Captain', type: 'boolean', default: false },
      { name: 'featured', label: 'Show on the home page slider', type: 'boolean', default: false },
      published(),
      order,
    ],
  },
  {
    key: 'committee',
    label: 'Committee',
    singular: 'committee member',
    icon: 'users',
    group: 'People',
    description: 'Office-bearers shown on the Committee page, in this order.',
    titleField: 'name',
    subtitle: ['role'],
    imageField: 'photo',
    orderable: true,
    publishable: true,
    searchable: ['name', 'role'],
    fields: [
      { name: 'role', label: 'Role', type: 'combo', required: true, options: ['President', 'Vice President', 'Secretary', 'Joint Secretary', 'Treasurer', 'Sports Secretary', 'Cultural Secretary', 'Head Coach'], max: 60, t: true, half: true },
      { name: 'name', label: 'Name', type: 'text', required: true, max: 80, t: true, half: true },
      { name: 'photo', label: 'Photo (optional)', type: 'image', aspect: 'square', help: 'Shown in a circle — put the focus point on the face.' },
      published(),
      order,
    ],
  },
  {
    key: 'stories',
    label: 'Stories',
    singular: 'story',
    icon: 'circle-play',
    group: 'Home page',
    description: 'The round “ATC Stories” bubbles on the home page. Each story is a few full-screen slides.',
    titleField: 'title',
    imageField: 'cover',
    orderable: true,
    publishable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 30, t: true, help: 'Keep it short — it sits under a small circle.' },
      { name: 'cover', label: 'Circle photo', type: 'image', required: true, aspect: 'square' },
      {
        name: 'slides', label: 'Slides', type: 'list', required: true, max: 12, itemLabel: 'Slide',
        help: 'Each slide shows for about 5 seconds.',
        fields: [
          { name: 'kind', label: 'Slide type', type: 'select', required: true, default: 'photo', options: [{ value: 'photo', label: 'Photo with a caption' }, { value: 'letter', label: 'Hand-written letter (text only)' }] },
          { name: 'photo', label: 'Photo', type: 'image', aspect: 'story', when: { field: 'kind', is: 'photo' }, required: true },
          { name: 'text', label: 'Text', type: 'textarea', required: true, max: 240, t: true },
        ],
      },
      published(),
      order,
    ],
  },
  {
    key: 'promos',
    label: 'Events & Tickets cards',
    singular: 'card',
    icon: 'ticket',
    group: 'Home page',
    description: 'The row of tall cards under the big story on the home page.',
    titleField: 'title',
    imageField: 'photo',
    orderable: true,
    publishable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 40, t: true },
      { name: 'link', label: 'Opens', type: 'link', required: true, default: '/schedule' },
      { name: 'style', label: 'Card style', type: 'select', required: true, default: 'photo', options: [{ value: 'photo', label: 'Photo' }, { value: 'paper', label: 'Paper poster (text on old paper)' }] },
      { name: 'photo', label: 'Photo', type: 'image', aspect: 'portrait', required: true, when: { field: 'style', is: 'photo' } },
      { name: 'paperScript', label: 'Small hand-written word', type: 'text', max: 20, t: true, when: { field: 'style', is: 'paper' }, placeholder: 'e.g. The', half: true },
      { name: 'paperBig', label: 'Big word', type: 'text', max: 24, t: true, when: { field: 'style', is: 'paper' }, required: true, placeholder: 'e.g. Annual Cup', half: true },
      { name: 'paperNote', label: 'Note at the bottom', type: 'text', max: 40, t: true, when: { field: 'style', is: 'paper' }, placeholder: 'e.g. 15 Nov · S. Akhanagar' },
      { name: 'paperTone', label: 'Paper colour', type: 'select', default: 'light', options: [{ value: 'light', label: 'Light paper' }, { value: 'dark', label: 'Dark brown' }], when: { field: 'style', is: 'paper' } },
      published(),
      order,
    ],
  },
  {
    key: 'explore',
    label: 'Explore the Club cards',
    singular: 'card',
    icon: 'compass',
    group: 'Home page',
    description: 'The three large cards in “Explore the Club” on the home page.',
    titleField: 'title',
    imageField: 'photo',
    orderable: true,
    publishable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 40, t: true },
      { name: 'desc', label: 'Description', type: 'textarea', required: true, max: 160, t: true },
      { name: 'photo', label: 'Photo', type: 'image', required: true, aspect: 'wide' },
      { name: 'art', label: 'Drawing', type: 'select', default: 'crest', options: [{ value: 'jersey', label: 'Club shirt' }, { value: 'drum', label: 'Madal drum' }, { value: 'crest', label: 'Club crest' }] },
      { name: 'cta', label: 'Button text', type: 'text', required: true, max: 30, t: true, default: 'Discover', half: true },
      { name: 'link', label: 'Opens', type: 'link', required: true, default: '/club', half: true },
      published(),
      order,
    ],
  },
  {
    key: 'partners',
    label: 'Partners & Sponsors',
    singular: 'partner',
    icon: 'handshake',
    group: 'Home page',
    description: 'Businesses that support the club. Main partners’ logos appear on the home page.',
    titleField: 'name',
    subtitle: ['level'],
    imageField: 'logo',
    orderable: true,
    publishable: true,
    fields: [
      { name: 'name', label: 'Business name', type: 'text', required: true, max: 80 },
      { name: 'logo', label: 'Logo', type: 'image', required: true, aspect: 'any', help: 'A PNG with a transparent background looks best.' },
      { name: 'level', label: 'Partnership', type: 'select', required: true, default: 'main', options: [{ value: 'main', label: 'Main Partner' }, { value: 'cup', label: 'Annual Cup Partner' }, { value: 'community', label: 'Community Supporter' }] },
      { name: 'url', label: 'Their website (optional)', type: 'url' },
      published(),
      order,
    ],
  },
  {
    key: 'honours',
    label: 'Honours & Trophies',
    singular: 'honour',
    icon: 'trophy',
    group: 'Club information',
    description: 'The trophy counters shown on the Club page and in the footer.',
    titleField: 'comp',
    subtitle: ['count', 'unit'],
    orderable: true,
    fields: [
      { name: 'comp', label: 'Competition', type: 'text', required: true, max: 40, t: true },
      { name: 'count', label: 'How many', type: 'number', required: true, min: 0, max: 9999, integer: true, half: true },
      { name: 'unit', label: 'Word after the number', type: 'combo', required: true, options: ['Titles', 'Trophies', 'Seasons'], t: true, half: true },
      { name: 'icon', label: 'Icon', type: 'select', default: 'cup', options: [{ value: 'cup', label: 'Cup' }, { value: 'shield', label: 'Shield' }, { value: 'laurel', label: 'Laurel' }, { value: 'ball', label: 'Football' }] },
      order,
    ],
  },
  {
    key: 'timeline',
    label: 'History timeline',
    singular: 'milestone',
    icon: 'history',
    group: 'Club information',
    description: 'Milestones on the Club page, sorted by year automatically.',
    titleField: (d) => `${d.year || ''} — ${d.title || ''}`,
    sort: { year: 1 },
    fields: [
      { name: 'year', label: 'Year', type: 'text', required: true, max: 9, pattern: '^[0-9]{4}(s)?$', patternHelp: 'Write a year like 1981', half: true },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 60, t: true, half: true },
      { name: 'text', label: 'What happened', type: 'textarea', required: true, max: 300, t: true },
    ],
  },
  {
    key: 'faqs',
    label: 'Questions & answers',
    singular: 'question',
    icon: 'help',
    group: 'Club information',
    description: 'Frequently asked questions on the Club and Membership pages. Google also reads these.',
    titleField: 'q',
    subtitle: ['page'],
    orderable: true,
    publishable: true,
    searchable: ['q', 'a'],
    fields: [
      { name: 'q', label: 'Question', type: 'text', required: true, max: 160, t: true },
      { name: 'a', label: 'Answer', type: 'textarea', required: true, max: 1200, t: true },
      { name: 'page', label: 'Show on', type: 'select', required: true, default: 'club', options: [{ value: 'club', label: 'Club page' }, { value: 'membership', label: 'Membership page' }] },
      published(),
      order,
    ],
  },
  {
    key: 'tiers',
    label: 'Membership plans',
    singular: 'plan',
    icon: 'badge',
    group: 'Club information',
    description: 'The membership options on the Membership page.',
    titleField: 'name',
    subtitle: ['price'],
    orderable: true,
    fields: [
      { name: 'name', label: 'Plan name', type: 'text', required: true, max: 30, t: true, half: true },
      { name: 'price', label: 'Price', type: 'text', required: true, max: 30, t: true, placeholder: 'e.g. Free, ₹500 a year', half: true },
      { name: 'perks', label: 'What members get', type: 'list', of: 'text', required: true, max: 10, itemMax: 120, t: true, itemLabel: 'Benefit' },
      { name: 'featured', label: 'Highlight this plan (wax seal)', type: 'boolean', default: false },
      order,
    ],
  },
  {
    key: 'teams',
    label: 'Teams',
    singular: 'team',
    icon: 'shield',
    group: 'Club information',
    description: 'Our club and the teams we play against. Used when adding matches.',
    titleField: 'name',
    subtitle: ['short'],
    imageField: 'crest',
    sort: { isClub: -1, name: 1 },
    searchable: ['name', 'short'],
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, max: 80, t: true, half: true },
      { name: 'short', label: 'Short name', type: 'text', required: true, max: 20, t: true, help: 'Shown on match cards, e.g. “Raiganj”.', half: true },
      { name: 'crest', label: 'Badge (optional)', type: 'image', aspect: 'square', help: 'Without a badge, a shield is drawn in the two colours below.' },
      { name: 'color1', label: 'Shield colour', type: 'color', default: '#2F4A3A', half: true },
      { name: 'color2', label: 'Letter colour', type: 'color', default: '#D8C9A3', half: true },
      { name: 'isClub', type: 'boolean', hidden: true, default: false },
    ],
  },
];

// ─── Single pages of settings ─────────────────────────────────
const PAGE_BANNERS = [
  ['club', 'The Club page'],
  ['schedule', 'Schedule page'],
  ['news', 'News page'],
  ['squad', 'Players page'],
  ['committee', 'Committee page'],
  ['gallery', 'Gallery page'],
  ['membership', 'Membership page'],
  ['contact', 'Contact page'],
];

export const SINGLES = [
  {
    key: 'settings',
    label: 'Club details',
    icon: 'settings',
    group: 'Settings',
    description: 'Name, address, contact details, social media and the announcement bar at the very top of the site.',
    fields: [
      { name: 'h1', type: 'heading', label: 'The club' },
      { name: 'name', label: 'Club name', type: 'text', required: true, max: 80, t: true, half: true },
      { name: 'short', label: 'Short name', type: 'text', required: true, max: 10, half: true },
      { name: 'founded', label: 'Founded in', type: 'number', required: true, min: 1800, max: 2100, integer: true, half: true },
      { name: 'motto', label: 'Motto', type: 'text', max: 120, t: true, half: true },
      { name: 'h2', type: 'heading', label: 'Address & ground' },
      { name: 'address', label: 'Address lines', type: 'list', of: 'text', required: true, max: 5, itemMax: 100, t: true, itemLabel: 'Line' },
      { name: 'ground', label: 'Home ground name', type: 'text', required: true, max: 80, t: true },
      { name: 'lat', label: 'Map latitude', type: 'number', min: -90, max: 90, half: true, help: 'In Google Maps, right-click the ground and click the numbers to copy them.' },
      { name: 'lng', label: 'Map longitude', type: 'number', min: -180, max: 180, half: true },
      { name: 'mapsClub', label: 'Google Maps link — club', type: 'url', half: true },
      { name: 'mapsGround', label: 'Google Maps link — ground', type: 'url', half: true },
      { name: 'h3', type: 'heading', label: 'Contact' },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true, help: 'Letters written on the website are sent here.' },
      { name: 'phone', label: 'Phone (optional)', type: 'text', max: 20, half: true },
      { name: 'h4', type: 'heading', label: 'Social media', help: 'Paste the full address of each page. Leave empty to hide the icon.' },
      { name: 'facebook', label: 'Facebook', type: 'url' },
      { name: 'instagram', label: 'Instagram', type: 'url' },
      { name: 'youtube', label: 'YouTube channel', type: 'url' },
      { name: 'h5', type: 'heading', label: 'Announcement bar', help: 'The thin bar at the very top of every page.' },
      { name: 'ribbonOn', label: 'Show the announcement bar', type: 'boolean', default: true },
      { name: 'ribbonText', label: 'Message', type: 'text', max: 90, t: true, when: { field: 'ribbonOn', is: true }, required: true },
      { name: 'ribbonCta', label: 'Button word', type: 'text', max: 16, t: true, when: { field: 'ribbonOn', is: true }, half: true },
      { name: 'ribbonLink', label: 'Opens', type: 'link', when: { field: 'ribbonOn', is: true }, half: true, required: true },
    ],
  },
  {
    key: 'pages',
    label: 'Page banners & photos',
    icon: 'image',
    group: 'Settings',
    description: 'The big photo and words at the top of each page, and the fixed photos on the home and club pages.',
    fields: [
      ...PAGE_BANNERS.flatMap(([p, label]) => [
        { name: `${p}Heading`, type: 'heading', label },
        { name: `${p}Photo`, label: 'Banner photo', type: 'image', aspect: 'banner', required: true },
        { name: `${p}Script`, label: 'Hand-written line', type: 'text', max: 30, t: true, half: true },
        { name: `${p}Intro`, label: 'Introduction', type: 'textarea', max: 200, t: true, half: true },
      ]),
      { name: 'homeHeading', type: 'heading', label: 'Home page photos' },
      { name: 'homeMembership', label: 'Membership banner background', type: 'image', aspect: 'banner', required: true },
      { name: 'homeCalendar', label: '“See the calendar” card', type: 'image', aspect: 'portrait', required: true },
      { name: 'homeGallery', label: 'Gallery card under the big story', type: 'image', aspect: 'photo', required: true },
      { name: 'homeVideo', label: 'Video card under the big story', type: 'image', aspect: 'photo', help: 'Used only when no YouTube video has been added.' },
      { name: 'clubHeading', type: 'heading', label: 'Club page photos' },
      { name: 'clubHeritage', label: 'Heritage & culture photo', type: 'image', aspect: 'photo', required: true },
      { name: 'clubCommunity', label: 'Community photo', type: 'image', aspect: 'photo', required: true },
    ],
  },
];

export const COLLECTION_MAP = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c]));
export const SINGLE_MAP = Object.fromEntries(SINGLES.map((s) => [s.key, s]));

/** Definitions as plain JSON for the admin panel (functions become a hint string). */
export function schemaForAdmin() {
  const clean = (def) => ({
    ...def,
    titleField: typeof def.titleField === 'function' ? null : def.titleField,
  });
  return {
    collections: COLLECTIONS.map(clean),
    singles: SINGLES,
    aspects: ASPECTS,
    siteLinks: SITE_LINKS,
  };
}

/** Human title of a stored item, for lists, activity log and messages. */
export function titleOf(def, doc, refs = {}) {
  if (!doc) return '';
  if (typeof def.titleField === 'function') return def.titleField(doc, refs);
  return String(doc[def.titleField] ?? '').trim() || `Untitled ${def.singular}`;
}
