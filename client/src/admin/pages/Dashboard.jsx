import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { useSchema } from '../schema';
import { fmtBytes, fmtDateTime, greeting, timeAgo } from '../format';
import { Button, Icon, Loading, Notice, useFeedback } from '../ui';
import builtInHi from '../../i18n/hi';
import builtInBn from '../../i18n/bn';

const QUICK = [
  { to: '/c/news/new', icon: 'newspaper', title: 'Write a news story', text: 'Match report or announcement' },
  { to: '/c/matches', icon: 'ball', title: 'Add a match or score', text: 'Fixtures and results' },
  { to: '/c/gallery', icon: 'images', title: 'Add gallery photos', text: 'Upload many at once' },
  { to: '/c/videos/new', icon: 'play', title: 'Add a YouTube video', text: 'Paste the link' },
  { to: '/c/events/new', icon: 'calendar', title: 'Announce an event', text: 'Cup, Heritage Night, AGM…' },
  { to: '/s/pages', icon: 'image', title: 'Change page photos', text: 'Banners at the top of pages' },
];

export function ActivityLine({ a }) {
  return (
    <li className="a-activity__item">
      <span className="a-avatar a-avatar--sm">{(a.userName || '?').slice(0, 1).toUpperCase()}</span>
      <span>
        <strong>{a.userName || 'Someone'}</strong> {a.action}
        {a.areaLabel && a.area !== 'account' && <> in <em>{a.areaLabel}</em></>}
        {a.itemTitle && <>: “{a.itemTitle.length > 80 ? `${a.itemTitle.slice(0, 80)}…` : a.itemTitle}”</>}
        <span className="a-muted a-small" title={fmtDateTime(a.at)}> · {timeAgo(a.at)}</span>
      </span>
    </li>
  );
}

function WebsiteCard({ website, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();
  if (!website.configured) {
    return (
      <section className="a-card">
        <h2 className="a-card__title"><Icon name="globe" size={20} /> Website</h2>
        <p>Your changes appear on the website straight away.</p>
        <p className="a-muted a-small">Automatic refresh for Google is not switched on yet. Your developer can turn it on (DEPLOY_HOOK_URL).</p>
      </section>
    );
  }
  const run = async () => {
    setBusy(true);
    try {
      await api('/admin/website/rebuild', { method: 'POST', body: {} });
      toast('Google’s copy of the website is being refreshed (takes 2–3 minutes)');
      onRefresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="a-card">
      <h2 className="a-card__title"><Icon name="globe" size={20} /> Website</h2>
      <p>Visitors see your changes straight away. Google and WhatsApp previews are refreshed automatically a few minutes after you stop editing.</p>
      {website.pending
        ? <Notice kind="info">Refresh for Google is planned for about {fmtDateTime(website.dueAt)}.</Notice>
        : website.lastRunAt && <p className="a-muted a-small">Last refreshed {timeAgo(website.lastRunAt)}{website.lastOk === false ? ' — it failed, it will try again by itself' : ''}.</p>}
      <Button icon="refresh" busy={busy} onClick={run}>Refresh now</Button>
    </section>
  );
}

function StorageCard() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/storage').then(setData).catch(() => setData({ usage: null })); }, []);
  if (!data?.usage) return null;
  const u = data.usage;
  return (
    <section className="a-card">
      <h2 className="a-card__title"><Icon name="images" size={20} /> Photo storage (Cloudinary)</h2>
      {u.percent != null && (
        <div className="a-meter" role="meter" aria-valuenow={u.percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.min(100, u.percent)}%` }} className={u.percent > 80 ? 'is-high' : ''} />
        </div>
      )}
      <p className="a-small">{u.percent != null ? `${Math.round(u.percent)}% of this month’s free allowance used` : 'Usage information'}{u.storageBytes != null && ` · ${fmtBytes(u.storageBytes)} stored`}</p>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const schema = useSchema();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = () => api('/admin/dashboard').then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <div className="a-page"><Notice kind="error" action={<Button onClick={() => { setError(null); load(); }}>Try again</Button>}>{error}</Notice></div>;
  if (!data) return <Loading />;

  const saved = data.media.originalBytes - data.media.bytes;
  const missingTranslations = data.translations.untranslated
    .filter((r) => (!r.hi && !builtInHi[r.en]) || (!r.bn && !builtInBn[r.en])).length;
  const stats = [
    ['news', 'News stories'], ['matches', 'Matches'], ['gallery', 'Gallery photos'], ['videos', 'Videos'], ['players', 'Players'], ['events', 'Events'],
  ];

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1>{greeting()}, {user.name.split(' ')[0]}</h1>
          <p className="a-page__desc">What would you like to do on the club website today?</p>
        </div>
      </header>

      {data.needScore.length > 0 && (
        <Notice kind="warn" title={`${data.needScore.length === 1 ? 'A match needs' : `${data.needScore.length} matches need`} a final score`}>
          <ul className="a-plainlist">
            {data.needScore.map((m) => <li key={m.id}><Link to={`/c/matches/${m.id}`}>{m.title} — {fmtDateTime(m.date)}</Link></li>)}
          </ul>
        </Notice>
      )}

      <ul className="a-quick">
        {QUICK.map((q) => (
          <li key={q.to}>
            <Link to={q.to} className="a-quick__card">
              <span className="a-quick__icon"><Icon name={q.icon} size={24} /></span>
              <span><strong>{q.title}</strong><span className="a-muted">{q.text}</span></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="a-dash">
        <div className="a-dash__main">
          <section className="a-card">
            <h2 className="a-card__title"><Icon name="activity" size={20} /> Recent changes</h2>
            {data.recent.length ? (
              <ul className="a-activity">{data.recent.map((a) => <ActivityLine key={a._id} a={a} />)}</ul>
            ) : <p className="a-muted">Nothing yet — your changes will be listed here.</p>}
            <Link to="/activity" className="a-link">See all activity</Link>
          </section>
        </div>
        <div className="a-dash__side">
          <section className="a-card">
            <h2 className="a-card__title"><Icon name="sparkle" size={20} /> On the website</h2>
            <ul className="a-stats">
              {stats.map(([k, label]) => (
                <li key={k}><Link to={`/c/${k}`}><strong>{data.counts[k] ?? 0}</strong><span>{label}</span></Link></li>
              ))}
            </ul>
            {data.nextMatch && <p className="a-small">Next match: <Link to={`/c/matches/${data.nextMatch.id}`}>{data.nextMatch.title}</Link>, {fmtDateTime(data.nextMatch.date)}</p>}
            {data.media.count > 0 && saved > 0 && (
              <p className="a-small a-muted">{data.media.count} photos uploaded. Compression saved {fmtBytes(saved)} ({Math.round((saved / data.media.originalBytes) * 100)}% smaller) — pages load faster for visitors on mobile data.</p>
            )}
          </section>
          {missingTranslations > 0 && (
            <section className="a-card">
              <h2 className="a-card__title"><Icon name="translate" size={20} /> Translations</h2>
              <p>{missingTranslations} sentence{missingTranslations === 1 ? '' : 's'} show in English on the Hindi or Bengali site.</p>
              <Link to="/translations" className="a-link">Translate now</Link>
            </section>
          )}
          <WebsiteCard website={data.website} onRefresh={load} />
          <StorageCard />
          {!schema.storage || schema.storage === 'local' ? <Notice kind="warn">Photos are being saved on the server’s own disk. This is only for testing — your developer should connect Cloudinary.</Notice> : null}
        </div>
      </div>
    </div>
  );
}
