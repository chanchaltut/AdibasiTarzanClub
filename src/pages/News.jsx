import { useState } from 'react';
import { NEWS, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import { NewsCard } from '../components/home/NewsGrid';
import { useReveal } from '../utils/helpers';
import { useLang } from '../i18n';

const TAGS = ['All', ...new Set(NEWS.map((n) => n.tag))];

export default function News() {
  const [tag, setTag] = useState('All');
  const { t } = useLang();
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
          <div className="chips" role="tablist" aria-label={t('Filter news')}>
            {TAGS.map((tg) => (
              <button key={tg} role="tab" aria-selected={tag === tg} className={`chip ${tag === tg ? 'is-active' : ''}`} onClick={() => setTag(tg)}>
                {t(tg)}
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
