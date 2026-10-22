const P = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  sync: <><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16" /><path d="M20 20v-4h-4" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5H5V6h5" /></>,
  ticket: <><path d="M3 8V6h18v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v0H3v0a2 2 0 0 0 0-4v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2" /></>,
  seal: <><circle cx="12" cy="11" r="6" /><path d="m9 16-1.5 5L12 19l4.5 2L15 16" /><path d="M10 11h4M12 9v4" /></>,
  shirt: <path d="M8 3 3 6l2 5 3-1.5V21h8V9.5L19 11l2-5-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z" />,
  letter: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3.5 6 8.5 7 8.5-7" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="m12 7.5 4 2.9-1.5 4.7h-5L8 10.4z" /><path d="M12 3v4.5M16 10.4l4.3-1.4M14.5 15.1l2.7 3.7M9.5 15.1l-2.7 3.7M8 10.4 3.7 9" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3.5 6 8.5 7 8.5-7" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" fill="currentColor" stroke="none" />,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".8" fill="currentColor" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
  whatsapp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7Z" /><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2Z" fill="currentColor" stroke="none" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  quote: <path d="M7 17c-2 0-3-1.5-3-3.5C4 10 6 7.5 9 6l.8 1.2C8 8.3 7.2 9.6 7 11c2 0 3 1.2 3 3s-1.3 3-3 3Zm9 0c-2 0-3-1.5-3-3.5 0-3.5 2-6 5-7.5l.8 1.2c-1.8 1.1-2.6 2.4-2.8 3.8 2 0 3 1.2 3 3s-1.3 3-3 3Z" fill="currentColor" stroke="none" />,
};

export default function Icon({ name, size = 20, className = '', title }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {P[name]}
    </svg>
  );
}
