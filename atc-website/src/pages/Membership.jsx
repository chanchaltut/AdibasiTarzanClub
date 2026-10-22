import { MEMBERSHIP_TIERS, PHOTO } from '../data/club';
import PageHero from '../components/page/PageHero';
import LetterForm from '../components/home/LetterForm';
import { FaqList } from './Club';
import { WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { useReveal } from '../utils/helpers';

const STEPS = [
  { n: '01', title: 'Write or visit', text: 'Send us a letter below, or visit the club office any evening.' },
  { n: '02', title: 'Fill the form', text: 'A short membership form with your name, village and contact number.' },
  { n: '03', title: 'Welcome home', text: 'Receive your member card and join us at the next home match.' },
];

const MEMBER_FAQ = [
  { q: 'Who can become a member?', a: 'Anyone who shares the values of the club — players, supporters, families and friends of S. Akhanagar.' },
  { q: 'How much does membership cost?', a: 'Annual and life membership fees are set at the AGM each year. Please ask the club office for the current rates.' },
  { q: 'Can I vote at the AGM?', a: 'Yes. Members and life members can vote at the Annual General Meeting and stand for the committee.' },
];

export default function Membership() {
  useReveal();
  return (
    <>
      <PageHero
        title="Membership"
        script="Join the family"
        intro="Stand with the club that has stood for S. Akhanagar since 1981."
        photo={PHOTO.tunnel}
        crumbs={[{ label: 'Membership' }]}
      />

      <section className="section bg-parchment">
        <div className="wrapper">
          <ul className="tiers">
            {MEMBERSHIP_TIERS.map((t) => (
              <li key={t.name} className={`tier paper ${t.featured ? 'tier--featured' : ''}`} data-reveal>
                {t.featured && <WaxSeal size={86} className="tier__seal" />}
                <p className="tier__price serif">{t.price}</p>
                <h2 className="tier__name display">{t.name}</h2>
                <ul className="tier__perks">
                  {t.perks.map((p) => <li key={p}><Icon name="seal" size={18} />{p}</li>)}
                </ul>
                <a href="#join" className={`btn ${t.featured ? '' : 'btn--outline-ink'}`}>Join as {t.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-bark">
        <div className="wrapper">
          <div className="widget-header"><h2 className="widget-title">How to <span className="script">join</span></h2></div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="step" data-reveal>
                <span className="step__n display">{s.n}</span>
                <span className="step__title display">{s.title}</span>
                <span className="step__text">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-parchment">
        <div className="wrapper faq-wrap">
          <div>
            <p className="kicker kicker--ink">Membership</p>
            <h2 className="h2 display">Good <span className="script">to know</span></h2>
          </div>
          <FaqList items={MEMBER_FAQ} />
        </div>
      </section>

      <LetterForm id="join" />
    </>
  );
}
