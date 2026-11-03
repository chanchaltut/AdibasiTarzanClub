import { Link, useLang } from '../../i18n';
import { useContent } from '../../content/store';
import { imgUrl } from '../../content/image';
import Icon from '../ui/Icon';
import { Photo } from '../ui/Art';

/** Newest first, pinned ones (this year's calendar, the current invitation) on top. */
export const sortDocuments = (docs) => [...docs].sort((a, b) => (Boolean(b.pinned) - Boolean(a.pinned)) || String(b.date).localeCompare(String(a.date)));

/** The latest club calendar on the Notice Board, if one was uploaded. */
export const latestCalendar = (docs) => sortDocuments(docs).find((d) => /calendar/i.test(d.kind || ''));

const openUrl = (d) => d.pdf?.url || imgUrl(d.photo, 2048);

function Preview({ d }) {
  const { t } = useLang();
  if (d.photo) return <Photo src={d.photo} className="doc-card__img" sizes="(max-width: 640px) 90vw, 320px" />;
  if (d.pdf?.thumb) return <Photo src={d.pdf.thumb} className="doc-card__img doc-card__img--pdf" sizes="(max-width: 640px) 90vw, 320px" />;
  return (
    <span className="doc-card__sheet" aria-hidden="true">
      <span className="doc-card__lines" />
      <span className="doc-card__stamp">{t('PDF')}</span>
    </span>
  );
}

export function DocumentCard({ d, i = 0 }) {
  const { t, date } = useLang();
  const href = openUrl(d);
  return (
    <li className="doc-card paper paper--sm" style={{ '--tilt': `${(i % 3 - 1) * 0.7}deg` }}>
      <span className="tape" style={{ top: -11, left: '38%', transform: `rotate(${i % 2 ? 4 : -3}deg)` }} />
      <a className="doc-card__preview" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${t('Open')}: ${t(d.title)}`} tabIndex={-1}>
        <Preview d={d} />
      </a>
      <div className="doc-card__body">
        <p className="doc-card__meta">
          <span className="tag tag--ink">{t(d.kind)}</span>
          {d.date && <time dateTime={d.date}>{date(d.date, { day: 'numeric', month: 'short', year: 'numeric' })}</time>}
        </p>
        <h3 className="doc-card__title display">{t(d.title)}</h3>
        {d.desc && <p className="doc-card__desc">{t(d.desc)}</p>}
        <div className="doc-card__actions">
          <a className="link-arrow" href={href} target="_blank" rel="noopener noreferrer">
            {t(d.pdf ? 'Open PDF' : 'View letter')} <Icon name="external" size={16} />
          </a>
          {d.pdf?.download && (
            <a className="doc-card__download" href={d.pdf.download} rel="noopener noreferrer">
              <Icon name="download" size={16} /> {t('Download')}
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function DocumentList({ docs }) {
  return <ul className="doc-grid">{docs.map((d, i) => <DocumentCard key={d.id} d={d} i={i} />)}</ul>;
}

/** Home page: the latest letters, invitations and the club calendar. Hidden until something is added. */
export default function NoticeBoard() {
  const { t, ta } = useLang();
  const { DOCUMENTS } = useContent();
  if (!DOCUMENTS.length) return null;
  const docs = sortDocuments(DOCUMENTS);
  return (
    <section className="section notice-board bg-bark" aria-labelledby="notice-title">
      <div className="wrapper">
        <div className="widget-header">
          <h2 className="widget-title" id="notice-title">{ta('Notice *Board*')}</h2>
          {docs.length > 3 && (
            <Link to="/schedule?tab=notices" className="btn btn--ghost btn--sm"><Icon name="file" size={16} /> {t('All letters & notices')}</Link>
          )}
        </div>
        <DocumentList docs={docs.slice(0, 3)} />
      </div>
    </section>
  );
}
