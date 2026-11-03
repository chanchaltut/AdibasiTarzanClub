// ─────────────────────────────────────────────────────────────
// The fonts the club can choose between for the decorative lettering.
//
// Only hand-picked fonts that suit the paper-and-ink look are offered, so
// any choice still looks right. The alternatives are self-hosted by the
// website (client/src/styles/lettering.css, family "ATC …"), each resized
// to take about the same room on the page as the original.
//   family  the CSS font family
//   bold    the real bold weight, if the font has one; without it, "bold"
//           is drawn with a thin outline instead of the browser's fake bold
// ─────────────────────────────────────────────────────────────

export const SCRIPT_FONTS = [
  { value: 'mrs-saint-delafield', label: 'Mrs Saint Delafield (original)', family: 'Mrs Saint Delafield' },
  { value: 'great-vibes', label: 'Great Vibes — elegant, easier to read', family: 'ATC Great Vibes' },
  { value: 'parisienne', label: 'Parisienne — neat and clear', family: 'ATC Parisienne' },
  { value: 'dancing-script', label: 'Dancing Script — friendly, has a true bold', family: 'ATC Dancing Script', bold: 700 },
  { value: 'alex-brush', label: 'Alex Brush — brush pen', family: 'ATC Alex Brush' },
  { value: 'pinyon-script', label: 'Pinyon Script — formal, like a certificate', family: 'ATC Pinyon Script' },
  { value: 'satisfy', label: 'Satisfy — bold and casual', family: 'ATC Satisfy' },
];

export const HAND_FONTS = [
  { value: 'homemade-apple', label: 'Homemade Apple (original)', family: 'Homemade Apple' },
  { value: 'caveat', label: 'Caveat — clear marker pen, has a true bold', family: 'ATC Caveat', bold: 700 },
  { value: 'kalam', label: 'Kalam — neat handwriting, has a true bold', family: 'ATC Kalam', bold: 700 },
  { value: 'patrick-hand', label: 'Patrick Hand — very easy to read', family: 'ATC Patrick Hand' },
  { value: 'nothing-you-could-do', label: 'Nothing You Could Do — closest to the original', family: 'ATC Nothing You Could Do' },
  { value: 'architects-daughter', label: 'Architects Daughter — tidy print', family: 'ATC Architects Daughter' },
  { value: 'indie-flower', label: 'Indie Flower — round and friendly', family: 'ATC Indie Flower' },
];

export const NAME_STYLES = [
  { value: 'hand', label: 'Handwriting (the font chosen above)' },
  { value: 'script', label: 'Joined-up script (the font chosen above)' },
  { value: 'serif', label: 'Old-style print — easiest to read' },
  { value: 'print', label: 'Clean print — like the rest of the text' },
];

export const NAME_SIZES = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Larger' },
  { value: 'xl', label: 'Largest' },
];

const pick = (list, value) => list.find((f) => f.value === value) || list[0];

/** One font, ready for the website. */
const face = (f, bold) => ({ family: f.family, boldWeight: f.bold || 400, bold: Boolean(bold) });

/** The saved "Fonts & lettering" settings → what the website needs. */
export function buildLettering(l = {}) {
  return {
    script: face(pick(SCRIPT_FONTS, l.scriptFont), l.scriptBold),
    hand: face(pick(HAND_FONTS, l.handFont), l.handBold),
    names: {
      style: pick(NAME_STYLES, l.nameStyle).value,
      size: pick(NAME_SIZES, l.nameSize).value,
      bold: Boolean(l.nameBold),
    },
  };
}
