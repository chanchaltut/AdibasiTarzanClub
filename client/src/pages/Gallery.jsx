import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/store';
import { imgUrl, srcSet, toImg } from '../content/image';
import PageHero from '../components/page/PageHero';
import { Photo } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { Link, useLang } from '../i18n';
import { GALLERY_SECTIONS, SECTION_MAP, albumsWithPhotos, sectionOf } from '../data/gallery';

const PREVIEW = 8;
const galleryHref = (section, album) => `/gallery?section=${section}${album ? `&album=${encodeURIComponent(album)}` : ''}`;

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

/** The pinned-up photos. `onOpen(i)` opens the lightbox on photo i of `shots`. */
function Scrapbook({ shots, onOpen }) {
  const { t } = useLang();
  const { CLUB } = useContent();
  return (
    <ul className="scrapbook">
      {shots.map((s, i) => {
        const where = [t(s.album), t(SECTION_MAP[sectionOf(s)].title)].filter(Boolean).join(', ');
        return (
          <li key={s.id || s.cap} className="scrap" style={{ '--tilt': `${((i * 37) % 7) - 3}deg` }}>
            <button className="scrap__btn" onClick={() => onOpen(i)} aria-label={t('Open photo: {cap}', { cap: t(s.cap) })}>
              <span className="tape" style={{ top: -10, left: '34%', transform: `rotate(${i % 2 ? 4 : -4}deg)` }} />
              <Photo src={s.photo} alt={`${t(s.cap)} — ${where} · ${t(CLUB.name)}, ${t('S. Akhanagar, Kaliyaganj')}`} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
              <span className="scrap__cap hand">{t(s.cap)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Album links of a section with how many photos each holds; albums still empty are listed as coming soon. */
function AlbumList({ section, shots, soonOnly = false }) {
  const { t } = useLang();
  const used = soonOnly ? [] : albumsWithPhotos(section.id, shots);
  const count = (a) => shots.filter((s) => s.album === a).length;
  const others = section.albums.filter((a) => !shots.some((s) => s.album === a));
  if (!used.length && !others.length) return null;
  return (
    <ul className="album-list" aria-label={t('Albums')}>
      {soonOnly && others.length > 0 && <li className="album-list__label">{t('More albums coming soon')}</li>}
      {used.map((a) => (
        <li key={a}><Link to={galleryHref(section.id, a)} className="album-list__link">{t(a)} <span>{count(a)}</span></Link></li>
      ))}
      {others.map((a) => <li key={a} className="album-list__soon">{t(a)}</li>)}
    </ul>
  );
}

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(null); // { list, i }
  const { t, ta } = useLang();
  const { CLUB, GALLERY, VIDEOS, PAGES } = useContent();

  const sectionId = SECTION_MAP[params.get('section')] ? params.get('section') : null;
  const section = sectionId && SECTION_MAP[sectionId];
  const inSection = (id) => GALLERY.filter((s) => sectionOf(s) === id);
  const sectionShots = section ? inSection(section.id) : [];
  const albums = section ? albumsWithPhotos(section.id, sectionShots) : [];
  const album = albums.includes(params.get('album')) ? params.get('album') : null;
  const shown = album ? sectionShots.filter((s) => s.album === album) : sectionShots;

  const pick = (id, a) => {
    setOpen(null);
    setParams(id ? { section: id, ...(a && { album: a }) } : {});
  };

  const list = open?.list || [];
  useEffect(() => {
    if (!open) return undefined;
    const n = open.list.length;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => ({ ...o, i: (o.i + 1) % n }));
      if (e.key === 'ArrowLeft') setOpen((o) => ({ ...o, i: (o.i - 1 + n) % n }));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const current = open ? list[open.i] : null;
  const big = current && toImg(current.photo);
  const step = (d) => setOpen((o) => ({ ...o, i: (o.i + d + o.list.length) % o.list.length }));

  return (
    <>
      <PageHero
        title="Gallery"
        script={PAGES.gallery?.script || 'Moments to Memories'}
        intro={PAGES.gallery?.intro}
        photo={PAGES.gallery?.photo}
        crumbs={section ? [{ label: 'Gallery', href: '/gallery' }, { label: section.title }] : [{ label: 'Gallery' }]}
      />

      <section className="section bg-kraft gallery">
        <div className="wrapper">
          <header className="gallery__intro">
            <p className="kicker kicker--ink">{t('Gallery')}</p>
            <h2 className="h2 display">{ta('Moments *to Memories*')}</h2>
          </header>

          <nav className="gallery-tabs" aria-label={t('Gallery sections')}>
            <button type="button" className={`gallery-tab ${!section ? 'is-active' : ''}`} aria-pressed={!section} onClick={() => pick(null)}>
              <span className="gallery-tab__title display">{t('All moments')}</span>
              <span className="gallery-tab__count">{t(GALLERY.length === 1 ? '{n} photo' : '{n} photos', { n: GALLERY.length })}</span>
            </button>
            {GALLERY_SECTIONS.map((s) => {
              const n = inSection(s.id).length;
              return (
                <button type="button" key={s.id} className={`gallery-tab ${sectionId === s.id ? 'is-active' : ''}`} aria-pressed={sectionId === s.id} onClick={() => pick(s.id)}>
                  <span className="gallery-tab__title display">{t(s.title)}</span>
                  <span className="gallery-tab__count">{n ? t(n === 1 ? '{n} photo' : '{n} photos', { n }) : t('Coming soon')}</span>
                </button>
              );
            })}
          </nav>

          {section ? (
            <div className="gallery-section">
              <header className="gallery-section__head">
                <h2 className="gallery-section__title display">{t(section.title)}</h2>
                <p className="gallery-section__blurb serif">{t(section.blurb)}</p>
              </header>
              {albums.length > 0 && (
                <div className="chips chips--ink" role="tablist" aria-label={t('Albums')}>
                  {[null, ...albums].map((a) => (
                    <button key={a || 'all'} role="tab" aria-selected={album === a} className={`chip ${album === a ? 'is-active' : ''}`} onClick={() => pick(section.id, a)}>
                      {a ? t(a) : t('All')}
                    </button>
                  ))}
                </div>
              )}
              <Scrapbook shots={shown} onOpen={(i) => setOpen({ list: shown, i })} />
              {!shown.length && <p className="empty empty--ink">{t('Photos will be added soon.')}</p>}
              <AlbumList section={section} shots={sectionShots} soonOnly />
            </div>
          ) : (
            GALLERY_SECTIONS.map((s) => {
              const shots = inSection(s.id);
              const preview = shots.slice(0, PREVIEW);
              return (
                <section key={s.id} id={s.id} className="gallery-section" aria-labelledby={`gallery-${s.id}`}>
                  <header className="gallery-section__head">
                    <h2 className="gallery-section__title display" id={`gallery-${s.id}`}>
                      <Link to={galleryHref(s.id)}>{t(s.title)}</Link>
                    </h2>
                    <p className="gallery-section__blurb serif">{t(s.blurb)}</p>
                  </header>
                  <AlbumList section={s} shots={shots} />
                  {preview.length > 0 && <Scrapbook shots={preview} onOpen={(i) => setOpen({ list: shots, i })} />}
                  {!shots.length && <p className="empty empty--ink">{t('Photos will be added soon.')}</p>}
                  {shots.length > PREVIEW && (
                    <button type="button" className="btn btn--ink" onClick={() => pick(s.id)}>
                      {t('See all {n} photos', { n: shots.length })} <Icon name="arrow" size={18} />
                    </button>
                  )}
                </section>
              );
            })
          )}
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
            <figcaption className="hand">{t(current.cap)}{current.album && <span className="lightbox__album"> · {t(current.album)}</span>}</figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--prev slider-btn" onClick={() => step(-1)} aria-label={t('Previous photo')}><Icon name="chevron-left" /></button>
          <button className="lightbox__nav lightbox__nav--next slider-btn" onClick={() => step(1)} aria-label={t('Next photo')}><Icon name="chevron-right" /></button>
          <button className="lightbox__close" onClick={() => setOpen(null)} aria-label={t('Close')}><Icon name="close" size={26} /></button>
        </div>
      )}
    </>
  );
}
