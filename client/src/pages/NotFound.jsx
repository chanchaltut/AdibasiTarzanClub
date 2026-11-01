import { Link, useLang } from '../i18n';
import { Sprig, WaxSeal } from '../components/ui/Art';

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="section bg-burlap lost">
      <div className="wrapper">
        <div className="lost__letter paper">
          <p className="lost__code display">404</p>
          <p className="lost__hi script">{t('Dear visitor,')}</p>
          <p className="hand lost__text">
            {t('This page seems to have wandered off into the forest. Let us walk you back to the ground.')}
          </p>
          <Link to="/" className="btn btn--ink">{t('Back to home')}</Link>
          <WaxSeal size={80} className="lost__seal" />
          <Sprig className="lost__sprig" />
        </div>
      </div>
    </section>
  );
}
