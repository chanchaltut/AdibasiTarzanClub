import { Link } from 'react-router-dom';
import { FEATURED_PLAYERS, SQUAD } from '../../data/club';
import { useScroller } from '../../utils/helpers';
import { Jersey } from '../ui/Art';
import { ScrollMeter, SliderControls } from '../ui/Slider';

export function PlayerCard({ p, i = 0 }) {
  return (
    <Link to="/squad" className={`player-card player-card--${i % 2 ? 'b' : 'a'}`}>
      <span className="player-card__art">
        <span className="player-card__bignum" aria-hidden="true">{p.no}</span>
        <Jersey name={p.last} number={p.no} />
      </span>
      <span className="player-card__text">
        <span className="player-card__no">{p.no}</span>
        <span className="player-card__name">
          <span className="player-card__first">{p.first}</span>
          <span className="player-card__last">{p.last}{p.captain && <abbr title="Captain">C</abbr>}</span>
        </span>
        <span className="player-card__pos">{p.pos}</span>
      </span>
    </Link>
  );
}

export default function PlayerSlider() {
  const s = useScroller();
  const players = FEATURED_PLAYERS.map((n) => SQUAD.find((p) => p.no === n)).filter(Boolean);
  return (
    <section className="section players bg-bark" aria-labelledby="players-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="players-title">Players</h2>
          <SliderControls s={s} label="players" />
        </div>
        <ul className="h-scroll players__row" ref={s.ref}>
          {players.map((p, i) => <li key={p.no}><PlayerCard p={p} i={i} /></li>)}
        </ul>
        <ScrollMeter s={s} />
      </div>
    </section>
  );
}
