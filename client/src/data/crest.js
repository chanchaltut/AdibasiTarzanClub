// ─────────────────────────────────────────────────────────────
// "The Story Behind Our Crest" — the club's own words about every
// part of the emblem, shown on /crest.
//
// The crest itself is fixed artwork, so its story lives here with
// the site rather than in the admin panel. `spot` is where that part
// sits on /brand/AdibasiTarzanClub.webp, as % from the left and top.
// Hindi and Bengali are in src/i18n/hi.js and bn.js.
// ─────────────────────────────────────────────────────────────

export const CREST_IMAGE = { src: '/brand/AdibasiTarzanClub.webp', width: 1221, height: 1289 };

export const CREST_INTRO = {
  kicker: 'The Symbol of Our Identity',
  title: 'The Story Behind Our Crest',
  established: 'Established in 1981 | S. Akhanagar, Kaliyaganj, Uttar Dinajpur, West Bengal',
  body: [
    'Every crest tells a story, but ours carries the identity of an entire community, the history of a club, the pride of our heritage, and the spirit of generations brought together through football and unity.',
    'The crest of Adibasi Tarzan Club is more than a logo or a decorative emblem. It is a representation of who we are, where we come from, what we believe in, and what we wish to carry forward. Every figure, symbol, colour, and inscription has its own significance, reflecting our roots, culture, sporting spirit, and collective identity.',
    'It was created to give our club a distinctive identity—one that represents our heritage with pride, honours our beginnings, and reminds every generation of the values that bind us together.',
  ],
};

export const CREST_PARTS = [
  {
    id: 'estd-1981',
    label: 'Estd. 1981',
    title: 'The Foundation of Our Legacy',
    spot: { x: 71, y: 72.5 },
    body: [
      'The year 1981 marks the establishment of Adibasi Tarzan Club and the beginning of a journey built upon passion, dedication, friendship, and a shared vision.',
      'It honours the efforts of those who laid the foundation of our club and reminds us of the legacy passed down through generations. It is not merely a year written on our crest, but a symbol of our history, our beginnings, and the responsibility we carry to preserve and strengthen what was built before us.',
    ],
  },
  {
    id: 'jungle',
    label: 'The Jungle & Trees',
    title: 'Our Roots, Origin and Journey',
    spot: { x: 11, y: 31 },
    body: [
      'The trees and jungle in the background represent our origin, our ancestral roots, and our connection with the natural world from which our identity emerged.',
      'Tarzan’s emergence from the jungle symbolizes a journey towards awareness, growth, progress, and a more united society. It reflects the idea of moving forward with knowledge, understanding, and strength while remaining deeply connected to our roots.',
      'The jungle reminds us that no matter how much we evolve, how far we advance, or how modern we become, we must never forget where we belong and the heritage from which we have grown.',
    ],
    quote: 'We move forward with time, but we never move away from our roots.',
  },
  {
    id: 'tarzan',
    label: 'Tarzan',
    title: 'The Identity and Spirit of Our Club',
    spot: { x: 36, y: 23 },
    body: [
      'Tarzan stands at the heart of our crest, representing the identity of Adibasi Tarzan Club. He symbolizes courage, strength, bravery, resilience, confidence, determination, and the spirit of facing challenges together.',
      'Holding a football represents our passion and love for the game, while his powerful presence reflects a community that has grown, evolved, and embraced progress without forgetting its original identity.',
      'Tarzan is not simply a figure from the jungle. He represents our club’s character—a strength that stands firm, an identity that remains proud, and a spirit that continues to move forward.',
    ],
  },
  {
    id: 'bow-arrows',
    label: 'The Bow, Arrows & Quiver',
    title: 'Our Heritage and Strength',
    spot: { x: 24, y: 14.5 },
    body: [
      'The bow, arrows, and quiver resting upon Tarzan’s shoulder represent our tribal heritage, ancestral traditions, courage, readiness, and strength.',
      'These elements remind us of the history, way of life, and cultural identity of tribal communities. They symbolize our connection with our ancestors, respect for our traditions, and the pride with which we carry our heritage into the future.',
      'They are a reminder that progress should never mean forgetting our cultural identity.',
    ],
  },
  {
    id: 'tumdak-tamak',
    label: 'Tumdak & Tamak',
    title: 'The Rhythm of Our Culture',
    spot: { x: 65, y: 29 },
    body: [
      'The Tumdak and Tamak (Nagada), represented alongside the traditional bow and arrow within the crest, symbolize our tribal culture, musical traditions, community life, and cultural pride.',
      'Their rhythms are deeply connected with celebrations, festivals, gatherings, and the collective spirit of our people. They represent the sound of our traditions, the joy of our culture, and the rhythm that brings our community together.',
      'They remind us that our heritage is not simply something inherited from the past—it is something we must keep alive, celebrate, and pass on to future generations.',
    ],
  },
  {
    id: 'bengali-inscription',
    label: 'The Bengali Inscription',
    title: 'Our Regional Identity',
    spot: { x: 70, y: 15.5 },
    body: [
      'The Bengali inscription within our crest represents our regional identity and our connection to West Bengal, our locality, and the community from which Adibasi Tarzan Club emerged.',
      'It reflects our belonging to our land, our village, and our people. It gives our crest a local identity and reminds us that the club’s journey is deeply connected to the place we call home.',
    ],
  },
  {
    id: 'football',
    label: 'The Football',
    title: 'Our Sporting Spirit & Common Bond',
    spot: { x: 46, y: 33 },
    body: [
      'The football represents the passion that brought us together and continues to unite us. It stands for teamwork, discipline, dedication, sportsmanship, friendship, and the determination to grow together.',
      'Football is more than a game for us. It is a bond between generations, a reason for friendships, a source of shared memories, and a common ground where people come together regardless of differences.',
      'It reminds us that true success is not built upon individual talent alone, but through collective effort, trust, cooperation, and unity.',
    ],
  },
  {
    id: 'atc',
    label: 'ATC',
    title: 'One Name, One Identity',
    spot: { x: 71.5, y: 36.5 },
    body: [
      'ATC stands for Adibasi Tarzan Club. These three letters bring together our full identity, our members, our history, our heritage, and our shared sense of belonging.',
      'It represents one club, one community, and one common spirit—a name carried with pride by everyone who has been part of our journey.',
    ],
  },
  {
    id: 'unity-symbol',
    label: 'The Circular Symbol between Estd. & 1981',
    title: 'Unity and Togetherness',
    spot: { x: 50, y: 73 },
    body: [
      'The circular symbol placed between ESTD. and 1981 represents unity, togetherness, and collective strength.',
      'Its interconnected form reflects the idea that individuals become stronger when they stand together, support one another, and work towards a common purpose.',
      'It symbolizes the bond between our members, generations, and community—a reminder that our strength does not lie in one individual, but in all of us standing together.',
    ],
    quote: 'One Community. One Unity. One Strength.',
  },
  {
    id: 'shield',
    label: 'The Shield',
    title: 'Strength, Protection & Pride',
    spot: { x: 6, y: 54 },
    body: [
      'The shield is the foundation that brings every element of our crest together within one emblem. It symbolizes resilience, solidarity, protection, dignity, and the determination to uphold our club’s identity and values.',
      'It represents a club that stands firm through challenges, honours its history, protects its heritage, and remains united in spirit.',
      'The shield gives our identity its form—a symbol of strength that holds our history, culture, sporting passion, and unity together.',
    ],
  },
  {
    id: 'colours',
    label: 'The Colours',
    title: 'Pride in Our Identity',
    spot: { x: 57, y: 24 },
    body: [
      'The colours of our crest give it a distinctive character and reflect the pride, dignity, strength, and heritage of our club.',
    ],
    colours: [
      { name: 'Maroon', hex: '#5C0A1C', meaning: 'Courage & Passion', text: 'Maroon represents courage, determination, passion, and the strong spirit that drives our community forward.' },
      { name: 'Blue', hex: '#0F2F55', meaning: 'Confidence & Progress', text: 'Blue represents confidence, stability, hope, and a forward-looking spirit. It reflects our belief in growth, progress, and the future of our club.' },
    ],
    after: 'Together, these colours create an identity that reflects our heritage, strength, passion, and ambition.',
  },
  {
    id: 'home',
    label: 'S. Akhanagar, Kaliyaganj, U/D',
    title: 'Our Home',
    spot: { x: 50, y: 86 },
    body: [
      'The bottom banner identifies our locality and connects the crest to the home of Adibasi Tarzan Club.',
      'It represents our village, our community, our people, and the place from which our journey began and continues. It reminds us that no matter where our journey takes us, our identity will always remain connected to our home and our roots.',
    ],
  },
];

export const CREST_MESSAGE = {
  title: 'The Message Behind Our Crest',
  body: [
    'Our crest brings together our history, tribal heritage, cultural traditions, sporting passion, and community identity in one emblem.',
    'Tarzan represents our strength and identity. The jungle reminds us of our origin. Our tribal symbols honour our culture and traditions. The football represents the passion that unites us. The year 1981 honours our foundation. The shield holds all these elements together, while the symbols of unity remind us that our greatest strength has always been standing together.',
    'It reminds us that our past gives us roots, our culture gives us pride, our sports bring us together, and our unity gives us strength.',
    'Our crest is not merely a symbol we wear. It is a legacy we inherit, an identity we honour, and a spirit we carry forward.',
  ],
  closing: 'One Heritage. One Identity. One Club. One Spirit — Since 1981.',
};

/** Questions people ask about the crest, answered from the club's own words (shown on /crest and as FAQ data). */
export const CREST_FAQ = [
  {
    q: 'What does the Adibasi Tarzan Club crest mean?',
    a: 'The crest of Adibasi Tarzan Club (ATC), S. Akhanagar, Kaliyaganj, brings together the club’s history, tribal heritage, cultural traditions, sporting passion and community identity. Tarzan stands for the club’s strength and identity, the jungle for its origin, the bow, arrows, Tumdak and Tamak for Adibasi culture, the football for the passion that unites it, and “Estd. 1981” for its foundation — all held together by the shield.',
  },
  {
    q: 'What are the colours of Adibasi Tarzan Club?',
    a: 'The crest’s colours are maroon, for courage and passion, and blue, for confidence and progress, set in the gold and brown of the shield.',
  },
  {
    q: 'What are the Tumdak and Tamak on the ATC crest?',
    a: 'The Tumdak and Tamak (Nagada) are traditional drums of the Adibasi community. On the crest they stand for tribal culture, music, festivals and the rhythm that brings the community of S. Akhanagar together.',
  },
  {
    q: 'When was Adibasi Tarzan Club established?',
    a: 'Adibasi Tarzan Club was established in 1981 in S. Akhanagar, Kaliyaganj, Uttar Dinajpur, West Bengal. The year is written on the crest as “Estd. 1981”.',
  },
];
