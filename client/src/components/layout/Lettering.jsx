// The decorative fonts chosen in the admin panel (Settings → Fonts & lettering).
// Rendered into every page, so the prerendered HTML already has the right
// fonts and nothing flickers. The fonts themselves live in styles/lettering.css.
import { useContent } from '../../content/store';

// Only plain font names reach the stylesheet.
const family = (f) => (/^[A-Za-z0-9 ]{1,60}$/.test(f?.family || '') ? `'${f.family}'` : null);
const weight = (n) => (n === 700 ? 700 : 400);

function vars(name, f) {
  const fam = family(f);
  if (!fam) return '';
  const boldWeight = weight(f.boldWeight);
  const boldStroke = boldWeight === 700 ? '0px' : '.035em';
  return `--f-${name}-face: ${fam}; --${name}-bold-weight: ${boldWeight}; --${name}-bold-stroke: ${boldStroke};`
    + (f.bold ? ` --${name}-weight: ${boldWeight}; --${name}-stroke: ${boldStroke};` : '');
}

export default function Lettering() {
  const { LETTERING } = useContent();
  if (!LETTERING) return null;
  const css = `${vars('script', LETTERING.script)} ${vars('hand', LETTERING.hand)}`.trim();
  if (!css) return null;
  return <style data-lettering="">{`html:root { ${css} }`}</style>;
}
