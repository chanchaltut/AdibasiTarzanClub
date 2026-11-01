import { Link, useLang } from '../../i18n';
import { NEWS } from '../../data/club';
import { tornClip } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Photo } from '../ui/Art';

export function NewsCard({ n, i = 0 }) {
  const { t, timeAgo } = useLang();
  return (
    <Link to={`/news/${n.slug}`} className="news-card" data-reveal style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
      <span className="news-card__media" style={{ clipPath: tornClip(50 + i * 3, 4.5) }}>
        <Photo src={n.photo} />
      </span>
      <span className="news-card__body">
        <span className="news-card__title">{t(n.title)}</span>
        <span className="news-card__desc">{t(n.desc)}</span>
        <span className="news-card__meta">
          <span className="tag tag--ink">{t(n.tag)}</span>
          <span className="meta-time"><Icon name="clock" size={13} />{timeAgo(n.date)}</span>
        </span>
      </span>
    </Link>
  );
}

export default function NewsGrid() {
  const { t, ta } = useLang();
  return (
    <section className="section news" aria-labelledby="news-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="news-title">{ta('ATC *News*')}</h2>
          <Link to="/news" className="link-arrow news__all">{t('All news')} <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="news__grid">
          {NEWS.slice(0, 8).map((n, i) => <NewsCard n={n} i={i} key={n.slug} />)}
        </div>
      </div>
    </section>
  );
}
