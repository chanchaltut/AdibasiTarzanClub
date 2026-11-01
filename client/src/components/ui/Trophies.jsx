import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import { TrophyIcon } from './Art';

export default function Trophies() {
  const { t } = useLang();
  const { HONOURS } = useContent();
  if (!HONOURS.length) return null;
  return (
    <div className="trophies">
      {HONOURS.map((h, i) => (
        <Link to="/club#honours" className={`trophy trophy--${i % 2 ? 'b' : 'a'}`} key={h.comp}>
          <span className="trophy__comp">{t(h.comp)}</span>
          <TrophyIcon kind={h.icon} />
          <span className="trophy__count">{h.count}</span>
          <span className="trophy__unit">{t(h.unit)}</span>
        </Link>
      ))}
    </div>
  );
}
