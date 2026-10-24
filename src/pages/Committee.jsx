import { Link, useLang } from '../i18n';
import { COMMITTEE, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import { Crest } from '../components/ui/Art';
import { useReveal } from '../utils/helpers';

export default function Committee() {
  useReveal();
  const { t, ta } = useLang();
  return (
    <>
      <PageHero
        title="Committee"
        script="2026–27"
        intro="The office-bearers who run the club on behalf of its members."
        photo={PHOTO.ballShadow}
        crumbs={[{ label: 'Club', href: '/club' }, { label: 'Committee' }]}
      />
      <section className="section bg-parchment">
        <div className="wrapper">
          <ul className="committee-grid">
            {COMMITTEE.map((c, i) => (
              <li key={c.role} className="member-card paper paper--sm" data-reveal style={{ '--tilt': `${(i % 3 - 1) * 0.9}deg`, transitionDelay: `${(i % 4) * 70}ms` }}>
                <span className="member-card__photo"><Crest size={84} alt="" /></span>
                <span className="member-card__role display">{t(c.role)}</span>
                <span className="member-card__name hand">{t(c.name)}</span>
              </li>
            ))}
          </ul>
          <p className="committee-note serif">
            {ta('Want to stand for the committee? Nominations open before every [Annual General Meeting].', (label) => <Link to="/schedule?tab=events">{label}</Link>)}
          </p>
        </div>
      </section>
    </>
  );
}
