import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { Button, FieldFrame, Icon, Notice, useFeedback } from '../ui';

/** Change your own password. Used on "My account" and when a temporary password must be replaced. */
export default function PasswordForm({ forced = false }) {
  const { setUser } = useAuth();
  const { toast } = useFeedback();
  const [f, setF] = useState({ current: '', next: '', again: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError(null);
    if (f.next !== f.again) { setErrors({ again: 'The two new passwords are different' }); return; }
    setBusy(true);
    try {
      const { user } = await api('/auth/password', { method: 'POST', body: { current: f.current, next: f.next } });
      setF({ current: '', next: '', again: '' });
      toast('Your password has been changed');
      setUser(user);
    } catch (err) {
      setErrors(err.details || {});
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const type = show ? 'text' : 'password';
  return (
    <form className="a-form a-form--narrow" onSubmit={submit}>
      {forced && <Notice kind="info" title="Choose your own password">You signed in with a temporary password. Please choose a new one that only you know.</Notice>}
      {error && !Object.keys(errors).length && <Notice kind="error">{error}</Notice>}
      <FieldFrame label={forced ? 'Temporary password' : 'Current password'} error={errors.current}>
        <input className="a-input" type={type} autoComplete="current-password" value={f.current} onChange={set('current')} required />
      </FieldFrame>
      <FieldFrame label="New password" error={errors.next} help="At least 10 characters. A short sentence is easy to remember and hard to guess, e.g. “brown and gold since 1981”.">
        <input className="a-input" type={type} autoComplete="new-password" value={f.next} onChange={set('next')} required />
      </FieldFrame>
      <FieldFrame label="New password again" error={errors.again}>
        <input className="a-input" type={type} autoComplete="new-password" value={f.again} onChange={set('again')} required />
      </FieldFrame>
      <label className="a-check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords</label>
      <div className="a-row">
        <Button type="submit" variant="primary" busy={busy} icon="key" disabled={!f.current || !f.next || !f.again}>Change password</Button>
      </div>
      <p className="a-muted a-small"><Icon name="info" size={14} /> Changing your password signs you out on every other device.</p>
    </form>
  );
}
