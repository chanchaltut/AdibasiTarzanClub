import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprig, WaxSeal } from '../components/ui/Art';

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found — Adibasi Tarzan Club'; }, []);
  return (
    <section className="section bg-burlap lost">
      <div className="wrapper">
        <div className="lost__letter paper">
          <p className="lost__code display">404</p>
          <p className="lost__hi script">Dear visitor,</p>
          <p className="hand lost__text">
            This page seems to have wandered off into the forest. Let us walk you back to the ground.
          </p>
          <Link to="/" className="btn btn--ink">Back to home</Link>
          <WaxSeal size={80} className="lost__seal" />
          <Sprig className="lost__sprig" />
        </div>
      </div>
    </section>
  );
}
