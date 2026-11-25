// ─────────────────────────────────────────────────────────────
// The Gallery — "Moments to Memories" — in the four sections the club
// laid out, each with its albums in the club's order. The admin panel
// offers the same list (server/src/content/schemas.js, GALLERY_SECTIONS);
// keep the two in step. Albums typed in the admin that aren't listed
// here still show, after the listed ones.
// ─────────────────────────────────────────────────────────────

export const GALLERY_SECTIONS = [
  {
    id: 'football',
    title: 'The Football Arena',
    blurb: 'Matchdays, squads, away trips, training and the Dashami Dhamaka — football at S. Akhanagar and beyond.',
    albums: ['Matchday Action', 'Team & Squad Photos', 'Away Matches & Participation', 'Training & Practice', 'Dashami Dhamaka', 'Trophies & Achievements', 'Other Sports & Games'],
  },
  {
    id: 'celebrations',
    title: 'Celebrations & Club Events',
    blurb: 'Kali Puja and its preparations, ceremonies, felicitations, prize distributions and club functions.',
    albums: ['Kali Puja', 'Puja Preparations', 'Ceremonial Moments', 'Felicitation & Welcome', 'Prize Distribution', 'Club Functions & Special Events'],
  },
  {
    id: 'heritage',
    title: 'Roots & Heritage',
    blurb: 'Baha and Sohrai Parab, traditional marriage, dance, music, instruments, attire and rituals of our Adibasi community.',
    albums: ['Baha Parab', 'Sohrai Parab', 'Traditional Marriage', 'Traditional Dance, Music & Instruments', 'Traditional Attire & Rituals', 'Cultural Programme'],
  },
  {
    id: 'family',
    title: 'The ATC Family',
    blurb: 'Group photos, birthdays, candid moments, reunions and old memories of the people who make the club.',
    albums: ['Club Group Photo', 'Men’s & Women’s Group', 'Birthday Celebrations', 'Behind the Scenes & Candid Moments', 'Reunions & Gatherings', 'Old Memories'],
  },
];

export const SECTION_MAP = Object.fromEntries(GALLERY_SECTIONS.map((s) => [s.id, s]));

/** A photo's section, also for photos saved before the sections existed. */
export const sectionOf = (shot) => (SECTION_MAP[shot.section] ? shot.section : 'football');

/** Albums of a section that have photos, in the club's order, then any others. */
export function albumsWithPhotos(sectionId, shots) {
  const used = new Set(shots.map((s) => s.album).filter(Boolean));
  const listed = SECTION_MAP[sectionId].albums.filter((a) => used.has(a));
  return [...listed, ...[...used].filter((a) => !listed.includes(a))];
}
