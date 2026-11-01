import { Link, useLang } from '../../i18n';
import { CLUB, NEWS, PHOTO } from '../../data/club';
import { tornClip } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Photo } from '../ui/Art';

const lead = NEWS[0];

const LIST = [
  { kind: 'news', item: NEWS[1] },
  { kind: 'gallery', title: 'Matchday at S. Akhanagar, in pictures', href: '/gallery', photo: PHOTO.tackle, count: 24, tag: 'Gallery', date: NEWS[1].date },
  { kind: 'video', title: 'Under the lights: inside a cup-week session', href: CLUB.socials.youtube, photo: PHOTO.goalNight, tag: 'ATC Play', external: true },
];

function HeroCard({ entry, i }) {
  const { t, timeAgo } = useLang();
  const isNews = entry.kind === 'news';
  const href = isNews ? `/news/${entry.item.slug}` : entry.href;
  const title = isNews ? entry.item.title : entry.title;
  const photo = isNews ? entry.item.photo : entry.photo;
  const tag = isNews ? entry.item.tag : entry.tag;
  const date = isNews ? entry.item.date : entry.date;
  const Tag = entry.external ? 'a' : Link;
  const linkProps = entry.external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { to: href };

  return (
    <Tag {...linkProps} className={`hero-card hero-card--${entry.kind}`}>
      <span className="hero-card__media" style={{ clipPath: tornClip(11 + i * 7, 5) }}>
        <Photo src={photo} />
        {entry.kind === 'video' && <span className="play-badge"><Icon name="play" size={18} /></span>}
        {entry.kind === 'gallery' && <span className="count-badge"><Icon name="camera" size={14} /> {entry.count}</span>}
      </span>
      <span className="hero-card__body">
        <span className="hero-card__title">{t(title)}</span>
        <span className="hero-card__meta">
          <span className="hero-card__tag">{t(tag)}</span>
          {date && <span className="meta-time"><Icon name="clock" size={13} />{timeAgo(date)}</span>}
          {entry.external && <span className="meta-time"><Icon name="external" size={13} />YouTube</span>}
        </span>
      </span>
    </Tag>
  );
}

export default function HeroFeatured() {
  const { t, ta, timeAgo } = useLang();
  return (
    <header className="hero">
      <h1 className="visually-hidden">{t('Adibasi Tarzan Club — football and heritage club of S. Akhanagar, Kaliyaganj, Uttar Dinajpur, since 1981')}</h1>
      <Link to={`/news/${lead.slug}`} className="hero__primary">
        <Photo src={lead.photo} className="hero__photo" eager position="50% 62%" />
        <span className="hero__shade" aria-hidden="true" />
        <span className="wrapper hero__content">
          <span className="hero__kicker">
            <span className="script">{t('Since 1981')}</span>
            <span className="tag">{t(lead.tag)}</span>
          </span>
          <span className="hero__title">{t(lead.title)}</span>
          <span className="hero__desc">{t(lead.desc)}</span>
          <span className="hero__meta">
            <span className="meta-time"><Icon name="clock" size={14} />{timeAgo(lead.date)}</span>
            <span className="link-arrow">{t('Read the story')} <Icon name="arrow" size={18} /></span>
          </span>
        </span>
      </Link>

      <div className="hero__below">
        <div className="wrapper hero__below-inner">
          <div className="hero__list">
            {LIST.map((e, i) => <HeroCard entry={e} i={i} key={i} />)}
          </div>
          <Link to="/contact#partners" className="hero__partners">
            <span className="hero__partners-label">{t('Main Partners')}</span>
            <span className="hero__partners-slot">{ta('*Your brand* could stand here')}</span>
            <span className="link-arrow">{t('Partner with ATC')} <Icon name="arrow" size={16} /></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
