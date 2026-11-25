import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/store';
import { apiUrl } from '../content/load';
import PageHero from '../components/page/PageHero';
import { DateStamp } from '../components/page/Matches';
import { Photo, WaxSeal } from '../components/ui/Art';
import Icon from '../components/ui/Icon';
import { kickoff } from '../utils/helpers';
import { eventOpen, tournamentOpen } from '../utils/tournaments';
import { Link, useLang } from '../i18n';

const EMPTY = { name: '', phone: '', place: '', people: '', team: '', age: '', message: '', website: '' };

/** Everything open for sign-ups now, as "kind:id" choices. */
function useChoices() {
  const { EVENTS, PROGRAMMES, TOURNAMENTS } = useContent();
  return useMemo(() => ({
    event: EVENTS.filter(eventOpen),
    programme: PROGRAMMES.filter((p) => p.signup),
    tournament: TOURNAMENTS.filter(tournamentOpen),
  }), [EVENTS, PROGRAMMES, TOURNAMENTS]);
}

const titleOf = (kind, x) => (kind === 'tournament' ? x.name : x.title);

/** If the server can't be reached, the same details can still go by email. */
function mailtoSignup(email, target, f) {
  const lines = [`Sign-up for: ${target}`, `Name: ${f.name}`, `Phone: ${f.phone}`, f.place && `Village / town: ${f.place}`, f.team && `Team: ${f.team}`, f.people && `People: ${f.people}`, f.age && `Age: ${f.age}`, f.message && `\n${f.message}`].filter(Boolean);
  return `mailto:${email}?subject=${encodeURIComponent(`Sign-up: ${target}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function OptionCard({ kind, x, onPick }) {
  const { t, date } = useLang();
  return (
    <li className="signup-card paper paper--sm">
      {x.photo && <Photo src={x.photo} className="signup-card__photo" sizes="(max-width: 840px) 100vw, 33vw" />}
      <div className="signup-card__top">
        {kind === 'event' && <DateStamp iso={x.date} />}
        <span className="tag tag--ink">{t(kind === 'event' ? x.kind : kind === 'programme' ? 'Club programme' : 'Tournament')}</span>
      </div>
      <h3 className="signup-card__title display">{t(titleOf(kind, x))}</h3>
      {kind === 'event' && <p className="signup-card__meta"><Icon name="pin" size={14} />{t(x.venue)} · {kickoff(x.date)} {t('IST')}</p>}
      {kind === 'programme' && (x.when || x.who) && <p className="signup-card__meta"><Icon name="clock" size={14} />{[x.when && t(x.when), x.who && t(x.who)].filter(Boolean).join(' · ')}</p>}
      {kind === 'tournament' && <p className="signup-card__meta"><Icon name="calendar" size={14} />{date(x.start, { day: 'numeric', month: 'long', year: 'numeric' })} · {t(x.venue)}</p>}
      {(x.desc || x.about?.[0]) && <p className="signup-card__desc">{t(x.desc || x.about[0])}</p>}
      {x.signupBy && <p className="signup-card__by">{t('Sign up by {date}', { date: date(x.signupBy, { day: 'numeric', month: 'long' }) })}</p>}
      <button type="button" className="btn btn--ink btn--sm" onClick={() => onPick(`${kind}:${x.id}`)}>{t(kind === 'tournament' ? 'Enter a team' : 'Sign up')}</button>
    </li>
  );
}

export default function Register() {
  const { t, ta } = useLang();
  const { CLUB, PAGES } = useContent();
  const [params] = useSearchParams();
  const choices = useChoices();
  const all = Object.entries(choices).flatMap(([kind, list]) => list.map((x) => ({ key: `${kind}:${x.id}`, kind, x })));
  const fromLink = all.some((c) => c.key === params.get('for')) ? params.get('for') : '';
  const [picked, setPicked] = useState(null);
  const choice = picked ?? fromLink;
  const [f, setF] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle' }); // idle | sending | done | error | offline
  const formRef = useRef(null);
  const current = all.find((c) => c.key === choice);
  const kind = current?.kind;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const banner = PAGES.register || {};

  const pick = (key) => {
    setPicked(key);
    setState({ status: 'idle' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!current) { setState({ status: 'error', message: t('Please choose what you are signing up for.'), errors: { targetId: true } }); return; }
    setState({ status: 'sending' });
    const body = {
      kindOf: kind,
      targetId: current.x.id,
      name: f.name,
      phone: f.phone,
      place: f.place || undefined,
      people: kind === 'event' && f.people ? Number(f.people) : undefined,
      team: kind === 'tournament' ? f.team : undefined,
      age: kind === 'programme' && f.age ? Number(f.age) : undefined,
      message: f.message || undefined,
      website: f.website || undefined,
    };
    try {
      const res = await fetch(apiUrl('/api/public/register'), {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'omit',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setState({ status: 'done', target: titleOf(kind, current.x) }); setF(EMPTY); return; }
      if (res.status >= 500 || res.status === 404) throw new Error('offline');
      setState({ status: 'error', message: data.error || t('Please check the form.'), errors: data.details || {} });
    } catch {
      setState({ status: 'offline' });
    }
  };

  const err = (k) => state.errors?.[k];
  const none = !all.length;

  return (
    <>
      <PageHero
        title="Registration & Participation"
        script={banner.script || 'Join in'}
        intro={banner.intro}
        photo={banner.photo || PAGES.schedule?.photo}
        crumbs={[{ label: 'Events & Participations', href: '/schedule' }, { label: 'Registration & Participation' }]}
      />

      <section className="section bg-parchment">
        <div className="wrapper">
          <header className="signup-intro">
            <p className="kicker kicker--ink">{t('Club Events')}</p>
            <h2 className="h2 display">{ta('Take *part*')}</h2>
            <p className="lead serif">{t('Sign up for an upcoming club event, join one of the club’s regular programmes, or enter a team in an ATC tournament. The club will call or message you to confirm.')}</p>
          </header>

          {[
            ['event', 'Upcoming club events', 'Sign up for an upcoming club event or programme day.'],
            ['programme', 'Club programmes', 'Sign up for a specific club programme that runs through the year.'],
            ['tournament', 'Tournament entries', 'Enter your team in an ATC tournament.'],
          ].map(([k, title, sub]) => choices[k].length > 0 && (
            <div key={k} className="signup-group">
              <h3 className="signup-group__title display">{t(title)}</h3>
              <p className="signup-group__sub serif">{t(sub)}</p>
              <ul className="signup-grid">{choices[k].map((x) => <OptionCard key={x.id} kind={k} x={x} onPick={pick} />)}</ul>
            </div>
          ))}

          {none && (
            <div className="members-empty paper">
              <p>{t('There are no sign-ups open right now. New events and programmes are announced on the Schedule and the Notice Board.')}</p>
              <Link to="/schedule?tab=events" className="btn btn--ink">{t('See club events')}</Link>
            </div>
          )}
        </div>
      </section>

      {!none && (
        <section className="section bg-burlap" id="sign-up" ref={formRef}>
          <div className="wrapper">
            <form className="signup-form paper" onSubmit={submit} noValidate>
              <WaxSeal size={78} className="signup-form__seal" />
              <h2 className="signup-form__title display">{t('Sign-up form')}</h2>

              {state.status === 'done' ? (
                <div className="signup-done" role="status">
                  <p className="signup-done__big script">{t('Thank you!')}</p>
                  <p>{t('Your sign-up for {target} has reached the club. Someone from the committee will call or message you soon.', { target: t(state.target) })}</p>
                  <button type="button" className="btn btn--outline-ink" onClick={() => setState({ status: 'idle' })}>{t('Sign up someone else')}</button>
                </div>
              ) : (
                <>
                  <label className={`signup-field signup-field--wide ${err('targetId') ? 'has-error' : ''}`}>
                    <span>{t('I am signing up for')} *</span>
                    <select value={choice} onChange={(e) => { setPicked(e.target.value); setState({ status: 'idle' }); }} required>
                      <option value="">{t('Choose…')}</option>
                      {[['event', 'Club events'], ['programme', 'Club programmes'], ['tournament', 'Tournaments']].map(([k, label]) => choices[k].length > 0 && (
                        <optgroup key={k} label={t(label)}>
                          {choices[k].map((x) => <option key={x.id} value={`${k}:${x.id}`}>{t(titleOf(k, x))}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    {err('targetId') && <small>{t('Please choose what you are signing up for.')}</small>}
                  </label>

                  {kind === 'tournament' && (
                    <label className={`signup-field signup-field--wide ${err('team') ? 'has-error' : ''}`}>
                      <span>{t('Team name')} *</span>
                      <input value={f.team} onChange={set('team')} required maxLength={80} placeholder={t('e.g. Kaliyaganj Youth Club')} />
                      {err('team') && <small>{t(err('team'))}</small>}
                    </label>
                  )}
                  <label className={`signup-field ${err('name') ? 'has-error' : ''}`}>
                    <span>{t(kind === 'tournament' ? 'Manager’s name' : 'Your name')} *</span>
                    <input value={f.name} onChange={set('name')} required maxLength={80} autoComplete="name" />
                    {err('name') && <small>{t(err('name'))}</small>}
                  </label>
                  <label className={`signup-field ${err('phone') ? 'has-error' : ''}`}>
                    <span>{t('Phone / WhatsApp')} *</span>
                    <input value={f.phone} onChange={set('phone')} required inputMode="tel" autoComplete="tel" maxLength={20} placeholder="98765 43210" />
                    {err('phone') && <small>{t(err('phone'))}</small>}
                  </label>
                  <label className="signup-field">
                    <span>{t('Village / town')}</span>
                    <input value={f.place} onChange={set('place')} maxLength={80} placeholder={t('e.g. S. Akhanagar')} />
                  </label>
                  {kind === 'event' && (
                    <label className={`signup-field ${err('people') ? 'has-error' : ''}`}>
                      <span>{t('How many people')}</span>
                      <input type="number" min={1} max={200} value={f.people} onChange={set('people')} placeholder="1" />
                      {err('people') && <small>{t(err('people'))}</small>}
                    </label>
                  )}
                  {kind === 'programme' && (
                    <label className={`signup-field ${err('age') ? 'has-error' : ''}`}>
                      <span>{t('Age (optional)')}</span>
                      <input type="number" min={3} max={110} value={f.age} onChange={set('age')} />
                      {err('age') && <small>{t(err('age'))}</small>}
                    </label>
                  )}
                  <label className="signup-field signup-field--wide">
                    <span>{t('Anything we should know?')}</span>
                    <textarea rows={3} value={f.message} onChange={set('message')} maxLength={600} />
                  </label>
                  {/* Left empty by people; bots fill it in. */}
                  <label className="visually-hidden" aria-hidden="true">
                    Website
                    <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
                  </label>

                  {state.status === 'error' && <p className="signup-form__error" role="alert">{state.message}</p>}
                  {state.status === 'offline' && current && (
                    <p className="signup-form__error" role="alert">
                      {t('The sign-up could not be sent just now.')}{' '}
                      {CLUB.email && <a href={mailtoSignup(CLUB.email, titleOf(kind, current.x), f)}>{t('Send it by email instead')}</a>}
                    </p>
                  )}
                  <div className="signup-form__foot">
                    <p className="signup-form__note">{t('Your details are seen only by the club committee and used only to contact you about this sign-up.')}</p>
                    <button type="submit" className="btn btn--lg btn--ink" disabled={state.status === 'sending'}>
                      {t(state.status === 'sending' ? 'Sending…' : 'Send sign-up')}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
      )}
    </>
  );
}
