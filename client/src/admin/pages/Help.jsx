import { Link } from 'react-router-dom';
import { Icon } from '../ui';

const TOPICS = [
  {
    icon: 'images',
    title: 'Photos',
    points: [
      'Upload photos straight from your phone or camera — any size. They are made small and fast automatically (WebP), without visible loss of quality.',
      'Hidden information inside photos, such as the GPS location where it was taken, is removed for everyone’s privacy.',
      '“Crop” cuts away what should never be seen. Most photos don’t need it — keep the whole photo.',
      '“Focus point” is the most important spot (usually a face). Phones, tablets and computers show photos in different shapes; the focus point always stays in view.',
      'Write a short description for each photo. It helps blind visitors and helps Google find the club.',
      'iPhone photos: if one won’t upload, on the iPhone go to Settings → Camera → Formats → “Most Compatible”.',
    ],
  },
  {
    icon: 'play',
    title: 'Videos',
    points: [
      'Upload the video to the club’s YouTube channel first (as Public or Unlisted — not Private).',
      'On YouTube press Share → Copy, then in Videos press “Add video” and paste the link. The title fills in by itself.',
      'Videos play inside the website but are stored by YouTube, so they cost nothing and never slow the site down.',
    ],
  },
  {
    icon: 'eye',
    title: 'Hide instead of delete',
    points: [
      'Every news story, match, photo and person can be hidden with the eye button. Hidden things disappear from the website but stay here, ready to show again.',
      'Deleting is permanent. Photos still used somewhere can’t be deleted by mistake.',
    ],
  },
  {
    icon: 'ball',
    title: 'Matches',
    points: [
      'Add a match before it is played: it appears under Fixtures with a countdown on the home page.',
      'After the match, open it and fill in both scores. It moves to Results by itself.',
      'The dashboard reminds you about matches that still need a score.',
    ],
  },
  {
    icon: 'translate',
    title: 'Hindi and Bengali',
    points: [
      'Everything you write appears on the Translations screen. Until you translate it, visitors reading in Hindi or Bengali see the English.',
      'You don’t have to translate everything at once — start with the headlines.',
    ],
  },
  {
    icon: 'globe',
    title: 'When do changes appear?',
    points: [
      'Visitors see your changes the next time they open or refresh a page.',
      'Google, WhatsApp link previews and other search engines get the update a few minutes after you stop editing.',
    ],
  },
  {
    icon: 'key',
    title: 'Staying safe',
    points: [
      'Use your own account. Never share passwords — the owner can add as many people as needed.',
      'After 8 wrong passwords an account locks for 15 minutes.',
      'Lost a phone? Open “My account” and press “Sign out everywhere”.',
      'Every change is written in the Activity log, so mistakes can be traced and fixed.',
    ],
  },
];

export default function Help() {
  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name="help" size={26} /> Help & tips</h1>
          <p className="a-page__desc">Everything you need to look after the club website. Nothing here can break the website — if something is wrong, the panel will tell you how to fix it.</p>
        </div>
      </header>
      <div className="a-helpgrid">
        {TOPICS.map((t) => (
          <section className="a-card" key={t.title}>
            <h2 className="a-card__title"><Icon name={t.icon} size={20} /> {t.title}</h2>
            <ul className="a-ticks">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </section>
        ))}
      </div>
      <p className="a-muted">Still stuck? Write down what you were doing and what the message said, and send it to your website developer. <Link to="/activity">The activity log</Link> helps them see what happened.</p>
    </div>
  );
}
