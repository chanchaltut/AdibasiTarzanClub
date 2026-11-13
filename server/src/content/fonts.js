// ─────────────────────────────────────────────────────────────
// The fonts the club can choose between, for every kind of lettering on the site.
//
// Only hand-picked fonts that suit the paper-and-ink look are offered, so
// any choice still looks right. Sizes move in small, safe steps for the same reason. The alternatives are self-hosted by the
// website (client/src/styles/lettering.css, family "ATC …"), each resized
// to take about the same room on the page as the original.
//   family  the CSS font family
//   bold    the real bold weight, if the font has one; without it, "bold"
//           is drawn with a thin outline instead of the browser's fake bold
// ─────────────────────────────────────────────────────────────

import { FONT_FILES } from './font-files.js';

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

export const DISPLAY_FONTS = [
  { value: 'barlow-condensed', label: 'Barlow Condensed (original)', family: 'Barlow Condensed' },
  { value: 'oswald', label: 'Oswald — strong newspaper headline', family: 'ATC Oswald' },
  { value: 'antonio', label: 'Antonio — tall and tight', family: 'ATC Antonio' },
  { value: 'teko', label: 'Teko — square, like a scoreboard', family: 'ATC Teko' },
  { value: 'big-shoulders-display', label: 'Big Shoulders — stadium signage', family: 'ATC Big Shoulders Display' },
  { value: 'bebas-neue', label: 'Bebas Neue — classic poster capitals', family: 'ATC Bebas Neue' },
  { value: 'fjalla-one', label: 'Fjalla One — sturdy and easy to read', family: 'ATC Fjalla One' },
];

export const BODY_FONTS = [
  { value: 'barlow', label: 'Barlow (original)', family: 'Barlow' },
  { value: 'source-sans-3', label: 'Source Sans — calm and very clear', family: 'ATC Source Sans 3' },
  { value: 'work-sans', label: 'Work Sans — open and friendly', family: 'ATC Work Sans' },
  { value: 'karla', label: 'Karla — a little quirky', family: 'ATC Karla' },
  { value: 'cabin', label: 'Cabin — warm and rounded', family: 'ATC Cabin' },
  { value: 'mulish', label: 'Mulish — light and modern', family: 'ATC Mulish' },
  { value: 'dm-sans', label: 'DM Sans — neat and geometric', family: 'ATC DM Sans' },
];

export const SERIF_FONTS = [
  { value: 'im-fell-english', label: 'IM Fell English (original)', family: 'IM Fell English' },
  { value: 'eb-garamond', label: 'EB Garamond — classic book print', family: 'ATC EB Garamond' },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond — fine and elegant', family: 'ATC Cormorant Garamond' },
  { value: 'crimson-text', label: 'Crimson Text — easy to read', family: 'ATC Crimson Text' },
  { value: 'libre-caslon-text', label: 'Libre Caslon — old newspaper', family: 'ATC Libre Caslon Text' },
  { value: 'old-standard-tt', label: 'Old Standard — like an old textbook', family: 'ATC Old Standard TT' },
  { value: 'sorts-mill-goudy', label: 'Sorts Mill Goudy — soft and bookish', family: 'ATC Sorts Mill Goudy' },
];

// Sizes move in small steps so headings, cards and letters keep their layout.
// `scale` is how much larger or smaller the lettering is drawn.
const sizes = (small, large, xl) => [
  { value: 'small', label: 'Smaller', scale: small },
  { value: 'normal', label: 'Normal', scale: 1 },
  { value: 'large', label: 'Larger', scale: large },
  { value: 'xl', label: 'Largest', scale: xl },
];
export const DISPLAY_SIZES = sizes(0.94, 1.05, 1.1);
export const TEXT_SIZES = sizes(0.94, 1.06, 1.12);
export const ACCENT_SIZES = sizes(0.9, 1.1, 1.2);
/** { small: 0.94, normal: 1, … } — lets the admin panel draw its samples at the chosen size. */
export const scalesOf = (list) => Object.fromEntries(list.map((x) => [x.value, x.scale]));

export const NAME_STYLES = [
  { value: 'hand', label: 'Handwriting (the font chosen above)' },
  { value: 'script', label: 'Joined-up script (the font chosen above)' },
  { value: 'serif', label: 'Old-style print (the font chosen above)' },
  { value: 'print', label: 'Clean print — like the reading text' },
];

// Names on the player and member cards: bold capitals unless changed.
export const CARD_NAME_STYLES = [
  { value: 'display', label: 'Bold capitals (the headings font) — original' },
  ...NAME_STYLES,
];

export const NAME_SIZES = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Larger' },
  { value: 'xl', label: 'Largest' },
];

const pick = (list, value) => list.find((f) => f.value === value) || list[0];

/**
 * One font, ready for the website. At any size but "Normal" the website also
 * gets the font's files, to redraw it at that size (`sized`).
 */
function face(fonts, value, sizeList, size, bold) {
  const f = pick(fonts, value);
  const out = { family: f.family };
  if (bold !== undefined) Object.assign(out, { boldWeight: f.bold || 400, bold: Boolean(bold) });
  const scale = pick(sizeList, size || 'normal').scale;
  const files = FONT_FILES[f.value];
  if (scale !== 1 && files) out.sized = { adjust: Math.round(files.adjust * scale * 10) / 10, faces: files.faces };
  return out;
}

const names = (styles, style, size, bold) => ({
  style: pick(styles, style).value,
  size: pick(NAME_SIZES, size).value,
  bold: Boolean(bold),
});

/** The saved "Fonts & lettering" settings → what the website needs. */
export function buildLettering(l = {}) {
  return {
    display: face(DISPLAY_FONTS, l.displayFont, DISPLAY_SIZES, l.displaySize),
    body: face(BODY_FONTS, l.bodyFont, TEXT_SIZES, l.bodySize),
    serif: face(SERIF_FONTS, l.serifFont, TEXT_SIZES, l.serifSize),
    script: face(SCRIPT_FONTS, l.scriptFont, ACCENT_SIZES, l.scriptSize, Boolean(l.scriptBold)),
    hand: face(HAND_FONTS, l.handFont, ACCENT_SIZES, l.handSize, Boolean(l.handBold)),
    names: names(NAME_STYLES, l.nameStyle, l.nameSize, l.nameBold),
    playerNames: names(CARD_NAME_STYLES, l.playerNameStyle, l.playerNameSize, l.playerNameBold),
    memberNames: names(CARD_NAME_STYLES, l.memberNameStyle, l.memberNameSize, l.memberNameBold),
  };
}
