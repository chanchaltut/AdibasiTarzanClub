import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { fmtBytes, fmtDate } from '../format';
import { mediaUrl } from '../images';
import { useUploader } from '../fields/Uploader';
import { Badge, Button, Empty, Icon, Loading, Modal, Notice, useFeedback } from '../ui';

const LINK_FOR = (u) => (u.kind === 'single' ? `/s/${u.area}` : `/c/${u.area}/${u.id}`);

function Details({ item, onClose, onChanged, onDeleted }) {
  const [alt, setAlt] = useState(item.alt || '');
  const [usage, setUsage] = useState(null);
  const [busy, setBusy] = useState(false);
  const { toast, confirm } = useFeedback();

  useEffect(() => { api(`/admin/media/${item.id}/usage`).then((r) => setUsage(r.usedIn)).catch(() => setUsage([])); }, [item.id]);

  const saveAlt = async () => {
    setBusy(true);
    try {
      const r = await api(`/admin/media/${item.id}`, { method: 'PATCH', body: { alt } });
      onChanged(r.item);
      toast('Description saved');
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  const remove = async () => {
    const ok = await confirm({ title: 'Delete this photo for good?', message: 'It will be removed from the library and from Cloudinary. This can’t be undone.', ok: 'Delete photo', danger: true });
    if (!ok) return;
    try {
      await api(`/admin/media/${item.id}`, { method: 'DELETE' });
      toast('Photo deleted');
      onDeleted(item.id);
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <Modal title={item.originalName || 'Photo'} size="lg" onClose={onClose}>
      <div className="a-mediadetail">
        <div className="a-mediadetail__img" style={{ backgroundColor: item.color }}>
          <img src={mediaUrl(item, { width: 1200 })} alt={item.alt || ''} />
        </div>
        <div className="a-mediadetail__info">
          <dl className="a-dl">
            <dt>Size</dt><dd>{item.width} × {item.height} pixels</dd>
            <dt>File</dt><dd>{fmtBytes(item.bytes)} WebP{item.originalBytes > item.bytes && <span className="a-muted"> (uploaded {fmtBytes(item.originalBytes)}, {Math.round((1 - item.bytes / item.originalBytes) * 100)}% smaller)</span>}</dd>
            <dt>Added</dt><dd>{fmtDate(item.createdAt)}</dd>
          </dl>
          <label className="a-field">
            <span className="a-field__label">Description <span className="a-muted">(for blind visitors and Google)</span></span>
            <textarea className="a-input a-textarea" rows={2} maxLength={200} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. The first team lifting the 2025 District League trophy" />
          </label>
          <Button size="sm" icon="check" busy={busy} disabled={alt === (item.alt || '')} onClick={saveAlt}>Save description</Button>

          <h3 className="a-subhead">Used on the website</h3>
          {usage === null ? <Loading label="Checking…" /> : usage.length ? (
            <ul className="a-plainlist">{usage.map((u, i) => <li key={i}><Link to={LINK_FOR(u)} onClick={onClose}>{u.label}: {u.title}</Link></li>)}</ul>
          ) : <p className="a-muted">Not used anywhere at the moment.</p>}

          <div className="a-row a-row--end">
            <Button variant="danger" icon="trash" onClick={remove} disabled={!usage || usage.length > 0}>Delete photo</Button>
          </div>
          {usage?.length > 0 && <p className="a-muted a-small">A photo that is in use can’t be deleted. Replace it in the places above first.</p>}
        </div>
      </div>
    </Modal>
  );
}

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [unused, setUnused] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const { upload, progress, busy } = useUploader();
  const { toast } = useFeedback();

  const load = useCallback(async (p = 1, append = false) => {
    setError(null);
    try {
      const r = await api(`/admin/media?page=${p}&limit=60&q=${encodeURIComponent(q)}${unused ? '&unused=1' : ''}`);
      setItems((prev) => (append && prev ? [...prev, ...r.items] : r.items));
      setPage(r.page); setPages(r.pages);
    } catch (err) { setError(err.message); }
  }, [q, unused]);

  const loadStats = () => api('/admin/media/stats').then(setStats).catch(() => {});
  useEffect(() => { const t = setTimeout(() => load(1), q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { loadStats(); }, []);

  const onFiles = async (files) => {
    const res = await upload(files);
    if (res.items.length) {
      toast(`${res.items.length} photo${res.items.length === 1 ? '' : 's'} uploaded`);
      setItems((prev) => [...res.items, ...(prev || [])]);
      loadStats();
    }
  };

  return (
    <div
      className={`a-page ${drag ? 'is-dragging' : ''}`}
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDrag(true); } }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
    >
      <header className="a-page__head">
        <div>
          <h1><Icon name="images" size={26} /> Photo library</h1>
          <p className="a-page__desc">Every photo uploaded to the website. Photos are turned into small WebP files automatically, with hidden location data removed.</p>
          {stats && stats.count > 0 && (
            <p className="a-muted a-small">{stats.count} photos · {fmtBytes(stats.bytes)} on the website{stats.originalBytes > stats.bytes ? ` (uploaded ${fmtBytes(stats.originalBytes)})` : ''}</p>
          )}
        </div>
        <div className="a-page__actions">
          <Button variant="primary" icon="upload" busy={busy} onClick={() => input.current?.click()}>Upload photos</Button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
        </div>
      </header>

      {busy && <div className="a-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /><p>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Making the photos web-ready…'}</p></div>}

      <div className="a-toolbar">
        <div className="a-search">
          <Icon name="search" size={18} />
          <input className="a-input" placeholder="Search by file name or description" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="a-check"><input type="checkbox" checked={unused} onChange={(e) => setUnused(e.target.checked)} /> Only photos not used anywhere</label>
      </div>

      {error && <Notice kind="error" action={<Button size="sm" onClick={() => load(1)}>Try again</Button>}>{error}</Notice>}
      {!items && !error && <Loading />}
      {items && !items.length && (
        <Empty icon="images" title={q || unused ? 'No photos found' : 'No photos yet'}>
          {q || unused ? 'Try a different search.' : 'Drag photos onto this page, or use the Upload button. You can also add photos directly while editing any page.'}
        </Empty>
      )}
      {items?.length > 0 && (
        <ul className="a-mediagrid a-mediagrid--lg">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" className="a-mediatile" onClick={() => setOpen(m)}>
                <span className="a-mediatile__img" style={{ backgroundColor: m.color }}>
                  <img src={mediaUrl(m, { width: 320 })} alt={m.alt || ''} loading="lazy" />
                  {m.usedIn === 0 && <span className="a-mediatile__flag"><Badge kind="muted">Not used</Badge></span>}
                </span>
                <span className="a-mediatile__name">{m.originalName || 'Photo'}</span>
                <span className="a-mediatile__meta">{fmtBytes(m.bytes)} · {fmtDate(m.createdAt)}{m.usedIn > 0 && ` · used ${m.usedIn}×`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {items && page < pages && <div className="a-center-row"><Button onClick={() => load(page + 1, true)}>Show more photos</Button></div>}
      {drag && <div className="a-dropcover"><Icon name="upload" size={40} /><p>Drop the photos to upload them</p></div>}

      {open && (
        <Details
          item={open}
          onClose={() => setOpen(null)}
          onChanged={(m) => { setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x))); setOpen((o) => ({ ...o, ...m })); }}
          onDeleted={(mid) => { setItems((prev) => prev.filter((x) => x.id !== mid)); setOpen(null); loadStats(); }}
        />
      )}
    </div>
  );
}
