import { useContent } from '../content/store';
import PageHero from '../components/page/PageHero';
import LetterForm from '../components/home/LetterForm';
import { FaqList } from './Club';
import { WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { useLang } from '../i18n';

const STEPS = [
  { n: '01', title: 'Write or visit', text: 'Send us a letter below, or visit the club office any evening.' },
  { n: '02', title: 'Fill the form', text: 'A short membership form with your name, village and contact number.' },
  { n: '03', title: 'Welcome home', text: 'Receive your member card and join us at the next home match.' },
];

export default function Membership() {
  const { t, ta } = useLang();
  const { MEMBERSHIP_TIERS, MEMBER_FAQ, PAGES } = useContent();
  return (
    <>
      <PageHero
        title="Membership"
        script={PAGES.membership?.script}
        intro={PAGES.membership?.intro}
        photo={PAGES.membership?.photo}
        crumbs={[{ label: 'Membership' }]}
      />

      <section className="section bg-parchment">
        <div className="wrapper">
          <ul className="tiers">
            {MEMBERSHIP_TIERS.map((tier) => (
              <li key={tier.name} className={`tier paper ${tier.featured ? 'tier--featured' : ''}`} data-reveal>
                {tier.featured && <WaxSeal size={86} className="tier__seal" />}
                <p className="tier__price serif">{t(tier.price)}</p>
                <h2 className="tier__name display">{t(tier.name)}</h2>
                <ul className="tier__perks">
                  {tier.perks.map((p) => <li key={p}><Icon name="seal" size={18} />{t(p)}</li>)}
                </ul>
                <a href="#join" className={`btn ${tier.featured ? '' : 'btn--outline-ink'}`}>{t('Join as {name}', { name: t(tier.name) })}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-bark">
        <div className="wrapper">
          <div className="widget-header"><h2 className="widget-title">{ta('How to *join*')}</h2></div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="step" data-reveal>
                <span className="step__n display">{s.n}</span>
                <span className="step__title display">{t(s.title)}</span>
                <span className="step__text">{t(s.text)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {MEMBER_FAQ.length > 0 && (
        <section className="section bg-parchment">
          <div className="wrapper faq-wrap">
            <div>
              <p className="kicker kicker--ink">{t('Membership')}</p>
              <h2 className="h2 display">{ta('Good *to know*')}</h2>
            </div>
            <FaqList items={MEMBER_FAQ} />
          </div>
        </section>
      )}

      <LetterForm id="join" />
    </>
  );
}
