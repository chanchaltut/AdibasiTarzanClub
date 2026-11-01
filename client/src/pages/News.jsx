import { useState } from 'react';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { NewsCard } from '../components/home/NewsGrid';
import { useLang } from '../i18n';

export default function News() {
  const [tag, setTag] = useState('All');
  const { t } = useLang();
  const { NEWS, PAGES } = useContent();
  const TAGS = ['All', ...new Set(NEWS.map((n) => n.tag).filter(Boolean))];
  const list = tag === 'All' ? NEWS : NEWS.filter((n) => n.tag === tag);

  return (
    <>
      <PageHero
        title="News"
        script={PAGES.news?.script}
        intro={PAGES.news?.intro}
        photo={PAGES.news?.photo}
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
