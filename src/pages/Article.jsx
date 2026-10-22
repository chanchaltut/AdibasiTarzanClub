import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NEWS } from '../data/club';
import { NewsCard } from '../components/home/NewsGrid';
import { Photo, Sprig, TornEdge } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { longDate, useReveal } from '../utils/helpers';
import NotFound from './NotFound';

export default function Article() {
  const { slug } = useParams();
  const n = NEWS.find((x) => x.slug === slug);
  useReveal([slug]);
  useEffect(() => { if (n) document.title = `${n.title} — Adibasi Tarzan Club`; }, [n]);
  if (!n) return <NotFound />;

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const related = NEWS.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <article>
      <header className="article-hero">
        <Photo src={n.photo} className="article-hero__bg" eager />
        <span className="page-hero__shade" aria-hidden="true" />
        <div className="wrapper article-hero__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span><Icon name="chevron-right" size={12} /><Link to="/news">News</Link></span>
          </nav>
          <span className="tag">{n.tag}</span>
          <h1 className="article-hero__title display">{n.title}</h1>
          <p className="meta-time"><Icon name="clock" size={14} />{longDate(n.date)}</p>
        </div>
      </header>

      <div className="bg-parchment article-run">
        <TornEdge position="top" seed={73} />
        <div className="wrapper article-body">
          <aside className="article-share" aria-label="Share">
            <span>Share</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${n.title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><Icon name="whatsapp" size={20} /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Icon name="facebook" size={20} /></a>
          </aside>
          <div className="article-sheet paper">
            <p className="article-sheet__lead serif">{n.desc}</p>
            {n.body.map((para, i) => <p key={i} className={i === 0 ? 'dropcap' : ''}>{para}</p>)}
            <p className="article-sheet__sign script">Adibasi Tarzan Club</p>
            <Sprig className="article-sheet__sprig" />
          </div>
        </div>

        <section className="section news">
          <div className="wrapper">
            <div className="widget-header">
              <h2 className="widget-title">More <span className="script">news</span></h2>
              <Link to="/news" className="link-arrow news__all">All news <Icon name="arrow" size={18} /></Link>
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
