// Pick a font by looking at it: each option is a card with a sample written
// in that font, at the size the website draws it (see styles/lettering.css).

import '../../styles/lettering.css';

// How each kind of lettering is shown: headings in bold capitals, reading text small, and so on.
const LOOKS = {
  display: { fallback: "'Arial Narrow', sans-serif", weight: 700, size: 26, style: { textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: 1.15 } },
  body: { fallback: 'system-ui, sans-serif', weight: 400, size: 17 },
  serif: { fallback: 'Georgia, serif', weight: 400, size: 21, style: { fontStyle: 'italic' } },
  accent: { fallback: 'cursive', weight: 400, size: 26 },
};

function previewStyle(f, o, bold, scale) {
  const look = LOOKS[f.look] || LOOKS.accent;
  return {
    fontFamily: `'${o.family}', ${look.fallback}`,
    fontSize: Math.round(look.size * scale * 10) / 10,
    fontWeight: bold && o.bold ? o.bold : look.weight,
    WebkitTextStroke: bold && !o.bold ? '.035em currentColor' : undefined,
    ...look.style,
  };
}

/** `bold` and `size` are the neighbouring "Make it bolder" and "Size" answers, so the samples follow them. */
export default function FontField({ f, id, value, onChange, bold, scale = 1 }) {
  return (
    <div className="a-fonts" role="radiogroup" id={id} aria-label={f.label}>
      {f.options.map((o) => (
        <label key={o.value} className={`a-font ${value === o.value ? 'is-on' : ''}`}>
          <input type="radio" name={id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className="a-font__sample" style={previewStyle(f, o, bold, scale)}>{f.sample || o.family}</span>
          <span className="a-font__name">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
