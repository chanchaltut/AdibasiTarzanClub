import { useMemo } from 'react';
import { TEAMS } from '../../data/club';
import { tornStripPath } from '../../utils/helpers';
import { useLang } from '../../i18n';

/** Global SVG filters — rendered once in the layout. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="atc-rough" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="5" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="atc-rough-sm" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

export function Crest({ size = 56, className = '', alt }) {
  const { t } = useLang();
  return <img className={`crest ${className}`} src="/brand/crest.webp" width={size} height={size} alt={alt ?? t('Adibasi Tarzan Club crest')} />;
}

export function TeamBadge({ code, size = 64 }) {
  const { t: tr } = useLang();
  const t = TEAMS[code];
  if (!t) return null;
  if (t.crest) return <img className="team-badge" src={t.crest} width={size} height={size} alt={tr(t.name)} />;
  const [a, b] = t.colors;
  const initials = t.name.split(' ').filter((w) => !/^(FC|SC|Club)$/.test(w)).map((w) => w[0]).join('').slice(0, 2);
  return (
    <svg className="team-badge" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={tr(t.name)}>
      <path d="M32 3 56 10v20c0 15-10 25-24 31C18 55 8 45 8 30V10Z" fill={a} stroke={b} strokeWidth="2.5" />
      <path d="M32 9 50 14.5V30c0 11.5-7.5 19.5-18 24.5C21.5 49.5 14 41.5 14 30V14.5Z" fill="none" stroke={b} strokeOpacity=".35" />
      <text x="32" y="38" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="19" fill={b} letterSpacing=".5">
        {initials}
      </text>
    </svg>
  );
}

/** Back of an ATC shirt with name and number. */
export function Jersey({ name = '', number = '', className = '' }) {
  const id = useMemo(() => `j${Math.random().toString(36).slice(2, 8)}`, []);
  const { t } = useLang();
  const body = 'M78 18 Q120 34 162 18 L212 38 L236 92 L200 108 L190 96 L190 236 Q120 246 50 236 L50 96 L40 108 L4 92 L28 38 Z';
  return (
    <svg className={`jersey ${className}`} viewBox="0 0 240 250" role="img" aria-label={t('Shirt number {n}', { n: number })}>
      <defs>
        <clipPath id={`${id}c`}><path d={body} /></clipPath>
        <pattern id={`${id}p`} width="22" height="10" patternUnits="userSpaceOnUse">
          <rect width="22" height="10" fill="#3A1A0B" />
          <rect x="10" width="2" height="10" fill="#C9892A" opacity=".55" />
        </pattern>
        <linearGradient id={`${id}s`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".22" stopColor="#000" stopOpacity="0" />
          <stop offset=".78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="240" height="250" fill={`url(#${id}p)`} />
        <rect width="240" height="250" fill={`url(#${id}s)`} />
        <path d="M4 92 L40 108 L50 96 L28 38 Z M236 92 L200 108 L190 96 L212 38 Z" fill="#2A1208" />
        <path d="M4 92 L40 108 L44 99 L8 83 Z M236 92 L200 108 L196 99 L232 83 Z" fill="#D99A2B" />
      </g>
      <path d="M78 18 Q120 34 162 18 Q156 30 120 34 Q84 30 78 18 Z" fill="#D99A2B" />
      <path d={body} fill="none" stroke="#1A0A04" strokeOpacity=".5" strokeWidth="1.5" />
      <text x="120" y="78" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="19" letterSpacing="3" fill="#E9BE6A">
        {name.toUpperCase()}
      </text>
      <text x="120" y="182" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="104" fill="#E9BE6A" stroke="#1A0A04" strokeWidth="2.5" paintOrder="stroke">
        {number}
      </text>
    </svg>
  );
}

/** A madal drum, for heritage content. */
export function Drum({ className = '' }) {
  const { t } = useLang();
  const lace = Array.from({ length: 9 }, (_, i) => {
    const x1 = 46 + i * 17;
    return `M${x1} ${i % 2 ? 70 : 152} L${x1 + 17} ${i % 2 ? 152 : 70}`;
  }).join(' ');
  return (
    <svg className={`drum ${className}`} viewBox="0 0 240 220" role="img" aria-label={t('Madal drum')}>
      <defs>
        <linearGradient id="drumBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B4632A" />
          <stop offset=".5" stopColor="#7A3712" />
          <stop offset="1" stopColor="#3D1A09" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="196" rx="96" ry="10" fill="#1A0A04" opacity=".25" />
      <path d="M38 70 C 90 44, 150 44, 204 62 L204 160 C150 178, 90 178, 38 152 Z" fill="url(#drumBody)" />
      <path d={lace} stroke="#E9D7B4" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
      <path d="M38 70 C 90 44, 150 44, 204 62" fill="none" stroke="#E9BE6A" strokeWidth="3" />
      <path d="M38 152 C 90 178, 150 178, 204 160" fill="none" stroke="#E9BE6A" strokeWidth="3" />
      <ellipse cx="38" cy="111" rx="14" ry="41" fill="#E6D2AE" stroke="#3D1A09" strokeWidth="3" />
      <ellipse cx="38" cy="111" rx="6" ry="16" fill="#2A1208" opacity=".85" />
      <ellipse cx="204" cy="111" rx="18" ry="49" fill="#EADBC0" stroke="#3D1A09" strokeWidth="3" />
      <ellipse cx="204" cy="111" rx="7" ry="18" fill="#2A1208" opacity=".85" />
      <path d="M60 64 C 80 20, 160 20, 184 58" fill="none" stroke="#9A4A1C" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Wax seal with the club monogram. */
export function WaxSeal({ size = 88, className = '', label = 'ATC' }) {
  const { t } = useLang();
  const d = useMemo(() => {
    let s = 9;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const pts = [];
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rad = 44 + r() * 5 - (i % 3 === 0 ? 3 : 0);
      pts.push(`${(50 + Math.cos(a) * rad).toFixed(1)},${(50 + Math.sin(a) * rad).toFixed(1)}`);
    }
    return `M${pts.join(' L')} Z`;
  }, []);
  return (
    <svg className={`wax-seal ${className}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={t('Wax seal')}>
      <defs>
        <radialGradient id="wax" cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#B23A28" />
          <stop offset=".55" stopColor="#7B1F17" />
          <stop offset="1" stopColor="#4A100B" />
        </radialGradient>
      </defs>
      <path d={d} fill="url(#wax)" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#4A100B" strokeWidth="2.5" opacity=".7" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#C65A44" strokeWidth="1" opacity=".55" />
      <text x="50" y="57" textAnchor="middle" fontFamily="IM Fell English, serif" fontSize="21" fill="#E38B72" opacity=".9" letterSpacing="1">
        {label}
      </text>
      <ellipse cx="38" cy="30" rx="10" ry="5" fill="#fff" opacity=".12" transform="rotate(-30 38 30)" />
    </svg>
  );
}

/** Dried flower sprig, for letters. */
export function Sprig({ className = '' }) {
  return (
    <svg className={`sprig ${className}`} viewBox="0 0 120 160" aria-hidden="true">
      <path d="M60 158 C58 120 62 80 70 30" stroke="#5A3A1C" strokeWidth="2" fill="none" />
      <path d="M62 120 C44 112 34 98 30 84 M64 96 C82 90 92 78 96 64 M66 70 C50 64 44 52 42 40" stroke="#5A3A1C" strokeWidth="1.4" fill="none" />
      {[[30, 82], [96, 62], [42, 38], [70, 28], [52, 104], [80, 84]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="7" fill="#7B1F17" opacity=".85" />
          <circle r="4" cx="-2" cy="-2" fill="#9C3A2A" />
          <circle r="1.6" fill="#E9BE6A" />
        </g>
      ))}
    </svg>
  );
}

export function TrophyIcon({ kind }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg className="trophy-icon" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'cup' && (
        <g {...c}>
          <path d="M20 8h24v14c0 9-5 15-12 15S20 31 20 22Z" />
          <path d="M20 13h-8c0 9 4 13 9 13M44 13h8c0 9-4 13-9 13M32 37v9M24 56h16l-2-10H26Z" />
        </g>
      )}
      {kind === 'shield' && (
        <g {...c}>
          <path d="M32 6 52 12v17c0 13-9 22-20 28C21 51 12 42 12 29V12Z" />
          <path d="m32 20 3.5 7 7.5 1-5.5 5 1.5 7.5L32 37l-7 3.5L26.5 33 21 28l7.5-1Z" />
        </g>
      )}
      {kind === 'laurel' && (
        <g {...c}>
          <path d="M22 54C12 46 9 32 14 18M42 54c10-8 13-22 8-36" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <ellipse cx={14 + i * 1.2} cy={44 - i * 8} rx="5" ry="2.6" transform={`rotate(-35 ${14 + i * 1.2} ${44 - i * 8})`} />
              <ellipse cx={50 - i * 1.2} cy={44 - i * 8} rx="5" ry="2.6" transform={`rotate(35 ${50 - i * 1.2} ${44 - i * 8})`} />
            </g>
          ))}
          <circle cx="32" cy="30" r="8" />
        </g>
      )}
      {kind === 'ball' && (
        <g {...c}>
          <circle cx="32" cy="32" r="22" />
          <path d="m32 21 10 7-4 12H26l-4-12Z" />
          <path d="M32 10v11M42 28l11-4M38 40l7 10M26 40l-7 10M22 28l-11-4" />
        </g>
      )}
    </svg>
  );
}

/** Ragged, singed paper edge placed at the top or bottom of a section. */
export function TornEdge({ position = 'top', seed = 7, className = '' }) {
  const d = useMemo(() => tornStripPath(seed), [seed]);
  return (
    <svg className={`torn-edge torn-edge--${position} ${className}`} viewBox="0 0 1440 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} className="torn-edge__burn" />
      <path d={d} className="torn-edge__paper" transform="translate(0 3.5)" />
    </svg>
  );
}

export function Photo({ src, alt = '', className = '', eager = false, position }) {
  return (
    <span className={`photo ${className}`}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" style={position ? { objectPosition: position } : undefined} />
    </span>
  );
}
