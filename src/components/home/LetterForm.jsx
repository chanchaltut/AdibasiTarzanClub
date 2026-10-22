import { useState } from 'react';
import { mailtoLetter } from '../../utils/helpers';
import { WaxSeal } from '../ui/Art';

export default function LetterForm({ id = 'write', title = true }) {
  const [f, setF] = useState({ name: '', place: '', contact: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    window.location.href = mailtoLetter(f);
    setSent(true);
  };

  return (
    <section className="section letter-section bg-burlap" id={id} aria-labelledby={`${id}-title`}>
      <div className="wrapper letter-section__inner">
        {title && (
          <div className="letter-section__intro" data-reveal>
            <p className="kicker">Write to the club</p>
            <h2 className="display letter-section__title" id={`${id}-title`}>
              A letter <span className="script">to</span> ATC
            </h2>
            <p className="letter-section__copy">
              Want to enter a team in the Annual Cup, volunteer at Heritage Night, or just say thank you?
              Write it the old way — we read every letter.
            </p>
          </div>
        )}

        <form className="letter paper" onSubmit={submit} data-reveal>
          <div className="letter__head">
            <span className="serif">S. Akhanagar, Kaliyaganj</span>
            <span className="serif">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <p className="letter__salutation script">Dear Tarzans,</p>
          <label className="visually-hidden" htmlFor={`${id}-msg`}>Your message</label>
          <textarea
            id={`${id}-msg`}
            className="letter__message hand ruled"
            rows={5}
            required
            value={f.message}
            onChange={set('message')}
            placeholder="I would like to…"
          />
          <div className="letter__fields">
            <label>
              <span>Yours sincerely,</span>
              <input required value={f.name} onChange={set('name')} placeholder="Your name" className="hand" />
            </label>
            <label>
              <span>From</span>
              <input value={f.place} onChange={set('place')} placeholder="Village / town" className="hand" />
            </label>
            <label>
              <span>Reach me at</span>
              <input value={f.contact} onChange={set('contact')} placeholder="Phone or email" className="hand" />
            </label>
          </div>
          <div className="letter__foot">
            <p className="letter__note">{sent ? 'Your email app should open with the letter ready to send.' : 'Sealing opens your email app with the letter written out.'}</p>
            <button type="submit" className="letter__seal" aria-label="Seal and send">
              <WaxSeal size={84} />
              <span>Seal &amp; send</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
