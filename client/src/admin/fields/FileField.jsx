import { useEffect, useRef, useState } from 'react';
import { api, uploadPdf } from '../api';
import { fmtBytes, fmtDate } from '../format';
import { Button, Icon, useFeedback } from '../ui';

const MAX_MB = 10;

/**
 * A PDF slot in a form (Notice Board letters, invitations, calendars).
 * Value: { file } — the id of an uploaded PDF.
 */
export default function FileField({ f, value, onChange, error, half }) {
  const [info, setInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const { toast } = useFeedback();
  const id = value?.file;

  useEffect(() => {
    if (!id || info?.id === id) return undefined;
    let live = true;
    api(`/admin/files/${id}`).then((r) => live && setInfo(r.item)).catch(() => live && setInfo({ id, missing: true }));
    return () => { live = false; };
  }, [id, info?.id]);

  const send = async (files) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      toast(`“${file.name}” is not a PDF. For a photo of the letter, choose “A photo or scan” above.`, 'error');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`“${file.name}” is larger than ${MAX_MB} MB. Please save a smaller copy.`, 'error');
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const r = await uploadPdf(file, { onProgress: setProgress });
      setInfo(r.item);
      onChange({ file: r.item.id });
      toast('PDF uploaded');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`a-field ${half ? 'a-field--half' : ''} ${error ? 'has-error' : ''}`}>
      <div className="a-field__top">
        <span className="a-field__label">{f.label}{f.required && <span className="a-req"> *</span>}</span>
      </div>

      {id && !busy ? (
        <div className="a-filefield">
          <span className="a-filefield__icon"><Icon name="file" size={28} /></span>
          <div className="a-filefield__info">
            {info?.missing ? <p className="a-field__error">This file is missing — please upload it again.</p> : (
              <>
                <strong>{info?.originalName || 'PDF file'}</strong>
                {info && (
                  <span className="a-muted a-small">
                    {info.pages ? `${info.pages} page${info.pages === 1 ? '' : 's'} · ` : ''}{fmtBytes(info.bytes)}{info.createdAt ? ` · added ${fmtDate(info.createdAt)}` : ''}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="a-imgfield__actions">
            {info?.url && <a className="a-btn a-btn--sm" href={info.url} target="_blank" rel="noopener noreferrer"><Icon name="external" size={16} /> Open</a>}
            <Button size="sm" icon="upload" onClick={() => input.current?.click()}>Replace</Button>
            {!f.required && <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(null)}>Remove</Button>}
          </div>
        </div>
      ) : (
        <div
          className={`a-dropzone ${drag ? 'is-drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files); }}
        >
          {busy ? (
            <div className="a-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /><p>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Saving…'}</p></div>
          ) : (
            <>
              <Icon name="file" size={30} />
              <p>Drag a PDF here, or</p>
              <Button variant="primary" size="sm" icon="upload" onClick={() => input.current?.click()}>Choose a PDF from this device</Button>
            </>
          )}
        </div>
      )}

      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { send(e.target.files); e.target.value = ''; }} />
      {error ? <p className="a-field__error"><Icon name="alert" size={14} />{error}</p> : f.help && <p className="a-field__help">{f.help}</p>}
    </div>
  );
}
