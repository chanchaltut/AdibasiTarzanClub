// Small building blocks used across the admin panel.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ─── Icons (simple line drawings, 24×24) ─────────────────────
const P = {
  type: <><path d="M4 7V5h11v2" /><path d="M9.5 5v14M7.5 19h4" /><path d="M14 12v-1.5h7V12M17.5 10.5V19M16 19h3" /></>,
  home: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  newspaper: <><path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z" /><path d="M17 9h3v10a2 2 0 0 1-2 2" /><path d="M7 9h7M7 13h7M7 17h4" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="m12 7.5 4 2.9-1.5 4.7h-5L8 10.4z" /><path d="M12 3v4.5M16 10.4l4.3-1.4M14.5 15.1l2.7 3.7M9.5 15.1l-2.7 3.7M8 10.4 3.7 9" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  play: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
  images: <><rect x="3" y="6" width="14" height="14" rx="1.5" /><path d="M7 3h13a1 1 0 0 1 1 1v13" /><circle cx="8" cy="11" r="1.6" /><path d="m3 18 4.5-4.5 3 3 2-2L17 19" /></>,
  file: <><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z" /><path d="M14 3v5h5M8.5 13h7M8.5 17h5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><circle cx="9" cy="10" r="2" /><path d="m3 18 5.5-5.5 4 4 3-3L21 19" /></>,
  shirt: <path d="M8 3 3 6l2 5 3-1.5V21h8V9.5L19 11l2-5-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.2c3 .2 5.5 2.3 5.5 5.3" /></>,
  'circle-play': <><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></>,
  ticket: <><path d="M3 8V6h18v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4H3a2 2 0 0 0 0-4v-2a2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  handshake: <><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2" /><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2L15 11l-3 1.5a2 2 0 0 1-2-3.4L13 7l5 2 3-1v8l-2 .5" /><path d="M3 8l3-1 3 1.5M3 8v8l3 1 4 3.5a1.4 1.4 0 0 0 2-2" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 6H4c0 3 1.5 5 3.5 5M17 6h3c0 3-1.5 5-3.5 5M12 14v4M8 21h8l-1-3H9Z" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5M12 17.5v.01" /></>,
  badge: <><circle cx="12" cy="10" r="6" /><path d="m9 15-1.5 6L12 19l4.5 2L15 15" /></>,
  shield: <path d="M12 3 20 6v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6Z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  translate: <><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 8M11 5c-.5 3-2.5 6.5-7 9" /><path d="m13 21 4-10 4 10M14.5 17.5h5" /></>,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  top: <><path d="M6 4h12" /><path d="m6 15 6-6 6 6" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5H5V6h5" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  alert: <><path d="M12 3 2 20h20Z" /><path d="M12 10v4M12 17v.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  crop: <><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16" /><path d="M20 20v-4h-4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3M14 9l2 2" /></>,
  drag: <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth="3" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
};

export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg className={`a-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] || P.info}
    </svg>
  );
}

// ─── Buttons ─────────────────────────────────────────────────
export function Button({ variant = 'default', size, icon, busy, children, className = '', disabled, type = 'button', ...rest }) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} className={`a-btn a-btn--${variant} ${size ? `a-btn--${size}` : ''} ${className}`} disabled={Boolean(busy || disabled)} aria-busy={busy || undefined} {...rest}>
      {busy ? <Spinner size={16} /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
    </button>
  );
}

export function IconButton({ icon, label, variant = 'ghost', ...rest }) {
  return (
    <button type="button" className={`a-iconbtn a-iconbtn--${variant}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}

export const Spinner = ({ size = 20 }) => <span className="a-spinner" style={{ width: size, height: size }} aria-label="Loading" role="status" />;

export function Loading({ label = 'Loading…' }) {
  return <div className="a-loading"><Spinner size={28} /><span>{label}</span></div>;
}

export function Notice({ kind = 'info', title, children, action }) {
  return (
    <div className={`a-notice a-notice--${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      <Icon name={kind === 'error' || kind === 'warn' ? 'alert' : kind === 'ok' ? 'check' : 'info'} size={20} />
      <div className="a-notice__body">
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon = 'sparkle', title, children, action }) {
  return (
    <div className="a-empty">
      <span className="a-empty__icon"><Icon name={icon} size={30} /></span>
      <p className="a-empty__title">{title}</p>
      {children && <p className="a-empty__text">{children}</p>}
      {action}
    </div>
  );
}

export function Badge({ kind = 'neutral', children }) {
  return <span className={`a-badge a-badge--${kind}`}>{children}</span>;
}

// ─── Modal dialog ────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, size = 'md', closeOnBackdrop = true }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('a-noscroll');
    const first = ref.current?.querySelector('input, textarea, select, button:not(.a-modal__x)');
    first?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('a-noscroll');
      prev?.focus?.();
    };
  }, [onClose]);
  return createPortal(
    <div className="a-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="a-modal__scrim" onClick={closeOnBackdrop ? onClose : undefined} />
      <div className={`a-modal__box a-modal__box--${size}`} ref={ref}>
        <header className="a-modal__head">
          <h2>{title}</h2>
          {onClose && <button type="button" className="a-modal__x" onClick={onClose} aria-label="Close"><Icon name="close" /></button>}
        </header>
        <div className="a-modal__body">{children}</div>
        {footer && <footer className="a-modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

// ─── Confirm & toast (one place for the whole app) ───────────
const FeedbackCtx = createContext(null);

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const toast = useCallback((message, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    setConfirmState({ ...opts, resolve });
  }), []);

  const close = (answer) => {
    confirmState?.resolve(answer);
    setConfirmState(null);
  };

  return (
    <FeedbackCtx.Provider value={{ toast, confirm }}>
      {children}
      <div className="a-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast a-toast--${t.kind}`}>
            <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      {confirmState && (
        <Modal
          title={confirmState.title || 'Are you sure?'}
          onClose={() => close(false)}
          size="sm"
          footer={(
            <>
              <Button onClick={() => close(false)}>{confirmState.cancel || 'Cancel'}</Button>
              <Button variant={confirmState.danger ? 'danger' : 'primary'} onClick={() => close(true)}>{confirmState.ok || 'Yes'}</Button>
            </>
          )}
        >
          <p className="a-confirm-text">{confirmState.message}</p>
        </Modal>
      )}
    </FeedbackCtx.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackCtx);

// ─── Form field frame ────────────────────────────────────────
export function FieldFrame({ label, help, error, required, htmlFor, children, counter, half, aside }) {
  return (
    <div className={`a-field ${half ? 'a-field--half' : ''} ${error ? 'has-error' : ''}`}>
      {label && (
        <div className="a-field__top">
          <label className="a-field__label" htmlFor={htmlFor}>
            {label}{required && <span className="a-req" title="Required"> *</span>}
          </label>
          {aside}
        </div>
      )}
      {children}
      <div className="a-field__bottom">
        {error ? <p className="a-field__error" role="alert"><Icon name="alert" size={14} />{error}</p> : help && <p className="a-field__help">{help}</p>}
        {counter}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, id, disabled }) {
  return (
    <label className={`a-toggle ${disabled ? 'is-disabled' : ''}`} htmlFor={id}>
      <input id={id} type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="a-toggle__track"><span className="a-toggle__thumb" /></span>
      <span className="a-toggle__label">{label}</span>
    </label>
  );
}

/** Warn before closing the tab with unsaved work. */
export function useUnloadWarning(active) {
  useEffect(() => {
    if (!active) return undefined;
    const onBefore = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [active]);
}
