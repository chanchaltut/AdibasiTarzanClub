import { useState } from 'react';
import { NEWS, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import { NewsCard } from '../components/home/NewsGrid';
import { useReveal } from '../utils/helpers';

const TAGS = ['All', ...new Set(NEWS.map((n) => n.tag))];

export default function News() {
  const [tag, setTag] = useState('All');
  const list = tag === 'All' ? NEWS : NEWS.filter((n) => n.tag === tag);
  useReveal([tag]);

  return (
    <>
      <PageHero
        title="News"
        script="From the touchline"
        intro="Match reports, club announcements and stories from S. Akhanagar."
        photo={PHOTO.action}
        crumbs={[{ label: 'News' }]}
      />
      <section className="section bg-parchment news">
        <div className="wrapper">
          <div className="chips" role="tablist" aria-label="Filter news">
            {TAGS.map((t) => (
              <button key={t} role="tab" aria-selected={tag === t} className={`chip ${tag === t ? 'is-active' : ''}`} onClick={() => setTag(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="news__grid">
            {list.map((n, i) => <NewsCard n={n} i={i} key={n.slug} />)}
          </div>
        </div>
      </section>
    </>
  );
}
