import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import builtInHi from '../../i18n/hi';
import builtInBn from '../../i18n/bn';
import { Badge, Button, Empty, Icon, Loading, Notice, useFeedback } from '../ui';

const LANGS = [['hi', 'हिन्दी Hindi', builtInHi], ['bn', 'বাংলা Bengali', builtInBn]];

function Row({ row, onSaved }) {
  const [v, setV] = useState({ hi: row.hi, bn: row.bn });
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();
  const dirty = v.hi !== row.hi || v.bn !== row.bn;

  const save = async () => {
    setBusy(true);
    try {
      await api('/admin/translations', { method: 'PUT', body: { en: row.en, ...v } });
      onSaved({ ...row, ...v });
      toast('Translation saved');
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <li className="a-tr">
      <div className="a-tr__en">
        <p>{row.en}</p>
        <p className="a-muted a-small">{row.where.join(' · ')}</p>
      </div>
      {LANGS.map(([code, label, dict]) => (
        <label key={code} className="a-tr__lang">
          <span className="a-small">{label} {!v[code] && dict[row.en] && <Badge kind="ok">Built-in translation used</Badge>}</span>
          <textarea
            className="a-input a-textarea"
            rows={row.en.length > 120 ? 4 : 2}
            lang={code}
            value={v[code]}
            placeholder={dict[row.en] || 'Not translated — English is shown'}
            onChange={(e) => setV({ ...v, [code]: e.target.value })}
          />
        </label>
      ))}
      <div className="a-tr__save">
        <Button size="sm" variant={dirty ? 'primary' : 'default'} disabled={!dirty} busy={busy} onClick={save} icon="check">Save</Button>
      </div>
    </li>
  );
}

export default function Translations() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('missing');
  const [q, setQ] = useState('');

  useEffect(() => { api('/admin/translations').then((r) => setRows(r.items)).catch((e) => setError(e.message)); }, []);

  const isMissing = (r) => LANGS.some(([code, , dict]) => !r[code] && !dict[r.en]);
  const shown = useMemo(() => (rows || [])
    .filter((r) => (filter === 'missing' ? isMissing(r) : true))
    .filter((r) => !q || r.en.toLowerCase().includes(q.toLowerCase()) || r.hi.includes(q) || r.bn.includes(q))
    .slice(0, 200), [rows, filter, q]);
  const missingCount = rows ? rows.filter(isMissing).length : 0;

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name="translate" size={26} /> Translations</h1>
          <p className="a-page__desc">The website is in English, Hindi and Bengali. Anything you write in the admin panel appears here so it can be translated. Until it is, the English is shown.</p>
        </div>
      </header>
      {error && <Notice kind="error">{error}</Notice>}
      {!rows && !error && <Loading />}
      {rows && (
        <>
          <div className="a-toolbar">
            <div className="a-segment" role="tablist">
              <button type="button" role="tab" aria-selected={filter === 'missing'} className={filter === 'missing' ? 'is-active' : ''} onClick={() => setFilter('missing')}>Needs translating ({missingCount})</button>
              <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Everything ({rows.length})</button>
            </div>
            <div className="a-search">
              <Icon name="search" size={18} />
              <input className="a-input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          {!shown.length ? (
            <Empty icon="check" title={filter === 'missing' ? 'Everything is translated' : 'Nothing found'}>
              {filter === 'missing' && 'Every sentence on the website has a Hindi and Bengali version. 🎉'}
            </Empty>
          ) : (
            <ul className="a-trlist">
              {shown.map((r) => <Row key={r.en} row={r} onSaved={(n) => setRows((prev) => prev.map((x) => (x.en === n.en ? n : x)))} />)}
            </ul>
          )}
          <p className="a-muted a-small"><Icon name="info" size={14} /> Tip: names of people and places can stay as they are, or be written in the other script (e.g. “Suraj Soren” → “सूरज सोरेन”).</p>
        </>
      )}
    </div>
  );
}
