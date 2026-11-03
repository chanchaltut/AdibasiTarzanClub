// Pick a font by looking at it: each option is a card with a sample written
// in that font, at the size the website draws it (see styles/lettering.css).

import '../../styles/lettering.css';

const previewStyle = (o, bold) => ({
  fontFamily: `'${o.family}', cursive`,
  fontWeight: bold && o.bold ? o.bold : 400,
  WebkitTextStroke: bold && !o.bold ? '.035em currentColor' : undefined,
});

export default function FontField({ f, id, value, onChange, bold }) {
  return (
    <div className="a-fonts" role="radiogroup" id={id} aria-label={f.label}>
      {f.options.map((o) => (
        <label key={o.value} className={`a-font ${value === o.value ? 'is-on' : ''}`}>
          <input type="radio" name={id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className="a-font__sample" style={previewStyle(o, bold)}>{f.sample || o.family}</span>
          <span className="a-font__name">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
