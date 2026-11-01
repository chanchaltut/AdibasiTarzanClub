import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { fmtDateTime, timeAgo } from '../format';
import { Badge, Button, FieldFrame, Icon, Loading, Modal, Notice, useFeedback } from '../ui';

const WORDS = ['brown', 'gold', 'river', 'drum', 'mango', 'football', 'village', 'lantern', 'forest', 'tiger', 'monsoon', 'kite', 'paddy', 'madal', 'sunrise', 'banyan'];
/** A temporary password that is easy to read out over the phone. */
function suggestPassword() {
  const pick = () => WORDS[crypto.getRandomValues(new Uint32Array(1))[0] % WORDS.length];
  return `${pick()}-${pick()}-${pick()}-${10 + (crypto.getRandomValues(new Uint32Array(1))[0] % 90)}`;
}

function PersonForm({ person, onClose, onSaved }) {
  const isNew = !person;
  const [f, setF] = useState({ name: person?.name || '', email: person?.email || '', role: person?.role || 'editor', password: isNew ? suggestPassword() : '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e?.preventDefault();
    setBusy(true); setErrors({}); setError(null);
    try {
      const r = isNew
        ? await api('/admin/users', { method: 'POST', body: f })
        : await api(`/admin/users/${person.id}`, { method: 'PATCH', body: { name: f.name, role: f.role } });
      onSaved(r.item, isNew ? f.password : null);
    } catch (err) { setErrors(err.details || {}); setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Modal title={isNew ? 'Add a person' : `Edit ${person.name}`} onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" busy={busy} onClick={submit}>{isNew ? 'Add person' : 'Save'}</Button></>}>
      <form className="a-form" onSubmit={submit}>
        {error && !Object.keys(errors).length && <Notice kind="error">{error}</Notice>}
        <FieldFrame label="Name" error={errors.name} required><input className="a-input" value={f.name} onChange={set('name')} /></FieldFrame>
        {isNew && <FieldFrame label="Email" error={errors.email} required help="They sign in with this."><input className="a-input" type="email" value={f.email} onChange={set('email')} /></FieldFrame>}
        <FieldFrame label="What can they do?">
          <select className="a-input" value={f.role} onChange={set('role')}>
            <option value="editor">Editor — can change everything on the website</option>
            <option value="owner">Owner — can also add and remove people</option>
          </select>
        </FieldFrame>
        {isNew && (
          <FieldFrame label="Temporary password" error={errors.password} help="Give this to them. They will be asked to choose their own the first time they sign in." aside={<button type="button" className="a-link" onClick={() => setF({ ...f, password: suggestPassword() })}>New suggestion</button>}>
            <input className="a-input a-mono" value={f.password} onChange={set('password')} />
          </FieldFrame>
        )}
      </form>
    </Modal>
  );
}

function ResetPassword({ person, onClose, onDone }) {
  const [password, setPassword] = useState(suggestPassword());
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await api(`/admin/users/${person.id}/password`, { method: 'POST', body: { password } });
      onDone(password);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`New password for ${person.name}`} size="sm" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" busy={busy} onClick={submit}>Set password</Button></>}>
      {error && <Notice kind="error">{error}</Notice>}
      <FieldFrame label="Temporary password" help="They will be signed out everywhere and must choose their own password next time." aside={<button type="button" className="a-link" onClick={() => setPassword(suggestPassword())}>New suggestion</button>}>
        <input className="a-input a-mono" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FieldFrame>
    </Modal>
  );
}

function ShowPassword({ name, password, onClose }) {
  const { toast } = useFeedback();
  return (
    <Modal title="Give them this password" size="sm" onClose={onClose} footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <p>Tell <strong>{name}</strong> this temporary password (in person or by phone is safest):</p>
      <p className="a-bigcode">{password}</p>
      <Button size="sm" icon="copy" onClick={() => navigator.clipboard?.writeText(password).then(() => toast('Copied'))}>Copy</Button>
      <p className="a-muted a-small">It won’t be shown again. They will choose their own password when they first sign in.</p>
    </Modal>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [shown, setShown] = useState(null);
  const { toast, confirm } = useFeedback();
  const load = () => api('/admin/users').then((r) => setItems(r.items)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const patch = async (p, body, msg) => {
    try { await api(`/admin/users/${p.id}`, { method: 'PATCH', body }); toast(msg); load(); } catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (p) => {
    if (!(await confirm({ title: `Remove ${p.name}?`, message: 'They will no longer be able to sign in. The changes they made stay on the website.', ok: 'Remove', danger: true }))) return;
    try { await api(`/admin/users/${p.id}`, { method: 'DELETE' }); toast('Removed'); load(); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name="key" size={26} /> People & access</h1>
          <p className="a-page__desc">Who can sign in to manage the website. Give each person their own account — never share one password.</p>
        </div>
        <div className="a-page__actions"><Button variant="primary" icon="plus" onClick={() => setEditing('new')}>Add a person</Button></div>
      </header>
      {error && <Notice kind="error">{error}</Notice>}
      {!items && !error && <Loading />}
      {items && (
        <ul className="a-list">
          {items.map((p) => (
            <li key={p.id} className={`a-row ${p.active ? '' : 'is-hidden'}`}>
              <div className="a-row__main">
                <span className="a-avatar">{p.name.slice(0, 1).toUpperCase()}</span>
                <span className="a-row__text">
                  <span className="a-row__title">{p.name}{p.id === me.id && ' (you)'}</span>
                  <span className="a-row__sub">{p.email} · {p.lastLoginAt ? <span title={fmtDateTime(p.lastLoginAt)}>signed in {timeAgo(p.lastLoginAt)}</span> : 'never signed in'}</span>
                  <span className="a-row__badges">
                    <Badge kind={p.role === 'owner' ? 'gold' : 'neutral'}>{p.role === 'owner' ? 'Owner' : 'Editor'}</Badge>
                    {!p.active && <Badge kind="muted">Switched off</Badge>}
                    {p.mustChangePassword && <Badge kind="warn">Has a temporary password</Badge>}
                  </span>
                </span>
              </div>
              {p.id !== me.id && (
                <span className="a-row__tools a-row__tools--wrap">
                  <Button size="sm" icon="edit" onClick={() => setEditing(p)}>Edit</Button>
                  <Button size="sm" icon="key" onClick={() => setResetting(p)}>New password</Button>
                  <Button size="sm" icon={p.active ? 'eye-off' : 'eye'} onClick={() => patch(p, { active: !p.active }, p.active ? `${p.name} can no longer sign in` : `${p.name} can sign in again`)}>{p.active ? 'Switch off' : 'Switch on'}</Button>
                  <Button size="sm" variant="ghost" icon="trash" onClick={() => remove(p)}>Remove</Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <PersonForm
          person={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(p, pw) => { setEditing(null); load(); if (pw) setShown({ name: p.name, password: pw }); else toast('Saved'); }}
        />
      )}
      {resetting && <ResetPassword person={resetting} onClose={() => setResetting(null)} onDone={(pw) => { setShown({ name: resetting.name, password: pw }); setResetting(null); load(); }} />}
      {shown && <ShowPassword {...shown} onClose={() => setShown(null)} />}
    </div>
  );
}
