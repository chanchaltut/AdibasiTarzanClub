import { useEffect, useState } from 'react';
import { CLUB, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import { Photo } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { useLang } from '../i18n';

// SAMPLE captions — swap in real club photos and captions
const SHOTS = [
  { src: PHOTO.action, cap: 'Matchday, S. Akhanagar' },
  { src: PHOTO.youth, cap: 'Youth session' },
  { src: PHOTO.strike, cap: 'Shooting practice' },
  { src: PHOTO.night, cap: 'Under the lights' },
  { src: PHOTO.tackle, cap: 'Every ball counts' },
  { src: PHOTO.kick, cap: 'Warm-up' },
  { src: PHOTO.pitch, cap: 'Fresh lines' },
  { src: PHOTO.balls, cap: 'New match balls' },
  { src: PHOTO.boot, cap: 'Boots on' },
  { src: PHOTO.net, cap: 'Back of the net' },
  { src: PHOTO.training, cap: 'First touch' },
  { src: PHOTO.goalNight, cap: 'Late session' },
];

export default function Gallery() {
  const [open, setOpen] = useState(null);
  const { t, ta } = useLang();

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
  }, [open]);

  return (
    <>
      <PageHero
        title="Gallery"
        script="In pictures"
        intro="Moments from the ground, the training pitch and the club grounds."
        photo={PHOTO.boot}
        position="50% 70%"
        crumbs={[{ label: 'Gallery' }]}
      />
      <section className="section bg-kraft">
        <div className="wrapper">
          <ul className="scrapbook">
            {SHOTS.map((s, i) => (
              <li key={s.cap} className="scrap" style={{ '--tilt': `${((i * 37) % 7) - 3}deg` }}>
                <button className="scrap__btn" onClick={() => setOpen(i)} aria-label={t('Open photo: {cap}', { cap: t(s.cap) })}>
                  <span className="tape" style={{ top: -10, left: '34%', transform: `rotate(${i % 2 ? 4 : -4}deg)` }} />
                  <Photo src={s.src} alt={`${t(s.cap)} — ${t(CLUB.name)}`} />
                  <span className="scrap__cap hand">{t(s.cap)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-bark" id="videos">
        <div className="wrapper videos-cta">
          <div>
            <p className="kicker">{t('ATC Play')}</p>
            <h2 className="h2 display">{ta('Watch the club *on YouTube*')}</h2>
            <p>{t("Highlights, Heritage Night performances and behind-the-scenes from the club's channel.")}</p>
          </div>
          <a className="btn btn--lg" href={CLUB.socials.youtube} target="_blank" rel="noopener noreferrer"><Icon name="youtube" size={20} /> {t('Open channel')}</a>
        </div>
      </section>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-label={t(SHOTS[open].cap)}>
          <button className="lightbox__scrim" onClick={() => setOpen(null)} aria-label={t('Close')} tabIndex={-1} />
          <figure className="lightbox__figure">
            <img src={SHOTS[open].src} alt={t(SHOTS[open].cap)} />
            <figcaption className="hand">{t(SHOTS[open].cap)}</figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--prev slider-btn" onClick={() => setOpen((open - 1 + SHOTS.length) % SHOTS.length)} aria-label={t('Previous photo')}><Icon name="chevron-left" /></button>
          <button className="lightbox__nav lightbox__nav--next slider-btn" onClick={() => setOpen((open + 1) % SHOTS.length)} aria-label={t('Next photo')}><Icon name="chevron-right" /></button>
          <button className="lightbox__close" onClick={() => setOpen(null)} aria-label={t('Close')}><Icon name="close" size={26} /></button>
        </div>
      )}
    </>
  );
}
