import { useEffect, useState } from 'react';
import { useContent } from '../content/store';
import { imgUrl, srcSet, toImg } from '../content/image';
import PageHero from '../components/page/PageHero';
import { Photo } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { useLang } from '../i18n';

/**
 * A YouTube video that costs nothing until it's played: only the thumbnail loads,
 * and the real player (from youtube-nocookie.com, no tracking cookies) replaces it on click.
 */
function VideoCard({ v }) {
  const [playing, setPlaying] = useState(false);
  const { t, shortDate } = useLang();
  return (
    <li className="video-card">
      <div className="video-card__frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={t(v.title)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button type="button" className="video-card__poster" onClick={() => setPlaying(true)} aria-label={t('Play video: {title}', { title: t(v.title) })}>
            <img src={v.thumb} alt="" loading="lazy" decoding="async" />
            <span className="play-badge play-badge--lg"><Icon name="play" size={26} /></span>
          </button>
        )}
      </div>
      <p className="video-card__title">{t(v.title)}</p>
      {(v.desc || v.date) && <p className="video-card__meta">{v.date && shortDate(v.date)}{v.date && v.desc ? ' · ' : ''}{v.desc && t(v.desc)}</p>}
    </li>
  );
}

export default function Gallery() {
  const [open, setOpen] = useState(null);
  const [album, setAlbum] = useState('All');
  const { t, ta } = useLang();
  const { CLUB, GALLERY, VIDEOS, PAGES } = useContent();
  const albums = ['All', ...new Set(GALLERY.map((s) => s.album).filter(Boolean))];
  const SHOTS = album === 'All' ? GALLERY : GALLERY.filter((s) => s.album === album);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % SHOTS.length);
      if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + SHOTS.length) % SHOTS.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, SHOTS.length]);

  const current = open !== null ? SHOTS[open] : null;
  const big = current && toImg(current.photo);

  return (
    <>
      <PageHero
        title="Gallery"
        script={PAGES.gallery?.script}
        intro={PAGES.gallery?.intro}
        photo={PAGES.gallery?.photo}
        crumbs={[{ label: 'Gallery' }]}
      />
      <section className="section bg-kraft">
        <div className="wrapper">
          {albums.length > 2 && (
            <div className="chips chips--ink" role="tablist" aria-label={t('Albums')}>
              {albums.map((a) => (
                <button key={a} role="tab" aria-selected={album === a} className={`chip ${album === a ? 'is-active' : ''}`} onClick={() => { setAlbum(a); setOpen(null); }}>
                  {t(a)}
                </button>
              ))}
            </div>
          )}
          <ul className="scrapbook">
            {SHOTS.map((s, i) => (
              <li key={s.id || s.cap} className="scrap" style={{ '--tilt': `${((i * 37) % 7) - 3}deg` }}>
                <button className="scrap__btn" onClick={() => setOpen(i)} aria-label={t('Open photo: {cap}', { cap: t(s.cap) })}>
                  <span className="tape" style={{ top: -10, left: '34%', transform: `rotate(${i % 2 ? 4 : -4}deg)` }} />
                  <Photo src={s.photo} alt={`${t(s.cap)} — ${t(CLUB.name)}`} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  <span className="scrap__cap hand">{t(s.cap)}</span>
                </button>
              </li>
            ))}
          </ul>
          {!SHOTS.length && <p className="empty">{t('Photos will be added soon.')}</p>}
        </div>
      </section>

      <section className="section bg-bark" id="videos">
        <div className="wrapper">
          <div className="videos-cta">
            <div>
              <p className="kicker">{t('ATC Play')}</p>
              <h2 className="h2 display">{ta('Watch the club *on YouTube*')}</h2>
              <p>{t("Highlights, Heritage Night performances and behind-the-scenes from the club's channel.")}</p>
            </div>
            {CLUB.socials.youtube && (
              <a className="btn btn--lg" href={CLUB.socials.youtube} target="_blank" rel="noopener noreferrer"><Icon name="youtube" size={20} /> {t('Open channel')}</a>
            )}
          </div>
          {VIDEOS.length > 0 && (
            <ul className="video-grid">
              {VIDEOS.map((v) => <VideoCard key={v.id} v={v} />)}
            </ul>
          )}
        </div>
      </section>

      {current && (
        <div className="lightbox" role="dialog" aria-label={t(current.cap)}>
          <button className="lightbox__scrim" onClick={() => setOpen(null)} aria-label={t('Close')} tabIndex={-1} />
          <figure className="lightbox__figure">
            <img src={imgUrl(big, 1600)} srcSet={srcSet(big)} sizes="88vw" alt={t(current.cap)} />
            <figcaption className="hand">{t(current.cap)}</figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--prev slider-btn" onClick={() => setOpen((open - 1 + SHOTS.length) % SHOTS.length)} aria-label={t('Previous photo')}><Icon name="chevron-left" /></button>
          <button className="lightbox__nav lightbox__nav--next slider-btn" onClick={() => setOpen((open + 1) % SHOTS.length)} aria-label={t('Next photo')}><Icon name="chevron-right" /></button>
          <button className="lightbox__close" onClick={() => setOpen(null)} aria-label={t('Close')}><Icon name="close" size={26} /></button>
        </div>
      )}
    </>
  );
}
