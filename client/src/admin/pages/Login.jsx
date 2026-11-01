import { useState } from 'react';
import { useAuth } from '../auth';
import { Button, Icon, Notice } from '../ui';

export default function Login() {
  const { login, expired, error: serverError, retry } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="a-login">
      <form className="a-login__card" onSubmit={submit} noValidate>
        <img src="/brand/crest.webp?v=2" alt="Adibasi Tarzan Club crest" width="84" height="84" className="a-login__crest" />
        <h1>Website management</h1>
        <p className="a-muted">Adibasi Tarzan Club</p>

        {expired && <Notice kind="info">You were signed out. Please sign in again — nothing you saved was lost.</Notice>}
        {serverError && <Notice kind="error" action={<Button size="sm" onClick={retry}>Try again</Button>}>{serverError}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}

        <label className="a-field">
          <span className="a-field__label">Email</span>
          <input className="a-input" type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="a-field">
          <span className="a-field__label">Password</span>
          <span className="a-password">
            <input className="a-input" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eye-off' : 'eye'} size={18} /></button>
          </span>
        </label>
        <Button type="submit" variant="primary" size="lg" busy={busy} disabled={!email || !password}>Sign in</Button>
        <p className="a-login__foot">Forgot your password? Ask the site owner to set a new one for you.</p>
      </form>
    </div>
  );
}
