import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setSignedOutHandler } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, error: null, expired: false });

  const check = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user } = await api('/auth/session');
      setState({ loading: false, user, error: null, expired: false });
    } catch (err) {
      setState({ loading: false, user: null, error: err.status === 0 ? err.message : null, expired: false });
    }
  }, []);

  useEffect(() => {
    check();
    setSignedOutHandler(() => setState((s) => (s.user ? { loading: false, user: null, error: null, expired: true } : s)));
  }, [check]);

  const value = useMemo(() => ({
    ...state,
    retry: check,
    async login(email, password) {
      const { user } = await api('/auth/login', { method: 'POST', body: { email, password } });
      setState({ loading: false, user, error: null, expired: false });
      return user;
    },
    async logout() {
      await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {});
      setState({ loading: false, user: null, error: null, expired: false });
    },
    setUser(user) { setState((s) => ({ ...s, user })); },
  }), [state, check]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
