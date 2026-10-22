import { Link } from 'react-router-dom';
import { HONOURS } from '../../data/club';
import { TrophyIcon } from './Art';

export default function Trophies() {
  return (
    <div className="trophies">
      {HONOURS.map((h, i) => (
        <Link to="/club#honours" className={`trophy trophy--${i % 2 ? 'b' : 'a'}`} key={h.comp}>
          <span className="trophy__comp">{h.comp}</span>
          <TrophyIcon kind={h.icon} />
          <span className="trophy__count">{h.count}</span>
          <span className="trophy__unit">{h.unit}</span>
        </Link>
      ))}
    </div>
  );
}
