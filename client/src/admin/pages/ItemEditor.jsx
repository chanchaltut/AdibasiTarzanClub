import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSchema } from '../schema';
import { fmtDateTime } from '../format';
import { Field, isHidden } from '../fields';
import { Button, Icon, Loading, Modal, Notice, useFeedback, useUnloadWarning } from '../ui';
import NotFound from './NotFound';

/** Where an item shows on the public website. */
const SITE_PATH = {
  news: (d) => (d.slug ? `/news/${d.slug}` : '/news'),
  matches: (d) => (d.homeScore !== undefined ? '/schedule?tab=results' : '/schedule'),
  events: () => '/schedule?tab=events',
  videos: () => '/gallery#videos',
  gallery: () => '/gallery',
  players: () => '/squad',
  committee: () => '/committee',
  stories: () => '/',
  promos: () => '/',
  explore: () => '/',
  partners: () => '/contact#partners',
  honours: () => '/club#honours',
  timeline: () => '/club#history',
  faqs: (d) => (d.page === 'membership' ? '/membership' : '/club#faq'),
  tiers: () => '/membership',
  teams: () => '/schedule',
  settings: () => '/',
  pages: () => '/',
};

const snapshot = (item) => JSON.stringify(item ?? null);

export default function ItemEditor({ single = false }) {
  const { type, id, key } = useParams();
  const schema = useSchema();
  const def = single ? schema.singleMap[key] : schema.collectionMap[type];
  const isNew = !single && !id;
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();

  const [item, setItem] = useState(null);
  const [saved, setSaved] = useState(null);
  const [media, setMedia] = useState({});
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [stale, setStale] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const skipBlock = useRef(false);

  const endpoint = single ? `/admin/s/${key}` : `/admin/c/${type}`;

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await api(single ? endpoint : isNew ? `${endpoint}/new` : `${endpoint}/${id}`);
      setItem(r.item);
      setSaved(snapshot(r.item));
      setMedia(r.media || {});
      setErrors({});
      setStale(false);
    } catch (err) {
      setLoadError(err);
    }
  }, [endpoint, id, isNew, single]);

  useEffect(() => { load(); }, [load]);

  const dirty = item !== null && snapshot(item) !== saved;
  useUnloadWarning(dirty);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !skipBlock.current && dirty && currentLocation.pathname !== nextLocation.pathname);

  const set = (name, value) => {
    setItem((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n; });
  };

  const save = useCallback(async () => {
    if (!item || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const body = { ...item, _updatedAt: single ? item._updatedAt : item.updatedAt };
      const r = await api(isNew ? endpoint : single ? endpoint : `${endpoint}/${id}`, { method: isNew ? 'POST' : 'PUT', body });
      setErrors({});
      setMedia((m) => ({ ...m, ...(r.media || {}) }));
      toast(isNew ? `${def.singular[0].toUpperCase()}${def.singular.slice(1)} added` : 'Saved — the website is updated');
      if (isNew) {
        skipBlock.current = true;
        navigate(`/c/${type}/${r.item._id}`, { replace: true });
        return;
      }
      setItem(r.item);
      setSaved(snapshot(r.item));
      setLastSaved(new Date());
    } catch (err) {
      if (err.code === 'STALE') setStale(true);
      setErrors(err.details || {});
      setSaveError(err.message);
      setTimeout(() => document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setSaving(false);
    }
  }, [item, saving, single, isNew, endpoint, id, toast, def, navigate, type]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  if (!def) return <NotFound />;
  if (loadError) {
    return (
      <div className="a-page">
        <Notice kind="error" title={loadError.status === 404 ? 'Not found' : 'Could not open this'} action={<Button onClick={() => (loadError.status === 404 ? navigate(`/c/${type}`) : load())}>{loadError.status === 404 ? 'Back to the list' : 'Try again'}</Button>}>{loadError.message}</Notice>
      </div>
    );
  }
  if (!item) return <Loading />;

  const remove = async () => {
    const ok = await confirm({ title: `Delete this ${def.singular}?`, message: 'It will be removed from the website. This can’t be undone.', ok: 'Delete', danger: true });
    if (!ok) return;
    try {
      await api(`${endpoint}/${id}`, { method: 'DELETE' });
      skipBlock.current = true;
      toast('Deleted');
      navigate(`/c/${type}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const sitePath = SITE_PATH[def.key]?.(item);
  const siteHref = sitePath && `${schema.siteUrl || window.location.origin}${sitePath}`;
  const title = single ? def.label : isNew ? `New ${def.singular}` : `Edit ${def.singular}`;
  const errorCount = Object.keys(errors).length;

  return (
    <div className="a-page a-page--editor">
      <header className="a-page__head">
        <div>
          {!single && <Link to={`/c/${type}`} className="a-back"><Icon name="up" size={16} className="a-rot-270" /> {def.label}</Link>}
          <h1>{title}</h1>
          <p className="a-page__desc">{def.description}</p>
        </div>
        {siteHref && !isNew && (
          <div className="a-page__actions">
            <a className="a-btn a-btn--ghost" href={siteHref} target="_blank" rel="noopener noreferrer"><Icon name="external" size={18} /><span>See it on the website</span></a>
          </div>
        )}
      </header>

      {stale && (
        <Notice kind="warn" title="Someone else changed this" action={<Button onClick={load}>Load their version</Button>}>
          Another person saved changes while you were editing. Loading their version will remove your unsaved changes — copy anything you need first.
        </Notice>
      )}
      {saveError && !stale && <Notice kind="error" title={errorCount ? `Please fix ${errorCount === 1 ? 'the item' : `the ${errorCount} items`} marked in red` : 'Not saved'}>{errorCount ? null : saveError}</Notice>}
      {item.locked && <Notice kind="info">This is part of the website, so it can be edited but not deleted.</Notice>}

      <form className="a-form a-grid" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        {def.fields.filter((f) => !f.hidden && !isHidden(f, item)).map((f) => (
          <Field
            key={f.name}
            f={f}
            value={item[f.name]}
            data={item}
            onChange={(v) => set(f.name, v)}
            errors={errors}
            media={media}
            onMedia={(m) => setMedia((prev) => ({ ...prev, ...m }))}
            onAlso={f.type === 'youtube' ? (info) => { if (info?.title) setItem((prev) => (prev.title ? prev : { ...prev, title: info.title })); } : undefined}
          />
        ))}
      </form>

      <div className={`a-savebar ${dirty ? 'is-dirty' : ''}`}>
        <span className="a-savebar__state">
          {saving ? 'Saving…' : dirty ? <><span className="a-dot" /> Unsaved changes</> : lastSaved ? <><Icon name="check" size={16} /> Saved {fmtDateTime(lastSaved)}</> : item.updatedAt || item._updatedAt ? `Last changed ${fmtDateTime(item.updatedAt || item._updatedAt)}` : ''}
        </span>
        <span className="a-spacer" />
        {!isNew && !single && !item.locked && <Button variant="ghost" icon="trash" onClick={remove} className="a-savebar__delete">Delete</Button>}
        {!single && <Button onClick={() => navigate(`/c/${type}`)}>{dirty ? 'Cancel' : 'Back to list'}</Button>}
        <Button variant="primary" icon="check" busy={saving} onClick={save} disabled={!dirty && !isNew}>{isNew ? `Add ${def.singular}` : 'Save changes'}</Button>
      </div>

      {blocker.state === 'blocked' && (
        <Modal
          title="Leave without saving?"
          size="sm"
          onClose={() => blocker.reset()}
          footer={(
            <>
              <Button onClick={() => blocker.reset()}>Stay here</Button>
              <Button variant="danger" onClick={() => blocker.proceed()}>Leave and lose changes</Button>
            </>
          )}
        >
          <p className="a-confirm-text">You have changes that are not saved yet.</p>
        </Modal>
      )}
    </div>
  );
}
