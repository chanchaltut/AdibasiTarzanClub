import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { fmtBytes, fmtDate } from '../format';
import { mediaUrl } from '../images';
import { Button, Empty, Icon, Loading, Modal, Notice } from '../ui';
import { useUploader } from './Uploader';

/** Choose a photo from the library, or upload a new one. */
export default function MediaPicker({ onClose, onPick }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const input = useRef(null);
  const { upload, progress, busy } = useUploader();

  const load = useCallback(async (p, query, append) => {
    setLoading(true);
    setError(null);
    try {
      const r = await api(`/admin/media?page=${p}&limit=48&usage=0&q=${encodeURIComponent(query)}`);
      setItems((prev) => (append ? [...prev, ...r.items] : r.items));
      setPage(r.page);
      setPages(r.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(1, q, false), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, load]);

  const onFiles = async (files) => {
    const res = await upload(files);
    if (res.items.length === 1) onPick(res.items[0]);
    else if (res.items.length) setItems((prev) => [...res.items, ...prev]);
  };

  return (
    <Modal title="Choose a photo" size="xl" onClose={onClose}>
      <div className="a-picker__bar">
        <div className="a-search">
          <Icon name="search" size={18} />
          <input className="a-input" placeholder="Search by file name or description" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button variant="primary" icon="upload" onClick={() => input.current?.click()} busy={busy}>Upload new photos</Button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {busy && <div className="a-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /><p>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Making the photos web-ready…'}</p></div>}
      {error && <Notice kind="error">{error}</Notice>}
      {!loading && !items.length && !error && (
        <Empty icon="images" title={q ? 'No photos match your search' : 'The photo library is empty'}>
          {q ? 'Try another word.' : 'Upload your first photos with the button above.'}
        </Empty>
      )}
      <ul className="a-mediagrid">
        {items.map((m) => (
          <li key={m.id}>
            <button type="button" className="a-mediatile" onClick={() => onPick(m)} title={m.originalName}>
              <span className="a-mediatile__img" style={{ backgroundColor: m.color }}>
                <img src={mediaUrl(m, { width: 320 })} alt={m.alt || ''} loading="lazy" />
              </span>
              <span className="a-mediatile__name">{m.originalName || 'Photo'}</span>
              <span className="a-mediatile__meta">{m.width}×{m.height} · {fmtBytes(m.bytes)} · {fmtDate(m.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
      {loading && <Loading />}
      {!loading && page < pages && <div className="a-center-row"><Button onClick={() => load(page + 1, q, true)}>Show more photos</Button></div>}
    </Modal>
  );
}
