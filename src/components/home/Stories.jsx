import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { STORIES } from '../../data/club';
import { useScroller } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Crest, Photo, Sprig } from '../ui/Art';
import { SliderControls } from '../ui/Slider';
import { useLang } from '../../i18n';

const SEEN_KEY = 'atc-stories-seen';
const readSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || []; } catch { return []; } };
const writeSeen = (ids) => { try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ } };

const SLIDE_MS = 5200;

function Viewer({ start, onClose, onSeen }) {
  const [si, setSi] = useState(start);
  const [i, setI] = useState(0);
  const { t } = useLang();
  const story = STORIES[si];
  const slide = story.slides[i];

  const next = useCallback(() => {
    if (i < story.slides.length - 1) setI(i + 1);
    else if (si < STORIES.length - 1) { setSi(si + 1); setI(0); }
    else onClose();
  }, [i, si, story, onClose]);

  const prev = () => {
    if (i > 0) setI(i - 1);
    else if (si > 0) { setSi(si - 1); setI(0); }
  };

  useEffect(() => { onSeen(story.id); }, [story.id, onSeen]);
  useEffect(() => {
    const t = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(t);
  }, [next]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  });

  return (
    <div className="story-viewer" role="dialog" aria-label={t('Story: {title}', { title: t(story.title) })}>
      <div className="story-viewer__frame">
        <div className="story-viewer__bars">
          {story.slides.map((_, k) => (
            <span key={k} className="story-viewer__bar">
              <span
                key={`${si}-${i}`}
                className={k < i ? 'is-done' : k === i ? 'is-active' : ''}
                style={{ animationDuration: `${SLIDE_MS}ms` }}
              />
            </span>
          ))}
        </div>
        <div className="story-viewer__head">
          <Crest size={32} alt="" />
          <span>{t(story.title)}</span>
          <button onClick={onClose} aria-label={t('Close story')}><Icon name="close" size={22} /></button>
        </div>

        {slide.photo ? (
          <>
            <Photo src={slide.photo} className="story-viewer__photo" />
            <p className="story-viewer__caption">{t(slide.text)}</p>
          </>
        ) : (
          <div className="story-viewer__letter">
            <div className="paper story-viewer__sheet">
              <p className="hand">{t(slide.letter)}</p>
              <p className="story-viewer__sign script">{t('ATC')}</p>
              <Sprig className="story-viewer__sprig" />
            </div>
          </div>
        )}

        <button className="story-viewer__tap story-viewer__tap--prev" onClick={prev} aria-label={t('Previous')} />
        <button className="story-viewer__tap story-viewer__tap--next" onClick={next} aria-label={t('Next')} />
      </div>
      <button className="story-viewer__scrim" onClick={onClose} aria-label={t('Close')} tabIndex={-1} />
    </div>
  );
}

export default function Stories() {
  const s = useScroller();
  const [open, setOpen] = useState(null);
  const [seen, setSeen] = useState(readSeen);
  const { t, ta } = useLang();

  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      if (prev.includes(id)) return prev;
      const nextSeen = [...prev, id];
      writeSeen(nextSeen);
      return nextSeen;
    });
  }, []);

  return (
    <section className="section stories" aria-labelledby="stories-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="stories-title">{ta('ATC *Stories*')}</h2>
          <SliderControls s={s} label={t('stories')} />
        </div>
        <ul className="h-scroll stories__row" ref={s.ref}>
          {STORIES.map((st, idx) => (
            <li key={st.id}>
              <button className={`story-tile ${seen.includes(st.id) ? 'is-seen' : ''}`} onClick={() => setOpen(idx)}>
                <span className="story-tile__ring">
                  <Photo src={st.cover} />
                </span>
                <span className="story-tile__title">{t(st.title)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Portal out of .parchment-run, whose stacking context would keep the viewer under the sticky header */}
      {open !== null && createPortal(<Viewer start={open} onClose={() => setOpen(null)} onSeen={markSeen} />, document.body)}
    </section>
  );
}
