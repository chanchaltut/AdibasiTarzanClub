import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import { tornClip } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Crest, Drum, Jersey, Photo } from '../ui/Art';

const ART = {
  jersey: <Jersey name="Tarzan" number="81" />,
  drum: <Drum />,
  crest: <Crest size={120} alt="" />,
};

export default function ExploreClub() {
  const { t, ta } = useLang();
  const { EXPLORE } = useContent();
  return (
    <section className="section explore" aria-labelledby="explore-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="explore-title">{ta('Explore the *Club*')}</h2>
        </div>
        <ul className="explore__list">
          {EXPLORE.map((e, i) => (
            <li key={e.id || e.title} className="explore-card" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <Link to={e.href} className="explore-card__link">
                <span className="explore-card__hero" style={{ clipPath: tornClip(31 + i, 6, 30, 'trl') }}>
                  <Photo src={e.photo} sizes="(max-width: 840px) 100vw, 33vw" />
                </span>
                <span className="explore-card__body paper paper--kraft paper--flat">
                  <span className="explore-card__art">{ART[e.art] || ART.crest}</span>
                  <span className="explore-card__info">
                    <span className="explore-card__title">{t(e.title)}</span>
                    <span className="explore-card__desc">{t(e.desc)}</span>
                    <span className="link-arrow">{t(e.cta)} <Icon name="arrow" size={18} /></span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
