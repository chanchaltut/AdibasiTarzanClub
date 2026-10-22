import { Link } from 'react-router-dom';
import { PROMOS } from '../../data/club';
import { useScroller } from '../../utils/helpers';
import Icon from '../ui/Icon';
import { Photo, WaxSeal } from '../ui/Art';
import { ScrollMeter, SliderControls } from '../ui/Slider';

function PaperArt({ paper }) {
  return (
    <span className={`promo-card__paper promo-card__paper--${paper.tone || 'light'}`}>
      <span className="promo-card__script script">{paper.script}</span>
      <span className="promo-card__big display">{paper.big}</span>
      <span className="promo-card__rule" />
      <span className="promo-card__note serif">{paper.note}</span>
      <WaxSeal size={58} className="promo-card__seal" />
    </span>
  );
}

export default function PromoCarousel() {
  const s = useScroller();
  return (
    <section className="section promos bg-bark" aria-labelledby="promos-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="promos-title">Events <span className="script">&amp;</span> Tickets</h2>
          <SliderControls s={s} label="events" />
        </div>
        <ul className="h-scroll promos__row" ref={s.ref}>
          {PROMOS.map((p) => (
            <li key={p.title} className="promo-card">
              <Link to={p.href} className="promo-card__link">
                {p.photo ? <Photo src={p.photo} /> : <PaperArt paper={p.paper} />}
                <span className="promo-card__info">
                  <span className="promo-card__title">{p.title}</span>
                  <Icon name="chevron-right" size={20} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ScrollMeter s={s} />
      </div>
    </section>
  );
}
