// The fonts chosen in the admin panel (Settings → Fonts & lettering).
// Rendered into every page, so the prerendered HTML already has the right
// fonts and nothing flickers. The fonts themselves live in styles/lettering.css.
import { useContent } from '../../content/store';

const ROLES = ['display', 'body', 'serif', 'script', 'hand'];
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';

// Only plain font names, file names and numbers reach the stylesheet.
const plainFamily = (f) => (/^[A-Za-z0-9 ]{1,60}$/.test(f?.family || '') ? `'${f.family}'` : null);
const weight = (n) => (n === 700 ? 700 : 400);

/** A font at a size other than "Normal": the same files, redrawn smaller or larger. */
function sizedFaces(role, sized) {
  const adjust = Number(sized?.adjust);
  if (!(adjust >= 50 && adjust <= 220) || !Array.isArray(sized.faces)) return null;
  const family = `ATC ${role[0].toUpperCase()}${role.slice(1)} Sized`;
  const rules = sized.faces
    .filter((x) => Array.isArray(x) && /^[a-z0-9-]{1,80}\.woff2$/.test(x[0]) && /^\d{3}( \d{3,4})?$/.test(x[1]) && /^(normal|italic)$/.test(x[2]))
    .map(([file, w, style, range]) => `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${w}; font-display: swap; size-adjust: ${adjust}%; src: url(/fonts/lettering/${file}) format('woff2'); unicode-range: ${range === 'e' ? LATIN_EXT : LATIN}; }`);
  return rules.length ? { family: `'${family}'`, css: rules.join('\n') } : null;
}

function vars(name, f, fam) {
  let css = `--f-${name}-face: ${fam};`;
  if (f.boldWeight === undefined) return css;
  const boldWeight = weight(f.boldWeight);
  const boldStroke = boldWeight === 700 ? '0px' : '.035em';
  css += ` --${name}-bold-weight: ${boldWeight}; --${name}-bold-stroke: ${boldStroke};`;
  if (f.bold) css += ` --${name}-weight: ${boldWeight}; --${name}-stroke: ${boldStroke};`;
  return css;
}

export default function Lettering() {
  const { LETTERING } = useContent();
  if (!LETTERING) return null;
  const faces = [];
  const root = [];
  ROLES.forEach((role) => {
    const f = LETTERING[role];
    const sized = f?.sized && sizedFaces(role, f.sized);
    const fam = sized ? sized.family : plainFamily(f);
    if (!fam) return;
    if (sized) faces.push(sized.css);
    root.push(vars(role, f, fam));
  });
  if (!root.length) return null;
  return <style data-lettering="">{`${faces.length ? `${faces.join('\n')}\n` : ''}html:root { ${root.join(' ')} }`}</style>;
}

/** Classes for names whose lettering, size and weight are chosen in the admin panel. */
export function nameClasses(cfg, styles, fallback) {
  const c = cfg || {};
  const style = styles.includes(c.style) ? c.style : fallback;
  return [`names--${style}`, c.size === 'large' || c.size === 'xl' ? `names--${c.size}` : '', c.bold ? 'is-bold' : ''].filter(Boolean).join(' ');
}
export const CARD_NAME_STYLES = ['display', 'hand', 'script', 'serif', 'print'];
