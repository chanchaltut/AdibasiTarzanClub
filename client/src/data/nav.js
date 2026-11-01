// ─────────────────────────────────────────────────────────────
// Site navigation. This is the structure of the website itself (which
// pages exist), so it lives in code rather than in the admin panel.
// ─────────────────────────────────────────────────────────────

export const NAV_LEFT = [
  {
    label: 'Events & Tickets',
    href: '/schedule',
    columns: 2,
    items: [
      { label: 'First Team Fixtures', href: '/schedule' },
      { label: 'ATC Annual Cup', href: '/schedule?tab=events' },
      { label: 'Heritage Night', href: '/schedule?tab=events' },
      { label: 'Prize Distribution', href: '/schedule?tab=events' },
      { label: 'Sports Day', href: '/schedule?tab=events' },
      { label: 'Results', href: '/schedule?tab=results' },
    ],
  },
  { label: 'Membership', href: '/membership' },
  { label: 'Gallery', href: '/gallery' },
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
      { label: 'Committee', href: '/committee' },
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

