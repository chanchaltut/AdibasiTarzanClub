// Draws one form field from its description in the server's schemas.js.

import { useEffect, useId, useState } from 'react';
import { api } from '../api';
import { useSchema } from '../schema';
import { fromLocalInput, toLocalInput } from '../format';
import { FieldFrame, Icon, IconButton, Toggle } from '../ui';
import FileField from './FileField';
import ImageField from './ImageField';
import YouTubeField from './YouTubeField';

export const optionList = (f) => (f.options || []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/** Is this field hidden by a "only show when…" rule? */
export const isHidden = (f, data) => Boolean(f.when) && data?.[f.when.field] !== f.when.is;

function Counter({ value, max }) {
  if (!max) return null;
  const n = String(value || '').length;
  if (n < max * 0.7) return null;
  return <span className={`a-counter ${n > max ? 'is-over' : ''}`}>{n} / {max}</span>;
}

function TextInput({ f, id, value, onChange }) {
  const list = f.type === 'combo' || f.type === 'link' ? `${id}-list` : undefined;
  const { siteLinks } = useSchema();
  const opts = f.type === 'link' ? siteLinks : optionList(f);
  return (
    <>
      <input
        id={id}
        className="a-input"
        type={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'}
        inputMode={f.type === 'url' || f.type === 'link' ? 'url' : undefined}
        value={value ?? ''}
        placeholder={f.placeholder || (f.type === 'url' ? 'https://' : f.type === 'link' ? 'Pick a page or paste a web address' : '')}
        onChange={(e) => onChange(e.target.value)}
        list={list}
        autoComplete="off"
        spellCheck={f.type === 'text' || f.type === 'combo'}
      />
      {list && (
        <datalist id={list}>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label !== o.value ? o.label : undefined}</option>)}
        </datalist>
      )}
    </>
  );
}

function SlugInput({ id, value, onChange, data, f }) {
  const [editing, setEditing] = useState(false);
  const auto = (data?.[f.from] || '').toString().normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  if (!editing) {
    return (
      <div className="a-slug">
        <code>/news/{value || auto || '…'}</code>
        <button type="button" className="a-link" onClick={() => setEditing(true)}>Change</button>
      </div>
    );
  }
  return (
    <div className="a-slug a-slug--edit">
      <span>/news/</span>
      <input id={id} className="a-input" value={value || ''} placeholder={auto} onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
    </div>
  );
}

function RefSelect({ f, id, value, onChange }) {
  const [options, setOptions] = useState(null);
  useEffect(() => {
    let live = true;
    api(`/admin/c/${f.to}/options`).then((r) => live && setOptions(r.options)).catch(() => live && setOptions([]));
    return () => { live = false; };
  }, [f.to]);
  return (
    <select id={id} className="a-input" value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={!options}>
      <option value="">{options ? 'Choose…' : 'Loading…'}</option>
      {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TextList({ f, value, onChange, errorFor }) {
  const items = Array.isArray(value) && value.length ? value : [''];
  const set = (i, v) => onChange(items.map((x, k) => (k === i ? v : x)));
  const move = (i, d) => { const a = [...items]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <div className="a-textlist">
      {items.map((v, i) => (
        <div className={`a-textlist__row ${errorFor(i) ? 'has-error' : ''}`} key={i}>
          <span className="a-textlist__n">{i + 1}</span>
          <input className="a-input" value={v} onChange={(e) => set(i, e.target.value)} aria-label={`${f.itemLabel || 'Item'} ${i + 1}`} />
          <IconButton icon="up" label="Move up" onClick={() => move(i, -1)} disabled={i === 0} />
          <IconButton icon="down" label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
          <IconButton icon="trash" label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} disabled={items.length === 1 && !v} />
        </div>
      ))}
      {(!f.max || items.length < f.max) && (
        <button type="button" className="a-addrow" onClick={() => onChange([...items, ''])}><Icon name="plus" size={16} /> Add {(f.itemLabel || 'item').toLowerCase()}</button>
      )}
    </div>
  );
}

function ObjectList({ f, value, onChange, errors, prefix, media, onMedia }) {
  const items = Array.isArray(value) ? value : [];
  const blank = () => Object.fromEntries(f.fields.filter((x) => x.default !== undefined).map((x) => [x.name, x.default]));
  const set = (i, v) => onChange(items.map((x, k) => (k === i ? v : x)));
  const move = (i, d) => { const a = [...items]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <div className="a-objlist">
      {items.map((item, i) => (
        <div className="a-objlist__item" key={i}>
          <div className="a-objlist__head">
            <strong>{f.itemLabel || 'Item'} {i + 1}</strong>
            <span className="a-objlist__tools">
              <IconButton icon="up" label="Move up" onClick={() => move(i, -1)} disabled={i === 0} />
              <IconButton icon="down" label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
              <IconButton icon="trash" label={`Remove ${(f.itemLabel || 'item').toLowerCase()}`} onClick={() => onChange(items.filter((_, k) => k !== i))} />
            </span>
          </div>
          <div className="a-grid">
            {f.fields.map((sub) => !isHidden(sub, item) && (
              <Field
                key={sub.name}
                f={sub}
                value={item?.[sub.name]}
                data={item}
                onChange={(v) => set(i, { ...item, [sub.name]: v })}
                errors={errors}
                path={`${prefix}${i}.${sub.name}`}
                media={media}
                onMedia={onMedia}
              />
            ))}
          </div>
        </div>
      ))}
      {(!f.max || items.length < f.max) && (
        <button type="button" className="a-addrow" onClick={() => onChange([...items, blank()])}><Icon name="plus" size={16} /> Add {(f.itemLabel || 'item').toLowerCase()}</button>
      )}
    </div>
  );
}

/**
 * One field. `path` is its key in server error messages (e.g. "slides.2.text").
 * `media` holds details of photos used on the page; `onMedia` adds to it.
 */
export function Field({ f, value, onChange, data, errors = {}, path = f.name, media, onMedia, onAlso }) {
  const id = useId();
  const error = errors[path];
  const common = { label: f.label, help: f.help, error, required: f.required, htmlFor: id, half: f.half };

  if (f.type === 'heading') {
    return (
      <div className="a-section-head">
        <h3>{f.label}</h3>
        {f.help && <p>{f.help}</p>}
      </div>
    );
  }

  switch (f.type) {
    case 'text': case 'combo': case 'link': case 'url': case 'email':
      return <FieldFrame {...common} counter={<Counter value={value} max={f.max} />}><TextInput f={f} id={id} value={value} onChange={onChange} /></FieldFrame>;
    case 'slug':
      return <FieldFrame {...common}><SlugInput f={f} id={id} value={value} onChange={onChange} data={data} /></FieldFrame>;
    case 'textarea': case 'longtext':
      return (
        <FieldFrame {...common} counter={<Counter value={value} max={f.max} />}>
          <textarea id={id} className={`a-input a-textarea ${f.type === 'longtext' ? 'a-textarea--long' : ''}`} rows={f.type === 'longtext' ? 14 : 3} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
        </FieldFrame>
      );
    case 'number':
      return (
        <FieldFrame {...common}>
          <input id={id} className="a-input a-input--num" type="number" inputMode={f.integer ? 'numeric' : 'decimal'} step={f.integer ? 1 : 'any'} min={f.min} max={f.max} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} onWheel={(e) => e.currentTarget.blur()} />
        </FieldFrame>
      );
    case 'boolean':
      return (
        <div className={`a-field a-field--toggle ${f.half ? 'a-field--half' : ''}`}>
          <Toggle id={id} checked={value} onChange={onChange} label={f.label} />
          {f.help && <p className="a-field__help">{f.help}</p>}
        </div>
      );
    case 'datetime':
      return (
        <FieldFrame {...common} help={f.help || 'India time (IST)'}>
          <input id={id} className="a-input" type="datetime-local" value={toLocalInput(value)} onChange={(e) => onChange(fromLocalInput(e.target.value))} />
        </FieldFrame>
      );
    case 'select':
      return (
        <FieldFrame {...common}>
          <select id={id} className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {!f.required && !optionList(f).some((o) => o.value === '') && <option value="">—</option>}
            {f.required && (value === undefined || value === '') && <option value="">Choose…</option>}
            {optionList(f).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </FieldFrame>
      );
    case 'color':
      return (
        <FieldFrame {...common}>
          <div className="a-color">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={f.label} />
            <input id={id} className="a-input" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={7} placeholder="#3A1A0B" />
          </div>
        </FieldFrame>
      );
    case 'ref':
      return <FieldFrame {...common}><RefSelect f={f} id={id} value={value} onChange={onChange} /></FieldFrame>;
    case 'youtube':
      return <FieldFrame {...common}><YouTubeField id={id} value={value} onChange={onChange} onInfo={(info) => onAlso?.(info)} /></FieldFrame>;
    case 'image':
      return <ImageField f={f} value={value} onChange={onChange} error={error} media={media} onMedia={onMedia} half={f.half} />;
    case 'file':
      return <FileField f={f} value={value} onChange={onChange} error={error} half={f.half} />;
    case 'list':
      if (f.of === 'text') {
        return (
          <FieldFrame {...common} htmlFor={undefined}>
            <TextList f={f} value={value} onChange={onChange} errorFor={(i) => errors[`${path}.${i}`]} />
          </FieldFrame>
        );
      }
      return (
        <FieldFrame {...common} htmlFor={undefined}>
          <ObjectList f={f} value={value} onChange={onChange} errors={errors} prefix={`${path}.`} media={media} onMedia={onMedia} />
        </FieldFrame>
      );
    default:
      return null;
  }
}
