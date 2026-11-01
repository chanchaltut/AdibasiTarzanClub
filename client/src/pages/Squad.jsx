import { Link, useLang } from '../i18n';
import { useContent } from '../content/store';
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

const squadOf = (p) => p.squad || 'first-team';
const byNumber = (a, b) => a.no - b.no;

function Groups({ players }) {
  const { t } = useLang();
  return GROUPS.map(([pos, label]) => {
    const list = players.filter((p) => p.pos === pos).sort(byNumber);
    if (!list.length) return null;
    return (
      <div className="squad-group" key={pos}>
        <h2 className="squad-group__title display">{t(label)} <span>{list.length}</span></h2>
        <ul className="squad-grid">
          {list.map((p, i) => <li key={p.id || p.no}><PlayerCard p={p} i={i} /></li>)}
        </ul>
      </div>
    );
  });
}

export default function Squad() {
  const { t, ta } = useLang();
  const { SQUAD, PAGES } = useContent();
  const youth = SQUAD.filter((p) => squadOf(p) === 'youth');
  const veterans = SQUAD.filter((p) => squadOf(p) === 'veterans');
  return (
    <>
      <PageHero
        title="Players"
        script={PAGES.squad?.script}
        intro={PAGES.squad?.intro}
        photo={PAGES.squad?.photo}
        crumbs={[{ label: 'First Team' }, { label: 'Players' }]}
        tabs={TABS}
      />
      <section className="section bg-bark" id="first-team">
        <div className="wrapper">
          <Groups players={SQUAD.filter((p) => squadOf(p) === 'first-team')} />
        </div>
      </section>

      {youth.length > 0 && (
        <section className="section bg-bark-deep" id="youth">
          <div className="wrapper">
            <div className="widget-header"><h2 className="widget-title">{t('Youth (U-17)')}</h2></div>
            <Groups players={youth} />
          </div>
        </section>
      )}
      {veterans.length > 0 && (
        <section className="section bg-bark" id="veterans">
          <div className="wrapper">
            <div className="widget-header"><h2 className="widget-title">{t('Veterans')}</h2></div>
            <Groups players={veterans} />
          </div>
        </section>
      )}

      {(!youth.length || !veterans.length) && (
        <section className="section bg-parchment" id={!youth.length ? 'youth' : 'veterans'}>
          <div className="wrapper squad-notes">
            <div className="squad-note paper" id={!youth.length && !veterans.length ? 'veterans' : undefined}>
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
      )}
    </>
  );
}
