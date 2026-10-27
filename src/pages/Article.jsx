import { useParams } from 'react-router-dom';
import { Link, useLang } from '../i18n';
import { NEWS } from '../data/club';
import { NewsCard } from '../components/home/NewsGrid';
import { Photo, Sprig, TornEdge } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { abs } from '../seo/meta';
import NotFound from './NotFound';

export default function Article() {
  const { slug } = useParams();
  const n = NEWS.find((x) => x.slug === slug);
  const { t, ta, to, longDate } = useLang();
  if (!n) return <NotFound />;

  const url = abs(to(`/news/${n.slug}`));
  const title = t(n.title);
  const related = NEWS.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <article>
      <header className="article-hero">
        <Photo src={n.photo} className="article-hero__bg" eager />
        <span className="page-hero__shade" aria-hidden="true" />
        <div className="wrapper article-hero__inner">
          <nav className="crumbs" aria-label={t('Breadcrumb')}>
            <Link to="/">{t('Home')}</Link>
            <span><Icon name="chevron-right" size={12} /><Link to="/news">{t('News')}</Link></span>
          </nav>
          <span className="tag">{t(n.tag)}</span>
          <h1 className="article-hero__title display">{title}</h1>
          <p className="meta-time"><Icon name="clock" size={14} />{longDate(n.date)}</p>
        </div>
      </header>

      <div className="bg-parchment article-run">
        <TornEdge position="top" seed={73} />
        <div className="wrapper article-body">
          <aside className="article-share" aria-label={t('Share')}>
            <span>{t('Share')}</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label={t('Share on WhatsApp')}><Icon name="whatsapp" size={20} /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label={t('Share on Facebook')}><Icon name="facebook" size={20} /></a>
          </aside>
          <div className="article-sheet paper">
            <p className="article-sheet__lead serif">{t(n.desc)}</p>
            {n.body.map((para, i) => <p key={i} className={i === 0 ? 'dropcap' : ''}>{t(para)}</p>)}
            <p className="article-sheet__sign script">{t('Adibasi Tarzan Club')}</p>
            <Sprig className="article-sheet__sprig" />
          </div>
        </div>

        <section className="section news">
          <div className="wrapper">
            <div className="widget-header">
              <h2 className="widget-title">{ta('More *news*')}</h2>
              <Link to="/news" className="link-arrow news__all">{t('All news')} <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="news__grid">
              {related.map((r, i) => <NewsCard n={r} i={i} key={r.slug} />)}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
