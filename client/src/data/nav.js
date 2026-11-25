// ─────────────────────────────────────────────────────────────
// Site navigation. This is the structure of the website itself (which
// pages exist), so it lives in code rather than in the admin panel.
// ─────────────────────────────────────────────────────────────

export const NAV_LEFT = [
  {
    label: 'Events & Participations',
    href: '/schedule',
    script: 'ATC',
    mega: [
      { title: 'Matches & Tournaments', links: [
        { label: 'First Team Fixtures', href: '/schedule' },
        { label: 'Results', href: '/schedule?tab=results' },
        { label: 'Match Information', href: '/schedule?tab=info' },
        { label: 'ATC Annual Cup', href: '/tournaments' },
        { label: 'Tournament Schedule', href: '/tournaments#schedule' },
        { label: 'Participating Teams', href: '/tournaments#teams' },
        { label: 'Tournament Fixtures', href: '/tournaments#fixtures' },
      ] },
      { title: 'Club Events', links: [
        { label: 'Sports Day', href: '/schedule?tab=events' },
        { label: 'Heritage Night', href: '/schedule?tab=events' },
        { label: 'Prize Distribution', href: '/schedule?tab=events' },
        { label: 'Club Calendar', href: '/schedule?tab=notices' },
        { label: 'Notice Board', href: '/schedule?tab=notices' },
        { label: 'Registration & Participation', href: '/register' },
      ] },
    ],
    cta: { title: 'Take part', text: 'Sign up for club events, programmes and the ATC Annual Cup.', label: 'Register now', href: '/register' },
  },
  { label: 'Membership', href: '/membership' },
  {
    label: 'Gallery',
    href: '/gallery',
    items: [
      { label: 'All moments', href: '/gallery' },
      { label: 'The Football Arena', href: '/gallery?section=football' },
      { label: 'Celebrations & Club Events', href: '/gallery?section=celebrations' },
      { label: 'Roots & Heritage', href: '/gallery?section=heritage' },
      { label: 'The ATC Family', href: '/gallery?section=family' },
      { label: 'Videos', href: '/gallery#videos' },
    ],
  },
  { label: 'Partner With Us', href: '/contact#partners' },
];

export const NAV_RIGHT = [
  {
    label: 'First Team',
    href: '/squad',
    items: [
      { label: 'Latest', href: '/news' },
      { label: 'Schedule', href: '/schedule' },
      { label: 'Results', href: '/schedule?tab=results' },
      { label: 'Players', href: '/squad' },
      { label: 'Honours', href: '/club#honours' },
    ],
  },
  {
    label: 'Club',
    href: '/club',
    columns: 2,
    items: [
      { label: 'About ATC', href: '/club' },
      { label: 'History', href: '/club#history' },
      { label: 'Our Legacy', href: '/club#legacy' },
      { label: 'Our Crest', href: '/crest' },
      { label: 'Committee', href: '/committee' },
      { label: 'Members', href: '/members' },
      { label: 'In Memoriam', href: '/members#in-memoriam' },
      { label: 'Our Ground', href: '/club#ground' },
      { label: 'Honours', href: '/club#honours' },
      { label: 'Membership', href: '/membership' },
      { label: 'FAQ', href: '/club#faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  { label: 'Our Ground', href: '/club#ground' },
  {
    label: 'ATC Teams',
    href: '/squad',
    mega: [
      { title: 'Football', links: [
        { label: 'First Team', href: '/squad' },
        { label: 'Youth (U-17)', href: '/squad#youth' },
        { label: 'Veterans', href: '/squad#veterans' },
      ] },
      { title: 'Heritage', links: [
        { label: 'Cultural Troupe', href: '/club#heritage' },
        { label: 'Heritage Night', href: '/schedule?tab=events' },
      ] },
      { title: 'Community', links: [
        { label: 'Social Wing', href: '/club#community' },
        { label: 'Volunteer', href: '/contact' },
      ] },
    ],
  },
];

export const QUICK_NAV = [
  { label: 'Fixtures', href: '/schedule', icon: 'ticket' },
  { label: 'Membership', href: '/membership', icon: 'seal' },
  { label: 'Squad', href: '/squad', icon: 'shirt' },
  { label: 'Gallery', href: '/gallery', icon: 'camera' },
  { label: 'News', href: '/news', icon: 'letter' },
  { label: 'Contact', href: '/contact', icon: 'pin' },
];

