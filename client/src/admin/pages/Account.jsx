import { api } from '../api';
import { useAuth } from '../auth';
import { fmtDateTime } from '../format';
import { Button, useFeedback } from '../ui';
import PasswordForm from './PasswordForm';

export default function Account() {
  const { user, logout } = useAuth();
  const { confirm } = useFeedback();

  const everywhere = async () => {
    const ok = await confirm({ title: 'Sign out everywhere?', message: 'You will be signed out on every phone and computer, including this one. Use this if you lost a phone or signed in on someone else’s computer.', ok: 'Sign out everywhere', danger: true });
    if (!ok) return;
    await api('/auth/logout-everywhere', { method: 'POST', body: {} }).catch(() => {});
    logout();
  };

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1>My account</h1>
          <p className="a-page__desc">{user.name} · {user.email} · {user.role === 'owner' ? 'Owner (can manage people)' : 'Editor'}</p>
          {user.lastLoginAt && <p className="a-muted a-small">Last signed in {fmtDateTime(user.lastLoginAt)}</p>}
        </div>
      </header>
      <section className="a-card">
        <h2 className="a-card__title">Change password</h2>
        <PasswordForm />
      </section>
      <section className="a-card">
        <h2 className="a-card__title">Lost a phone?</h2>
        <p>Sign out on every device at once. You can sign in again straight away.</p>
        <Button variant="danger" icon="logout" onClick={everywhere}>Sign out everywhere</Button>
      </section>
    </div>
  );
}
