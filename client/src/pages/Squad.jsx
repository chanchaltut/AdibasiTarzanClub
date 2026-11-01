import { Link, useLang } from '../i18n';
import { PHOTO, SQUAD } from '../data/club';
import PageHero from '../components/page/PageHero';
import { PlayerCard } from '../components/home/PlayerSlider';
import { Sprig } from '../components/ui/Art';

const GROUPS = [
  ['Goalkeeper', 'Goalkeepers'],
  ['Defender', 'Defenders'],
  ['Midfielder', 'Midfielders'],
  ['Forward', 'Forwards'],
];

const TABS = [
  { id: 'first-team', label: 'First Team' },
  { id: 'youth', label: 'Youth (U-17)' },
  { id: 'veterans', label: 'Veterans' },
];

export default function Squad() {
  const { t, ta } = useLang();
  return (
    <>
      <PageHero
        title="Players"
        script="The first XI"
        intro="The squad wearing the brown and gold in the 2026–27 season."
        photo={PHOTO.tackle}
        crumbs={[{ label: 'First Team' }, { label: 'Players' }]}
        tabs={TABS}
      />
      <section className="section bg-bark" id="first-team">
        <div className="wrapper">
          {GROUPS.map(([pos, label]) => {
            const list = SQUAD.filter((p) => p.pos === pos);
            return (
              <div className="squad-group" key={pos}>
                <h2 className="squad-group__title display">{t(label)} <span>{list.length}</span></h2>
                <ul className="squad-grid">
                  {list.map((p, i) => <li key={p.no}><PlayerCard p={p} i={i} /></li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section bg-parchment" id="youth">
        <div className="wrapper squad-notes">
          <div className="squad-note paper" id="veterans">
            <p className="kicker kicker--ink">{t('Youth & Veterans')}</p>
            <h2 className="h2 display">{ta('More squads *coming soon*')}</h2>
            <p>
              {t('Our under-17 and veterans squads will be listed here soon. Parents and former players can register their interest with the club office.')}
            </p>
            <Link to="/contact" className="btn btn--ink">{t('Get in touch')}</Link>
            <Sprig className="squad-note__sprig" />
          </div>
        </div>
      </section>
    </>
  );
}
