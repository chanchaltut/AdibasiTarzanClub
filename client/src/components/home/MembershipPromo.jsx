import { Link, useLang } from '../../i18n';
import { PHOTO } from '../../data/club';
import { Photo, Sprig, WaxSeal } from '../ui/Art';

export function Twine() {
  return (
    <svg className="twine" viewBox="0 0 400 120" aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 64 C 90 58, 160 70, 200 62 C 240 54, 320 66, 400 60" stroke="#8B6A3E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M0 64 C 90 58, 160 70, 200 62 C 240 54, 320 66, 400 60" stroke="#C9A36B" strokeWidth="2" strokeDasharray="3 4" fill="none" />
      <path d="M200 62 C 170 20, 140 30, 160 58 C 172 74, 196 66, 200 62 C 230 22, 262 34, 242 60 C 230 74, 204 66, 200 62 M200 62 C 186 86, 176 104, 168 116 M200 62 C 212 88, 226 104, 236 114" stroke="#8B6A3E" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function MembershipPromo() {
  const { t } = useLang();
  return (
    <section className="member-promo" aria-labelledby="member-title">
      <Photo src={PHOTO.tunnel} className="member-promo__bg" />
      <span className="member-promo__shade" aria-hidden="true" />
      <div className="wrapper member-promo__inner">
        <div className="member-promo__copy" data-reveal>
          <p className="kicker">{t('Membership 2026–27')}</p>
          <h2 className="member-promo__title display" id="member-title">
            <span className="script">{t('Join the family')}</span>
            {t('Become an ATC Member')}
          </h2>
          <p className="member-promo__desc">
            {t('Vote at the AGM, priority seats at the Annual Cup final, your member card and an invitation to Heritage Night — and a place in a family that has stood together since 1981.')}
          </p>
          <div className="member-promo__ctas">
            <Link to="/membership" className="btn btn--lg">{t('More Info')}</Link>
            <Link to="/contact" className="btn btn--ghost btn--lg">{t('Talk to us')}</Link>
          </div>
        </div>

        <div className="member-letter" data-reveal>
          <Twine />
          <div className="member-letter__sheet paper">
            <p className="member-letter__date serif">{t('S. Akhanagar, Kaliyaganj')}</p>
            <p className="member-letter__hi script">{t('Dear friend,')}</p>
            <p className="member-letter__text hand">
              {t('Every Saturday the ground fills with our people — grandparents on the boundary, children on every wall. Join us, and keep the spirit of 1981 alive.')}
            </p>
            <p className="member-letter__sign script">{t('The Committee')}</p>
            <WaxSeal size={92} className="member-letter__seal" />
            <Sprig className="member-letter__sprig" />
          </div>
        </div>
      </div>
    </section>
  );
}
