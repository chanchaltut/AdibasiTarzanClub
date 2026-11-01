import { Link, useLang } from '../i18n';
import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import { Crest, Photo } from '../components/ui/Art';

export default function Committee() {
  const { t, ta } = useLang();
  const { COMMITTEE, PAGES } = useContent();
  return (
    <>
      <PageHero
        title="Committee"
        script={PAGES.committee?.script}
        intro={PAGES.committee?.intro}
        photo={PAGES.committee?.photo}
        crumbs={[{ label: 'Club', href: '/club' }, { label: 'Committee' }]}
      />
      <section className="section bg-parchment">
        <div className="wrapper">
          <ul className="committee-grid">
            {COMMITTEE.map((c, i) => (
              <li key={c.id || c.role} className="member-card paper paper--sm" data-reveal style={{ '--tilt': `${(i % 3 - 1) * 0.9}deg`, transitionDelay: `${(i % 4) * 70}ms` }}>
                <span className={`member-card__photo ${c.photo ? 'member-card__photo--img' : ''}`}>{c.photo ? <Photo src={c.photo} sizes="120px" alt={t(c.name)} /> : <Crest size={84} alt="" />}</span>
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
