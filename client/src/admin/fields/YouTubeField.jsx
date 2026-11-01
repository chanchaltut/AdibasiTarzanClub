import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { Icon, Spinner } from '../ui';

const ID = /(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live|v)\/)([A-Za-z0-9_-]{11})|^([A-Za-z0-9_-]{11})$/;
export const youTubeId = (s) => {
  const m = ID.exec(String(s || '').trim());
  return m ? m[1] || m[2] : null;
};

/** Paste a YouTube link → see the video's picture and title straight away. */
export default function YouTubeField({ id, value, onChange, onInfo }) {
  const [state, setState] = useState({ loading: false, error: null, info: null });
  const last = useRef(null);
  const vid = youTubeId(value);

  useEffect(() => {
    if (!vid || vid === last.current) return undefined;
    last.current = vid;
    let live = true;
    setState({ loading: true, error: null, info: null });
    const t = setTimeout(() => {
      api(`/admin/youtube?url=${encodeURIComponent(value)}`)
        .then((info) => { if (!live) return; setState({ loading: false, error: null, info }); onInfo?.(info); })
        .catch((err) => live && setState({ loading: false, error: err.message, info: null }));
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [vid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="a-yt">
      <input id={id} className="a-input" inputMode="url" placeholder="https://youtu.be/…" value={value || ''} onChange={(e) => onChange(e.target.value.trim())} />
      {value && !vid && <p className="a-field__error"><Icon name="alert" size={14} />This doesn’t look like a YouTube link yet.</p>}
      {vid && (
        <div className="a-yt__preview">
          <img src={`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`} alt="" />
          <div>
            {state.loading && <p className="a-muted"><Spinner size={14} /> Checking the video…</p>}
            {state.info?.title && <p className="a-yt__title">{state.info.title}</p>}
            {state.info?.channel && <p className="a-muted">{state.info.channel}</p>}
            {state.error && <p className="a-field__error"><Icon name="alert" size={14} />{state.error}</p>}
            <a className="a-link" href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noopener noreferrer">Open on YouTube <Icon name="external" size={13} /></a>
          </div>
        </div>
      )}
    </div>
  );
}
